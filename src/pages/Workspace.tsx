import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, ClipboardList, Inbox, ListTodo, Plus, Send, Users } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useAuth, useCan } from '../lib/auth';
import { date, relative } from '../lib/format';
import { Avatar, Badge, Button, Card, Empty, ErrorState, Kpi, LoadingBlock, Select } from '../components/ui';
import { TaskForm, WorkOrderForm, useDepartments } from '../components/work';
import { DeptDashboard } from '../components/DeptDashboard';

/** Accueil d'un service : son équipe, son travail, ses demandes reçues et émises, ses échéances. */
export default function Workspace() {
  const { me } = useAuth();
  const can = useCan();
  const [sp, setSp] = useSearchParams();
  const deps = useDepartments();
  const dep = sp.get('service') ?? '';
  const r = useApi<any>(['workspace', dep], `/api/workspace${dep ? `?department=${dep}` : ''}`);
  const [task, setTask] = useState(false);
  const [wo, setWo] = useState(false);
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading || !r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const d = r.data.department;
  const kinds = r.data.work_kinds as Record<string, string> | null;
  return (
    <>
      <section className="dept-hero" style={{ ['--dept' as any]: d.color }}>
        <div>
          <div className="eyebrow">Espace de service</div>
          <h1>{d.label}</h1>
          <p>{d.description}</p>
        </div>
        <div className="row-wrap">
          {me?.cross_department && (
            <Select aria-label="Service affiché" value={dep} onChange={(e) => setSp(e.target.value ? { service: e.target.value } : {})} placeholder="Mon service"
              options={deps.map((x) => ({ value: x.code, label: x.label }))} />
          )}
          {!me?.cross_department && (r.data.services?.length > 0 || d.parent_code) && (
            <Select aria-label="Service affiché" value={dep} onChange={(e) => setSp(e.target.value ? { service: e.target.value } : {})} placeholder={`Département (${me?.department_label ?? ''})`}
              options={(r.data.services ?? []).map((x: any) => ({ value: x.code, label: x.label }))} />
          )}
          {can('tasks', 'create') && <Button icon={<Plus />} onClick={() => setTask(true)}>Tâche</Button>}
          {can('workorders', 'create') && <Button variant="primary" icon={<Send />} onClick={() => setWo(true)}>Demande à un service</Button>}
        </div>
      </section>

      <div className="grid-4 kpi-grid">
        <Kpi label="Tâches ouvertes" value={r.data.tasks.open} foot={`${r.data.tasks.done_week} terminée(s) cette semaine`} />
        <Kpi label="Tâches en retard" value={<span className={r.data.tasks.late ? 'text-danger' : ''}>{r.data.tasks.late}</span>} foot={`${r.data.tasks.urgent_important} urgente(s) et importante(s)`} />
        <Kpi label="Ordres reçus en cours" value={r.data.work_orders.received_open} foot={`${r.data.work_orders.received_late} en retard`} />
        <Kpi label="Demandes émises en cours" value={r.data.work_orders.sent_open} foot="Auprès des autres services" />
      </div>

      {r.data.services?.length > 0 && (
        <div className="subservices">
          {r.data.services.map((x: any) => (
            <button key={x.code} className="subservice" style={{ ['--dept' as any]: x.color }} onClick={() => setSp({ service: x.code })}>
              <strong>{x.label}</strong><span className="xsmall muted">{x.open_orders} ordre(s) en cours{x.late_orders ? ` · ${x.late_orders} en retard` : ''} · {x.members} pers.</span>
            </button>
          ))}
        </div>
      )}

      <DeptDashboard department={dep || undefined} />

      <div className="grid-2">
        <Card title="Échéances proches" sub="Tâches et ordres de travail du service (retards compris)" actions={<Link to="/taches" className="small">Toutes les tâches</Link>}>
          {r.data.upcoming.length ? (
            <ul className="list">
              {r.data.upcoming.map((u: any) => (
                <li key={u.type + u.id} className="list-item">
                  <span className="icon-chip">{u.type === 'tache' ? <ListTodo /> : <ClipboardList />}</span>
                  <div className="spacer">
                    <Link to={u.type === 'tache' ? '/taches' : `/ordres-travail/${u.id}`} className="strong">{u.title}</Link>
                    <div className="xsmall muted">{u.ref} · {u.who ?? 'Non affecté'}</div>
                  </div>
                  <Badge tone={u.date < new Date().toISOString().slice(0, 10) ? 'danger' : 'info'}>{date(u.date)}</Badge>
                </li>
              ))}
            </ul>
          ) : <Empty icon={<CalendarDays />} title="Rien d’urgent">Aucune échéance dans les 14 prochains jours.</Empty>}
        </Card>
        <Card title="Équipe" sub={`${r.data.members.length} membre(s)`} actions={<Users aria-hidden className="muted" />}>
          <ul className="list">
            {r.data.members.map((m: any) => (
              <li key={m.id} className="list-item"><Avatar name={m.full_name} size="sm" /><div className="spacer"><div className="strong">{m.full_name}</div><div className="xsmall muted">{m.job_title || m.role_label}</div></div><span className="xsmall muted">{m.last_seen_at ? `vu ${relative(m.last_seen_at)}` : ''}</span></li>
            ))}
          </ul>
        </Card>
      </div>

      {kinds && (
        <Card title="Travaux réalisés par le service" sub="Les autres services vous transmettent leurs demandes avec ces types d’ordres de travail"
          actions={<Link to={`/ordres-travail?service=${d.code}`}><Button size="sm" icon={<Inbox />}>File de travail</Button></Link>}>
          <div className="chips">{Object.values(kinds).map((k) => <span key={k} className="chip">{k}</span>)}</div>
        </Card>
      )}
      <TaskForm open={task} onClose={() => setTask(false)} />
      <WorkOrderForm open={wo} onClose={() => setWo(false)} />
    </>
  );
}

