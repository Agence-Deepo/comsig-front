// Checklists : points à vérifier (obligatoires ou non), cochés avec auteur et date ; modèles réutilisables
import { useState } from 'react';
import { Plus, Trash2, ListChecks } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { relative } from '../lib/format';
import { Alert, Badge, Button, Field, Input, LoadingBlock, Modal, Select, Textarea } from './ui';

export function Progress({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((100 * done) / total) : 0;
  return <span className="cl-progress" title={`${done} / ${total} point(s) vérifié(s)`}><span className="pm-bar"><span style={{ width: `${pct}%` }} /></span><span className="xsmall muted">{done}/{total}</span></span>;
}

/** Points d'une checklist, cochables ; ajout et suppression de points. */
export function ChecklistItems({ id, invalidate = [] }: { id: string; invalidate?: unknown[][] }) {
  const c = useApi<any>(['checklist', id], `/api/checklists/${id}`);
  const [label, setLabel] = useState('');
  const [required, setRequired] = useState(true);
  const inv = [['checklist', id], ['checklists'], ['todos'], ...invalidate];
  const toggle = useAction((v: { id: string; done: boolean }) => api.patch(`/api/checklist-items/${v.id}`, { done: v.done }), { invalidate: inv });
  const add = useAction(() => api.post(`/api/checklists/${id}/items`, { label, required }), { invalidate: inv, onSuccess: () => setLabel('') });
  const del = useAction((itemId: string) => api.del(`/api/checklist-items/${itemId}`), { invalidate: inv });
  if (c.isLoading || !c.data) return <LoadingBlock rows={3} />;
  const tpl = c.data.is_template;
  // Checklist de suivi : reflet de la to-do list (ajouter un point ajoute une chose à faire)
  const suivi = c.data.kind === 'suivi_todo';
  return (
    <div className="stack-sm">
      <ul className="cl-items" role="list">
        {c.data.items.map((i: any) => (
          <li key={i.id} className={i.done_at ? 'done' : ''}>
            <label className="checkbox">
              <input type="checkbox" disabled={tpl || !c.data.can_edit} checked={!!i.done_at} onChange={(e) => toggle.run({ id: i.id, done: e.target.checked })} />
              <span>{i.label}{i.required || suivi ? '' : <span className="xsmall muted"> (facultatif)</span>}</span>
            </label>
            {i.done_at && <span className="xsmall muted">{i.done_by_name} · {relative(i.done_at)}</span>}
            {c.data.can_edit && !i.todo_id && <Button size="sm" variant="ghost" iconOnly icon={<Trash2 />} aria-label={`Retirer « ${i.label} »`} onClick={() => del.run(i.id)} />}
          </li>
        ))}
      </ul>
      {c.data.can_edit && (
        <div className="row" style={{ gap: 6 }}>
          <Input aria-label={suivi ? 'Nouvelle chose à faire' : 'Nouveau point à vérifier'} placeholder={suivi ? 'Ajouter une chose à faire (elle rejoint la to-do list)…' : 'Ajouter un point à vérifier…'} value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && label.trim()) add.run(undefined); }} />
          {!suivi && <label className="checkbox xsmall" style={{ whiteSpace: 'nowrap' }}><input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />Obligatoire</label>}
          <Button size="sm" icon={<Plus />} disabled={!label.trim()} loading={add.isPending} onClick={() => add.run(undefined)}>Ajouter</Button>
        </div>
      )}
      {suivi && !c.data.items.length && <span className="xsmall muted">Votre to-do list est vide : ce que vous y ajoutez apparaît ici automatiquement.</span>}
      {(toggle.error || add.error || del.error) && <Alert tone="danger">{(toggle.error ?? add.error ?? del.error)!.message}</Alert>}
    </div>
  );
}

