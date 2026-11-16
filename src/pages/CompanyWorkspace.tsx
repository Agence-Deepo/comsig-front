import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CalendarClock, Plus, TriangleAlert, Users } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useCan } from '../lib/auth';
import { date, money } from '../lib/format';
import { Badge, Button, Card, Empty, ErrorState, Kpi, LoadingBlock, Segmented, Status } from '../components/ui';
import { DeptChip } from '../components/work';
import { ProjectForm, PROJECT_KIND } from './Projects';
import { ProcessFlow } from '../components/ProcessFlow';

/**
 * Espace entreprise, ouvert à tout le personnel : les projets enregistrés par le service commercial (et tout projet
 * publié pour l'entreprise) avec leurs caractéristiques, contraintes, intervenants et avancement.
 */
export default function CompanyWorkspace() {
  const can = useCan();
  const nav = useNavigate();
  const r = useApi<any>(['company-ws'], '/api/workspace/company');
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('actifs');
  const [open, setOpen] = useState<string | null>(null);
  const flow = useApi<any>(['project', open], open ? `/api/projects/${open}` : null);
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading || !r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const rows = (r.data.projects as any[]).filter((p) => filter === 'tous' || (filter === 'mine' ? p.i_am_member : !['termine', 'annule'].includes(p.status)));
  return (
    <>
      <section className="dept-hero company-hero">
        <div>
          <div className="eyebrow">Espace entreprise — ouvert à tout le personnel</div>
          <h1>Projets de COM&amp;SIG</h1>
          <p>Chaque nouveau projet enregistré par le service commercial est publié ici et signalé à toute l’équipe. Consultez ses caractéristiques, ses contraintes, ses intervenants et sa planification.</p>
        </div>
        {can('projects', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>Nouveau projet</Button>}
      </section>
      <div className="grid-4">
        <Kpi label="Projets d’entreprise" value={r.data.stats.total} />
        <Kpi label="En cours ou planifiés" value={r.data.stats.active} />
        <Kpi label="Où j’interviens" value={r.data.stats.mine} />
        <Kpi label="Tâches en retard" value={<span className={r.data.stats.late_tasks ? 'text-danger' : ''}>{r.data.stats.late_tasks}</span>} />
      </div>
      <Segmented label="Filtre" value={filter} onChange={setFilter} options={[{ id: 'actifs', label: 'En cours' }, { id: 'mine', label: 'Où j’interviens' }, { id: 'tous', label: 'Tous' }]} />
      {!rows.length ? <Card><Empty icon={<Building2 />} title="Aucun projet">Les projets enregistrés par le service commercial apparaîtront ici.</Empty></Card> : (
        <div className="cp-grid">
          {rows.map((p) => (
            <article key={p.id} className="card cp-card" style={{ ['--dept' as any]: p.department_color }}>
              <div className="row"><span className="xsmall muted">{p.ref} · {PROJECT_KIND[p.kind]} · par {p.created_by_name}</span><span className="spacer" />{p.i_am_member && <Badge tone="accent">J’interviens</Badge>}<Status kind="project" code={p.status} /></div>
              <h3><button className="link-btn" onClick={() => nav(`/projets/${p.id}`)}>{p.name}</button></h3>
              <div className="row-wrap small"><DeptChip label={p.department_label} color={p.department_color} /><span><CalendarClock className="ic-xs" aria-hidden /> {date(p.start_date)} → {date(p.end_date)}</span>{p.organization_name && <span>· {p.organization_name}</span>}{p.location && <span>· {p.location}</span>}</div>
              {p.objectives && <p className="small" style={{ margin: 0 }}><strong>Objectifs : </strong>{p.objectives}</p>}
              {p.scope && <p className="small secondary" style={{ margin: 0 }}><strong>Caractéristiques : </strong>{p.scope}</p>}
              {p.constraints && <div className="cp-constraints"><TriangleAlert className="ic-xs" aria-hidden /> <strong>Contraintes : </strong>{p.constraints}</div>}
              <div className="progress" role="progressbar" aria-valuenow={p.progress_pct} aria-valuemin={0} aria-valuemax={100} aria-label="Avancement"><span style={{ width: `${p.progress_pct}%` }} /></div>
              <div className="row small"><span>{p.progress_pct} % · {p.tasks_done}/{p.tasks_total} tâches</span><span className="spacer" />{p.tasks_late > 0 && <Badge tone="danger">{p.tasks_late} en retard</Badge>}{p.budget ? <span className="muted">{money(p.budget)}</span> : null}</div>
              {p.next_milestone && <div className="xsmall muted">Prochain jalon : <strong>{p.next_milestone.title}</strong> le {date(p.next_milestone.due_date)}</div>}
              <div>
                <div className="xsmall muted"><Users className="ic-xs" aria-hidden /> Intervenants ({p.members.length})</div>
                <div className="cp-members">{p.members.map((m: any) => <span key={m.user_id} className="dept-chip" style={{ ['--dept' as any]: m.department_color }} title={m.department_label}><span className="dept-dot" aria-hidden />{m.full_name} · {m.role_label}</span>)}</div>
              </div>
              <div className="row"><Button size="sm" onClick={() => setOpen(open === p.id ? null : p.id)}>{open === p.id ? 'Masquer la frise' : 'Voir la frise'}</Button><Button size="sm" variant="ghost" onClick={() => nav(`/projets/${p.id}`)}>Ouvrir le projet</Button></div>
              {open === p.id && (flow.data ? <ProcessFlow items={flow.data.tasks.map((t: any) => ({ id: t.id, title: t.title, start: t.start_date, end: t.due_date, status: t.status, who: t.owner_name, ref: t.ref, predecessor_id: t.predecessor_id, late: t.is_late, onClick: () => nav(`/projets/${p.id}`) }))} /> : <LoadingBlock rows={2} />)}
            </article>
          ))}
        </div>
      )}
      <ProjectForm open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
