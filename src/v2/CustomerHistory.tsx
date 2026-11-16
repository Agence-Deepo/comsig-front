import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, ClipboardList, Phone, Mail, StickyNote } from 'lucide-react';
import { Badge, Button, Card, Empty } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { can, dateTime, label, toApiDateTime, type Page, type Row } from './types';
import { ActionForm, ErrorBox, Loading, Pager, Status } from './ui';
import { RecordForm } from './forms';
import { modules } from './modules';

export function FollowUpForm({ row, close }: { row: Row; close: () => void }) {
  const qc = useQueryClient();
  return (
    <ActionForm
      title="Planifier une relance"
      close={close}
      submitLabel="Planifier"
      submit={async (form) => {
        await api.post(`/activities/${row.id}/follow-up`, {
          title: form.get('title'),
          due_at: toApiDateTime(String(form.get('due_at'))),
        });
        await qc.invalidateQueries();
      }}
    >
      <p>
        La relance restera liée à cette activité et à son contact. Une seule relance par activité ; aucun
        message n’est envoyé.
      </p>
      <label className="field">
        Objet de la relance
        <input
          name="title"
          required
          maxLength={300}
          defaultValue={('Relance — ' + row.title).slice(0, 300)}
        />
      </label>
      <label className="field">
        Échéance de la relance
        <input name="due_at" type="datetime-local" required />
      </label>
    </ActionForm>
  );
}

export function ActivityHistory({
  id,
  contacts,
  opportunity = false,
}: {
  id: string;
  contacts: Row[];
  opportunity?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Row | null>(null);
  const [follow, setFollow] = useState<Row | null>(null);
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ['customer-history', id, opportunity, page],
    queryFn: () =>
      api.get<Page>(
        `/${opportunity ? 'opportunities' : 'organizations'}/${id}/related/activities?page=${page}&per_page=25`,
      ),
  });
  return (
    <Card
      title="Historique des interactions"
      sub="Compte rendu, résultat et échéances des activités accessibles."
    >
      <ErrorBox error={q.error} retry={() => void q.refetch()} />
      {q.isLoading ? (
        <Loading />
      ) : (
        !q.error &&
        (!q.data?.data.length ? (
          <Empty title="Aucune activité">
            Consignez un appel, une visite ou une réunion pour constituer l’historique.
          </Empty>
        ) : (
          <div className="timeline">
            {q.data.data.map((a) => {
              const contact = contacts.find((c) => c.id === a.contact_id);
              return (
                <div className="tl-item" key={a.id}>
                  <span className="tl-icon" aria-hidden>
                    {a.kind === 'appel' ? (
                      <Phone />
                    ) : a.kind === 'email' ? (
                      <Mail />
                    ) : a.kind === 'note' ? (
                      <StickyNote />
                    ) : (
                      <Calendar />
                    )}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="row-wrap">
                      <Link className="tl-title" to={'/activites/' + a.id}>
                        {a.title}
                      </Link>
                      <Status value={a.status} />
                      {a.contact_result && (
                        <Badge
                          tone={
                            a.contact_result === 'joint'
                              ? 'success'
                              : a.contact_result === 'refus'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          {label(a.contact_result)}
                        </Badge>
                      )}
                    </div>
                    <div className="tl-meta">
                      {label(a.kind)} ·{' '}
                      {a.status === 'termine'
                        ? a.done_at
                          ? 'Réalisé le ' + dateTime(a.done_at)
                          : 'Date de réalisation non renseignée'
                        : 'Échéance : ' + dateTime(a.due_at)}
                      {contact && <> · {[contact.first_name, contact.last_name].filter(Boolean).join(' ')}</>}
                      {a.duration_min != null && <> · {a.duration_min} min</>}
                      {a.follow_up_of_id && <> · Relance liée</>}
                    </div>
                    {(a.outcome || a.description) && (
                      <div className="tl-body" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                        {a.outcome || a.description}
                      </div>
                    )}
                    <div className="row-wrap" style={{ marginTop: 8 }}>
                      {can(user, 'activities.update') && (
                        <Button size="sm" variant="ghost" onClick={() => setEdit(a)}>
                          Modifier l’activité
                        </Button>
                      )}
                      {can(user, 'activities.create') &&
                        a.status === 'termine' &&
                        !a.follow_up_exists &&
                        a.contact_result !== 'refus' &&
                        !contact?.opt_out && (
                          <Button size="sm" onClick={() => setFollow(a)}>
                            Planifier une relance
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
      <Pager page={q.data} change={setPage} />
      {edit && (
        <RecordForm
          title="Modifier l’activité"
          fields={modules.find((m) => m.key === 'activities')!.fields}
          path="/activities"
          row={edit}
          close={() => setEdit(null)}
        />
      )}
      {follow && <FollowUpForm row={follow} close={() => setFollow(null)} />}
    </Card>
  );
}

export function CustomerDecisions({ id }: { id: string }) {
  const [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ['customer-decisions', id, page],
    queryFn: () => api.get<Page>(`/organizations/${id}/decisions?page=${page}&per_page=25`),
  });
  return (
    <Card
      title="Historique des décisions"
      sub="Événements métier enregistrés ; chaque module respecte vos droits actuels."
    >
      <ErrorBox error={q.error} retry={() => void q.refetch()} />
      {q.isLoading ? (
        <Loading />
      ) : (
        !q.error &&
        (!q.data?.data.length ? (
          <Empty title="Aucune décision enregistrée" />
        ) : (
          <div className="timeline">
            {q.data.data.map((event) => (
              <div className="tl-item" key={event.id}>
                <span className="tl-icon" aria-hidden>
                  <ClipboardList />
                </span>
                <div>
                  <div className="tl-title">{event.summary}</div>
                  <div className="tl-meta">
                    {dateTime(event.at)} · {event.actor_name}
                    {event.entity_ref && <> · {event.entity_ref}</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
      <Pager page={q.data} change={setPage} />
    </Card>
  );
}
