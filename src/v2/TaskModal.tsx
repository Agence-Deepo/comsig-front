import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ListChecks, Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { api } from './api';
import { useAuth } from './auth';
import { can, label, type Row } from './types';
import { ErrorBox } from './ui';
import './task-modal.css';

const STATUSES = ['a_faire', 'en_cours', 'en_attente', 'termine', 'annule'];

/** Niveaux P1 à P5, avec le délai et les critères affichés sous le sélecteur. */
const PRIORITIES = [
  {
    level: 1,
    code: 'P1',
    label: 'Critique',
    color: '#C81E1E',
    response: 'Prise en charge immédiate (sous 4 heures).',
    criteria:
      'Arrêt ou risque d’arrêt d’une activité, d’une campagne ou d’un chantier ; Sécurité des personnes, des biens ou des données en jeu ; Impact financier ou contractuel majeur, ou demande expresse de la direction générale.',
  },
  {
    level: 2,
    code: 'P2',
    label: 'Haute',
    color: '#EA580C',
    response: 'Prise en charge sous 24 heures.',
    criteria:
      'Engagement envers un client ou une collectivité sous 48 heures ; Échéance contractuelle, pénalité ou réservation en jeu ; Blocage du travail d’un autre service.',
  },
  {
    level: 3,
    code: 'P3',
    label: 'Moyenne',
    color: '#CA8A04',
    response: 'Prise en charge sous 3 jours ouvrés.',
    criteria:
      'Travail planifié de la semaine ; Échéance connue à moins de 10 jours ; Impact limité à un dossier.',
  },
  {
    level: 4,
    code: 'P4',
    label: 'Normale',
    color: '#2563EB',
    response: 'Prise en charge sous 7 jours.',
    criteria: 'Travail courant sans échéance proche ; Préparation, mise à jour, suivi.',
  },
  {
    level: 5,
    code: 'P5',
    label: 'Basse',
    color: '#64748B',
    response: 'Prise en charge sous 30 jours.',
    criteria: 'Amélioration, fond de tâches, veille.',
  },
];

/**
 * Fenêtre d'édition d'une tâche, ouverte depuis la frise, le Kanban ou la matrice.
 * Reprend la composition de la démonstration : identité, dates, Eisenhower, priorité P1–P5,
 * temps estimé, statut, projet, description, puis la checklist personnelle du titulaire.
 */
