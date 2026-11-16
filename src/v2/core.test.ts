import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  advanceSession,
  api,
  HttpError,
  initializeCsrf,
  onUnauthenticated,
  queryString,
  request,
} from './api';
import { serializeFields, referenceLabel, initial } from './forms';
import { modules } from './modules';
import { dateTime } from './types';
import { can, date, money, today, parseDateTime, toApiDateTime, type User } from './types';
import { quoteLinePayload } from './QuoteEditor';

beforeEach(() => {
  vi.stubGlobal('document', { cookie: 'XSRF-TOKEN=csrf%3Dtest' });
});
afterEach(() => {
  vi.unstubAllGlobals();
  advanceSession();
});
describe('permissions et formats', () => {
  const user = (permissions: string[]) => ({ role: { permissions } }) as User;
  it('accepte les permissions explicites', () =>
    expect(can(user(['quotes.view']), 'quotes.view')).toBe(true));
  it('respecte les jokers par module', () => {
    expect(can(user(['quotes.*']), 'quotes.update')).toBe(true);
    expect(can(user(['admin.*']), 'quotes.view')).toBe(false);
  });
  it('refuse sans compte', () => expect(can(null, 'quotes.view')).toBe(false));
  it('formate les FCFA entiers et les dates invalides', () => {
    expect(money(1800000).replaceAll(/\s/g, '')).toBe('1800000FCFA');
    expect(date(null)).toBe('—');
    expect(date('invalide')).toBe('—');
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
describe('formulaires', () => {
  it('affiche le nom du contact et non son UUID dans les sélecteurs', () => {
    expect(referenceLabel({ id: 'uuid', first_name: 'Marie', last_name: 'Koné' })).toBe('Marie Koné');
  });
  it('ne sérialise jamais la date de réalisation ou le lien technique de relance', () => {
    const fields = modules.find((m) => m.key === 'activities')!.fields;
    const payload = serializeFields(fields, {
      ...Object.fromEntries(fields.map((field) => [field.key, initial(field)])),
      title: 'Compte rendu',
      done_at: '2020-01-01',
      follow_up_of_id: 'forgé',
      outcome: 'Budget confirmé',
      contact_result: 'joint',
    });
    expect(payload).toMatchObject({ outcome: 'Budget confirmé', contact_result: 'joint' });
    expect(payload).not.toHaveProperty('done_at');
    expect(payload).not.toHaveProperty('follow_up_of_id');
  });
  it('affiche les dates/heures SQL UTC et ISO de manière cohérente sans inventer une date inconnue', () => {
    expect(dateTime('2026-11-03 09:30:00')).toBe(dateTime('2026-11-03T09:30:00Z'));
    expect(dateTime(null)).toBe('—');
    expect(dateTime('date inconnue')).toBe('—');
  });
  it('garde les détails structurés des doublons pour la confirmation utilisateur', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'Doublon possible',
            duplicates: [{ id: 'org-1', reasons: ['Même e-mail'] }],
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    await expect(api.post('/organizations', { legal_name: 'Société' })).rejects.toMatchObject({
      status: 409,
      details: { duplicates: [{ id: 'org-1' }] },
    });
  });
  it('sérialise les lignes ERP et ignore leurs champs non autorisés', () => {
    const fields = [
      {
        key: 'materials',
        label: '',
        type: 'rows' as const,
        fields: [
          { key: 'stock_item_id', label: '' },
          { key: 'quantity', label: '', type: 'number' as const },
        ],
      },
    ];
    expect(
      serializeFields(fields, { materials: [{ stock_item_id: 'uuid', quantity: '1.5', balance: 99999 }] }),
    ).toEqual({ materials: [{ stock_item_id: 'uuid', quantity: 1.5 }] });
  });
  it('détecte réellement les changements dans les listes de lignes', () => {
    const fields = [
      {
        key: 'lines',
        label: '',
        type: 'rows' as const,
        fields: [{ key: 'debit', label: '', type: 'number' as const }],
      },
    ];
    expect(serializeFields(fields, { lines: [{ debit: '200' }] }, { lines: [{ debit: 100 }] })).toEqual({
      lines: [{ debit: 200 }],
    });
  });
  it('adapte les échéances SQL UTC sans changer l’instant', () => {
    expect(toApiDateTime('2026-11-02T15:00:00Z')).toBe('2026-11-02 15:00:00');
    expect(parseDateTime('2026-11-02 15:00:00').toISOString()).toBe('2026-11-02T15:00:00.000Z');
    const result = serializeFields([{ key: 'due_at', label: '', type: 'datetime-local' }], {
      due_at: '2026-11-02T15:00',
    });
    expect(result.due_at).toMatch(/^2026-11-02 \d{2}:00:00$/);
  });
  it('convertit les montants, booléens et identifiants numériques', () =>
    expect(
      serializeFields(
        [
          { key: 'amount', label: '', type: 'number' },
          { key: 'is_active', label: '', type: 'checkbox' },
          { key: 'role_id', label: '' },
        ],
        { amount: '1000', is_active: false, role_id: '2' },
      ),
    ).toEqual({ amount: 1000, is_active: false, role_id: 2 }));
  it('ne renvoie pas les droits inchangés lors d’une modification', () =>
    expect(
      serializeFields(
        [
          { key: 'name', label: '' },
          { key: 'role_id', label: '' },
        ],
        { name: 'Nouveau', role_id: '2' },
        { name: 'Ancien', role_id: 2 },
      ),
    ).toEqual({ name: 'Nouveau' }));
  it('ne vide pas un mot de passe par erreur', () =>
    expect(serializeFields([{ key: 'password', label: '', type: 'password' }], { password: '' })).toEqual(
      {},
    ));
  it('peut effacer un champ nullable', () =>
    expect(
      serializeFields(
        [{ key: 'email', label: '', nullable: true }],
        { email: '' },
        { email: 'ancien@example.com' },
      ),
    ).toEqual({ email: null }));
  it('convertit les décimaux des lignes sans calculer le total côté navigateur', () =>
    expect(
      quoteLinePayload({
        label: 'Enseigne',
        unit: 'unité',
        quantity: '1.5',
        duration: '2',
        unit_price: 1000,
        unit_cost: 500,
        tax_rate: '18',
        discount_pct: '0',
      }),
    ).toMatchObject({ quantity: 1.5, duration: 2, unit_price: 1000, tax_rate: 18 }));
});
describe('client HTTP Laravel', () => {
  it('envoie le multipart avec CSRF sans imposer un Content-Type JSON', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'doc' } }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetch);
    const body = new FormData();
    body.append('kind', 'photo');
    await api.upload('/attachments', body);
    expect(fetch.mock.calls[0][1].body).toBe(body);
    expect(fetch.mock.calls[0][1].headers['X-XSRF-TOKEN']).toBe('csrf=test');
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Content-Type');
  });
  it('reçoit une pièce jointe du type attendu et refuse du HTML à sa place', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('image', { headers: { 'Content-Type': 'image/png' } }))
      .mockResolvedValueOnce(
        new Response('<html>connexion</html>', { headers: { 'Content-Type': 'text/html' } }),
      );
    vi.stubGlobal('fetch', fetch);
    await expect(
      request('/attachments/id/file', { binary: true, binaryTypes: ['image/png'] }),
    ).resolves.toBeInstanceOf(Blob);
    await expect(
      request('/attachments/id/file', { binary: true, binaryTypes: ['image/png'] }),
    ).rejects.toThrow('document valide');
  });
  it('laisse une déconnexion refusée afficher son erreur sans prétendre fermer la session', async () => {
    const handler = vi.fn();
    onUnauthenticated(handler);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'CSRF' }), {
          status: 419,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    await expect(
      request('/auth/logout', { method: 'POST', invalidateSessionOnError: false }),
    ).rejects.toMatchObject({ status: 419 });
    expect(handler).not.toHaveBeenCalled();
  });
  it('ignore un 401 tardif provenant de la connexion précédente', async () => {
    const handler = vi.fn();
    onUnauthenticated(handler);
    let resolve!: (response: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((done) => {
            resolve = done;
          }),
      ),
    );
    advanceSession();
    const pending = api.get('/tasks');
    advanceSession();
    resolve(
      new Response(JSON.stringify({ message: 'Session expirée.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await expect(pending).rejects.toBeInstanceOf(HttpError);
    expect(handler).not.toHaveBeenCalled();
  });
  it('préserve zéro, false et encode les recherches', () =>
    expect(queryString({ page: 0, low: false, q: 'A&B', empty: '' })).toBe('?page=0&low=false&q=A%26B'));
  it('envoie les cookies et le CSRF, sans en-tête Authorization', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: [] }), { headers: { 'Content-Type': 'application/json' } }),
      );
    vi.stubGlobal('fetch', fetch);
    await api.post('/tasks', {});
    expect(fetch.mock.calls[0][1]).toMatchObject({
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': 'csrf=test', Accept: 'application/json' },
    });
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
  });
  it('initialise le cookie CSRF avant une mutation et partage les initialisations concurrentes', async () => {
    document.cookie = '';
    const fetch = vi.fn().mockImplementation(async () => {
      document.cookie = 'XSRF-TOKEN=nouveau%3Dcsrf';
      return new Response(null, { status: 204 });
    });
    vi.stubGlobal('fetch', fetch);
    await Promise.all([initializeCsrf(), initializeCsrf()]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('/sanctum/csrf-cookie');
  });
  it('explique une configuration qui ne renvoie pas de cookie CSRF', async () => {
    document.cookie = '';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(api.post('/auth/session', {})).rejects.toMatchObject({ status: 419 });
  });
  it('ne rejoue jamais une mutation refusée pour CSRF expiré', async () => {
    const handler = vi.fn();
    onUnauthenticated(handler);
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'CSRF' }), {
        status: 419,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetch);
    await expect(api.post('/tasks', {})).rejects.toMatchObject({ status: 419 });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledOnce();
  });
  it('distingue un refus métier de la révocation du compte', async () => {
    const handler = vi.fn();
    onUnauthenticated(handler);
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Action interdite' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'access_revoked' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetch);
    await expect(api.get('/quotes')).rejects.toMatchObject({ status: 403 });
    expect(handler).not.toHaveBeenCalled();
    await expect(api.get('/auth/me')).rejects.toMatchObject({ status: 403 });
    expect(handler).toHaveBeenCalledOnce();
  });
  it('efface la session logique sur 401', async () => {
    const handler = vi.fn();
    onUnauthenticated(handler);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Non connecté.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    await expect(api.get('/tasks')).rejects.toBeInstanceOf(HttpError);
    expect(handler).toHaveBeenCalledOnce();
  });
  it('conserve les erreurs de validation par champ', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Validation.', errors: { title: ['Obligatoire.'] } }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    await expect(api.post('/tasks', {})).rejects.toMatchObject({
      status: 422,
      errors: { title: ['Obligatoire.'] },
    });
  });
  it('accepte un succès sans contenu', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(api.delete('/tasks/id')).resolves.toBeUndefined();
  });
  it('explique les problèmes réseau', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api.get('/health')).rejects.toMatchObject({ status: 0 });
  });
  it('refuse du HTML à la place de JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html></html>')));
    await expect(api.get('/health')).rejects.toThrow('Réponse inattendue');
  });
});
