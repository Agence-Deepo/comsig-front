import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useLookups } from '../lib/auth';
import { addDays, date, today } from '../lib/format';
import { Button, Card, Empty, LoadingBlock, PageHeader, Select } from '../components/ui';

/** Planning des faces : frise d'occupation sur 3 mois, pré-réservations hachurées, dérogations signalées. */
export default function Planning() {
  const nav = useNavigate();
  const { lookups, label } = useLookups();
  const [start, setStart] = useState(() => today().slice(0, 8) + '01');
  const [commune, setCommune] = useState('');
  const end = addDays(start, 91);
  const r = useApi<any>(['planning', start, commune], `/api/supports/planning?from=${start}&to=${end}${commune ? `&commune=${commune}` : ''}`);
  const span = 92;
  const pos = (d: string) => Math.max(0, Math.min(100, ((Date.parse(d) - Date.parse(start)) / 86400000 / span) * 100));
  const months = useMemo(() => { const out: { label: string; left: number }[] = []; for (let i = 0; i < 4; i++) { const d = new Date(start + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + i, 1); const iso = d.toISOString().slice(0, 10); if (iso <= end) out.push({ label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }), left: pos(iso) }); } return out; }, [start]);
  const shift = (m: number) => { const d = new Date(start + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + m, 1); setStart(d.toISOString().slice(0, 10)); };
  return (
    <>
      <PageHeader title="Planning des faces" subtitle="Occupation des supports sur trois mois — les conflits de réservation sont bloqués par le CRM"
        actions={<>
          <Select aria-label="Commune" value={commune} onChange={(e) => setCommune(e.target.value)} placeholder="Toutes communes" options={(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label }))} style={{ width: 180 }} />
          <div className="row"><Button iconOnly aria-label="Mois précédent" icon={<ChevronLeft />} onClick={() => shift(-1)} /><span className="small strong" style={{ minWidth: 190, textAlign: 'center' }}>{date(start)} → {date(end)}</span><Button iconOnly aria-label="Mois suivant" icon={<ChevronRight />} onClick={() => shift(1)} /></div>
        </>} />
      <div className="chart-legend"><span><i className="swatch" style={{ background: 'var(--primary)' }} />Réservé</span><span><i className="swatch" style={{ background: 'repeating-linear-gradient(135deg, var(--primary-soft-2) 0 3px, var(--primary-soft) 3px 6px)' }} />Pré-réservé (devis en cours)</span><span><i className="swatch" style={{ background: 'var(--warning)' }} />Dérogation approuvée</span><span><i className="swatch" style={{ background: 'var(--brand-copper)', width: 3 }} />Aujourd’hui</span></div>
      <Card flush>
        {r.isLoading ? <div style={{ padding: 20 }}><LoadingBlock /></div> : !r.data?.faces.length ? <Empty title="Aucune face" /> : (
          <div className="gantt">
            <div className="gantt-grid">
              <div className="gantt-head"><div className="gantt-label small strong">Support / face</div><div className="gantt-track">{months.map((m) => <span key={m.label} className="xsmall muted" style={{ position: 'absolute', left: `${m.left}%`, top: 10, paddingLeft: 6, borderLeft: '1px solid var(--border)', textTransform: 'capitalize' }}>{m.label}</span>)}</div></div>
              {r.data.faces.map((f: any) => {
                const items = r.data.reservations.filter((x: any) => x.face_id === f.id);
                return (
                  <div key={f.id} className="gantt-row">
                    <div className="gantt-label"><button className="btn btn-ghost btn-sm" style={{ padding: 0, height: 'auto' }} onClick={() => nav(`/supports/${f.support_id}`)}><strong>{f.support_code}-{f.face_code}</strong></button><div className="xsmall muted truncate">{label('commune', f.commune)}{f.support_status !== 'disponible' ? ` · ${f.support_status.replace('_', ' ')}` : ''}</div></div>
                    <div className="gantt-track" style={f.support_status === 'en_maintenance' ? { background: 'repeating-linear-gradient(45deg, transparent 0 8px, var(--warning-soft) 8px 16px)' } : undefined}>
                      {start <= today() && today() <= end && <span className="gantt-today" style={{ left: `${pos(today())}%` }} />}
                      {items.map((x: any) => (
                        <span key={x.id} className={`gantt-bar${x.status === 'pre_reserve' ? ' pre' : ''}${x.derogation ? ' derog' : ''}`} style={{ left: `${pos(x.start_date)}%`, width: `${Math.max(1.2, pos(addDays(x.end_date, 1)) - pos(x.start_date))}%` }}
                          title={`${x.organization_name}${x.campaign_ref ? ` · ${x.campaign_ref}` : ''} — ${date(x.start_date)} → ${date(x.end_date)}`} role="button" tabIndex={0}
                          onClick={() => x.campaign_id && nav(`/campagnes/${x.campaign_id}`)} onKeyDown={(e) => { if (e.key === 'Enter' && x.campaign_id) nav(`/campagnes/${x.campaign_id}`); }}>{x.organization_name}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
