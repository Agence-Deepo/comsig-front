import { TaskChecklists } from './Checklist';
import { useEffect, useState } from 'react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { addDays, today } from '../lib/format';
import { Alert, Button, Field, Input, Modal, Select, Textarea } from './ui';
import { PrioritySelect } from './Priority';
import { useAuth } from '../lib/auth';

export interface Dept { code: string; label: string; color: string; icon: string; kind: string; description?: string }

/** Pastille de service (couleur du service + libellé : la couleur n'est jamais seule porteuse de sens). */
export function DeptChip({ label, color }: { label?: string | null; color?: string | null }) {
  if (!label) return null;
  return <span className="dept-chip" style={{ ['--dept' as any]: color ?? 'var(--primary)' }}><span className="dept-dot" aria-hidden />{label}</span>;
}

export function useDepartments() {
  const r = useApi<{ rows: Dept[] }>(['departments'], '/api/departments');
  return r.data?.rows ?? [];
}

export function useAssignable() {
  const r = useApi<{ rows: { id: string; full_name: string; department_label: string }[] }>(['assignable'], '/api/assignable-users');
  return r.data?.rows ?? [];
}

/** Création / modification d'une tâche (personne chargée : son service ou un délégant). */
export function TaskForm({ open, onClose, initial, preset, projectTasks, projectPeople }: { open: boolean; onClose: () => void; initial?: any; preset?: Record<string, unknown>; projectTasks?: any[]; projectPeople?: any[] }) {
  const assignable = useAssignable();
  // Dans un projet : les intervenants du projet (toutes directions) en plus de son service
  const users = projectPeople ? [...projectPeople.map((m: any) => ({ id: m.user_id, full_name: m.full_name, department_label: m.role_label })), ...assignable.filter((u) => !projectPeople.some((m: any) => m.user_id === u.id))] : assignable;
  const projects = useApi<any>(['projects-pick'], open ? '/api/projects' : null, { enabled: open });
  const { me } = useAuth();
  const [f, setF] = useState<any>({});
  useEffect(() => {
    if (open) setF(initial ? { ...initial } : { title: '', description: '', owner_id: '', urgent: false, important: true, priority_level: null, due_date: addDays(today(), 3), estimated_minutes: '', project_id: '', ...preset });
  }, [open, initial]);
  const save = useAction((b: any) => (initial?.id ? api.put(`/api/tasks/${initial.id}`, b) : api.post('/api/tasks', b)), {
    success: initial?.id ? 'Tâche mise à jour' : 'Tâche créée', invalidate: [['tasks'], ['eisenhower'], ['workspace'], ['calendar'], ['project'], ['company-ws']], onSuccess: onClose,
  });
  // Protocole : une tâche confiée à une autre personne porte un niveau de priorité choisi explicitement
  const delegated = !!f.owner_id && f.owner_id !== me?.id;
  const reassigned = !!initial?.id && !!f.owner_id && f.owner_id !== initial.owner_id && f.owner_id !== me?.id;
  const levelMissing = initial?.id ? reassigned && !f._levelChosen : delegated && !f.priority_level;
  const submit = () => save.run({
    title: f.title, description: f.description ?? '', owner_id: f.owner_id || null, urgent: !!f.urgent, important: !!f.important,
    ...(f.priority_level ? { priority_level: f.priority_level } : {}),
    start_date: f.start_date || null, due_date: f.due_date || null, ...(projectTasks ? { predecessor_id: f.predecessor_id || null } : {}), estimated_minutes: f.estimated_minutes === '' || f.estimated_minutes == null ? null : Number(f.estimated_minutes), project_id: f.project_id || null,
    ...(initial?.id ? { status: f.status } : {}),
  });
  return (
    <Modal open={open} onClose={onClose} size="lg" title={initial?.id ? `Tâche ${initial.ref}` : 'Nouvelle tâche'}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.title?.trim() || levelMissing} onClick={submit}>{delegated && !initial?.id ? 'Transmettre' : 'Enregistrer'}</Button></>}>
      <div className="form-grid">
        <Field label="Intitulé" required className="span-2" error={save.fieldErrors.title}><Input value={f.title ?? ''} onChange={(e) => setF({ ...f, title: e.target.value })} autoFocus /></Field>
        <Field label="Personne chargée" hint="Votre service ou une personne qui vous a délégué son travail" error={save.fieldErrors.owner_id}>
          <Select value={f.owner_id ?? ''} onChange={(e) => setF({ ...f, owner_id: e.target.value })} placeholder="Moi" options={users.map((u) => ({ value: u.id, label: `${u.full_name}${u.department_label ? ` · ${u.department_label}` : ''}` }))} />
        </Field>
        <Field label="Début"><Input type="date" value={f.start_date ?? ''} onChange={(e) => setF({ ...f, start_date: e.target.value })} /></Field>
        <Field label="Échéance" error={save.fieldErrors.due_date}><Input type="date" value={f.due_date ?? ''} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>
        {projectTasks && <Field label="Après la tâche" hint="Enchaînement affiché sur la frise" error={save.fieldErrors.predecessor_id}><Select value={f.predecessor_id ?? ''} onChange={(e) => setF({ ...f, predecessor_id: e.target.value })} placeholder="Aucune" options={projectTasks.filter((t) => t.id !== initial?.id).map((t) => ({ value: t.id, label: t.title }))} /></Field>}
        <Field label="Matrice d’Eisenhower" className="span-2">
          <div className="row-wrap">
            <label className="checkbox"><input type="checkbox" checked={!!f.urgent} onChange={(e) => setF({ ...f, urgent: e.target.checked })} /> Urgent</label>
            <label className="checkbox"><input type="checkbox" checked={!!f.important} onChange={(e) => setF({ ...f, important: e.target.checked })} /> Important</label>
          </div>
        </Field>
        <PrioritySelect value={f.priority_level} onChange={(v) => setF({ ...f, priority_level: v, _levelChosen: true })} required={delegated} error={save.fieldErrors.priority_level}
          label={delegated ? 'Niveau de priorité (obligatoire pour déléguer)' : 'Niveau de priorité'} />
        <Field label="Temps estimé (minutes)"><Input type="number" min={0} value={f.estimated_minutes ?? ''} onChange={(e) => setF({ ...f, estimated_minutes: e.target.value })} /></Field>
        {initial?.id && <Field label="Statut"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} options={[{ value: 'a_faire', label: 'À faire' }, { value: 'en_cours', label: 'En cours' }, { value: 'en_attente', label: 'En attente' }, { value: 'termine', label: 'Terminé' }, { value: 'annule', label: 'Annulé' }]} /></Field>}
        <Field label="Projet"><Select value={f.project_id ?? ''} onChange={(e) => setF({ ...f, project_id: e.target.value })} placeholder="Aucun" options={(projects.data?.rows ?? []).map((p: any) => ({ value: p.id, label: `${p.ref} — ${p.name}` }))} /></Field>
        <Field label="Description" className="span-2"><Textarea value={f.description ?? ''} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        {initial?.id && <TaskChecklists taskId={initial.id} />}
        {save.error && !Object.keys(save.fieldErrors).length && <div className="span-2"><Alert tone="danger">{save.error.message}</Alert></div>}
      </div>
    </Modal>
  );
}

