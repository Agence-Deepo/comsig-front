import { ExcelButton } from '../components/ExportButton';
import { PriorityBadge, PriorityLegend } from '../components/Priority';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Clock, Columns3, GitCommitHorizontal, Grid2x2, List, Plus, ShieldAlert, Timer } from 'lucide-react';
import { ProcessFlow } from '../components/ProcessFlow';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan } from '../lib/auth';
import { addDays, date, today } from '../lib/format';
import { QUADRANT, RISK_CATEGORY, statusOf } from '../lib/labels';
import { Badge, Button, Card, DataTable, Empty, ErrorState, Field, Input, LoadingBlock, Modal, PageHeader, Segmented, Select, Status, Tabs, Textarea } from '../components/ui';
import { TaskForm, minutes, useAssignable } from '../components/work';

type Tab = 'kanban' | 'liste' | 'frise' | 'matrice' | 'risques' | 'temps';
const COLS: { code: string; label: string }[] = [
  { code: 'a_faire', label: 'À faire' }, { code: 'en_cours', label: 'En cours' }, { code: 'en_attente', label: 'En attente' }, { code: 'termine', label: 'Terminé' },
];

/** Tâches et matrices d'aide à la performance : Kanban, liste, Eisenhower, risques, gestion du temps. */
export default function Tasks() {
  const [sp, setSp] = useSearchParams();
  const tab = (sp.get('vue') as Tab) ?? 'kanban';
  const view = sp.get('qui') ?? 'service';
  const setTab = (t: Tab) => setSp({ vue: t, qui: view });
  const can = useCan();
  const [edit, setEdit] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  return (
    <>
      <PageHeader title="Tâches et matrices" subtitle="Organisez le travail : Kanban, priorités (Eisenhower), risques et temps passé"
        actions={<>
          <Segmented label="Périmètre" value={view} onChange={(v) => setSp({ vue: tab, qui: v })} options={[{ id: 'mine', label: 'Mes tâches' }, { id: 'service', label: 'Mon service' }, { id: 'delegated', label: 'Confiées' }]} />
          <ExcelButton url={tab === 'risques' ? '/api/xlsx/risks' : tab === 'temps' ? `/api/xlsx/time-report` : `/api/xlsx/tasks${view !== 'service' ? `?view=${view}` : ''}`} />
          {can('tasks', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>Nouvelle tâche</Button>}
        </>} />
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'kanban', label: <><Columns3 aria-hidden /> Kanban</> }, { id: 'liste', label: <><List aria-hidden /> Liste</> }, { id: 'frise', label: <><GitCommitHorizontal aria-hidden /> Planification</> },
        { id: 'matrice', label: <><Grid2x2 aria-hidden /> Matrice des priorités</> }, { id: 'risques', label: <><ShieldAlert aria-hidden /> Matrice des risques</> },
        { id: 'temps', label: <><Timer aria-hidden /> Gestion du temps</> },
      ]} />
      {(tab === 'kanban' || tab === 'liste') && <PriorityLegend />}
      {tab === 'kanban' && <KanbanView view={view} onOpen={setEdit} />}
      {tab === 'liste' && <ListView view={view} onOpen={setEdit} />}
      {tab === 'frise' && <FlowView view={view} onOpen={setEdit} />}
      {tab === 'matrice' && <MatrixView view={view} onOpen={setEdit} />}
      {tab === 'risques' && <RisksView />}
      {tab === 'temps' && <TimeView />}
      <TaskForm open={creating} onClose={() => setCreating(false)} />
      <TaskForm open={!!edit} onClose={() => setEdit(null)} initial={edit} />
    </>
  );
}

function useTasks(view: string, extra = '') {
  return useApi<{ rows: any[] }>(['tasks', view, extra], `/api/tasks?${view !== 'service' ? `view=${view}&` : ''}${extra}`);
}

