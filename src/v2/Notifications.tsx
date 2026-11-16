import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '../components/ui';
import { api } from './api';
import { ErrorBox } from './ui';

export interface NotificationFeed {
  rows: { id: string; title: string; body?: string; href: string; read: boolean; kind?: string }[];
  unread: number;
  total: number;
  truncated: boolean;
  approvals_count: number;
}
export const loadNotifications = () => api.get<NotificationFeed>('/notifications');
export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const nav = useNavigate();
  const qc = useQueryClient();
  const feed = useQuery({ queryKey: ['notifications'], queryFn: loadNotifications, refetchInterval: 45_000 });
  useEffect(() => {
    if (!feed.data || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    for (const row of feed.data.rows.filter((x) => !x.read && x.kind === 'personal')) {
      const key = `comsig-spoken-${row.id}`;
      if (sessionStorage.getItem(key)) continue;
      sessionStorage.setItem(key, '1');
      const message = new SpeechSynthesisUtterance(row.title);
      message.lang = 'fr-FR'; window.speechSynthesis.speak(message);
    }
  }, [feed.data]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const outside = (e: MouseEvent) => {
      if (!container.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', key);
    document.addEventListener('mousedown', outside);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('mousedown', outside);
    };
  }, [open]);
  async function read(keys: string[]) {
    setBusy(true);
    setError(null);
    try {
      await api.post('/notifications/read', { keys });
      await qc.invalidateQueries({ queryKey: ['notifications'] });
      return true;
    } catch (e) {
      setError(e);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <div ref={container} style={{ position: 'relative' }}>
      <Button
        ref={trigger}
        variant="ghost"
        iconOnly
        aria-label={`Notifications${feed.data?.unread ? ` (${feed.data.unread} non lues)` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        icon={
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <Bell size={18} />
            {!!feed.data?.unread && (
              <span className="notification-count">{feed.data.unread > 99 ? '99+' : feed.data.unread}</span>
            )}
          </span>
        }
      />
      {open && (
        <div className="popover notification-popover" role="dialog" aria-label="Notifications">
          <div className="strong" style={{ padding: 10 }}>
            Notifications
          </div>
          <ErrorBox
            error={feed.error || error}
            retry={() => {
              void feed.refetch();
            }}
          />
          {feed.isLoading && <p style={{ padding: 10 }}>Chargement…</p>}
          {feed.data?.rows.map((row) => (
            <button
              key={row.id}
              className="menu-item"
              disabled={busy}
              onClick={async () => {
                if (await read([row.id])) {
                  setOpen(false);
                  nav(row.href);
                }
              }}
            >
              <span>
                {!row.read && <span aria-label="Non lue">● </span>}
                {row.title}
              </span>
            </button>
          ))}
          {feed.data && !feed.data.rows.length && (
            <p className="small muted" style={{ padding: 10 }}>
              Aucune échéance ou proposition à examiner dans votre périmètre.
            </p>
          )}
          {!!feed.data?.rows.some((row) => !row.read) && (
            <Button
              size="sm"
              disabled={busy}
              onClick={() => {
                void read(feed.data!.rows.map((row) => row.id));
              }}
            >
              Marquer cette liste comme lue
            </Button>
          )}
          {feed.data?.truncated && (
            <p className="xsmall muted" style={{ padding: 10 }}>
              50 éléments récents maximum par catégorie. Consultez les listes métier pour la suite.
            </p>
          )}
          <p className="xsmall muted" style={{ padding: 10 }}>
            Échéances et propositions réelles. Lecture enregistrée pour votre compte ; aucune messagerie
            externe.
          </p>
        </div>
      )}
    </div>
  );
}
