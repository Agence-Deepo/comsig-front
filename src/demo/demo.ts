// Mode démonstration (build `VITE_DEMO=1`) : l'interface réelle du CRM, servie par un instantané des réponses
// de l'API capturé sur une instance réelle chargée avec le jeu de données fictif. Lecture seule.
import { ApiError } from '../lib/api-error';

export const DEMO = import.meta.env.VITE_DEMO === '1';

export interface DemoProfile { key: string; label: string; role: string; description: string; name: string }
interface Snapshot {
  generatedAt: string;
  profiles: DemoProfile[];
  data: Record<string, Record<string, unknown>>;   // profil → « MÉTHODE /api/…?… » → réponse
  ai: Record<string, Record<string, unknown>>;     // profil → « contexte|id|message » → réponse de l'assistant
  files: Record<string, string>;                   // document → data: URI (photos de démonstration)
  search: Record<string, { type: string; id: string; title: string; subtitle: string; link: string }[]>; // profil → index de recherche
  xlsx?: Record<string, Record<string, { name: string; b64: string }>>; // profil → adresse Excel → classeur généré lors de la capture
}

let snap: Snapshot | null = null;
function snapshot(): Snapshot {
  if (!snap) {
    const el = document.getElementById('demo-data');
    snap = el ? (JSON.parse(el.textContent || '{}') as Snapshot) : { generatedAt: '', profiles: [], data: {}, ai: {}, files: {}, search: {}, xlsx: {} };
  }
  return snap;
}

let profile: string | null = null;
try { profile = sessionStorage.getItem('demo-profile'); } catch { /* stockage indisponible */ }

export const demoProfiles = () => snapshot().profiles;
/** Session capturée d'un profil de démonstration (département et rôle) : sert au portail de la démonstration. */
export const demoProfileMe = (key: string) => ((snapshot().data[key] ?? {})['GET /api/auth/me'] as any) as { department_code?: string | null; role_code?: string } | undefined;
export const demoGeneratedAt = () => snapshot().generatedAt;
export const currentProfile = () => profile;
export function setProfile(key: string | null) {
  profile = key;
  try { if (key) sessionStorage.setItem('demo-profile', key); else sessionStorage.removeItem('demo-profile'); } catch { /* stockage indisponible */ }
}

export const READ_ONLY = 'Version de démonstration en lecture seule : cette action fonctionne dans le logiciel installé, mais rien n’est enregistré ici.';

