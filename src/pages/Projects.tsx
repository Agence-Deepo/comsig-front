import { ExcelButton } from '../components/ExportButton';
import { PriorityBadge, PrioritySelect } from '../components/Priority';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Columns3, FolderKanban, GitCommitHorizontal, Grid3x3, Info, Plus, Trash2, Users } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan, useUsers } from '../lib/auth';
import { addDays, date, money, today } from '../lib/format';
import { DEPLOYMENT_KIND, RISK_CATEGORY } from '../lib/labels';
import { Badge, Button, Card, DataTable, Dl, Empty, ErrorState, Field, Input, Kpi, LoadingBlock, Modal, PageHeader, Segmented, Select, Status, Tabs, Textarea } from '../components/ui';
import { DeptChip, TaskForm } from '../components/work';
import { ProcessFlow } from '../components/ProcessFlow';

export const PROJECT_KIND: Record<string, string> = { projet: 'Projet client', deploiement: 'Déploiement de supports', campagne: 'Campagne', interne: 'Projet interne' };

/** Création / modification d'un projet : caractéristiques, contraintes et intervenants (toutes directions). */
export function ProjectForm({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: any }) {
  const users = useUsers() as any[];
  const can = useCan();
  const colls = useApi<any>(['collectivities'], open && can('collectivities') ? '/api/collectivities' : null);
  const [f, setF] = useState<any>(null);
  const [pick, setPick] = useState('');
  useEffect(() => {
    setF(open ? (initial ? { ...initial, members: (initial.members ?? []).map((m: any) => ({ user_id: m.user_id, role_label: m.role_label })) }
      : { name: '', description: '', kind: 'projet', manager_id: '', collectivity_id: '', status: 'cadrage', priority_level: null, start_date: today(), end_date: addDays(today(), 60), budget: '',
        objectives: '', scope: '', deliverables: '', constraints: '', location: '', visibility: '', members: [] }) : null);
    setPick('');
  }, [open]);
  const save = useAction((b: any) => (initial?.id ? api.put(`/api/projects/${initial.id}`, b) : api.post('/api/projects', b)), {
    success: (r: any) => (initial?.id ? 'Projet enregistré' : r.visibility === 'entreprise' ? 'Projet publié dans l’espace entreprise : tout le personnel est alerté' : 'Projet créé ; les intervenants sont alertés'),
    invalidate: [['projects'], ['project'], ['company-ws']], onSuccess: onClose,
  });
  if (!open || !f) return null;
  const name = (id: string) => users.find((u) => u.id === id);
  const submit = () => save.run({
    name: f.name, description: f.description ?? '', kind: f.kind, manager_id: f.manager_id || null, organization_id: f.organization_id || null, collectivity_id: f.collectivity_id || null,
    status: f.status, ...(f.priority_level ? { priority_level: f.priority_level } : {}), start_date: f.start_date || null, end_date: f.end_date || null, budget: f.budget === '' || f.budget == null ? null : Number(f.budget),
    objectives: f.objectives ?? '', scope: f.scope ?? '', deliverables: f.deliverables ?? '', constraints: f.constraints ?? '', location: f.location ?? '',
    ...(f.visibility ? { visibility: f.visibility } : {}), members: f.members,
  });
  return (
    <Modal open onClose={onClose} size="xl" title={initial?.id ? `Projet ${initial.ref}` : 'Nouveau projet'}
      description={initial?.id ? undefined : 'Un projet enregistré par le service commercial est publié dans l’espace entreprise : tout le personnel est alerté, les intervenants avec leur rôle.'}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.name?.trim() || !f.priority_level} onClick={submit}>{initial?.id ? 'Enregistrer' : 'Créer et alerter'}</Button></>}>
      <div className="form-grid">
        <Field label="Nom du projet" required className="span-2" error={save.fieldErrors.name}><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoFocus /></Field>
        <Field label="Nature"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} options={Object.entries(PROJECT_KIND).map(([value, label]) => ({ value, label }))} /></Field>
        <PrioritySelect value={f.priority_level} onChange={(v) => setF({ ...f, priority_level: v })} error={save.fieldErrors.priority_level} label="Niveau de priorité du projet" />
        <Field label="Début"><Input type="date" value={f.start_date ?? ''} onChange={(e) => setF({ ...f, start_date: e.target.value })} /></Field>
        <Field label="Fin" error={save.fieldErrors.end_date}><Input type="date" value={f.end_date ?? ''} onChange={(e) => setF({ ...f, end_date: e.target.value })} /></Field>
        <Field label="Statut"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} options={[['cadrage', 'Cadrage'], ['planifie', 'Planifié'], ['en_cours', 'En cours'], ['en_pause', 'En pause'], ['termine', 'Terminé'], ['annule', 'Annulé']].map(([value, label]) => ({ value, label }))} /></Field>
        <Field label="Budget (FCFA)"><Input type="number" min={0} value={f.budget ?? ''} onChange={(e) => setF({ ...f, budget: e.target.value })} /></Field>
        <Field label="Chef de projet"><Select value={f.manager_id ?? ''} onChange={(e) => setF({ ...f, manager_id: e.target.value })} placeholder="Moi" options={users.map((u) => ({ value: u.id, label: `${u.full_name}${u.department_label ? ` · ${u.department_label}` : ''}` }))} /></Field>
        <Field label="Visibilité" hint="Par défaut : espace entreprise pour le service commercial">
          <Select value={f.visibility ?? ''} onChange={(e) => setF({ ...f, visibility: e.target.value })} placeholder="Par défaut" options={[{ value: 'entreprise', label: 'Espace entreprise (tout le personnel)' }, { value: 'service', label: 'Mon service et les intervenants' }]} />
        </Field>
        <Field label="Lieu"><Input value={f.location ?? ''} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
        {colls.data && <Field label="Collectivité"><Select value={f.collectivity_id ?? ''} onChange={(e) => setF({ ...f, collectivity_id: e.target.value })} placeholder="Aucune" options={colls.data.rows.map((c: any) => ({ value: c.id, label: c.name }))} /></Field>}
        <Field label="Objectifs" className="span-2"><Textarea rows={2} value={f.objectives ?? ''} onChange={(e) => setF({ ...f, objectives: e.target.value })} /></Field>
        <Field label="Périmètre et caractéristiques" className="span-2"><Textarea rows={2} value={f.scope ?? ''} onChange={(e) => setF({ ...f, scope: e.target.value })} /></Field>
        <Field label="Livrables" className="span-2"><Textarea rows={2} value={f.deliverables ?? ''} onChange={(e) => setF({ ...f, deliverables: e.target.value })} /></Field>
        <Field label="Contraintes (délais, techniques, réglementaires…)" className="span-2"><Textarea rows={2} value={f.constraints ?? ''} onChange={(e) => setF({ ...f, constraints: e.target.value })} /></Field>
        <Field label="Intervenants" className="span-2" hint="Toutes directions : ils reçoivent une alerte et peuvent se voir confier des tâches du projet">
          <div className="stack">
            <div className="row"><Select aria-label="Ajouter un intervenant" value={pick} onChange={(e) => setPick(e.target.value)} placeholder="Ajouter une personne…"
              options={users.filter((u) => !f.members.some((m: any) => m.user_id === u.id)).map((u) => ({ value: u.id, label: `${u.full_name}${u.department_label ? ` · ${u.department_label}` : ''}` }))} />
              <Button icon={<Plus />} disabled={!pick} onClick={() => { const u = name(pick); setF({ ...f, members: [...f.members, { user_id: pick, role_label: u?.job_title || 'Intervenant' }] }); setPick(''); }}>Ajouter</Button></div>
            {f.members.map((m: any, i: number) => (
              <div key={m.user_id} className="row">
                <span className="spacer small"><strong>{name(m.user_id)?.full_name ?? '—'}</strong> <span className="muted">{name(m.user_id)?.department_label ?? ''}</span></span>
                <Input aria-label="Rôle sur le projet" value={m.role_label} onChange={(e) => setF({ ...f, members: f.members.map((x: any, j: number) => (j === i ? { ...x, role_label: e.target.value } : x)) })} style={{ maxWidth: 240 }} />
                <Button size="sm" variant="ghost" iconOnly icon={<Trash2 />} aria-label="Retirer" onClick={() => setF({ ...f, members: f.members.filter((_: any, j: number) => j !== i) })} />
              </div>
            ))}
          </div>
        </Field>
        <Field label="Description" className="span-2"><Textarea value={f.description ?? ''} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

