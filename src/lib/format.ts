const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const clean = (s: string) => s.replace(/ | /g, ' ');

export const num = (n: number | null | undefined) => (n === null || n === undefined || Number.isNaN(n) ? '—' : clean(nf.format(n)));
export const money = (n: number | null | undefined) => (n === null || n === undefined ? '—' : `${num(n)} FCFA`);
/** Montant compact pour les indicateurs : 12,4 M */
export function moneyShort(n: number | null | undefined) {
  if (n === null || n === undefined) return '—';
  const a = Math.abs(n);
  if (a >= 1e9) return `${clean((n / 1e9).toLocaleString('fr-FR', { maximumFractionDigits: 2 }))} Md`;
  if (a >= 1e6) return `${clean((n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }))} M`;
  if (a >= 1e3) return `${clean((n / 1e3).toLocaleString('fr-FR', { maximumFractionDigits: 0 }))} k`;
  return num(n);
}
export const pct = (n: number | null | undefined, digits = 1) => (n === null || n === undefined ? '—' : `${clean(Number(n).toLocaleString('fr-FR', { maximumFractionDigits: digits }))} %`);

export function date(d: string | null | undefined) {
  if (!d) return '—';
  const x = new Date(d.length === 10 ? d + 'T00:00:00' : d);
  return x.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function dateTime(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
export function relative(d: string | null | undefined) {
  if (!d) return '—';
  const x = new Date(d.length === 10 ? d + 'T00:00:00' : d).getTime();
  const days = Math.round((x - Date.now()) / 86400000);
  if (Math.abs(days) < 1) {
    const h = Math.round((x - Date.now()) / 3600000);
    if (Math.abs(h) < 1) return 'à l’instant';
    return h > 0 ? `dans ${h} h` : `il y a ${-h} h`;
  }
  if (days === 1) return 'demain';
  if (days === -1) return 'hier';
  return days > 0 ? `dans ${days} j` : `il y a ${-days} j`;
}
export const today = () => new Date().toISOString().slice(0, 10);
export const addDays = (d: string, n: number) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
export const initials = (name?: string | null) => (name ?? '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
export const bytes = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} Mo` : `${Math.max(1, Math.round(n / 1e3))} Ko`);

/**
 * Chemin interne sûr : refuse les URL absolues, protocol-relatives (`//`), les barres obliques inverses
 * et tout schéma (`javascript:`…). Les liens issus des données ne peuvent ainsi jamais sortir de l'application.
 */
export function safePath(p: unknown, fallback = '/'): string {
  if (typeof p !== 'string') return fallback;
  return /^\/(?![\/\\])[^\\\s]*$/.test(p) ? p : fallback;
}
/** Lien de messagerie uniquement (`mailto:`). */
export const safeMailto = (m: unknown) => (typeof m === 'string' && /^mailto:[^\s<>"]+$/i.test(m) ? m : undefined);