function TaskCard({ t, onOpen, draggable }: { t: any; onOpen: (t: any) => void; draggable?: boolean }) {
  return (
    <article className={`kanban-card task-card q-${t.urgent && t.important ? 'faire' : t.important ? 'planifier' : t.urgent ? 'deleguer' : 'eliminer'}${t.is_late ? ' flag' : ''}`}
      draggable={draggable} tabIndex={0} onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)} onClick={() => onOpen(t)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(t); }}>
      <div className="title"><PriorityBadge level={t.priority_level} legacy={t.priority} compact /> {t.title}</div>
      <div className="meta"><span>{t.ref}{t.project_ref ? ` · ${t.project_ref}` : ''}</span>{t.due_date && <span className={t.is_late ? 'text-danger' : ''}>{t.is_late && <AlertTriangle aria-label="En retard" className="ic-xs" />} {date(t.due_date)}</span>}</div>
      <div className="meta"><span>{t.owner_name}</span><span className="row">{t.urgent && <Badge tone="danger" dot={false}>Urgent</Badge>}{t.important && <Badge tone="primary" dot={false}>Important</Badge>}</span></div>
      {(t.estimated_minutes || t.spent_minutes) ? <div className="meta"><span><Clock className="ic-xs" aria-hidden /> {minutes(t.spent_minutes)}{t.estimated_minutes ? ` / ${minutes(t.estimated_minutes)}` : ''}</span></div> : null}
    </article>
  );
}

function KanbanView({ view, onOpen }: { view: string; onOpen: (t: any) => void }) {
  const can = useCan();
  const r = useTasks(view);
  const [over, setOver] = useState<string | null>(null);
  const move = useAction((b: { id: string; status: string; kanban_order: number }) => api.put(`/api/tasks/${b.id}`, { status: b.status, kanban_order: b.kanban_order }), { invalidate: [['tasks'], ['eisenhower'], ['workspace']] });
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading) return <Card><LoadingBlock rows={6} /></Card>;
  const rows = r.data?.rows ?? [];
  return (
    <div className="kanban" aria-label="Tâches par statut">
      {COLS.map((c) => {
        const items = rows.filter((t) => t.status === c.code);
        return (
          <section key={c.code} className={`kanban-col${over === c.code ? ' drop' : ''}`} aria-label={`${c.label}, ${items.length} tâches`}
            onDragOver={(e) => { e.preventDefault(); setOver(c.code); }} onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/plain'); const t = rows.find((x) => x.id === id); if (t && t.status !== c.code) move.run({ id, status: c.code, kanban_order: Date.now() / 1e6 }); }}>
            <div className="kanban-head"><h3>{c.label}<span className="muted">{items.length}</span></h3></div>
            {items.map((t) => <TaskCard key={t.id} t={t} onOpen={onOpen} draggable={can('tasks', 'update')} />)}
            {!items.length && <div className="xsmall muted kanban-empty">Glissez une tâche ici</div>}
          </section>
        );
      })}
    </div>
  );
}

function ListView({ view, onOpen }: { view: string; onOpen: (t: any) => void }) {
  const [status, setStatus] = useState('ouvertes');
  const r = useTasks(view, status === 'ouvertes' ? 'open=1' : status ? `status=${status}` : '');
  return (
    <Card flush>
      <div className="filter-bar"><Select aria-label="Statut" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'ouvertes', label: 'Ouvertes' }, { value: '', label: 'Toutes' }, ...COLS.map((c) => ({ value: c.code, label: c.label })), { value: 'annule', label: 'Annulées' }]} /></div>
      <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={onOpen} empty={<Empty icon={<List />} title="Aucune tâche" />}
        columns={[
          { key: 't', label: 'Tâche', render: (t: any) => <><div className="cell-title">{t.title}</div><div className="cell-sub">{t.ref}{t.project_name ? ` · ${t.project_name}` : ''}</div></> },
          { key: 'o', label: 'Personne', render: (t: any) => <span className="small">{t.owner_name}</span>, mobile: 'hide' },
          { key: 'p', label: 'Niveau', render: (t: any) => <PriorityBadge level={t.priority_level} legacy={t.priority} /> },
          { key: 'q', label: 'Eisenhower', mobile: 'hide', render: (t: any) => { const q = QUADRANT[t.urgent && t.important ? 'faire' : t.important ? 'planifier' : t.urgent ? 'deleguer' : 'eliminer']; return <Badge tone={q.tone}>{q.label}</Badge>; } },
          { key: 'd', label: 'Échéance', render: (t: any) => <span className={`small${t.is_late ? ' text-danger strong' : ''}`}>{date(t.due_date)}{t.is_late ? ' · en retard' : ''}</span> },
          { key: 'tm', label: 'Temps', render: (t: any) => <span className="small">{minutes(t.spent_minutes)}{t.estimated_minutes ? ` / ${minutes(t.estimated_minutes)}` : ''}</span>, mobile: 'hide' },
          { key: 's', label: 'Statut', render: (t: any) => <Status kind="task" code={t.status} /> },
        ]} />
    </Card>
  );
}