/** Empreinte stable d'un corps de requête (identique à celle calculée lors de la capture). */
export function hashBody(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export async function demoRequest<T>(method: string, url: string, body?: unknown): Promise<T> {
  await new Promise((r) => setTimeout(r, 60)); // laisse les états de chargement s'afficher brièvement
  const s = snapshot();
  const path = url.split('?')[0];
  if (path === '/api/auth/me') return { me: profile ? s.data[profile]?.['GET /api/auth/me'] ?? null : null } as T;
  if (path === '/api/auth/logout') { setProfile(null); return { ok: true } as T; }
  if (!profile) throw new ApiError(401, 'unauthenticated', 'Choisissez un profil de démonstration.');
  const data = s.data[profile] ?? {};

  if (method === 'GET' && path === '/api/search') {
    const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const term = norm(new URLSearchParams(url.split('?')[1] ?? '').get('q') ?? '').trim();
    if (term.length < 2) return { results: [] } as T;
    return { results: (s.search[profile] ?? []).filter((r) => norm(`${r.title} ${r.subtitle}`).includes(term)).slice(0, 40) } as T;
  }
  if (method === 'GET') {
    let hit = data[`GET ${url}`] ?? data[`GET ${path}`];
    if (hit === undefined) {
      // Écrans dont l'adresse dépend de la date du jour (calendrier, temps passé…) : réponse capturée pour la même ressource
      const want = new URLSearchParams(url.split('?')[1] ?? '');
      const same = Object.keys(data).filter((k) => k.startsWith(`GET ${path}?`));
      // Période glissante (du… au… jusqu'à aujourd'hui) : la capture de même durée et de mêmes autres critères
      if (want.get('from') && want.get('to')) {
        const span = (q: URLSearchParams) => (Date.parse(q.get('to') ?? '') - Date.parse(q.get('from') ?? '')) / 86_400_000;
        const target = span(want);
        const others = [...want.keys()].filter((k) => k !== 'from' && k !== 'to');
        const cands = same.map((k) => [k, new URLSearchParams(k.split('?')[1])] as const)
          .filter(([, q]) => q.get('from') && q.get('to') && others.every((o) => q.get(o) === want.get(o)))
          .sort((a, b) => Math.abs(span(a[1]) - target) - Math.abs(span(b[1]) - target));
        if (cands.length) hit = data[cands[0][0]];
      }
      const key = same.find((k) => new URLSearchParams(k.split('?')[1]).get('owner_id') === want.get('owner_id')) ?? (want.get('owner_id') ? undefined : same[0]);
      if (hit === undefined && key && /\/api\/(calendar|time\/report|accounting\/(balance|ledger\/\w+))$/.test(path)) hit = data[key];
    }
    if (hit !== undefined) return clone(hit) as T;
    // Liste filtrée non capturée : réponse vide plutôt qu'une erreur
    if (!/\/[0-9a-f-]{36}(\/|$)/.test(path)) return { rows: [] } as T;
    throw new ApiError(404, 'not_found', 'Élément non inclus dans la démonstration.');
  }
  if (method === 'POST' && path === '/api/quotes/simulate') {
    const hit = data[`POST ${path}#${hashBody(JSON.stringify(body ?? {}))}`];
    if (hit !== undefined) return clone(hit) as T;
    throw new ApiError(422, 'demo', 'Recalcul non disponible en démonstration : modifiez les lignes dans le logiciel installé.');
  }
  if (method === 'POST' && path === '/api/ai/chat') {
    const b = (body ?? {}) as { message?: string; context_type?: string | null; context_id?: string | null };
    const answers = s.ai[profile] ?? {};
    const hit = answers[`${b.context_type ?? ''}|${b.context_id ?? ''}|${b.message ?? ''}`];
    if (hit) return clone(hit) as T;
    return {
      conversation_id: 'demo', actions: [],
      message: {
        id: `demo-${Date.now()}`, role: 'assistant', confidence: 'elevee', provider: 'regles', sources: [], warnings: [],
        content: 'En démonstration, l’assistant répond aux **questions suggérées** (boutons proposés au-dessus de la zone de saisie). '
          + 'Dans le logiciel installé, il répond à toute question à partir des données du CRM, en citant ses sources et sans jamais inventer de chiffre.',
      },
    } as T;
  }
  if (method === 'POST' && path === '/api/notifications/read') return { ok: true } as T;
  throw new ApiError(422, 'demo', READ_ONLY);
}

/** Fichier joint (photo de preuve…) : data: URI si inclus dans la démonstration. */
export const demoFile = (id: string) => snapshot().files[id];

/** Fichier capturé pour cette adresse (Excel, PDF ou Word) : même adresse, sinon même liste avec d'autres filtres. */
function demoWorkbook(url: string) {
  const files = (profile && snapshot().xlsx?.[profile]) || {};
  const path = url.split('?')[0];
  return files[url] ?? files[Object.keys(files).find((k) => k.split('?')[0] === path) ?? ''] ?? null;
}

type DownloadsNs = { save: (r: { filename: string; data: Blob }) => Promise<{ status: string }> };
const notice = (detail: string) => window.dispatchEvent(new CustomEvent('demo:notice', { detail }));

/** Téléchargement en démonstration : le fichier réellement généré par le logiciel lors de la capture, proposé au visiteur. */
export async function demoDownload(url: string) {
  const wb = demoWorkbook(url);
  if (!wb) { notice('Ce fichier n’est pas inclus dans la démonstration : il est généré à la demande dans le logiciel installé.'); return; }
  const bin = atob(wb.b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const ext = wb.name.split('.').pop()?.toLowerCase();
  const blob = new Blob([bytes], { type: ext === 'pdf' ? 'application/pdf' : ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const claude = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
  const downloads = claude?.use ? ((await claude.use('downloads').catch(() => null)) as DownloadsNs | null) : null;
  if (downloads) {
    try { await downloads.save({ filename: wb.name, data: blob }); }
    catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === 'declined') return;
      notice(code === 'rate_limited' ? 'Un téléchargement est déjà en attente de confirmation.' : 'Le téléchargement n’est pas disponible dans cette vue.');
    }
    return;
  }
  // Page ouverte hors de la visionneuse (fichier local) : lien de téléchargement classique
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = wb.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}
