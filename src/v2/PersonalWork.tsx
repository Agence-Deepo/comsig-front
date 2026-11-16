import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, PageHeader, Tabs } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { can, dateTime, toApiDateTime, type Row } from './types';
import { ActionForm, ErrorBox, Loading, Pager } from './ui';

export default function PersonalWork() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams(),
    qc = useQueryClient();
  const tab = sp.get('vue') || 'todos',
    filter = sp.get('statut') || 'open';
  const [edit, setEdit] = useState<Row | null>(null),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ['personal-work', tab, filter, page],
    queryFn: () =>
      api.get(
        tab === 'todos'
          ? '/todos' + queryString({ status: filter, page })
          : '/checklists' + queryString({ page }),
      ),
  });
  const tasks = useQuery({
    queryKey: ['personal-task-choices'],
    queryFn: () => api.get('/tasks?mine=1&per_page=100'),
    enabled: edit?.mode === 'checklist' && can(user, 'tasks.update'),
  });
  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await qc.invalidateQueries();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  const rows = tab === 'todos' ? q.data?.items : q.data;
  return (
    <div className="p06-personal">
      <PageHeader
        title="To-do et checklists"
        subtitle="Votre organisation personnelle : ces listes restent privées, y compris vis-à-vis de la direction."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setEdit({ mode: tab === 'todos' ? 'todo' : 'checklist' })}
          >
            {tab === 'todos' ? 'Ajouter une chose à faire' : 'Nouvelle checklist'}
          </button>
        }
      />
      <Tabs
        value={tab}
        onChange={(v) => {
          setSp({ vue: v });
          setPage(1);
        }}
        tabs={[
          { id: 'todos', label: 'Ma to-do list' },
          { id: 'checklists', label: 'Mes checklists' },
        ]}
      />
      {tab === 'todos' && (
        <div className="row-wrap">
          <label className="field">
            Éléments affichés
            <select
              aria-label="Éléments affichés"
              value={filter}
              onChange={(e) => {
                setSp({ vue: tab, statut: e.target.value });
                setPage(1);
              }}
            >
              <option value="open">À faire</option>
              <option value="done">Faits</option>
              <option value="all">Tous</option>
            </select>
          </label>
          <p>
            {q.data?.open ?? 0} à faire · {q.data?.late ?? 0} en retard
          </p>
        </div>
      )}
      <ErrorBox error={q.error || error} />
      {q.isLoading && <Loading />}
      <div className="stack-lg">
        {rows?.data.map((r: Row) =>
          tab === 'todos' ? (
            <Card key={r.id}>
              <div className="list-item">
                <input
                  aria-label={'Terminer ' + r.title}
                  type="checkbox"
                  checked={!!r.done_at}
                  disabled={busy}
                  onChange={(e) => void run(() => api.patch('/todos/' + r.id, { done: e.target.checked }))}
                />
                <div className="spacer">
                  <strong style={{ textDecoration: r.done_at ? 'line-through' : undefined }}>
                    {r.title}
                  </strong>
                  <div className="small muted">
                    {r.priority === 'haute' ? 'Haute' : r.priority === 'basse' ? 'Basse' : 'Normale'} ·{' '}
                    {r.due_at ? dateTime(r.due_at) : 'Sans échéance'}
                  </div>
                  {r.remind_at && <div className="small muted">Rappel programmé : {dateTime(r.remind_at)}</div>}
                  {r.notes && <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{r.notes}</p>}
                </div>
                <button className="btn" onClick={() => setEdit({ ...r, mode: 'todo' })}>
                  Modifier
                </button>
                <button
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => {
                    if (confirm('Archiver cet élément de votre liste ?'))
                      void run(() => api.delete('/todos/' + r.id));
                  }}
                >
                  Archiver
                </button>
              </div>
            </Card>
          ) : (
            <Card
              key={r.id}
              title={r.title}
              sub={
                r.task_id
                  ? 'Checklist liée à une tâche : les points obligatoires bloquent sa clôture.'
                  : 'Checklist personnelle'
              }
              actions={
                <>
                  {r.kind !== 'suivi_todo' && <button className="btn" onClick={() => setEdit({ mode: 'item', checklist: r.id })}>
                    Ajouter un point
                  </button>}
                  {r.kind !== 'suivi_todo' && <button
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => {
                      if (confirm('Archiver cette checklist ? Ses points ne bloqueront plus la tâche liée.'))
                        void run(() => api.delete('/checklists/' + r.id));
                    }}
                  >
                    Archiver
                  </button>}
                </>
              }
            >
              {r.task_id && <Link to={'/taches/' + r.task_id}>Ouvrir la tâche liée</Link>}
              {r.items.map((i: Row) => (
                <label className="list-item" key={i.id}>
                  <input
                    type="checkbox"
                    checked={!!i.checked_at}
                    disabled={busy}
                    onChange={(e) =>
                      void run(() =>
                        api.patch(`/checklists/${r.id}/items/${i.id}`, { done: e.target.checked }),
                      )
                    }
                  />
                  <span>
                    {i.title}
                    {i.required ? ' · Obligatoire' : ' · Facultatif'}
                  </span>
                </label>
              ))}
              {!r.items.length && <p className="muted">Ajoutez les points à vérifier.</p>}
            </Card>
          ),
        )}
        {rows && !rows.data.length && (
          <Card>
            <p className="muted">Aucun élément dans cette vue.</p>
          </Card>
        )}
      </div>
      <Pager page={rows} change={setPage} />
      <p className="small muted">
        Les rappels programmés remontent dans la cloche et sont annoncés vocalement par le navigateur lorsqu’il l’autorise. Une relance interne est créée au plus toutes les quatre heures entre 7 h et 20 h.
      </p>
      {edit && (
        <ActionForm
          title={
            edit.mode === 'todo'
              ? 'Chose à faire'
              : edit.mode === 'item'
                ? 'Point de contrôle'
                : 'Nouvelle checklist'
          }
          close={() => setEdit(null)}
          submit={async (f) => {
            const title = f.get('title');
            if (edit.mode === 'todo') {
              const body = {
                title,
                notes: f.get('notes'),
                priority: f.get('priority'),
                due_at: f.get('due_at') ? toApiDateTime(String(f.get('due_at'))) : null,
                remind_at: f.get('remind_at') ? toApiDateTime(String(f.get('remind_at'))) : null,
              };
              if (edit.id) await api.patch('/todos/' + edit.id, body);
              else await api.post('/todos', body);
            } else if (edit.mode === 'checklist')
              await api.post('/checklists', { title, task_id: f.get('task_id') || null });
            else
              await api.post(`/checklists/${edit.checklist}/items`, {
                title,
                required: f.get('required') === 'on',
              });
            await qc.invalidateQueries();
          }}
        >
          <label className="field">
            Intitulé
            <input
              name="title"
              required
              maxLength={edit.mode === 'checklist' ? 200 : 300}
              defaultValue={edit.title || ''}
            />
          </label>
          {edit.mode === 'todo' && (
            <>
              <label className="field">
                Priorité
                <select aria-label="Priorité" name="priority" defaultValue={edit.priority || 'normale'}>
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                </select>
              </label>
              <label className="field">
                Échéance
                <input
                  name="due_at"
                  type="datetime-local"
                  defaultValue={edit.due_at ? String(edit.due_at).replace(' ', 'T').slice(0, 16) : ''}
                />
              </label>
              <label className="field">
                Rappel
                <input name="remind_at" type="datetime-local" defaultValue={edit.remind_at ? String(edit.remind_at).replace(' ', 'T').slice(0, 16) : ''} />
              </label>
              <label className="field">
                Notes
                <textarea name="notes" maxLength={4000} defaultValue={edit.notes || ''} />
              </label>
            </>
          )}
          {edit.mode === 'checklist' && can(user, 'tasks.update') && (
            <label className="field">
              Tâche liée (facultatif)
              <select aria-label="Tâche liée" name="task_id" defaultValue="">
                <option value="">Checklist personnelle</option>
                {tasks.data?.data
                  .filter((t: Row) => !['termine', 'annule'].includes(t.status))
                  .map((t: Row) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
              <span className="small muted">
                Vos 100 premières tâches accessibles ; aucune tâche d’un collègue.
              </span>
              <ErrorBox error={tasks.error} />
            </label>
          )}
          {edit.mode === 'item' && (
            <label className="row-wrap">
              <input type="checkbox" name="required" defaultChecked />
              Obligatoire avant de terminer la tâche liée
            </label>
          )}
        </ActionForm>
      )}
    </div>
  );
}
