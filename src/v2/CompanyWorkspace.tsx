import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, PageHeader } from '../components/ui';
import { api } from './api';
import { date, type Row } from './types';
import { ErrorBox, Loading } from './ui';

export default function CompanyWorkspace() {
  const [selected, setSelected] = useState<string | null>(null);
  const q = useQuery({ queryKey: ['company-projects'], queryFn: () => api.get('/company-projects?per_page=100') });
  const detail = useQuery({ queryKey: ['company-project', selected], queryFn: () => api.get('/company-projects/' + selected), enabled: !!selected });
  return <>
    <PageHeader title="Espace entreprise" subtitle="Les projets publiés pour COM&SIG, leurs intervenants, ordres de travail et échéances." />
    <ErrorBox error={q.error || detail.error} />
    {q.isLoading && <Loading />}
    <div className="p06-columns">
      <Card title="Projets accessibles">
        {(q.data?.data ?? []).map((p: Row) => <button key={p.id} className="list-item p06-project-button" onClick={() => setSelected(p.id)}>
          <span className="spacer"><strong>{p.title}</strong><span className="small muted">{p.status} · échéance {date(p.due_date)}</span></span>
          <span>{p.company_visible ? 'Publié' : 'Interne'}</span>
        </button>)}
        {!q.data?.data?.length && <p className="muted">Aucun projet publié pour le moment.</p>}
      </Card>
      <Card title="Vue projet">
        {!selected && <p className="muted">Sélectionnez un projet pour consulter son équipe et son travail en cours.</p>}
        {detail.isLoading && <Loading />}
        {detail.data && <ProjectPanel data={detail.data} refresh={() => detail.refetch()} />}
      </Card>
    </div>
  </>;
}

function ProjectPanel({ data, refresh }: { data: any; refresh: () => void }) {
  const p = data.data; const qc = useQueryClient(); const [busy, setBusy] = useState(false); const [user, setUser] = useState(''); const [role, setRole] = useState('');
  const users = useQuery({ queryKey: ['company-project-users', p.id], queryFn: () => api.get('/company-projects/' + p.id + '/users'), enabled: !!data.can_manage });
  async function action(fn: () => Promise<unknown>) { setBusy(true); try { await fn(); await refresh(); await qc.invalidateQueries({ queryKey: ['company-projects'] }); } finally { setBusy(false); } }
  return <div className="stack">
    <h2>{p.title}</h2><p>{p.brief || 'Aucun brief.'}</p><p className="small muted">Statut {p.status} · échéance {date(p.due_date)}</p>
    <Link to={'/projets/' + p.id}>Ouvrir la fiche complète</Link>
    {data.can_manage && <button className="btn" disabled={busy} onClick={() => action(() => api.post(`/company-projects/${p.id}/visibility`, { visible: !p.company_visible }))}>{p.company_visible ? 'Retirer de l’espace entreprise' : 'Publier pour toute l’entreprise'}</button>}
    <h3>Intervenants</h3>
    {data.members.map((m: Row) => <div className="list-item" key={m.id}><span>{m.name}{m.role_label ? ` · ${m.role_label}` : ''}</span>{data.can_manage && <button className="btn btn-ghost" disabled={busy} onClick={() => action(() => api.delete(`/company-projects/${p.id}/members/${m.id}`))}>Retirer</button>}</div>)}
    {data.can_manage && <div className="row-wrap"><select aria-label="Collaborateur" value={user} onChange={e => setUser(e.target.value)}><option value="">Choisir un collaborateur…</option>{(users.data?.data ?? []).map((u: Row) => <option key={u.id} value={u.id}>{u.name}</option>)}</select><input aria-label="Rôle dans le projet" placeholder="Rôle dans le projet" value={role} onChange={e => setRole(e.target.value)} /><button className="btn" disabled={!user || busy} onClick={() => action(() => api.post(`/company-projects/${p.id}/members`, { user_id: Number(user), role_label: role || null })).then(() => { setUser(''); setRole(''); })}>Ajouter</button></div>}
    <h3>Ordres de travail</h3>{data.work_orders.map((w: Row) => <Link key={w.id} to={'/ordres-travail/' + w.id}>{w.reference} · {w.title} · {w.status}</Link>)}{!data.work_orders.length && <p className="small muted">Aucun ordre de travail lié.</p>}
    <h3>Ordres de production</h3>{data.production_orders.map((w: Row) => <span key={w.id}>{w.number} · {w.title} · {w.status}</span>)}{!data.production_orders.length && <p className="small muted">Aucun ordre de production lié.</p>}
  </div>;
}
