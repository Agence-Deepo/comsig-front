export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> = {},
    public details: Record<string, any> = {},
  ) {
    super(message);
  }
}
const configured = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const API_BASE = configured.replace(/\/$/, '');
// Authentication is a server-side HttpOnly cookie. Only the CSRF cookie is read
// by JS. This counter prevents a late response from closing a newer session.
let sessionRevision = 0;
let unauthenticated: (() => void) | undefined;
export function advanceSession() {
  sessionRevision += 1;
}
export function onUnauthenticated(handler: () => void) {
  unauthenticated = handler;
  return () => {
    if (unauthenticated === handler) unauthenticated = undefined;
  };
}
const csrfUrl = import.meta.env.VITE_CSRF_URL || API_BASE.replace(/\/api\/v1$/, '') + '/sanctum/csrf-cookie';
let csrfPending: Promise<void> | undefined;
function csrfCookie() {
  const cookie = typeof document === 'undefined' ? '' : document.cookie;
  const value = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('XSRF-TOKEN='));
  try {
    return value ? decodeURIComponent(value.slice('XSRF-TOKEN='.length)) : '';
  } catch {
    return '';
  }
}
export async function initializeCsrf() {
  if (!csrfPending) {
    csrfPending = (async () => {
      let response: Response;
      try {
        response = await fetch(csrfUrl, {
          credentials: 'include',
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });
      } catch {
        throw new HttpError(0, 'API inaccessible. Vérifiez le serveur Laravel et la configuration réseau.');
      }
      if (!response.ok || !csrfCookie())
        throw new HttpError(
          response.ok ? 419 : response.status,
          'La session sécurisée ne peut pas être initialisée. Vérifiez les cookies et la configuration des domaines.',
        );
    })().finally(() => {
      csrfPending = undefined;
    });
  }
  return csrfPending;
}
export function queryString(params: Record<string, unknown>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  return query.size ? `?${query}` : '';
}
export async function request<T = any>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    signal?: AbortSignal;
    binary?: boolean;
    binaryTypes?: string[];
    invalidateSessionOnError?: boolean;
  } = {},
): Promise<T> {
  const revision = sessionRevision;
  const method = options.method || 'GET';
  const mutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const multipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (mutation && !csrfCookie()) await initializeCsrf();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      signal: options.signal,
      cache: 'no-store',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(mutation ? { 'X-XSRF-TOKEN': csrfCookie() } : {}),
        ...(options.body === undefined || multipart ? {} : { 'Content-Type': 'application/json' }),
      },
      body:
        options.body === undefined
          ? undefined
          : multipart
            ? (options.body as FormData)
            : JSON.stringify(options.body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new HttpError(0, 'API inaccessible. Vérifiez le serveur Laravel et la configuration réseau.');
  }
  if (response.status === 204) return undefined as T;
  if (options.binary && response.ok) {
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!(options.binaryTypes ?? ['application/pdf', 'text/csv']).includes(contentType))
      throw new HttpError(200, 'Le serveur n’a pas renvoyé un document valide.');
    return (await response.blob()) as T;
  }
  const payload = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : null;
  if (!response.ok) {
    // Do not replay mutations after 419: their outcome may be ambiguous.
    if (
      ([401, 419].includes(response.status) || payload?.code === 'access_revoked') &&
      revision === sessionRevision &&
      options.invalidateSessionOnError !== false
    )
      unauthenticated?.();
    throw new HttpError(
      response.status,
      response.status === 419
        ? 'La session a expiré. Reconnectez-vous avant de recommencer cette action.'
        : response.status === 413
          ? 'Le fichier dépasse la limite d’envoi du serveur. Réduisez sa taille.'
          : payload?.message || `La requête a échoué (${response.status}).`,
      payload?.errors,
      payload ?? {},
    );
  }
  if (payload === null)
    throw new HttpError(response.status, 'Réponse inattendue : vérifiez l’adresse de l’API.');
  return payload as T;
}
export const api = {
  get: <T = any>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T = any>(path: string, body: unknown = {}) => request<T>(path, { method: 'POST', body }),
  patch: <T = any>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T = any>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
  upload: <T = any>(path: string, body: FormData) => request<T>(path, { method: 'POST', body }),
};

export async function downloadFile(path: string, filename: string, binaryTypes?: string[]) {
  const blob = await request<Blob>(path, { binary: true, binaryTypes });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
