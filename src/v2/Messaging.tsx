import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCheck, Inbox, Send, SquarePen } from 'lucide-react';

import { Card, DataTable, Segmented, type Column } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { dateTime, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, PageTitle, Status } from './ui';

const BOXES: [string, string][] = [
  ['recus', 'Reçus'],
  ['envoyes', 'Envoyés'],
  ['archives', 'Archivés'],
];

function ExternalMail() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [confirm, setConfirm] = useState(false);
  const status = useQuery({queryKey:['external-mail-status'], queryFn: () => api.get<{available:boolean; from:string|null}>('/external-mail/status')});
  const send = useMutation({mutationFn: () => api.post<{message:string}>('/external-mail/send', {to, subject, body, confirm}), onSuccess: () => {setTo(''); setSubject(''); setBody(''); setConfirm(false);}});
  return <Card title="Courrier électronique externe">
    <p>Envoi manuel depuis la boîte COMSIG, réservé aux directions et administrateurs. Aucun envoi automatique ; la messagerie interne ci-dessus reste séparée.</p>
    <ErrorBox error={status.error} retry={() => void status.refetch()} />
    {status.data && !status.data.available && <p>Service désactivé ou non configuré sur le serveur.</p>}
    {status.data?.available && <form onSubmit={e => {e.preventDefault(); send.mutate();}}>
      <p>Expéditeur : {status.data.from}</p>
      <label className="field">Destinataire<input type="email" required maxLength={254} value={to} onChange={e => setTo(e.target.value)} /></label>
      <label className="field">Objet<input required maxLength={200} value={subject} onChange={e => setSubject(e.target.value)} /></label>
      <label className="field">Message<textarea required maxLength={20000} rows={6} value={body} onChange={e => setBody(e.target.value)} /></label>
      <label><input type="checkbox" required checked={confirm} onChange={e => setConfirm(e.target.checked)} /> Je confirme le destinataire et l’envoi réel de ce message.</label>
      <div><button className="button primary" disabled={send.isPending || !confirm}>{send.isPending ? 'Envoi…' : 'Envoyer le courrier'}</button></div>
      <ErrorBox error={send.error} />
      {send.data && <p role="status">{send.data.message}</p>}
      <p className="muted">En cas d’erreur, vérifiez la boîte expéditrice et le destinataire avant de réessayer : l’envoi peut avoir abouti.</p>
    </form>}
  </Card>;
}

