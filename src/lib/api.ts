// Client HTTP : en-tête anti-CSRF, erreurs typées, gestion de la session expirée
import { ApiError } from './api-error';
import { DEMO, demoRequest, demoFile, demoDownload } from '../demo/demo';
import { API_BASE, HttpError, request as v2Request } from '../v2/api';

export { ApiError };

let onUnauthenticated: (() => void) | null = null;
export function setUnauthenticatedHandler(fn: () => void) { onUnauthenticated = fn; }

export function legacyApiPath(url: string): string {
  if (url.startsWith('/api/v1/')) return url.slice('/api/v1'.length);
  if (url.startsWith('/api/')) return url.slice('/api'.length);
  throw new ApiError(0, 'invalid_url', 'Adresse API non prise en charge.');
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  if (DEMO) {
    try { return await demoRequest<T>(method, url, body); }
    catch (e) { if (e instanceof ApiError && e.status === 401 && e.code === 'unauthenticated') onUnauthenticated?.(); throw e; }
  }
  try {
    return await v2Request<T>(legacyApiPath(url), { method, body });
  } catch (error) {
    if (!(error instanceof HttpError)) throw error;
    if (error.status === 401 || error.status === 419) onUnauthenticated?.();
    const fields = Object.keys(error.errors ?? {}).length ? Object.fromEntries(Object.entries(error.errors).map(([key, messages]) => [key, messages[0]])) : undefined;
    throw new ApiError(error.status, String(error.details?.code ?? 'http'), error.message, fields, error.details);
  }
}

export const api = {
  get: <T = any>(url: string) => request<T>('GET', url),
  post: <T = any>(url: string, body: unknown = {}) => request<T>('POST', url, body),
  patch: <T = any>(url: string, body: unknown) => request<T>('PATCH', url, body),
  put: <T = any>(url: string, body: unknown) => request<T>('PUT', url, body),
  del: <T = any>(url: string) => request<T>('DELETE', url),
  upload: <T = any>(url: string, form: FormData) => request<T>('POST', url, form),
};

/** Construit une query string en ignorant les valeurs vides. */
export function qs(params: Record<string, unknown>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '' && v !== false) p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Téléchargement d'un export (CSV/XLSX/PDF) via un lien direct (cookie de session). */
export function download(url: string) {
  if (DEMO) { void demoDownload(url); return; }
  const a = document.createElement('a');
  a.href = API_BASE + legacyApiPath(url); a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
}

/** Adresse d'un fichier joint ; en démonstration, photo intégrée (data: URI) ou absence de lien. */
export function fileUrl(documentId: string): string | undefined {
  return DEMO ? demoFile(documentId) : `${API_BASE}/attachments/${encodeURIComponent(documentId)}/file`;
}
/** En démonstration, signale qu'un téléchargement n'est disponible que dans le logiciel installé. */
export function demoNotice(e?: { preventDefault: () => void }, message = 'Les fichiers et documents PDF s’ouvrent dans le logiciel installé.') {
  if (!DEMO) return false;
  e?.preventDefault();
  window.dispatchEvent(new CustomEvent('demo:notice', { detail: message }));
  return true;
}