/** Caractéristiques attendues selon le service exécutant (enregistrées telles quelles dans l'ordre). */
export const SPEC_FIELDS: Record<string, [string, string][]> = {
  imprimerie: [['support', 'Support / matière'], ['dimensions', 'Dimensions'], ['finition', 'Finition'], ['fichier', 'Fichier à imprimer']],
  decoration: [['lieu', 'Lieu ou véhicule'], ['surface', 'Surface'], ['materiaux', 'Matériaux'], ['visuel', 'Visuel / maquette']],
  atelier: [['matiere', 'Matière'], ['dimensions', 'Dimensions'], ['plan', 'Plan / référence'], ['finition', 'Finition (peinture…)']],
  cnc: [['matiere', 'Matière'], ['epaisseur', 'Épaisseur'], ['fichier', 'Fichier (DXF, SVG…)'], ['machine', 'Machine souhaitée']],
  informatique: [['formats', 'Formats / déclinaisons / livrables'], ['fichiers', 'Fichiers sources'], ['lieu', 'Lieu / site (études, architecture, tournage)'], ['dimensions', 'Dimensions / surfaces'], ['materiel', 'Matériel / poste concerné']],
  production: [['article', 'Article à fabriquer'], ['reference', 'Référence']],
  regie: [['support', 'Support / emplacement'], ['visuel', 'Visuel']],
};

