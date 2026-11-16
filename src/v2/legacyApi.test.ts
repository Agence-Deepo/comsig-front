import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, legacyApiPath } from '../lib/api';
import { API_BASE, advanceSession } from './api';

beforeEach(() => vi.stubGlobal('document', { cookie: 'XSRF-TOKEN=csrf%3Dtest' }));
afterEach(() => { vi.unstubAllGlobals(); advanceSession(); });

describe('adaptateur des écrans CRM', () => {
  it('normalise les routes et refuse les destinations extérieures arbitraires', () => {
    expect(legacyApiPath('/api/calendar?from=2026-01-01')).toBe('/calendar?from=2026-01-01');
    expect(legacyApiPath('/api/v1/flows')).toBe('/flows');
    expect(() => legacyApiPath('https://example.com/api/flows')).toThrow();
  });
  it('envoie les requêtes authentifiées vers la base API configurée avec protection CSRF', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    await api.post('/api/calendar/events', { title: 'Exemple' });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/calendar/events`, expect.objectContaining({
      method: 'POST', credentials: 'include', headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf=test' }),
    }));
  });
  it('conserve les erreurs de validation pour les formulaires repris', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Données invalides', errors: { title: ['Champ obligatoire.'] } }), { status: 422, headers: { 'Content-Type': 'application/json' } })));
    await expect(api.post('/api/flows', {})).rejects.toMatchObject({ status: 422, fields: { title: 'Champ obligatoire.' } });
  });
});
