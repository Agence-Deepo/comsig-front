import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, CalendarDays, Users } from 'lucide-react';
import { Card, Empty, Kpi, PageHeader } from '../components/ui';
import { api } from './api';
import { date, money, type Row } from './types';
import { ErrorBox, Loading } from './ui';
import './company-workspace.css';

type ProjectFilter = 'active' | 'mine' | 'all';
const activeStatuses = new Set(['en_cours', 'planifie']);
const statusLabels: Record<string, string> = {
  brouillon: 'Brouillon', planifie: 'Planifié', en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé',
};
const statusLabel = (value: string) => statusLabels[value] ?? value.replace(/_/g, ' ');
const shortDate = (value?: string) => value ? date(value) : '—';

export default function CompanyWorkspace() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectFilter>('active');
  const [page, setPage] = useState(1);
  const q = useQuery({ queryKey: ['company-projects', page], queryFn: () => api.get(`/company-projects?per_page=100&page=${page}`) });
  const detail = useQuery({ queryKey: ['company-project', selected], queryFn: () => api.get('/company-projects/' + selected), enabled: !!selected });
  const projects: Row[] = q.data?.data ?? [];
  const totals = useMemo(() => ({
    active: Number(q.data?.summary?.active ?? projects.filter((p) => activeStatuses.has(p.status)).length),
    late: Number(q.data?.summary?.late ?? projects.reduce((sum, p) => sum + Number(p.task_late ?? 0), 0)),
    mine: Number(q.data?.summary?.mine ?? projects.filter((p) => p.is_member).length),
  }), [projects, q.data?.summary]);
  const visible = projects.filter((p) => filter === 'active' ? activeStatuses.has(p.status) : filter === 'mine' ? p.is_member : true);

  return <div className="company-workspace">
    <PageHeader
      eyebrow="ESPACE ENTREPRISE — OUVERT À TOUT LE PERSONNEL"
      title="Projets de COM&SIG"
      subtitle="Chaque nouveau projet publié par le service commercial est signalé à toute l’équipe. Retrouvez son équipe, ses intervenants et sa planification."
    />
    <ErrorBox error={q.error || detail.error} retry={() => void q.refetch()} />
    {q.isLoading && <Loading />}
    {!q.isLoading && q.data && <>
      <section className="grid-4 company-kpis" aria-label="Synthèse des projets accessibles">
        <Kpi label="Projets d’entreprise" value={q.data?.summary?.total ?? projects.length} />
        <Kpi label="En cours ou planifiés" value={totals.active} />
        <Kpi label="Où j’interviens" value={totals.mine} />
        <Kpi label="Tâches en retard" value={totals.late} />
      </section>

      <nav className="company-filters" aria-label="Filtrer les projets">
        <button className={filter === 'active' ? 'is-active' : ''} onClick={() => setFilter('active')}>En cours</button>
        <button className={filter === 'mine' ? 'is-active' : ''} onClick={() => setFilter('mine')}>Où j’interviens</button>
        <button className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>Tous</button>
      </nav>

      {visible.length ? <section className="company-project-grid" aria-label="Projets publiés">
        {visible.map((p) => <ProjectCard key={p.id} project={p} onSelect={() => setSelected(p.id)} />)}
      </section> : <Card><Empty title={filter === 'mine' ? 'Vous n’intervenez sur aucun projet publié' : filter === 'active' ? 'Aucun projet en cours ou planifié' : 'Aucun projet publié pour le moment'} /></Card>}

      {Number(q.data?.last_page ?? 1) > 1 && <nav className="company-pagination" aria-label="Pages des projets">
        <button className="btn" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Précédent</button>
        <span className="small muted">Page {page} sur {q.data.last_page}</span>
        <button className="btn" disabled={page >= q.data.last_page} onClick={() => setPage((current) => current + 1)}>Suivant</button>
      </nav>}

      {selected && <Card className="company-project-detail" title="Détail du projet" actions={<button className="btn btn-ghost" onClick={() => setSelected(null)}>Fermer</button>}>
        {detail.isLoading && <Loading />}
        {detail.data && <ProjectPanel data={detail.data} refresh={() => detail.refetch()} />}
      </Card>}
      <p className="xsmall muted company-data-note">Projets et avancement affichés selon vos droits d’accès. Les tâches et interventions sont calculées depuis les données COM&SIG.</p>
    </>}
  </div>;
}