/** Demande ou ordre de travail à un service (imprimerie, décoration, atelier, CNC, informatique…). */
export function WorkOrderForm({ open, onClose, department, preset }: { open: boolean; onClose: () => void; department?: string; preset?: Record<string, unknown> }) {
  const deps = useDepartments();
  const kinds = useApi<{ kinds: Record<string, Record<string, string>> }>(['wo-kinds'], '/api/workorders/kinds');
  const [f, setF] = useState<any>({});
  useEffect(() => { if (open) setF({ department_code: department ?? '', kind: '', title: '', description: '', specs: {}, quantity: '', unit: '', priority_level: null, due_date: addDays(today(), 5), ...preset }); }, [open]);
  const save = useAction((b: any) => api.post('/api/workorders', b), { success: (r: any) => `Ordre ${r.ref} transmis`, invalidate: [['workorders'], ['workspace']], onSuccess: onClose });
  const k = kinds.data?.kinds ?? {};
  const execDeps = deps.filter((d) => k[d.code]);
  const specFields = SPEC_FIELDS[f.department_code] ?? [];
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Nouvelle demande à un service" description="Le service exécutant planifie, réalise et contrôle ; vous suivez l’avancement et êtes prévenu à chaque étape."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.department_code || !f.kind || !f.title?.trim() || !f.priority_level}
        onClick={() => save.run({ ...f, quantity: f.quantity === '' ? null : Number(f.quantity), due_date: f.due_date || null })}>Transmettre</Button></>}>
      <div className="form-grid">
        <Field label="Service exécutant" required error={save.fieldErrors.department_code}>
          <Select value={f.department_code} onChange={(e) => setF({ ...f, department_code: e.target.value, kind: '', specs: {} })} placeholder="Choisir…" options={execDeps.map((d) => ({ value: d.code, label: d.label }))} />
        </Field>
        <Field label="Type de travail" required error={save.fieldErrors.kind}>
          <Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} placeholder="Choisir…" options={Object.entries(k[f.department_code] ?? {}).map(([value, label]) => ({ value, label }))} />
        </Field>
        <Field label="Intitulé" required className="span-2" error={save.fieldErrors.title}><Input value={f.title ?? ''} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        {specFields.map(([key, label]) => (
          <Field key={key} label={label}><Input value={f.specs?.[key] ?? ''} onChange={(e) => setF({ ...f, specs: { ...f.specs, [key]: e.target.value } })} /></Field>
        ))}
        <Field label="Quantité"><Input type="number" min={0} step="any" value={f.quantity ?? ''} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></Field>
        <Field label="Unité"><Input value={f.unit ?? ''} onChange={(e) => setF({ ...f, unit: e.target.value })} placeholder="pièce, m², bâche…" /></Field>
        <PrioritySelect value={f.priority_level} onChange={(v) => setF({ ...f, priority_level: v })} error={save.fieldErrors.priority_level} />
        <Field label="Souhaité pour le"><Input type="date" value={f.due_date ?? ''} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>
        <Field label="Description" className="span-2"><Textarea value={f.description ?? ''} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

export const minutes = (m: number | null | undefined) => {
  if (!m) return '0 h';
  const h = Math.floor(m / 60), r = m % 60;
  return h ? `${h} h${r ? ` ${String(r).padStart(2, '0')}` : ''}` : `${r} min`;
};