function Compose({ close, thread }: { close: () => void; thread?: Row }) {
  const qc = useQueryClient();
  const recipients = useQuery({
    queryKey: ['message-recipients'],
    queryFn: () => api.get<{ data: Row[] }>('/messages/recipients'),
  });
  return (
    <ActionForm
      title={thread ? 'Répondre' : 'Nouveau message'}
      submitLabel="Envoyer"
      close={close}
      submit={async (form) => {
        const values: Row = Object.fromEntries(form);
        const ids = form.getAll('recipients').map((value) => Number(value));
        await api.post('/messages', {
          subject: values.subject,
          body: values.body,
          recipients: ids,
          thread_id: thread?.id,
        });
        await qc.invalidateQueries({ queryKey: ['messages'] });
        await qc.invalidateQueries({ queryKey: ['messages-unread'] });
      }}
    >
      <ErrorBox error={recipients.error} retry={() => void recipients.refetch()} />
      <label className="field">
        Objet *
        <input name="subject" required maxLength={200} defaultValue={thread ? `RE: ${thread.subject}` : ''} />
      </label>
      <label className="field">
        Destinataires * <small className="muted">(Ctrl+clic pour plusieurs)</small>
        <select name="recipients" multiple required size={6}>
          {(recipients.data?.data ?? []).map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
              {person.department_label ? ` · ${person.department_label}` : ''}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Message *
        <textarea name="body" required rows={8} maxLength={20000} />
      </label>
      <p className="muted">
        Messagerie interne uniquement : aucun e-mail, SMS ou notification externe n’est envoyé. Un message
        n’est lisible que par vous et les destinataires choisis.
      </p>
    </ActionForm>
  );
}

export function Messages() {
  const { user } = useAuth();
  const [box, setBox] = useState('recus');
  const [compose, setCompose] = useState(false);
  const list = useQuery({
    queryKey: ['messages', box],
    queryFn: ({ signal }) => api.get<Page>(`/messages${queryString({ box, per_page: 50 })}`, signal),
    refetchInterval: 20_000,
  });
  const unread = useQuery({
    queryKey: ['messages-unread'],
    queryFn: () => api.get<{ count: number }>('/messages/unread'),
    refetchInterval: 20_000,
  });
  const columns: Column<Row>[] = [
    {
      key: 'subject',
      label: 'Message',
      render: (row) => (
        <>
          <div className="cell-title">
            {row.unread && <strong>{row.subject}</strong>}
            {!row.unread && row.subject}
          </div>
          <div className="cell-sub">
            {box === 'envoyes' ? `À : ${row.recipients.length} destinataire(s)` : `De : ${row.sender_name}`}
          </div>
        </>
      ),
    },
    { key: 'created_at', label: 'Date', render: (row) => dateTime(row.created_at) },
    {
      key: 'read',
      label: 'État',
      render: (row) =>
        box === 'envoyes' ? (
          <span className="small">
            <CheckCheck size={13} /> {row.recipients.filter((r: Row) => r.read_at).length}/
            {row.recipients.length} lu
          </span>
        ) : row.unread ? (
          <Status value="nouveau" />
        ) : (
          <span className="muted">Lu</span>
        ),
    },
  ];
  return (
    <>
      <PageTitle
        eyebrow="MON TRAVAIL"
        title="Messagerie"
        description={`Messages internes. ${unread.data?.count ?? 0} non lu(s).`}
        actions={
          <button className="button primary" onClick={() => setCompose(true)}>
            <SquarePen size={16} />
            Nouveau message
          </button>
        }
      />
      <Card
        title={
          <span className="card-title-icon">
            <Inbox size={18} />
            Boîte
          </span>
        }
        actions={
          <Segmented
            label="Boîte"
            value={box}
            onChange={setBox}
            options={BOXES.map(([id, label]) => ({ id, label }))}
          />
        }
        flush
      >
        <ErrorBox error={list.error} retry={() => void list.refetch()} />
        <DataTable
          columns={columns}
          rows={list.data?.data}
          loading={list.isLoading}
          onRowClick={(row) => {
            window.location.assign(`${import.meta.env.BASE_URL}messagerie/${row.id}`.replace('//', '/'));
          }}
          caption="Messages"
          empty={<Empty>Aucun message dans cette boîte.</Empty>}
        />
      </Card>
      {['superadmin', 'admin_tech', 'direction_generale', 'direction_commerciale'].includes(user?.role?.code ?? '') && <ExternalMail />}
      <p className="xsmall muted">
        {user?.name} · les messages ne sont jamais supprimés, seulement archivés pour vous.
      </p>
      {compose && <Compose close={() => setCompose(false)} />}
    </>
  );
}

export function MessageThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [reply, setReply] = useState(false);
  const message = useQuery({
    queryKey: ['message', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/messages/${id}`, signal),
    enabled: Boolean(id),
  });
  const row = message.data?.data;
  const archive = async () => {
    await api.post(`/messages/${id}/archive`, { archived: true });
    await qc.invalidateQueries({ queryKey: ['messages'] });
    navigate('/messagerie');
  };
  return (
    <>
      <PageTitle
        eyebrow="MESSAGERIE"
        title={row?.subject ?? 'Message'}
        description={row ? `${row.sender_name} · ${dateTime(row.created_at)}` : undefined}
        actions={
          <>
            <button className="button" onClick={archive}>
              Archiver
            </button>
            {row && (
              <button className="button primary" onClick={() => setReply(true)}>
                <Send size={15} />
                Répondre
              </button>
            )}
          </>
        }
      />
      <ErrorBox error={message.error} retry={() => void message.refetch()} />
      {row && (
        <Card
          title="Contenu"
          sub={`Destinataires : ${row.recipients.map((r: Row) => r.name).join(', ') || '—'}`}
        >
          <p className="preserve">{row.body}</p>
        </Card>
      )}
      <p className="xsmall muted">
        <Link to="/messagerie">Retour à la messagerie</Link>
      </p>
      {reply && row && <Compose thread={row} close={() => setReply(false)} />}
    </>
  );
}
