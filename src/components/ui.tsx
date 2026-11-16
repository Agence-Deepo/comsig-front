// Composants du design system COM&SIG
import { cloneElement, forwardRef, isValidElement, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, ChevronRight, HelpCircle, Inbox, Info, X } from 'lucide-react';
import { statusOf, type Tone } from '../lib/labels';
import type { ApiError } from '../lib/api';

// ─── Boutons
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'soft' | 'danger' | 'default'; size?: 'sm' | 'md' | 'lg'; icon?: ReactNode; loading?: boolean; iconOnly?: boolean };
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button({ variant = 'default', size = 'md', icon, loading, iconOnly, children, className = '', disabled, ...rest }, ref) {
  const cls = ['btn', variant !== 'default' && `btn-${variant}`, size !== 'md' && `btn-${size}`, iconOnly && 'btn-icon', className].filter(Boolean).join(' ');
  return (
    <button ref={ref} type={rest.type ?? 'button'} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="spinner" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({ to, children, icon, variant = 'default', size = 'md' }: { to: string; children: ReactNode; icon?: ReactNode; variant?: BtnProps['variant']; size?: BtnProps['size'] }) {
  return <Link to={to} className={['btn', variant !== 'default' && `btn-${variant}`, size !== 'md' && `btn-${size}`].filter(Boolean).join(' ')}>{icon}{children}</Link>;
}

// ─── Badges
export function Badge({ tone = 'neutral', children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return <span className={`badge badge-${tone}${dot ? '' : ' no-dot'}`}>{children}</span>;
}
export function Status({ kind, code }: { kind: string; code?: string | null }) {
  const [label, tone] = statusOf(kind, code);
  return <Badge tone={tone}>{label}</Badge>;
}

// ─── Mise en page
export function PageHeader({ title, subtitle, actions, crumbs, eyebrow }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; crumbs?: { label: string; to?: string }[]; eyebrow?: ReactNode }) {
  useEffect(() => { if (typeof title === 'string') document.title = `${title} — COM&SIG CRM`; }, [title]);
  return (
    <header className="page-header">
      <div style={{ minWidth: 0 }}>
        {crumbs && (
          <nav className="breadcrumbs" aria-label="Fil d’Ariane">
            {crumbs.map((c, i) => (<span key={i} className="row" style={{ gap: 6 }}>{c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}{i < crumbs.length - 1 && <ChevronRight size={13} />}</span>))}
          </nav>
        )}
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="row-wrap">{actions}</div>}
    </header>
  );
}

export function Card({ title, sub, actions, children, flush, footer, className = '', id }: { title?: ReactNode; sub?: ReactNode; actions?: ReactNode; children?: ReactNode; flush?: boolean; footer?: ReactNode; className?: string; id?: string }) {
  return (
    <section className={`card ${className}`} id={id} aria-label={typeof title === 'string' ? title : undefined}>
      {(title || actions) && (
        <div className="card-header">
          <div style={{ minWidth: 0 }}>{title && <h2>{title}</h2>}{sub && <div className="card-sub">{sub}</div>}</div>
          <div className="spacer" />
          {actions && <div className="row-wrap">{actions}</div>}
        </div>
      )}
      <div className={`card-body${flush ? ' flush' : ''}`}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </section>
  );
}

// ─── Aide contextuelle (définition d'indicateur, explication)
export function Help({ title, children }: { title?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="help" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="help-btn" aria-label={`Aide : ${title ?? ''}`} aria-describedby={open ? id : undefined} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen((x) => !x)}>
        <HelpCircle />
      </button>
      {open && <span role="tooltip" id={id} className="help-pop">{title && <strong>{title}</strong>}{children}</span>}
    </span>
  );
}