function MatrixView({ view, onOpen }: { view: string; onOpen: (t: any) => void }) {
  const r = useApi<Record<string, any[]>>(['eisenhower', view], `/api/matrices/eisenhower${view === 'mine' ? '?view=mine' : ''}`);
  const move = useAction((b: { id: string; urgent: boolean; important: boolean }) => api.put(`/api/tasks/${b.id}`, { urgent: b.urgent, important: b.important }), { invalidate: [['eisenhower'], ['tasks']] });
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading || !r.data) return <Card><LoadingBlock rows={6} /></Card>;
  const flags: Record<string, { urgent: boolean; important: boolean }> = { faire: { urgent: true, important: true }, planifier: { urgent: false, important: true }, deleguer: { urgent: true, important: false }, eliminer: { urgent: false, important: false } };
  const total = Object.values(r.data).reduce((s, l) => s + l.length, 0);
  return (
    <>
      <p className="small muted">Glissez une tâche d’un quadrant à l’autre pour requalifier son urgence et son importance. Visez une majorité de tâches « importantes, non urgentes » : c’est la zone de performance.</p>
      <div className="matrix-2x2">
        {(['faire', 'planifier', 'deleguer', 'eliminer'] as const).map((k) => (
          <section key={k} className={`matrix-cell tone-${QUADRANT[k].tone}`} onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) move.run({ id, ...flags[k] }); }}>
            <header><h3>{QUADRANT[k].label}</h3><span className="badge">{r.data![k].length} · {total ? Math.round((r.data![k].length / total) * 100) : 0} %</span></header>
            <p className="xsmall">{QUADRANT[k].hint}</p>
            <div className="stack">{r.data![k].map((t) => <TaskCard key={t.id} t={t} onOpen={onOpen} draggable />)}</div>
          </section>
        ))}
      </div>
    </>
  );
}

