import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, PageHeader, Tabs } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { can, date, dateTime, today, type Row } from './types';
import { ActionForm, ErrorBox, Loading, Pager } from './ui';
import { Attachments } from './Attachments';

const names: Record<string, string> = {
  demande: 'Demande',
  planifie: 'Planifié',
  en_cours: 'En cours',
  bloque: 'Bloqué',
  en_controle: 'En contrôle',
  termine: 'Terminé',
  livre: 'Livré',
  annule: 'Annulé',
};
export default function WorkOrders() {
  const { user } = useAuth(),
    navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const view = sp.get('vue') || 'received';
  const [page, setPage] = useState(1),
    [create, setCreate] = useState(false);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['work-orders', view, page],
    queryFn: () => api.get('/work-orders' + queryString({ view, page })),
    enabled: can(user, 'workorders.view'),
  });
  const options = useQuery({
    queryKey: ['work-order-options'],
    queryFn: () => api.get('/work-orders/options'),
    enabled: can(user, 'workorders.view'),
  });
  if (!can(user, 'workorders.view'))
    return <div className="notice warning">Votre profil n’autorise pas les ordres de travail.</div>;
  return (
    <>
      <PageHeader
        title="Ordres de travail"
        subtitle="Demandes entre services : affectation, exécution, contrôle et livraison."
        actions={
          can(user, 'workorders.create') && (
            <button className="btn btn-primary" onClick={() => setCreate(true)}>
              Nouvelle demande
            </button>
          )
        }
      />
      <Tabs
        value={view}
        onChange={(v) => {
          setSp({ vue: v });
          setPage(1);
        }}
        tabs={[
          { id: 'received', label: 'File du service' },
          { id: 'mine', label: 'Qui me sont affectés' },
          { id: 'sent', label: 'Mes demandes' },
          ...(user?.role.data_scope === 'all' ? [{ id: 'all', label: 'Tous les services' }] : []),
        ]}
      />
      <ErrorBox error={q.error || options.error} />
      {q.isLoading && <Loading />}
      {q.data && (
        <Card title="Suivi des demandes">
          {q.data.data.map((w: Row) => (
            <div className="list-item" key={w.id}>
              <div className="spacer">
                <Link to={'/ordres-travail/' + w.id}>
                  <strong>{w.title}</strong>
                </Link>
                <div className="small muted">
                  {w.reference} · {w.department?.label} · {date(w.due_date)} · P{w.priority_level}
                </div>
                <div className="small muted">
                  {w.requester?.name} → {w.assignee?.name || 'Non affecté'}
                </div>
              </div>
              <span>{names[w.status]}</span>
            </div>
          ))}
          {!q.data.data.length && <p className="muted">Aucune demande dans cette vue.</p>}
          <Pager page={q.data} change={setPage} />
        </Card>
      )}
      {create && (
        <ActionForm
          title="Nouvelle demande à un service"
          close={() => setCreate(false)}
          submit={async (f) => {
            const result = await api.post('/work-orders', {
              title: f.get('title'),
              description: f.get('description'),
              kind: f.get('kind'),
              department_id: Number(f.get('department_id')),
              priority_level: Number(f.get('priority_level')),
              due_date: f.get('due_date'),
              project_id: f.get('project_id') || null,
              quantity: f.get('quantity') ? Number(f.get('quantity')) : null,
              unit: f.get('unit') || null,
              machine: f.get('machine') || null,
              specs: { material: f.get('material') || null, dimensions: f.get('dimensions') || null, finition: f.get('finition') || null },
            });
            await qc.invalidateQueries();
            navigate('/ordres-travail/' + result.data.id);
          }}
        >
          <label className="field">
            Intitulé
            <input name="title" required maxLength={300} />
          </label>
          <label className="field">
            Service destinataire
            <select aria-label="Service destinataire" name="department_id" required defaultValue="">
              <option value="">Choisir…</option>
              {options.data?.departments.map((d: Row) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Type de travail
            <select aria-label="Type de travail" name="kind" defaultValue="general">
              {Object.entries(options.data?.kinds || {}).map(([k, v]) => (
                <option key={k} value={k}>
                  {String(v)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Priorité
            <select aria-label="Priorité" name="priority_level" required defaultValue="">
              <option value="">Choisir explicitement…</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  P{n}
                  {n === 1 ? ' — critique' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Échéance
            <input name="due_date" type="date" required min={today()} defaultValue={today()} />
          </label>
          <label className="field">
            Projet lié
            <select aria-label="Projet lié" name="project_id" defaultValue=""><option value="">Aucun</option>{options.data?.projects?.map((p: Row) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
          </label>
          <label className="field">Quantité<input name="quantity" type="number" min="0.0001" step="0.0001" /></label>
          <label className="field">Unité<input name="unit" maxLength={40} placeholder="m², unité, lot…" /></label>
          <label className="field">Machine / poste<input name="machine" maxLength={120} /></label>
          <label className="field">Matière<input name="material" maxLength={500} /></label>
          <label className="field">Dimensions / format<input name="dimensions" maxLength={500} /></label>
          <label className="field">Finition<input name="finition" maxLength={500} /></label>
          <label className="field">
            Description et livrable attendu
            <textarea name="description" required maxLength={10000} />
          </label>
          <p className="small muted">
            Le service destinataire affectera le responsable. Aucune fabrication, facture ou sortie de stock
            n’est créée automatiquement.
          </p>
        </ActionForm>
      )}
    </>
  );
}

export function WorkOrderDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [modal, setModal] = useState<string | null>(null);
  const q = useQuery({ queryKey: ['work-order', id], queryFn: () => api.get('/work-orders/' + id) });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} />;
  const d = q.data,
    w = d?.data;
  if (!w) return null;
  return (
    <>
      <Link to="/ordres-travail?vue=sent">← Ordres de travail</Link>
      <PageHeader
        title={w.title}
        eyebrow={w.department?.label}
        subtitle={w.reference + ' · ' + names[w.status]}
        actions={
          <>
            {d.can_assign && !['termine', 'livre', 'annule'].includes(w.status) && (
              <button className="btn" onClick={() => setModal('assign')}>
                Affecter / planifier
              </button>
            )}
            {d.transitions.map((s: string) => (
              <button className="btn" key={s} onClick={() => setModal(s)}>
                {names[s]}
              </button>
            ))}
          </>
        }
      />
      <div className="p06-columns">
        <Card title="Description">
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{w.description}</p>
          <p>Demandeur : {w.requester?.name}</p>
          <p>Responsable : {w.assignee?.name || 'À affecter'}</p>
          <p>
            Échéance : {date(w.due_date)} · Priorité P{w.priority_level}
          </p>
          {d.project && <p>Projet : <Link to={'/projets/' + d.project.id}>{d.project.title}</Link></p>}
          {d.flow && <p>Circuit : <Link to={'/circuits/' + d.flow.id}>{d.flow.reference} · {d.flow.title}</Link></p>}
          {(w.quantity || w.machine || w.specs) && <p>Spécifications : {[w.quantity && `${w.quantity} ${w.unit || ''}`, w.machine && `machine ${w.machine}`, w.specs?.material, w.specs?.dimensions, w.specs?.finition].filter(Boolean).join(' · ')}</p>}
          {w.completed_at && <p>Terminé le {dateTime(w.completed_at)}</p>}
          {w.delivered_at && <p>Livré le {dateTime(w.delivered_at)}</p>}
        </Card>
        <Card
          title="Historique et échanges"
          actions={
            d.can_comment && (
              <button className="btn" onClick={() => setModal('comment')}>
                Ajouter un commentaire
              </button>
            )
          }
        >
          {d.history.map((h: Row) => (
            <div className="list-item" key={h.id}>
              <div>
                <strong>
                  {h.action === 'status'
                    ? names[h.to_status]
                    : h.action === 'create'
                      ? 'Demande créée'
                      : h.action === 'assign'
                        ? 'Affectation / planification'
                        : 'Commentaire'}
                </strong>
                <div className="small muted">
                  {h.author} · {dateTime(h.created_at)}
                </div>
                {h.comment && <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{h.comment}</p>}
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div className="p06-columns">
        <Card title="Pièces jointes"><Attachments entityType="work-orders" entityId={w.id} /></Card>
        <Card title="Temps passé" actions={<button className="btn" onClick={() => setModal('time')}>Saisir du temps</button>}>
          {(d.time_entries ?? []).map((e: Row) => <div className="list-item" key={e.id}><span>{e.user_name} · {date(e.work_date)}</span><strong>{Math.floor(e.minutes / 60)} h {e.minutes % 60 ? `${e.minutes % 60} min` : ''}</strong></div>)}
          {!d.time_entries?.length && <p className="muted">Aucun temps saisi.</p>}
        </Card>
      </div>
      {modal && (
        <ActionForm
          title={
            modal === 'time'
              ? 'Saisir du temps'
              : modal === 'assign'
              ? 'Affecter et planifier'
              : modal === 'comment'
                ? 'Commenter la demande'
                : names[modal]
          }
          close={() => setModal(null)}
          submit={async (f) => {
            if (modal === 'time')
              await api.post('/time-entries', { work_order_id: id, work_date: f.get('work_date'), minutes: Number(f.get('minutes')), note: f.get('note') || null });
            else if (modal === 'assign')
              await api.patch('/work-orders/' + id, {
                expected_revision: w.lock_version,
                assignee_id: Number(f.get('assignee_id')) || null,
                priority_level: Number(f.get('priority_level')),
                due_date: f.get('due_date'),
              });
            else if (modal === 'comment')
              await api.post(`/work-orders/${id}/comments`, { comment: f.get('comment') });
            else
              await api.post(`/work-orders/${id}/status`, {
                expected_revision: w.lock_version,
                status: modal,
                comment: f.get('comment'),
              });
            await qc.invalidateQueries();
          }}
        >
          {modal === 'time' ? <><label className="field">Date<input name="work_date" type="date" max={today()} defaultValue={today()} required /></label><label className="field">Durée en minutes<input name="minutes" type="number" min="1" max="1440" required /></label><label className="field">Note<textarea name="note" maxLength={500} /></label></> : modal === 'assign' ? (
            <>
              <label className="field">
                Responsable du service
                <select
                  aria-label="Responsable du service"
                  name="assignee_id"
                  defaultValue={w.assignee_id || ''}
                >
                  <option value="">Non affecté</option>
                  {d.members.map((m: Row) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Échéance
                <input type="date" name="due_date" required defaultValue={w.due_date} />
              </label>
              <label className="field">
                Priorité
                <select aria-label="Priorité" name="priority_level" defaultValue={w.priority_level}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      P{n}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <label className="field">
              {['bloque', 'annule'].includes(modal) ? 'Motif obligatoire' : 'Commentaire'}
              <textarea
                name="comment"
                required={['comment', 'bloque', 'annule'].includes(modal)}
                maxLength={4000}
              />
            </label>
          )}
        </ActionForm>
      )}
    </>
  );
}
