// To-do list et checklists : s'organiser, vérifier, se faire rappeler ce qu'il reste à faire
import { useState } from 'react';
import { Plus, Bell, Trash2, ListChecks, ListTodo, LayoutTemplate, CalendarClock, Copy } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { dateTime, relative } from '../lib/format';
import { Alert, Badge, Button, Card, Empty, Field, Input, Kpi, LoadingBlock, Modal, PageHeader, Select, Tabs, Textarea } from '../components/ui';
import { ChecklistItems, NewChecklist, Progress } from '../components/Checklist';

type Tab = 'todo' | 'checklists' | 'modeles';
const PRIO: Record<string, ['danger' | 'neutral' | 'info', string]> = { haute: ['danger', 'Haute'], normale: ['info', 'Normale'], basse: ['neutral', 'Basse'] };
/** Valeur d'un champ datetime-local (heure locale) → ISO avec fuseau */
const toIso = (v: string) => (v ? new Date(v).toISOString() : null);
const toLocal = (v?: string | null) => (v ? new Date(new Date(v).getTime() - new Date(v).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

export default function Todo() {
  const [tab, setTab] = useState<Tab>('todo');
  return (
    <>
      <PageHeader title="To-do list et checklists" subtitle="Organisez votre journée, vérifiez point par point et recevez un rappel (notification et annonce vocale) au moment choisi" />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'todo', label: 'Ma to-do list' }, { id: 'checklists', label: 'Mes checklists' }, { id: 'modeles', label: 'Modèles' }]} />
      {tab === 'todo' && <TodoList onShowSuivi={() => setTab('checklists')} />}
      {tab === 'checklists' && <Checklists />}
      {tab === 'modeles' && <Templates />}
    </>
  );
}