function RisksView() {
  const can = useCan();
  const r = useApi<{ rows: any[] }>(['risks'], '/api/risks');
  const users = useAssignable();
  const [edit, setEdit] = useState<any>(null);
  const save = useAction((b: any) => (edit?.id ? api.put(`/api/risks/${edit.id}`, b) : api.post('/api/risks', b)), { success: 'Risque enregistré', invalidate: [['risks']], onSuccess: () => setEdit(null) });
  const rows = r.data?.rows ?? [];
  const grid = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const x of rows.filter((x) => x.status !== 'clos')) (g[`${x.probability}-${x.impact}`] ??= []).push(x);
    return g;
  }, [rows]);
  const level = (s: number) => (s >= 15 ? 'critique' : s >= 8 ? 'eleve' : s >= 4 ? 'modere' : 'faible');
  return (
    <>
      <div className="stack-lg">
        <Card title="Matrice des risques" sub="Probabilité × impact (1 à 5) — risques non clos"
          actions={can('tasks', 'create') && <Button size="sm" icon={<Plus />} onClick={() => setEdit({ title: '', description: '', category: 'operationnel', probability: 3, impact: 3, owner_id: '', mitigation: '', status: 'identifie', review_date: addDays(today(), 30) })}>Nouveau risque</Button>}>
          <div className="risk-matrix" role="table" aria-label="Matrice des risques">
            <div className="risk-axis-y" aria-hidden>Probabilité</div>
            <div className="risk-grid">
              {[5, 4, 3, 2, 1].map((p) => [1, 2, 3, 4, 5].map((i) => {
                const items = grid[`${p}-${i}`] ?? [];
                return (
                  <div key={`${p}-${i}`} role="cell" className={`risk-cell lvl-${level(p * i)}`} aria-label={`Probabilité ${p}, impact ${i} : ${items.length} risque(s)`}>
                    <span className="risk-score">{p * i}</span>
                    {items.map((x) => <button key={x.id} className="risk-pill" title={x.title} onClick={() => setEdit({ ...x })}>{x.ref.replace('RSK-', '')}</button>)}
                  </div>
                );
              }))}
            </div>
            <div className="risk-axis-x" aria-hidden>Impact →</div>
          </div>
          <div className="chips small"><span className="chip lvl-critique">Critique ≥ 15</span><span className="chip lvl-eleve">Élevé 8–14</span><span className="chip lvl-modere">Modéré 4–7</span><span className="chip lvl-faible">Faible 1–3</span></div>
        </Card>
        <Card title="Registre" flush>
          <DataTable rows={rows} loading={r.isLoading} onRowClick={can('tasks', 'update') ? (x: any) => setEdit({ ...x }) : undefined} empty={<Empty icon={<ShieldAlert />} title="Aucun risque enregistré" />}
            columns={[
              { key: 't', label: 'Risque', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.ref} · {RISK_CATEGORY[x.category]}{x.department_label ? ` · ${x.department_label}` : ''}</div></> },
              { key: 's', label: 'Score', render: (x: any) => <Badge tone={x.score >= 15 ? 'danger' : x.score >= 8 ? 'warning' : 'info'}>{x.score}</Badge> },
              { key: 'r', label: 'Revue', render: (x: any) => <span className={`small${x.review_late ? ' text-danger strong' : ''}`}>{date(x.review_date)}</span>, mobile: 'hide' },
              { key: 'st', label: 'Statut', render: (x: any) => <Status kind="risk" code={x.status} /> },
            ]} />
        </Card>
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} size="lg" title={edit?.id ? `Risque ${edit.ref}` : 'Nouveau risque'}
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!edit?.title}
          onClick={() => save.run({ title: edit.title, description: edit.description ?? '', category: edit.category, probability: Number(edit.probability), impact: Number(edit.impact), owner_id: edit.owner_id || null, mitigation: edit.mitigation ?? '', status: edit.status, review_date: edit.review_date || null })}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Intitulé" required className="span-2" error={save.fieldErrors.title}><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
          <Field label="Catégorie"><Select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} options={Object.entries(RISK_CATEGORY).map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="Responsable"><Select value={edit.owner_id ?? ''} onChange={(e) => setEdit({ ...edit, owner_id: e.target.value })} placeholder="—" options={users.map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
          <Field label="Probabilité (1 = rare, 5 = quasi certaine)"><Select value={String(edit.probability)} onChange={(e) => setEdit({ ...edit, probability: e.target.value })} options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))} /></Field>
          <Field label="Impact (1 = mineur, 5 = majeur)"><Select value={String(edit.impact)} onChange={(e) => setEdit({ ...edit, impact: e.target.value })} options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))} /></Field>
          <Field label="Statut"><Select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} options={Object.keys({ identifie: 1, en_traitement: 1, maitrise: 1, clos: 1 }).map((c) => ({ value: c, label: statusOf('risk', c)[0] }))} /></Field>
          <Field label="Prochaine revue"><Input type="date" value={edit.review_date ?? ''} onChange={(e) => setEdit({ ...edit, review_date: e.target.value })} /></Field>
          <Field label="Plan de traitement" required={Number(edit.probability) * Number(edit.impact) >= 15} className="span-2" error={save.fieldErrors.mitigation}><Textarea value={edit.mitigation ?? ''} onChange={(e) => setEdit({ ...edit, mitigation: e.target.value })} /></Field>
          <Field label="Description" className="span-2"><Textarea value={edit.description ?? ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
        </div>}
      </Modal>
    </>
  );
}