export function ProjectCard({ p, onOpen }: { p: any; onOpen: () => void }) {
  return (
    <button className="card project-card" onClick={onOpen} style={{ ['--dept' as any]: p.department_color }}>
      <div className="row"><span className="xsmall muted">{p.ref} · {PROJECT_KIND[p.kind]}</span><span className="spacer" /><Status kind="project" code={p.status} /></div>
      <h3>{p.name}</h3>
      <div className="progress" role="progressbar" aria-valuenow={p.progress_pct} aria-valuemin={0} aria-valuemax={100} aria-label="Avancement"><span style={{ width: `${p.progress_pct}%` }} /></div>
      <div className="row small"><span>{p.progress_pct} % · {p.tasks_done}/{p.tasks_total} tâches</span><span className="spacer" />{p.tasks_late > 0 && <Badge tone="danger">{p.tasks_late} en retard</Badge>}</div>
      <div className="row-wrap xsmall muted"><DeptChip label={p.department_label} color={p.department_color} /><span>{p.manager_name} · {date(p.start_date)} → {date(p.end_date)}</span>{p.visibility === 'entreprise' && <Badge tone="primary">Espace entreprise</Badge>}</div>
    </button>
  );
}

/** Projets du service et projets auxquels on participe. */
export default function Projects() {
  const can = useCan();
  const nav = useNavigate();
  const [scope, setScope] = useState('tous');
  const r = useApi<{ rows: any[] }>(['projects', scope], `/api/projects${scope === 'mine' ? '?mine=1' : ''}`);
  const [creating, setCreating] = useState(false);
  return (
    <>
      <PageHeader title="Projets" subtitle="Caractéristiques, contraintes, intervenants, Kanban, matrice RACI et frise chronologique"
        actions={<><Segmented label="Périmètre" value={scope} onChange={setScope} options={[{ id: 'tous', label: 'Tous mes projets visibles' }, { id: 'mine', label: 'Où j’interviens' }]} />{can('projects', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>Nouveau projet</Button>}</>} />
      {r.error ? <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card> : r.isLoading ? <Card><LoadingBlock rows={6} /></Card> : !r.data?.rows.length ? (
        <Card><Empty icon={<FolderKanban />} title="Aucun projet">Les projets d’entreprise apparaissent aussi dans l’espace entreprise.</Empty></Card>
      ) : <div className="project-grid">{r.data.rows.map((p) => <ProjectCard key={p.id} p={p} onOpen={() => nav(`/projets/${p.id}`)} />)}</div>}
      <ProjectForm open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

type PTab = 'fiche' | 'kanban' | 'raci' | 'frise' | 'suivi';
const COLS = [{ code: 'a_faire', label: 'À faire' }, { code: 'en_cours', label: 'En cours' }, { code: 'en_attente', label: 'En attente' }, { code: 'termine', label: 'Terminé' }];

export function ProjectDetail() {
  const { id } = useParams();
  const can = useCan();
  const r = useApi<any>(['project', id], `/api/projects/${id}`);
  const [tab, setTab] = useState<PTab>('fiche');
  const [editing, setEditing] = useState(false);
  const [task, setTask] = useState<any>(null);
  const [ms, setMs] = useState<any>(null);
  const [over, setOver] = useState<string | null>(null);
  const inv = [['project', id], ['tasks'], ['company-ws']];
  const addMs = useAction((b: any) => api.post(`/api/projects/${id}/milestones`, b), { success: 'Jalon ajouté', invalidate: inv, onSuccess: () => setMs(null) });
  const toggle = useAction((b: { mid: string; done: boolean }) => api.put(`/api/projects/${id}/milestones/${b.mid}`, { done: b.done }), { invalidate: inv });
  const move = useAction((b: { id: string; status: string }) => api.put(`/api/tasks/${b.id}`, { status: b.status }), { invalidate: inv });
  const raci = useAction((b: any) => api.put(`/api/projects/${id}/raci`, b), { invalidate: [['project', id]] });
  const people = useMemo(() => {
    const p = r.data;
    if (!p) return [];
    // Chef de projet en tête, puis les intervenants
    const list = p.members.filter((m: any) => m.user_id !== p.manager_id);
    const mgr = p.members.find((m: any) => m.user_id === p.manager_id);
    if (p.manager_id) list.unshift(mgr ? { ...mgr, role_label: `Chef de projet · ${mgr.role_label}` } : { user_id: p.manager_id, full_name: p.manager_name, role_label: 'Chef de projet' });
    return list;
  }, [r.data]);
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading || !r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const p = r.data;
  const roleOf = (taskId: string, userId: string) => p.raci.find((x: any) => x.task_id === taskId && x.user_id === userId)?.role as string | undefined;
  const cycle: Record<string, string | null> = { '': 'R', R: 'A', A: 'C', C: 'I', I: null };
  return (
    <>
      <PageHeader eyebrow={<DeptChip label={p.department_label} color={p.department_color} />} title={p.name}
        subtitle={`${p.ref} · ${PROJECT_KIND[p.kind]}${p.visibility === 'entreprise' ? ' · espace entreprise' : ''} · enregistré par ${p.created_by_name ?? '—'}`}
        crumbs={[{ label: 'Projets', to: '/projets' }, { label: p.ref }]}
        actions={<><Status kind="project" code={p.status} /><ExcelButton url={`/api/xlsx/project/${p.id}`} title="Fiche, planification, matrice RACI et jalons au format Excel" />{p.can_manage && <Button onClick={() => setEditing(true)}>Modifier</Button>}{p.can_manage && can('tasks', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setTask({})}>Tâche</Button>}</>} />
      <div className="grid-4">
        <Kpi label="Avancement" value={p.progress_pct} unit="%" progress={p.progress_pct} foot={`${p.tasks_done}/${p.tasks_total} tâches terminées`} />
        <Kpi label="Tâches en retard" value={<span className={p.tasks_late ? 'text-danger' : ''}>{p.tasks_late}</span>} />
        <Kpi label="Intervenants" value={people.length} foot={p.manager_name ? `Chef de projet : ${p.manager_name}` : undefined} />
        <Kpi label="Échéance" value={date(p.end_date)} foot={p.budget ? `Budget ${money(p.budget)}` : undefined} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'fiche', label: <><Info aria-hidden /> Fiche</> }, { id: 'frise', label: <><GitCommitHorizontal aria-hidden /> Planification</> },
        { id: 'kanban', label: <><Columns3 aria-hidden /> Kanban</>, count: p.tasks.length }, { id: 'raci', label: <><Grid3x3 aria-hidden /> Matrice RACI</> },
        { id: 'suivi', label: <><Users aria-hidden /> Jalons, risques, ordres</> },
      ]} />

      {tab === 'fiche' && (
        <div className="split">
          <Card title="Caractéristiques">
            <Dl items={[
              ['Objectifs', <span key="o" className="pre-wrap">{p.objectives || '—'}</span>], ['Périmètre', <span key="s" className="pre-wrap">{p.scope || '—'}</span>],
              ['Livrables', <span key="l" className="pre-wrap">{p.deliverables || '—'}</span>], ['Lieu', p.location || '—'], ['Client', p.organization_name ?? '—'],
              ['Période', `${date(p.start_date)} → ${date(p.end_date)}`], ['Priorité', <PriorityBadge key="p" level={p.priority_level} legacy={p.priority} />], ['Budget', p.budget ? money(p.budget) : '—'],
            ]} />
            {p.constraints && <div className="cp-constraints"><strong>Contraintes : </strong><span className="pre-wrap">{p.constraints}</span></div>}
            {p.description && <p className="small secondary pre-wrap">{p.description}</p>}
          </Card>
          <Card title="Intervenants" sub="Alertés à la création ; ils mettent à jour les tâches qui leur sont confiées">
            <ul className="list">
              {people.map((m: any) => <li key={m.user_id} className="list-item"><div className="spacer"><div className="strong">{m.full_name}</div><div className="xsmall muted">{m.role_label}</div></div><DeptChip label={m.department_label} color={m.department_color} /></li>)}
              {!people.length && <li className="muted small">Aucun intervenant.</li>}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'frise' && (
        <Card title="Frise chronologique du projet" sub="Chaque tâche est une étape de sa couleur, proportionnelle à sa durée ; les pointillés signalent une attente">
          <ProcessFlow items={p.tasks.map((t: any) => ({ id: t.id, title: t.title, start: t.start_date, end: t.due_date, status: t.status, who: t.owner_name, ref: t.ref, predecessor_id: t.predecessor_id, late: t.is_late, onClick: () => setTask(t) }))} />
        </Card>
      )}

      {tab === 'kanban' && (
        <div className="kanban" aria-label="Kanban du projet">
          {COLS.map((c) => {
            const items = p.tasks.filter((t: any) => t.status === c.code);
            return (
              <section key={c.code} className={`kanban-col${over === c.code ? ' drop' : ''}`} onDragOver={(e) => { e.preventDefault(); setOver(c.code); }} onDragLeave={() => setOver(null)}
                onDrop={(e) => { e.preventDefault(); setOver(null); const tid = e.dataTransfer.getData('text/plain'); const t = p.tasks.find((x: any) => x.id === tid); if (t && t.status !== c.code) move.run({ id: tid, status: c.code }); }}>
                <div className="kanban-head"><h3>{c.label}<span className="muted">{items.length}</span></h3></div>
                {items.map((t: any) => (
                  <article key={t.id} className={`kanban-card task-card q-${t.urgent && t.important ? 'faire' : t.important ? 'planifier' : t.urgent ? 'deleguer' : 'eliminer'}${t.is_late ? ' flag' : ''}`} draggable tabIndex={0}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)} onClick={() => setTask(t)}>
                    <div className="title">{t.title}</div>
                    <div className="meta"><span>{t.owner_name ?? 'Non attribuée'}</span><span className={t.is_late ? 'text-danger' : ''}>{date(t.due_date)}</span></div>
                  </article>
                ))}
                {!items.length && <div className="xsmall muted kanban-empty">Glissez une tâche ici</div>}
              </section>
            );
          })}
        </div>
      )}

      {tab === 'raci' && (
        <Card title="Matrice des responsabilités (RACI)" sub={p.can_manage ? 'Cliquez sur une case pour parcourir R → A → C → I → vide' : 'Renseignée par le chef de projet'}>
          {!p.tasks.length ? <Empty title="Aucune tâche">Créez les tâches du projet pour définir les responsabilités.</Empty> : (
            <div className="raci">
              <table>
                <thead><tr><th>Tâche</th>{people.map((m: any) => <th key={m.user_id}>{m.full_name}<div className="xsmall muted">{m.role_label}</div></th>)}</tr></thead>
                <tbody>
                  {p.tasks.map((t: any) => {
                    const a = people.filter((m: any) => roleOf(t.id, m.user_id) === 'A').length;
                    const rr = people.filter((m: any) => roleOf(t.id, m.user_id) === 'R').length;
                    return (
                      <tr key={t.id}>
                        <td><div className="strong small">{t.title}</div>{(!a || !rr) && <div className="raci-warn">{!rr ? 'Personne ne réalise' : ''}{!rr && !a ? ' · ' : ''}{!a ? 'Pas d’approbateur' : ''}</div>}</td>
                        {people.map((m: any) => {
                          const role = roleOf(t.id, m.user_id) ?? '';
                          return <td key={m.user_id}><button className={`raci-cell r-${role}`} disabled={!p.can_manage || raci.isPending} aria-label={`${t.title} — ${m.full_name} : ${role || 'aucun rôle'}`}
                            onClick={() => raci.run({ task_id: t.id, user_id: m.user_id, role: cycle[role] })}>{role}</button></td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="chips small legend-row"><span className="chip"><i className="sw" style={{ background: '#2a78d6' }} />R — Réalise</span><span className="chip"><i className="sw" style={{ background: '#d9443a' }} />A — Approuve (un seul)</span><span className="chip"><i className="sw" style={{ background: '#e09a1a' }} />C — Consulté</span><span className="chip"><i className="sw" style={{ background: '#8a909c' }} />I — Informé</span></div>
        </Card>
      )}

      {tab === 'suivi' && <>
        <Card title="Jalons" actions={p.can_manage && <Button size="sm" icon={<Plus />} onClick={() => setMs({ title: '', due_date: addDays(today(), 14) })}>Jalon</Button>}>
          <ul className="list">
            {p.milestones.map((m: any) => (
              <li key={m.id} className="list-item">
                <button className="icon-btn" aria-label={m.done_at ? 'Marquer non atteint' : 'Marquer atteint'} disabled={!p.can_manage} onClick={() => toggle.run({ mid: m.id, done: !m.done_at })}>{m.done_at ? <CheckCircle2 className="text-success" /> : <Circle />}</button>
                <span className={`spacer${m.done_at ? ' muted' : ''}`}>{m.title}</span>
                <Badge tone={m.done_at ? 'success' : m.due_date < today() ? 'danger' : 'info'}>{date(m.due_date)}</Badge>
              </li>
            ))}
            {!p.milestones.length && <li className="muted small">Aucun jalon.</li>}
          </ul>
        </Card>
        <div className="grid-2">
          <Card title="Risques du projet" flush>
            <DataTable compact rows={p.risks} empty={<Empty title="Aucun risque rattaché" />}
              columns={[{ key: 't', label: 'Risque', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{RISK_CATEGORY[x.category]}</div></> }, { key: 's', label: 'Score', render: (x: any) => <Badge tone={x.score >= 15 ? 'danger' : x.score >= 8 ? 'warning' : 'info'}>{x.score}</Badge> }]} />
          </Card>
          <Card title="Ordres de travail" flush>
            <DataTable compact rows={p.work_orders} empty={<Empty title="Aucun ordre de travail" />}
              columns={[{ key: 't', label: 'Ordre', render: (w: any) => <><Link to={`/ordres-travail/${w.id}`} className="cell-title">{w.title}</Link><div className="cell-sub">{w.ref} · {w.department_label}</div></> }, { key: 's', label: 'Statut', render: (w: any) => <Status kind="workorder" code={w.status} /> }]} />
          </Card>
        </div>
        {p.deployments.length > 0 && <Card title="Déploiements" flush>
          <DataTable compact rows={p.deployments} columns={[{ key: 't', label: 'Déploiement', render: (d: any) => <><div className="cell-title">{d.title}</div><div className="cell-sub">{d.ref} · {DEPLOYMENT_KIND[d.kind]}</div></> }, { key: 'd', label: 'Date', render: (d: any) => date(d.planned_date) }, { key: 's', label: 'Statut', render: (d: any) => <Status kind="deployment" code={d.status} /> }]} />
        </Card>}
      </>}

      <ProjectForm open={editing} onClose={() => setEditing(false)} initial={p} />
      <TaskForm open={!!task} onClose={() => setTask(null)} initial={task?.id ? task : undefined} preset={task?.id ? undefined : { project_id: p.id }} projectTasks={p.tasks} projectPeople={people} />
      <Modal open={!!ms} onClose={() => setMs(null)} title="Nouveau jalon" footer={<><Button onClick={() => setMs(null)}>Annuler</Button><Button variant="primary" disabled={!ms?.title?.trim()} loading={addMs.isPending} onClick={() => addMs.run(ms)}>Ajouter</Button></>}>
        {ms && <div className="form-grid"><Field label="Intitulé" required><Input value={ms.title} onChange={(e) => setMs({ ...ms, title: e.target.value })} /></Field><Field label="Date"><Input type="date" value={ms.due_date} onChange={(e) => setMs({ ...ms, due_date: e.target.value })} /></Field></div>}
      </Modal>
    </>
  );
}