function TodoList({ onShowSuivi }: { onShowSuivi: () => void }) {
  const [status, setStatus] = useState<'ouvertes' | 'faites'>('ouvertes');
  const r = useApi<any>(['todos', status], `/api/todos${qs({ status })}`);
  const [quick, setQuick] = useState({ title: '', priority: 'normale', remind_at: '' });
  const [edit, setEdit] = useState<any>(null);
  const add = useAction((b: any) => api.post('/api/todos', b), { invalidate: [['todos']], onSuccess: () => setQuick({ title: '', priority: 'normale', remind_at: '' }) });
  const upd = useAction((v: { id: string; body: any }) => api.patch(`/api/todos/${v.id}`, v.body), { invalidate: [['todos']], onSuccess: () => setEdit(null) });
  const del = useAction((id: string) => api.del(`/api/todos/${id}`), { success: 'Élément supprimé', invalidate: [['todos']] });
  const st = r.data?.stats;
  return (
    <>
      <div className="grid-3">
        <Kpi label="À faire" value={st ? String(st.open) : '…'} foot="Éléments ouverts" />
        <Kpi label="En retard" value={st ? String(st.late) : '…'} foot="Échéance dépassée" />
        <Kpi label="Faits aujourd’hui" value={st ? String(st.done_today) : '…'} foot="Bravo !" />
      </div>
      <Alert tone="info">
        <span className="row-wrap" style={{ gap: 8 }}>
          <span><ListChecks size={14} aria-hidden /> Votre to-do list s’affiche automatiquement dans la <strong>checklist de suivi des tâches</strong> : cocher d’un côté coche de l’autre.</span>
          <span><Bell size={14} aria-hidden /> Rappel toutes les {r.data?.nudge_hours ?? 4} heures (de 7 h à 20 h) tant qu’il reste des choses à faire{r.data?.last_nudge_at ? ` — dernier rappel ${relative(r.data.last_nudge_at)}` : ''}.</span>
          {r.data?.suivi_checklist_id && <Button size="sm" variant="ghost" icon={<ListChecks />} onClick={onShowSuivi}>Voir la checklist de suivi</Button>}
        </span>
      </Alert>
      <Card>
        <div className="todo-quick">
          <Input aria-label="Nouvelle chose à faire" placeholder="Ajouter une chose à faire…" value={quick.title} onChange={(e) => setQuick({ ...quick, title: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter' && quick.title.trim()) add.run({ title: quick.title, priority: quick.priority, remind_at: toIso(quick.remind_at) }); }} />
          <Select aria-label="Priorité" value={quick.priority} onChange={(e) => setQuick({ ...quick, priority: e.target.value })} options={[{ value: 'haute', label: 'Haute' }, { value: 'normale', label: 'Normale' }, { value: 'basse', label: 'Basse' }]} />
          <label className="todo-remind"><Bell size={14} /><input type="datetime-local" aria-label="Me le rappeler le" value={quick.remind_at} onChange={(e) => setQuick({ ...quick, remind_at: e.target.value })} /></label>
          <Button variant="primary" icon={<Plus />} disabled={!quick.title.trim()} loading={add.isPending} onClick={() => add.run({ title: quick.title, priority: quick.priority, remind_at: toIso(quick.remind_at) })}>Ajouter</Button>
        </div>
      </Card>
      <Card flush title={status === 'ouvertes' ? 'À faire' : 'Fait'} actions={<Tabs value={status} onChange={setStatus} tabs={[{ id: 'ouvertes', label: 'À faire' }, { id: 'faites', label: 'Fait' }]} />}>
        {r.isLoading ? <LoadingBlock rows={5} /> : !r.data?.rows.length ? <Empty icon={<ListTodo />} title={status === 'ouvertes' ? 'Rien à faire pour le moment' : 'Aucun élément terminé'} /> : (
          <ul className="todo-list" role="list">
            {r.data.rows.map((t: any) => (
              <li key={t.id} className={`todo-item${t.done_at ? ' done' : ''}${t.is_late ? ' late' : ''}`}>
                <input type="checkbox" aria-label={`Marquer « ${t.title} » comme ${t.done_at ? 'à faire' : 'fait'}`} checked={!!t.done_at} onChange={(e) => upd.run({ id: t.id, body: { done: e.target.checked } })} />
                <button className="todo-main" onClick={() => setEdit({ ...t, due_local: toLocal(t.due_at), remind_local: toLocal(t.remind_at) })}>
                  <span className="todo-title">{t.title}</span>
                  <span className="row-wrap xsmall muted">
                    <Badge tone={PRIO[t.priority][0]}>{PRIO[t.priority][1]}</Badge>
                    {t.due_at && <span className={t.is_late ? 'text-danger' : ''}><CalendarClock size={12} /> {t.is_late ? 'En retard — ' : ''}{dateTime(t.due_at)}</span>}
                    {t.remind_at && <span><Bell size={12} /> {t.reminded_at ? `rappelé ${relative(t.reminded_at)}` : `rappel ${dateTime(t.remind_at)}`}</span>}
                    {t.task_ref && <span>Tâche {t.task_ref}</span>}
                    {t.done_at && <span>Fait {relative(t.done_at)}</span>}
                  </span>
                </button>
                <Button size="sm" variant="ghost" iconOnly icon={<Trash2 />} aria-label={`Supprimer « ${t.title} »`} onClick={() => del.run(t.id)} />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Chose à faire"
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={upd.isPending} onClick={() => upd.run({ id: edit.id, body: { title: edit.title, notes: edit.notes, priority: edit.priority, due_at: toIso(edit.due_local), remind_at: toIso(edit.remind_local) } })}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Intitulé" required className="span-2" error={upd.fieldErrors.title}><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
          <Field label="Priorité"><Select value={edit.priority} onChange={(e) => setEdit({ ...edit, priority: e.target.value })} options={[{ value: 'haute', label: 'Haute' }, { value: 'normale', label: 'Normale' }, { value: 'basse', label: 'Basse' }]} /></Field>
          <Field label="Échéance"><Input type="datetime-local" value={edit.due_local} onChange={(e) => setEdit({ ...edit, due_local: e.target.value })} /></Field>
          <Field label="Me le rappeler le" hint="Notification et annonce vocale"><Input type="datetime-local" value={edit.remind_local} onChange={(e) => setEdit({ ...edit, remind_local: e.target.value })} /></Field>
          <Field label="Notes" className="span-2"><Textarea value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></Field>
        </div>}
      </Modal>
    </>
  );
}

function Checklists() {
  const r = useApi<any>(['checklists', 'mine'], '/api/checklists');
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const del = useAction((id: string) => api.del(`/api/checklists/${id}`), { success: 'Checklist supprimée', invalidate: [['checklists']], onSuccess: () => setSel(null) });
  const rows: any[] = r.data?.rows ?? [];
  const current = rows.find((c) => c.id === sel) ?? rows.find((c) => c.kind === 'suivi_todo');
  return (
    <div className="grid-2">
      <Card flush title="Mes checklists" actions={<Button size="sm" variant="primary" icon={<Plus />} onClick={() => setOpen(true)}>Nouvelle checklist</Button>}>
        {r.isLoading ? <LoadingBlock rows={4} /> : !rows.length ? <Empty icon={<ListChecks />} title="Aucune checklist">Créez une liste de points à vérifier (avant une pose, un envoi de devis, une réunion…).</Empty> : (
          <ul className="todo-list" role="list">
            {rows.map((c) => (
              <li key={c.id} className={`todo-item${current?.id === c.id ? ' selected' : ''}`}>
                <button className="todo-main" onClick={() => setSel(c.id)}>
                  <span className="todo-title">{c.title}</span>
                  <span className="row-wrap xsmall muted">{c.kind === 'suivi_todo' && <Badge tone="info">Automatique · to-do list</Badge>}<Progress done={c.done_n} total={c.items_n} />{c.completed_at ? <Badge tone="success">Terminée</Badge> : c.required_open ? <Badge tone="warning">{c.required_open} {c.kind === 'suivi_todo' ? 'à faire' : 'obligatoire(s) restant(s)'}</Badge> : null}{c.task_ref && <span>Tâche {c.task_ref}</span>}{c.due_date && <span>Pour le {c.due_date}</span>}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title={current?.title ?? 'Points à vérifier'} sub={current?.kind === 'suivi_todo' ? 'Tenue automatiquement à partir de votre to-do list' : undefined}
        actions={current && current.kind !== 'suivi_todo' && <Button size="sm" variant="ghost" icon={<Trash2 />} onClick={() => del.run(current.id)}>Supprimer</Button>}>
        {current ? <ChecklistItems id={current.id} invalidate={current.kind === 'suivi_todo' ? [['todos']] : []} /> : <Empty icon={<ListChecks />} title="Sélectionnez une checklist" />}
      </Card>
      <NewChecklist open={open} onClose={() => setOpen(false)} onCreated={setSel} />
    </div>
  );
}

function Templates() {
  const r = useApi<any>(['checklists', 'templates'], '/api/checklists?templates=true');
  const [open, setOpen] = useState(false);
  const [use, setUse] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const rows: any[] = r.data?.rows ?? [];
  return (
    <div className="grid-2">
      <Card flush title="Modèles de checklists" sub="Les vôtres et ceux partagés par votre service" actions={<div className="row" style={{ gap: 6 }}><Button size="sm" icon={<Copy />} onClick={() => setUse(true)}>Utiliser un modèle</Button><Button size="sm" variant="primary" icon={<Plus />} onClick={() => setOpen(true)}>Nouveau modèle</Button></div>}>
        {r.isLoading ? <LoadingBlock rows={4} /> : !rows.length ? <Empty icon={<LayoutTemplate />} title="Aucun modèle" /> : (
          <ul className="todo-list" role="list">
            {rows.map((c) => (
              <li key={c.id} className={`todo-item${sel === c.id ? ' selected' : ''}`}>
                <button className="todo-main" onClick={() => setSel(c.id)}>
                  <span className="todo-title">{c.title}</span>
                  <span className="xsmall muted">{c.items_n} point(s) · {c.owner_name}{c.department_code ? ' · partagé avec le service' : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Contenu du modèle">{sel ? <ChecklistItems id={sel} /> : <Empty icon={<LayoutTemplate />} title="Sélectionnez un modèle" />}</Card>
      <NewChecklist open={open} onClose={() => setOpen(false)} template onCreated={setSel} />
      <NewChecklist open={use} onClose={() => setUse(false)} />
    </div>
  );
}
