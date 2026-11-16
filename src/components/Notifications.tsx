import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { BellOff } from 'lucide-react';
import { api } from '../lib/api';
import { relative, safePath } from '../lib/format';
import { Button } from './ui';

export function NotificationsPopover({ rows, onClose }: { rows: any[]; onClose: () => void }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    setTimeout(() => document.addEventListener('mousedown', h));
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, []);
  const read = async (ids?: string[]) => { await api.post('/api/notifications/read', ids ? { ids } : {}); qc.invalidateQueries({ queryKey: ['notifications'] }); };
  return (
    <div className="popover" ref={ref} role="dialog" aria-label="Notifications" style={{ right: 0, top: 42, width: 'min(400px, calc(100vw - 24px))', padding: 0 }}>
      <div className="row" style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <strong>Notifications</strong><div className="spacer" />
        <Button size="sm" variant="ghost" onClick={() => read()}>Tout marquer comme lu</Button>
      </div>
      <div style={{ maxHeight: 420, overflowY: 'auto', padding: 4 }}>
        {!rows.length && <div className="empty"><div className="empty-icon"><BellOff /></div><h3>Aucune notification</h3><p>Les alertes d’échéance, validations et relances apparaîtront ici.</p></div>}
        {rows.map((n) => (
          <div key={n.id} className={`notif-item${n.read_at ? '' : ' unread'}`} role="button" tabIndex={0}
            onClick={() => { read([n.id]); if (n.link) { onClose(); nav(safePath(n.link)); } }} onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLElement).click(); }}>
            <span className={`notif-dot ${n.severity}`} aria-label={n.severity === 'critique' ? 'Critique' : n.severity === 'attention' ? 'Attention' : 'Information'} />
            <div style={{ minWidth: 0 }}>
              <div className="small strong">{n.title}</div>
              <div className="xsmall secondary">{n.body}</div>
              <div className="xsmall muted">{relative(n.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
