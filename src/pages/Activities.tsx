import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, Check, ChevronLeft, ChevronRight, List, Plus, Trash2, Edit3, CalendarCheck } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useAuth, useCan } from '../lib/auth';
import { dateTime, relative } from '../lib/format';
import { ACTIVITY_KIND } from '../lib/labels';
import { Badge, Button, Card, ConfirmModal, DataTable, Empty, PageHeader, Segmented, Select, Status } from '../components/ui';
import { ActivityForm } from '../components/forms';
import { KIND_ICON } from './OrganizationDetail';

function startOfWeek(d: Date) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0); return x; }

export default function Activities() {
  const { me } = useAuth();
  const can = useCan();
  const [sp, setSp] = useSearchParams();
  const view = sp.get('view') ?? 'list';
  const set = (o: Record<string, string>) => { const n = new URLSearchParams(sp); for (const [k, v] of Object.entries(o)) { if (v) n.set(k, v); else n.delete(k); } setSp(n, { replace: true }); };
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [edit, setEdit] = useState<any>(null);
  const [complete, setComplete] = useState<any>(null);
  const [create, setCreate] = useState(false);
  const [del, setDel] = useState<any>(null);
  const period = sp.get('period') ?? (view === 'week' ? 'toutes' : 'semaine');
  const scope = sp.get('scope') ?? 'mine';
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const params = view === 'week' ? { scope, status: 'toutes', from: weekStart.toISOString(), to: weekEnd.toISOString(), kind: sp.get('kind') } : { scope, period, status: sp.get('status') ?? 'ouvertes', kind: sp.get('kind') };
  const r = useApi<any>(['activities', params], `/api/activities${qs(params)}`);
  const quickDone = useAction((a: any) => api.patch(`/api/activities/${a.id}`, { status: 'termine' }), { success: 'Tâche terminée', invalidate: [['activities'], ['dashboard']] });
  const remove = useAction((a: any) => api.del(`/api/activities/${a.id}`), { success: 'Activité supprimée', invalidate: [['activities']], onSuccess: () => setDel(null) });
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const x = new Date(weekStart); x.setDate(x.getDate() + i); return x; }), [weekStart]);
  const rows = r.data?.rows ?? [];
  const finish = (a: any) => (['appel', 'email', 'reunion', 'visite'].includes(a.kind) || a.priority === 'critique' ? setComplete(a) : quickDone.run(a));

  return (
    <>
      <PageHeader title="Activités et agenda" subtitle="Tâches, appels, rendez-vous, visites et relances"
        actions={<>
          <Segmented label="Affichage" value={view} onChange={(v) => set({ view: v === 'list' ? '' : v, period: '' })} options={[{ id: 'list', label: 'Liste', icon: <List /> }, { id: 'week', label: 'Semaine', icon: <CalendarDays /> }]} />
          {can('activities', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Nouvelle activité</Button>}
        </>} />
      <div className="filter-bar">
        {view === 'list' && <Segmented label="Période" value={period} onChange={(v) => set({ period: v })} options={[{ id: 'retard', label: 'En retard' }, { id: 'aujourdhui', label: 'Aujourd’hui' }, { id: 'semaine', label: '7 jours' }, { id: 'a_venir', label: 'À venir' }, { id: 'toutes', label: 'Toutes' }]} />}
        {view === 'week' && <div className="row"><Button size="sm" iconOnly aria-label="Semaine précédente" icon={<ChevronLeft />} onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 86400000))} />
          <strong className="small">Semaine du {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</strong>
          <Button size="sm" iconOnly aria-label="Semaine suivante" icon={<ChevronRight />} onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 86400000))} />
          <Button size="sm" variant="ghost" onClick={() => setWeekStart(startOfWeek(new Date()))}>Aujourd’hui</Button></div>}
        {me?.data_scope !== 'own' && <Select aria-label="Périmètre" value={scope} onChange={(e) => set({ scope: e.target.value })} options={[{ value: 'mine', label: 'Mes activités' }, { value: 'team', label: 'Mon équipe' }, { value: 'all', label: 'Toute l’entreprise' }]} />}
        <Select aria-label="Type" value={sp.get('kind') ?? ''} onChange={(e) => set({ kind: e.target.value })} placeholder="Tous types" options={Object.entries(ACTIVITY_KIND).map(([value, label]) => ({ value, label }))} />
        {view === 'list' && <Select aria-label="Statut" value={sp.get('status') ?? 'ouvertes'} onChange={(e) => set({ status: e.target.value })} options={[{ value: 'ouvertes', label: 'Ouvertes' }, { value: 'terminees', label: 'Terminées' }, { value: 'toutes', label: 'Toutes' }]} />}
      </div>
      {view === 'list' ? (
        <Card flush>
          <DataTable rows={rows} loading={r.isLoading} empty={<Empty icon={<CalendarCheck />} title="Aucune activité dans cette vue">Les relances automatiques (propositions envoyées, échéances de contrat…) apparaissent ici.</Empty>}
            rowClass={(a: any) => (a.is_overdue ? 'overdue' : '')}
            columns={[
              { key: 'k', label: '', width: 44, render: (a: any) => <span className="icon-chip" aria-label={ACTIVITY_KIND[a.kind]}>{KIND_ICON[a.kind]}</span>, mobile: 'hide' },
              { key: 's', label: 'Activité', render: (a: any) => <><div className="cell-title">{a.subject}</div><div className="cell-sub">{ACTIVITY_KIND[a.kind]}{a.organization_name && <> · <Link to={a.opportunity_id ? `/opportunites/${a.opportunity_id}` : `/organisations/${a.organization_id}`}>{a.opportunity_ref ? `${a.opportunity_ref} — ` : ''}{a.organization_name}</Link></>}{a.auto_rule ? ' · automatique' : ''}</div></> },
              { key: 'd', label: 'Échéance', render: (a: any) => <span className="small nowrap" style={a.is_overdue ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{a.status === 'termine' ? `Fait ${dateTime(a.done_at)}` : a.due_at ? <>{dateTime(a.due_at)}<div className="xsmall muted">{relative(a.due_at)}</div></> : '—'}</span> },
              { key: 'p', label: 'Priorité', render: (a: any) => <Status kind="priority" code={a.priority} />, mobile: 'hide' },
              { key: 'st', label: 'Statut', render: (a: any) => <Status kind="activity" code={a.status} /> },
              { key: 'w', label: 'Assigné', render: (a: any) => <span className="small">{a.assigned_name}</span>, mobile: 'hide' },
              { key: 'x', label: <span className="sr-only">Actions</span>, render: (a: any) => (
                <div className="row" style={{ justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                  {a.status !== 'termine' && a.status !== 'annule' && can('activities', 'update') && <Button size="sm" icon={<Check />} onClick={() => finish(a)}>Terminer</Button>}
                  {can('activities', 'update') && <Button size="sm" variant="ghost" iconOnly aria-label="Modifier" icon={<Edit3 />} onClick={() => setEdit(a)} />}
                  {can('activities', 'delete') && <Button size="sm" variant="ghost" iconOnly aria-label="Supprimer" icon={<Trash2 />} onClick={() => setDel(a)} />}
                </div>) },
            ]} />
        </Card>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(150px, 1fr))', minWidth: 1050 }}>
            {days.map((d) => {
              const iso = d.toDateString();
              const items = rows.filter((a: any) => a.due_at && new Date(a.due_at).toDateString() === iso);
              const isToday = iso === new Date().toDateString();
              return (
                <div key={iso} style={{ borderLeft: '1px solid var(--border)', minHeight: 360, background: isToday ? 'var(--primary-soft)' : undefined }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                    <div className="xsmall muted" style={{ textTransform: 'capitalize' }}>{d.toLocaleDateString('fr-FR', { weekday: 'long' })}</div>
                    <div className="strong">{d.getDate()} {d.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                  </div>
                  <div className="stack" style={{ padding: 8, gap: 6 }}>
                    {items.map((a: any) => (
                      <button key={a.id} className="kanban-card" style={{ cursor: 'pointer', textAlign: 'left', opacity: a.status === 'termine' ? 0.6 : 1 }} onClick={() => setEdit(a)}>
                        <span className="xsmall muted">{new Date(a.due_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {ACTIVITY_KIND[a.kind]}</span>
                        <span className="title" style={{ textDecoration: a.status === 'termine' ? 'line-through' : undefined }}>{a.subject}</span>
                        {a.organization_name && <span className="xsmall secondary truncate">{a.organization_name}</span>}
                        {a.priority === 'haute' || a.priority === 'critique' ? <Badge tone="warning">{a.priority}</Badge> : null}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <ActivityForm open={create} onClose={() => setCreate(false)} />
      <ActivityForm open={!!edit} onClose={() => setEdit(null)} initial={edit} />
      <ActivityForm open={!!complete} onClose={() => setComplete(null)} initial={complete ? { ...complete, status: 'termine' } : null} title="Terminer et consigner le compte rendu" />
      <ConfirmModal open={!!del} onClose={() => setDel(null)} danger title="Supprimer cette activité ?" confirmLabel="Supprimer" loading={remove.isPending} onConfirm={() => remove.run(del)}
        message={<>« {del?.subject} » sera supprimée. Les interactions consignées font partie de l’historique client : seule la direction peut les supprimer.</>} />
    </>
  );
}