export function TaskModal({
  task,
  onClose,
  onSaved,
}: {
  task: Row;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const editable = can(user, 'tasks.update');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(() => ({
    title: String(task.title ?? ''),
    owner_id: String(task.owner_id ?? ''),
    starts_at: task.starts_at ? String(task.starts_at).slice(0, 10) : '',
    due_at: task.due_at ? String(task.due_at).slice(0, 10) : '',
    urgent: Boolean(task.urgent),
    important: Boolean(task.important),
    priority_level: Number(task.priority_level ?? 4),
    estimated_minutes: task.estimated_minutes ? String(task.estimated_minutes) : '',
    status: String(task.status ?? 'a_faire'),
    project_id: String(task.project_id ?? ''),
    description: String(task.description ?? ''),
  }));
  const update = (patch: Record<string, unknown>) => setForm((current) => ({ ...current, ...patch }));

  const people = useQuery({
    queryKey: ['assignable-users'],
    queryFn: () => api.get<{ rows: Row[] }>('/assignable-users'),
    enabled: editable,
  });
  const projects = useQuery({
    queryKey: ['company-projects-options'],
    queryFn: () =>
      api.get<{ data: Row[] }>('/company-projects?per_page=100').catch(() => ({ data: [] as Row[] })),
    enabled: editable,
  });
  // Checklist personnelle rattachée à cette tâche. Elle est privée : seul le titulaire
  // la voit. Si la tâche ne m'appartient pas, aucun bloc n'est affiché.
  const mine = String(task.owner_id) === String(user?.id);
  const checklists = useQuery({
    queryKey: ['task-checklists', task.id],
    queryFn: () => api.get<{ data: Row[] }>(`/checklists?task_id=${task.id}`),
    enabled: editable && mine,
  });
  const checklist = checklists.data?.data?.[0];
  const items: Row[] = checklist?.items ?? [];
  const required = items.filter((item) => item.required);
  const open = required.filter((item) => !item.checked_at);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.patch('/tasks/' + task.id, {
        title: form.title,
        owner_id: form.owner_id ? Number(form.owner_id) : undefined,
        starts_at: form.starts_at || null,
        due_at: form.due_at || null,
        urgent: form.urgent,
        important: form.important,
        priority_level: form.priority_level,
        estimated_minutes: form.estimated_minutes === '' ? null : Number(form.estimated_minutes),
        status: form.status,
        project_id: form.project_id || null,
        description: form.description || null,
      });
      await qc.invalidateQueries();
      onSaved?.();
      onClose();
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };

  const priority = PRIORITIES.find((item) => item.level === form.priority_level) ?? PRIORITIES[3];

  return createPortal(
    <div className="modal-root">
      <div className="scrim" onClick={onClose} />
      <div className="modal lg" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <h2 id="task-modal-title">Tâche {task.reference ?? ''}</h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            aria-label="Fermer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <ErrorBox error={error} />
          <div className="form-grid">
            <div className="field span-2">
              <label className="field-label" htmlFor="tm-title">
                Intitulé<span className="req">*</span>
              </label>
              <input
                className="input"
                id="tm-title"
                value={form.title}
                onChange={(event) => update({ title: event.target.value })}
                disabled={!editable}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="tm-owner">
                Personne chargée
              </label>
              <select
                className="select"
                id="tm-owner"
                value={form.owner_id}
                onChange={(event) => update({ owner_id: event.target.value })}
                disabled={!editable}
              >
                <option value="">Moi</option>
                {(people.data?.rows ?? []).map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                    {person.department_label ? ` · ${person.department_label}` : ''}
                  </option>
                ))}
              </select>
              <div className="field-hint">Votre service ou une personne qui vous a délégué son travail</div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="tm-start">
                Début
              </label>
              <input
                className="input"
                type="date"
                id="tm-start"
                value={form.starts_at}
                onChange={(event) => update({ starts_at: event.target.value })}
                disabled={!editable}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="tm-due">
                Échéance
              </label>
              <input
                className="input"
                type="date"
                id="tm-due"
                value={form.due_at}
                onChange={(event) => update({ due_at: event.target.value })}
                disabled={!editable}
              />
            </div>
            <div className="field span-2">
              <span className="field-label">Matrice d’Eisenhower</span>
              <div className="row-wrap">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={form.urgent}
                    onChange={(event) => update({ urgent: event.target.checked })}
                    disabled={!editable}
                  />{' '}
                  Urgent
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={form.important}
                    onChange={(event) => update({ important: event.target.checked })}
                    disabled={!editable}
                  />{' '}
                  Important
                </label>
              </div>
            </div>
            <div className="field span-2 prio-field">
              <span className="field-label">
                Niveau de priorité (obligatoire pour déléguer)<span className="req"> *</span>{' '}
                <a className="xsmall" href="/protocole-priorites">
                  Voir la légende
                </a>
              </span>
              <div className="prio-select" role="radiogroup" aria-label="Niveau de priorité">
                {PRIORITIES.map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    role="radio"
                    aria-checked={form.priority_level === item.level}
                    className={`prio-option${form.priority_level === item.level ? ' on' : ''}`}
                    style={{ ['--prio' as string]: item.color }}
                    onClick={() => editable && update({ priority_level: item.level })}
                    disabled={!editable}
                  >
                    <span className="prio-dot" aria-hidden />
                    <strong>{item.code}</strong> {item.label}
                  </button>
                ))}
              </div>
              <div className="prio-help xsmall">
                <strong>{priority.response}</strong> Critères : {priority.criteria}
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="tm-estimate">
                Temps estimé (minutes)
              </label>
              <input
                className="input"
                type="number"
                min="0"
                id="tm-estimate"
                value={form.estimated_minutes}
                onChange={(event) => update({ estimated_minutes: event.target.value })}
                disabled={!editable}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="tm-status">
                Statut
              </label>
              <select
                className="select"
                id="tm-status"
                value={form.status}
                onChange={(event) => update({ status: event.target.value })}
                disabled={!editable}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {label(status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="tm-project">
                Projet
              </label>
              <select
                className="select"
                id="tm-project"
                value={form.project_id}
                onChange={(event) => update({ project_id: event.target.value })}
                disabled={!editable}
              >
                <option value="">Aucun</option>
                {(projects.data?.data ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.reference ? `${project.reference} — ` : ''}
                    {project.title ?? project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field span-2">
              <label className="field-label" htmlFor="tm-description">
                Description
              </label>
              <textarea
                className="textarea"
                id="tm-description"
                rows={3}
                value={form.description}
                onChange={(event) => update({ description: event.target.value })}
                disabled={!editable}
              />
            </div>
            {editable && mine && (
              <div className="span-2 stack-sm">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong className="small">
                    <ListChecks size={14} /> Checklist de vérification
                  </strong>
                  {!checklist && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={async () => {
                        try {
                          await api.post('/checklists', {
                            title: `Contrôle — ${task.title}`.slice(0, 200),
                            task_id: task.id,
                          });
                          await qc.invalidateQueries({ queryKey: ['task-checklists', task.id] });
                        } catch (caught) {
                          setError(caught);
                        }
                      }}
                    >
                      <Plus size={14} />
                      Ajouter une checklist
                    </button>
                  )}
                </div>
                <div className="cl-box">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="small strong">{checklist?.title ?? 'Aucune checklist'}</span>
                    {open.length > 0 && (
                      <span className="badge badge-warning">
                        {open.length} point(s) obligatoire(s) à cocher
                      </span>
                    )}
                  </div>
                  <ul className="cl-items" role="list">
                    {items.map((item) => (
                      <li key={item.id} className={item.checked_at ? 'done' : ''}>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={Boolean(item.checked_at)}
                            onChange={async (event) => {
                              const done = event.target.checked;
                              if (!checklist) return;
                              try {
                                await api.patch(`/checklists/${checklist.id}/items/${item.id}`, { done });
                                await qc.invalidateQueries({ queryKey: ['task-checklists', task.id] });
                              } catch (caught) {
                                setError(caught);
                              }
                            }}
                          />
                          <span>{item.title}</span>
                        </label>
                      </li>
                    ))}
                    {!items.length && (
                      <li className="muted small">
                        Aucun point de contrôle. Les points obligatoires doivent être cochés avant de terminer
                        la tâche.
                      </li>
                    )}
                  </ul>
                  <div className="row" style={{ gap: 6 }}>
                    <input
                      className="input"
                      aria-label="Nouvelle chose à faire"
                      placeholder="Ajouter une chose à faire…"
                      value={newItem}
                      onChange={(event) => setNewItem(event.target.value)}
                      disabled={!checklist}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      disabled={!checklist || !newItem.trim()}
                      onClick={async () => {
                        if (!checklist) return;
                        try {
                          await api.post(`/checklists/${checklist.id}/items`, {
                            title: newItem.trim(),
                            required: true,
                          });
                          setNewItem('');
                          await qc.invalidateQueries({ queryKey: ['task-checklists', task.id] });
                        } catch (caught) {
                          setError(caught);
                        }
                      }}
                    >
                      <Plus size={14} />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          {editable && (
            <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={busy}>
              Enregistrer
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default TaskModal;