// ─── Indicateur clé
export function Kpi({ label, value, unit, foot, help, progress, action, onClick }: { label: string; value: ReactNode; unit?: string; foot?: ReactNode; help?: { title: string; formula: string; source?: string; period?: string }; progress?: number | null; action?: boolean; onClick?: () => void }) {
  return (
    <div className={`card kpi${action ? ' kpi-action' : ''}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      <div className="kpi-label">{label}{help && <Help title={help.title}>{help.formula}{help.source && <><br /><em>Source : {help.source}</em></>}{help.period && <><br />Période : {help.period}</>}</Help>}</div>
      <div className="kpi-value">{value}{unit && <span className="unit">{unit}</span>}</div>
      {progress !== undefined && progress !== null && <div className="kpi-bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div>}
      {foot && <div className="kpi-foot">{foot}</div>}
    </div>
  );
}

// ─── Champs de formulaire
export function Field({ label, required, hint, error, children, className = '', htmlFor }: { label: ReactNode; required?: boolean; hint?: ReactNode; error?: string; children: ReactNode; className?: string; htmlFor?: string }) {
  // Associe le libellé au contrôle (lecteurs d'écran, clic sur le libellé) et relie le message d'erreur/d'aide
  const auto = useId();
  const msgId = `${auto}-msg`;
  let id = htmlFor;
  let control = children;
  if (!id && isValidElement(children) && (FIELD_CONTROLS.has(children.type as any) || ['input', 'select', 'textarea'].includes(children.type as string))) {
    const props = children.props as any;
    id = props.id ?? auto;
    control = cloneElement(children as any, { id, 'aria-describedby': error || hint ? msgId : undefined, ...(error ? { 'aria-invalid': true } : {}) });
  }
  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>{label}{required && <span className="req" aria-hidden>*</span>}</label>
      {control}
      {error ? <div className="field-error" role="alert" id={msgId}><AlertCircle size={13} />{error}</div> : hint ? <div className="field-hint" id={msgId}>{hint}</div> : null}
    </div>
  );
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(function Input({ invalid, className = '', ...p }, ref) {
  return <input ref={ref} className={`input ${className}`} aria-invalid={invalid || undefined} {...p} />;
});
export function Select({ invalid, options, placeholder, className = '', ...p }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select className={`select ${className}`} aria-invalid={invalid || undefined} {...p}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(function Textarea({ invalid, className = '', ...p }, ref) {
  return <textarea ref={ref} className={`textarea ${className}`} aria-invalid={invalid || undefined} {...p} />;
});
/** Saisie d'un montant en FCFA (espaces de milliers à l'affichage). */
export function MoneyInput({ value, onChange, invalid, id, placeholder }: { value: number | null | undefined; onChange: (n: number | null) => void; invalid?: boolean; id?: string; placeholder?: string }) {
  const [text, setText] = useState(value === null || value === undefined ? '' : new Intl.NumberFormat('fr-FR').format(value).replace(/ | /g, ' '));
  useEffect(() => { const cur = text.replace(/\s/g, ''); if (String(value ?? '') !== cur) setText(value === null || value === undefined ? '' : new Intl.NumberFormat('fr-FR').format(value).replace(/ | /g, ' ')); }, [value]);
  return (
    <div className="input-group" style={{ position: 'relative' }}>
      <input id={id} className="input num" style={{ paddingLeft: 11, paddingRight: 48 }} inputMode="numeric" aria-invalid={invalid || undefined} placeholder={placeholder} value={text}
        onChange={(e) => { const raw = e.target.value.replace(/[^\d]/g, ''); setText(raw ? new Intl.NumberFormat('fr-FR').format(Number(raw)).replace(/ | /g, ' ') : ''); onChange(raw ? Number(raw) : null); }} />
      <span className="input-suffix">FCFA</span>
    </div>
  );
}

// ─── Fenêtres modales
export function Modal({ open, onClose, title, description, children, footer, size }: { open: boolean; onClose: () => void; title: ReactNode; description?: ReactNode; children?: ReactNode; footer?: ReactNode; size?: 'lg' | 'xl' }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const list = [...f].filter((x) => !x.hasAttribute('disabled'));
        if (!list.length) return;
        if (e.shiftKey && document.activeElement === list[0]) { e.preventDefault(); list.at(-1)!.focus(); }
        else if (!e.shiftKey && document.activeElement === list.at(-1)) { e.preventDefault(); list[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    setTimeout(() => (ref.current?.querySelector<HTMLElement>('input, select, textarea, button.btn-primary') ?? ref.current)?.focus(), 30);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div className="modal-root">
      <div className="scrim" onClick={onClose} />
      <div className={`modal ${size ?? ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={ref} tabIndex={-1}>
        <div className="modal-head">
          <div style={{ flex: 1 }}><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div>
          <Button variant="ghost" iconOnly size="sm" aria-label="Fermer" onClick={onClose} icon={<X />} />
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/** Confirmation des opérations sensibles, avec saisie de motif facultative/obligatoire. */
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmer', danger, reason, loading }: {
  open: boolean; onClose: () => void; onConfirm: (reason: string) => void; title: string; message: ReactNode; confirmLabel?: string; danger?: boolean;
  reason?: { label: string; required?: boolean; placeholder?: string }; loading?: boolean;
}) {
  const [text, setText] = useState('');
  useEffect(() => { if (open) setText(''); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title={title} footer={<>
      <Button onClick={onClose}>Annuler</Button>
      <Button variant={danger ? 'danger' : 'primary'} loading={loading} disabled={reason?.required && !text.trim()} onClick={() => onConfirm(text)}>{confirmLabel}</Button>
    </>}>
      <div className="stack">
        <div className="secondary">{message}</div>
        {reason && <Field label={reason.label} required={reason.required}><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={reason.placeholder} /></Field>}
      </div>
    </Modal>
  );
}

// ─── Onglets
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: ReactNode; count?: number; hidden?: boolean }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.filter((t) => !t.hidden).map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}>
          {t.label}{t.count !== undefined && <span className="count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
export function Segmented<T extends string>({ options, value, onChange, label }: { options: { id: T; label: ReactNode; icon?: ReactNode }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.icon}{o.label}</button>)}
    </div>
  );
}