function ProjectCard({ project: p, onSelect }: { project: Row; onSelect: () => void }) {
  const members: Row[] = p.members ?? [];
  const total = Number(p.task_count ?? 0);
  const done = Number(p.task_done ?? 0);
  const progress = total ? Math.round(done * 100 / total) : 0;
  const late = Number(p.task_late ?? 0);
  return <article className={`company-project-card status-${p.status}`}>
    <div className="company-project-meta">
      <span>{p.reference ?? p.code ?? `Projet ${String(p.id).slice(0, 8)}`} · {p.organization_name || 'Projet client'} · par {p.owner_name}</span>
      <span className={`company-status status-${p.status}`}><i />{statusLabel(p.status)}</span>
    </div>
    <h2>{p.title}</h2>
    <div className="company-project-subline">
      <span className="company-department">{p.department_label}</span>
      <span><CalendarDays size={14} />{shortDate(p.published_at || p.created_at)} → {shortDate(p.due_date)}</span>
    </div>
    {p.organization_name && <p className="company-client">· {p.organization_name}</p>}
    {p.brief && <p className="company-brief">{p.brief}</p>}
    <div className="company-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Avancement des tâches : ${progress} %`}><span style={{ width: `${progress}%` }} /></div>
    <div className="company-progress-label"><strong>{progress} % · {done}/{total} tâches</strong><span>{money(p.budget)}</span></div>
    <div className="company-members-heading"><Users size={14} /> Intervenants ({members.length}){late > 0 && <span className="company-late"><AlertTriangle size={13} /> {late} en retard</span>}</div>
    {members.length > 0 ? <div className="company-members">{members.map((member, index) => <span className={`company-member member-${index % 7}`} key={member.id}><i />{member.name}{member.role_label ? ` · ${member.role_label}` : ''}</span>)}</div> : <p className="small muted">Aucun intervenant ajouté pour le moment.</p>}
    <div className="company-project-actions">
      <button className="btn" onClick={onSelect}>Voir le détail</button>
      <Link to={`/projets/${p.id}`}>Ouvrir le projet <ArrowRight size={14} /></Link>
    </div>
  </article>;
}

function ProjectPanel({ data, refresh }: { data: any; refresh: () => void }) {
  const p = data.data;
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const users = useQuery({ queryKey: ['company-project-users', p.id], queryFn: () => api.get('/company-projects/' + p.id + '/users'), enabled: !!data.can_manage });
  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    try { await fn(); await refresh(); await qc.invalidateQueries({ queryKey: ['company-projects'] }); }
    finally { setBusy(false); }
  }
  return <div className="stack">
    <h2>{p.title}</h2><p>{p.brief || 'Aucun brief.'}</p><p className="small muted">Statut {statusLabel(p.status)} · échéance {shortDate(p.due_date)}</p>
    <Link to={'/projets/' + p.id}>Ouvrir la fiche complète</Link>
    {data.can_manage && <button className="btn" disabled={busy} onClick={() => action(() => api.post(`/company-projects/${p.id}/visibility`, { visible: !p.company_visible }))}>{p.company_visible ? 'Retirer de l’espace entreprise' : 'Publier pour toute l’entreprise'}</button>}
    <h3>Intervenants</h3>
    {data.members.map((m: Row) => <div className="list-item" key={m.id}><span>{m.name}{m.role_label ? ` · ${m.role_label}` : ''}</span>{data.can_manage && <button className="btn btn-ghost" disabled={busy} onClick={() => action(() => api.delete(`/company-projects/${p.id}/members/${m.id}`))}>Retirer</button>}</div>)}
    {data.can_manage && <div className="row-wrap"><select aria-label="Collaborateur" value={userId} onChange={e => setUserId(e.target.value)}><option value="">Choisir un collaborateur…</option>{(users.data?.data ?? []).map((u: Row) => <option key={u.id} value={u.id}>{u.name}</option>)}</select><input aria-label="Rôle dans le projet" placeholder="Rôle dans le projet" value={role} onChange={e => setRole(e.target.value)} /><button className="btn" disabled={!userId || busy} onClick={() => action(() => api.post(`/company-projects/${p.id}/members`, { user_id: Number(userId), role_label: role || null })).then(() => { setUserId(''); setRole(''); })}>Ajouter</button></div>}
    <h3>Ordres de travail</h3>{data.work_orders.map((w: Row) => <Link key={w.id} to={'/ordres-travail/' + w.id}>{w.reference} · {w.title} · {statusLabel(w.status)}</Link>)}{!data.work_orders.length && <p className="small muted">Aucun ordre de travail lié.</p>}
    <h3>Ordres de production</h3>{data.production_orders.map((w: Row) => <span key={w.id}>{w.number} · {w.title} · {statusLabel(w.status)}</span>)}{!data.production_orders.length && <p className="small muted">Aucun ordre de production lié.</p>}
  </div>;
}
