import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Check, LoaderCircle, X } from 'lucide-react';
import { HttpError } from './api';
import { label, type Page } from './types';
import { Badge, Button, Empty as CrmEmpty, PageHeader } from '../components/ui';

export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={22} /> Chargement…
    </div>
  );
}
export function ErrorBox({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null;
  const fields = error instanceof HttpError ? error.errors : {};
  const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
  const repeated = Object.values(fields).some((messages) => messages.includes(message));
  return (
    <div className="notice danger" role="alert">
      <AlertCircle size={18} />
      <div>
        <strong>{repeated ? 'Vérifiez les champs indiqués.' : message}</strong>
        {Object.entries(fields).map(([key, messages]) => (
          <div key={key}>
            {key} : {messages.join(' ')}
          </div>
        ))}
        {retry && (
          <button className="text-button" onClick={retry}>
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}
export function Status({ value }: { value: unknown }) {
  const tone = [
    'accepte',
    'gagne',
    'valide',
    'payee',
    'paye',
    'valide_dg',
    'comptabilise',
    'finis',
    'livre',
    'termine',
  ].includes(String(value))
    ? 'green'
    : ['refuse', 'perdu', 'annule', 'expire'].includes(String(value))
      ? 'red'
      : ['soumis', 'partiellement_payee', 'en_cours'].includes(String(value))
        ? 'amber'
        : 'neutral';
  return (
    <span className={`status ${tone}`}>
      <Badge
        tone={
          tone === 'green' ? 'success' : tone === 'red' ? 'danger' : tone === 'amber' ? 'warning' : 'neutral'
        }
      >
        {label(value)}
      </Badge>
    </span>
  );
}
export function PageTitle({
  eyebrow = 'ESPACE DE TRAVAIL',
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} — COMSIG`;
  }, [title]);
  return (
    <PageHeader
      title={title}
      subtitle={description}
      actions={actions}
      eyebrow={eyebrow === 'ESPACE DE TRAVAIL' ? undefined : eyebrow}
    />
  );
}
export function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  // Same CRM markup, but focus before paint, not via a delayed timer which
  // can steal focus after the user has already moved to another field.
  useLayoutEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    (
      ref.current?.querySelector<HTMLElement>('input, select, textarea, button.btn-primary') ?? ref.current
    )?.focus();
    return () => previous?.focus?.();
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key === 'Tab' && ref.current) {
        const controls = Array.from(
          ref.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0);
        if (!controls.length) return;
        if (event.shiftKey && document.activeElement === controls[0]) {
          event.preventDefault();
          controls.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === controls.at(-1)) {
          event.preventDefault();
          controls[0].focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return createPortal(
    <div className="modal-root">
      <div className="scrim" onClick={close} />
      <div
        className="modal lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={ref}
        tabIndex={-1}
      >
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <h2 id="modal-title">{title}</h2>
          </div>
          <Button variant="ghost" iconOnly size="sm" aria-label="Fermer" onClick={close} icon={<X />} />
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
export function Pager({ page, change }: { page?: Page; change: (page: number) => void }) {
  if (!page) return null;
  return (
    <div className="pager">
      <span>
        {page.total} résultat{page.total > 1 ? 's' : ''} · Page {page.current_page} / {page.last_page}
      </span>
      <div className="actions">
        <button
          className="button"
          aria-label="Page précédente"
          disabled={page.current_page <= 1}
          onClick={() => change(page.current_page - 1)}
        >
          <ArrowLeft size={15} />
        </button>
        <button
          className="button"
          aria-label="Page suivante"
          disabled={page.current_page >= page.last_page}
          onClick={() => change(page.current_page + 1)}
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
export function Empty({ children = 'Aucun élément pour le moment.' }: { children?: ReactNode }) {
  return <CrmEmpty title="Aucun élément">{children}</CrmEmpty>;
}
export function ActionForm({
  title,
  children,
  submit,
  close,
  submitLabel = 'Confirmer',
}: {
  title: string;
  children: ReactNode;
  submit: (form: FormData) => Promise<void>;
  close: () => void;
  submitLabel?: string;
}) {
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      title={title}
      close={() => {
        if (!busy) close();
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          const values = new FormData(e.currentTarget);
          setBusy(true);
          setError(null);
          try {
            await submit(values);
            close();
          } catch (e) {
            setError(e);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="dialog-body">
          <ErrorBox error={error} />
          {children}
        </div>
        <div className="dialog-footer">
          <button type="button" className="button" disabled={busy} onClick={close}>
            Annuler
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