/** Création d'une checklist (vierge ou depuis un modèle), éventuellement rattachée à une tâche, ou d'un modèle. */
export function NewChecklist({ open, onClose, taskId, template, onCreated }: { open: boolean; onClose: () => void; taskId?: string; template?: boolean; onCreated?: (id: string) => void }) {
  const tpls = useApi<any>(['checklists', 'templates'], open && !template ? '/api/checklists?templates=true' : null);
  const [f, setF] = useState({ title: '', from_template: '', items: '', shared: true, due_date: '' });
  const save = useAction((b: any) => api.post('/api/checklists', b), {
    success: template ? 'Modèle créé' : 'Checklist créée', invalidate: [['checklists']],
    onSuccess: (r: any) => { setF({ title: '', from_template: '', items: '', shared: true, due_date: '' }); onCreated?.(r.id); onClose(); },
  });
  const items = f.items.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => ({ label: l.replace(/^\(f\)\s*/i, ''), required: !/^\(f\)/i.test(l) }));
  return (
    <Modal open={open} onClose={onClose} title={template ? 'Nouveau modèle de checklist' : taskId ? 'Checklist de la tâche' : 'Nouvelle checklist'}
      description={taskId ? 'Tant qu’un point obligatoire n’est pas coché, la tâche ne peut pas être terminée.' : template ? 'Un modèle partagé peut être utilisé par les collègues de votre service.' : undefined}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.title.trim() || (!items.length && !f.from_template)}
        onClick={() => save.run({ title: f.title, task_id: taskId, is_template: !!template, shared_with_department: !!template && f.shared, from_template: f.from_template || undefined, items, due_date: f.due_date || null })}>Créer</Button></>}>
      <div className="form-grid">
        <Field label="Intitulé" required className="span-2" error={save.fieldErrors.title}><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} autoFocus /></Field>
        {!template && (tpls.data?.rows?.length ?? 0) > 0 && <Field label="À partir d’un modèle"><Select value={f.from_template} placeholder="Aucun" onChange={(e) => setF({ ...f, from_template: e.target.value, title: f.title || (tpls.data.rows.find((t: any) => t.id === e.target.value)?.title ?? '') })} options={tpls.data.rows.map((t: any) => ({ value: t.id, label: `${t.title} (${t.items_n} points)` }))} /></Field>}
        {!template && !taskId && <Field label="À faire pour le"><Input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>}
        <Field label="Points à vérifier" hint="Un point par ligne ; préfixez « (f) » pour un point facultatif" className="span-2" error={save.fieldErrors.items}>
          <Textarea rows={6} value={f.items} onChange={(e) => setF({ ...f, items: e.target.value })} placeholder={'Marge vérifiée\nVisuel validé par le client\n(f) Photo du site'} />
        </Field>
        {template && <Field label="Partage" className="span-2"><label className="checkbox"><input type="checkbox" checked={f.shared} onChange={(e) => setF({ ...f, shared: e.target.checked })} />Utilisable par les collègues de mon service</label></Field>}
        {save.error && !Object.keys(save.fieldErrors).length && <Alert tone="danger">{save.error.message}</Alert>}
      </div>
    </Modal>
  );
}

/** Checklists rattachées à une tâche (dans la fiche de la tâche). */
export function TaskChecklists({ taskId }: { taskId: string }) {
  const r = useApi<any>(['checklists', 'task', taskId], `/api/checklists?task_id=${taskId}`);
  const [open, setOpen] = useState(false);
  return (
    <div className="span-2 stack-sm">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong className="small"><ListChecks size={14} /> Checklist de vérification</strong>
        <Button size="sm" icon={<Plus />} onClick={() => setOpen(true)}>Ajouter une checklist</Button>
      </div>
      {(r.data?.rows ?? []).map((c: any) => (
        <div key={c.id} className="cl-box">
          <div className="row" style={{ justifyContent: 'space-between' }}><span className="small strong">{c.title}</span>{c.required_open ? <Badge tone="warning">{c.required_open} point(s) obligatoire(s) à cocher</Badge> : <Badge tone="success">Vérifiée</Badge>}</div>
          <ChecklistItems id={c.id} invalidate={[['checklists', 'task', taskId]]} />
        </div>
      ))}
      {!r.data?.rows?.length && <span className="xsmall muted">Aucune checklist : ajoutez les points à vérifier avant de terminer la tâche.</span>}
      <NewChecklist open={open} onClose={() => setOpen(false)} taskId={taskId} />
    </div>
  );
}