// ─── États
export function Empty({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon ?? <Inbox />}</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
export function Skeleton({ h = 16, w = '100%', r }: { h?: number; w?: number | string; r?: number }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} aria-hidden />;
}
export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  return <div className="stack" aria-busy="true" aria-label="Chargement">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} h={18} w={`${90 - i * 8}%`} />)}</div>;
}
export function ErrorState({ error, onRetry }: { error: ApiError | Error | null; onRetry?: () => void }) {
  const status = (error as ApiError)?.status;
  return (
    <div className="empty">
      <div className="empty-icon" style={{ color: 'var(--danger)' }}><AlertTriangle /></div>
      <h3>{status === 403 ? 'Accès non autorisé' : status === 404 ? 'Élément introuvable' : 'Impossible de charger les données'}</h3>
      <p>{error?.message}</p>
      {onRetry && status !== 403 && status !== 404 && <Button onClick={onRetry}>Réessayer</Button>}
    </div>
  );
}
export function Alert({ tone = 'info', title, children, action }: { tone?: 'info' | 'warning' | 'danger' | 'success'; title?: ReactNode; children?: ReactNode; action?: ReactNode }) {
  const icon = tone === 'danger' ? <AlertCircle /> : tone === 'warning' ? <AlertTriangle /> : tone === 'success' ? <CheckCircle2 /> : <Info />;
  return (
    <div className={`alert alert-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>{title && <div className="alert-title">{title}</div>}{children}</div>
      {action}
    </div>
  );
}
/** Explique une erreur métier : message + liste des éléments manquants le cas échéant. */
export function ErrorExplain({ error }: { error: ApiError | null }) {
  if (!error || error.fields) return null;
  const issues: { message: string }[] = error.details?.issues ?? [];
  return (
    <Alert tone="danger" title={error.status === 403 ? 'Action non autorisée' : error.status === 409 ? 'Conflit' : 'Action impossible'}>
      {issues.length ? <ul>{issues.map((i, k) => <li key={k}>{i.message}</li>)}</ul> : <div>{error.message}</div>}
    </Alert>
  );
}

// ─── Tableau de données
export interface Column<T> { key: string; label: ReactNode; render?: (r: T) => ReactNode; num?: boolean; sortable?: boolean; width?: number | string; mobile?: 'hide' | 'label' }
export function DataTable<T extends { id?: string }>({ columns, rows, onRowClick, loading, empty, sort, onSort, caption, compact, rowClass }: {
  columns: Column<T>[]; rows: T[] | undefined; onRowClick?: (r: T) => void; loading?: boolean; empty?: ReactNode; sort?: { key: string; dir: 'asc' | 'desc' }; onSort?: (key: string) => void; caption?: string; compact?: boolean; rowClass?: (r: T) => string;
}) {
  if (loading) return <div style={{ padding: '8px 20px 20px' }}><LoadingBlock rows={6} /></div>;
  if (!rows?.length) return <>{empty ?? <Empty title="Aucun élément" />}</>;
  return (
    <div className="table-wrap">
      <table className={`table responsive${compact ? ' table-compact' : ''}`}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead><tr>{columns.map((c) => (
          <th key={c.key} className={c.num ? 'num' : ''} style={{ width: c.width }} aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
            {c.sortable && onSort ? <button onClick={() => onSort(c.key)}>{c.label}{sort?.key === c.key && (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button> : c.label}
          </th>
        ))}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className={`${onRowClick ? 'clickable' : ''} ${rowClass?.(r) ?? ''}`} onClick={onRowClick ? () => onRowClick(r) : undefined}
              tabIndex={onRowClick ? 0 : undefined} onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(r); } : undefined}>
              {columns.map((c) => (
                <td key={c.key} className={c.num ? 'num' : ''} data-mobile={c.mobile === 'hide' ? 'hide' : undefined} data-label={c.mobile === 'label' && typeof c.label === 'string' ? c.label : undefined}>
                  {c.render ? c.render(r) : (r as any)[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Divers
export function Avatar({ name, size }: { name?: string | null; size?: 'sm' }) {
  const ini = (name ?? '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return <span className={`avatar ${size ?? ''}`} aria-hidden>{ini}</span>;
}
export function Dl({ items }: { items: [ReactNode, ReactNode][] }) {
  return <dl className="dl">{items.map(([k, v], i) => <div key={i} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v ?? '—'}</dd></div>)}</dl>;
}

// Contrôles auxquels Field associe automatiquement son libellé
const FIELD_CONTROLS = new Set<unknown>([Input, Select, Textarea, MoneyInput]);