function TimeView() {
  const [from, setFrom] = useState(addDays(today(), -30));
  const [to, setTo] = useState(today());
  const r = useApi<any>(['time-report', from, to], `/api/time/report?from=${from}&to=${to}`);
  return (
    <Card title="Gestion du temps" sub={r.data ? `${r.data.working_days} jours ouvrés · ${minutes(r.data.available_minutes)} disponibles par personne` : undefined}
      actions={<div className="row"><Input type="date" aria-label="Du" value={from} onChange={(e) => setFrom(e.target.value)} /><Input type="date" aria-label="Au" value={to} onChange={(e) => setTo(e.target.value)} /></div>}>
      <p className="small muted">Temps saisi sur les tâches et ordres de travail, réparti selon la matrice d’Eisenhower. Une part élevée de « non important » signale du temps à réaffecter.</p>
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty icon={<Timer />} title="Aucun temps saisi sur la période" />}
        columns={[
          { key: 'n', label: 'Personne', render: (x: any) => <span className="strong">{x.full_name}</span> },
          { key: 'm', label: 'Temps saisi', num: true, render: (x: any) => minutes(x.minutes) },
          { key: 'l', label: 'Charge', render: (x: any) => <div className="hbar-track" title={`${x.load_pct ?? 0} %`}><span className="hbar-fill" style={{ width: `${Math.min(100, x.load_pct ?? 0)}%` }} /></div> },
          { key: 'q', label: 'Répartition', render: (x: any) => {
            const parts: [string, number, string][] = [['faire', x.q_faire ?? 0, 'Urgent et important'], ['planifier', x.q_planifier ?? 0, 'Important'], ['deleguer', x.q_deleguer ?? 0, 'Urgent'], ['eliminer', x.q_eliminer ?? 0, 'Ni l’un ni l’autre'], ['ot', x.ordres_travail ?? 0, 'Ordres de travail']];
            const tot = parts.reduce((s, p) => s + p[1], 0) || 1;
            return <div className="stacked-bar" role="img" aria-label={parts.map((p) => `${p[2]} ${Math.round((p[1] / tot) * 100)} %`).join(', ')}>{parts.filter((p) => p[1]).map((p) => <span key={p[0]} className={`seg-${p[0]}`} style={{ width: `${(p[1] / tot) * 100}%` }} title={`${p[2]} : ${minutes(p[1])}`} />)}</div>;
          } },
        ]} />
      <div className="chips small legend-row"><span className="chip"><i className="sw seg-faire" />Urgent et important</span><span className="chip"><i className="sw seg-planifier" />Important</span><span className="chip"><i className="sw seg-deleguer" />Urgent</span><span className="chip"><i className="sw seg-eliminer" />Ni l’un ni l’autre</span><span className="chip"><i className="sw seg-ot" />Ordres de travail</span></div>
    </Card>
  );
}

/** Planification : les tâches datées s'enchaînent sur une frise chronologique rectiligne, une couleur par tâche. */
function FlowView({ view, onOpen }: { view: string; onOpen: (t: any) => void }) {
  const r = useTasks(view, 'open=1');
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading) return <Card><LoadingBlock rows={4} /></Card>;
  const rows = r.data?.rows ?? [];
  return (
    <Card title="Planification" sub="Tâches ouvertes datées, de la plus proche à la plus lointaine ; renseignez début et échéance pour les placer sur la frise">
      <ProcessFlow items={rows.map((t) => ({ id: t.id, title: t.title, start: t.start_date, end: t.due_date, status: t.status, who: t.owner_name, ref: t.ref, predecessor_id: t.predecessor_id, late: t.is_late, onClick: () => onOpen(t) }))} />
    </Card>
  );
}
