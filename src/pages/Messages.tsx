// Messagerie interne : boîte de réception, envoyés, archives ; conversation, réponse, accusés de lecture ; assistant IA
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, ArchiveRestore, Inbox, Send, PenSquare, Sparkles, X, CheckCheck, Search, AlertTriangle, MessagesSquare } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useAuth } from '../lib/auth';
import { dateTime, relative } from '../lib/format';
import { Alert, Avatar, Badge, Button, Card, Empty, Field, Input, LoadingBlock, Modal, PageHeader, Select, Tabs, Textarea } from '../components/ui';
import { Markdown } from '../lib/markdown';

type Box = 'reception' | 'envoyes' | 'archives';

export default function Messages() {
  const [sp, setSp] = useSearchParams();
  const [box, setBox] = useState<Box>('reception');
  const [search, setSearch] = useState('');
  const [compose, setCompose] = useState<{ to?: string[]; subject?: string } | null>(null);
  const openId = sp.get('m');
  const list = useApi<any>(['messages', box, search], `/api/messages${qs({ box, q: search || undefined })}`, { refetchInterval: 15_000 });
  const unread = (list.data?.rows ?? []).filter((m: any) => box === 'reception' && !m.read_at).length;
  return (
    <>
      <PageHeader title="Messagerie interne" subtitle="Messages entre collaborateurs : annonce vocale à la réception, rappels à 5 et 10 minutes tant qu’un message n’est pas ouvert"
        actions={<Button variant="primary" icon={<PenSquare />} onClick={() => setCompose({})}>Nouveau message</Button>} />
      <div className="msg-layout">
        <Card flush className="msg-list-card">
          <div className="msg-toolbar">
            <Tabs value={box} onChange={(b) => { setBox(b); setSp({}); }} tabs={[{ id: 'reception', label: 'Réception', count: unread || undefined }, { id: 'envoyes', label: 'Envoyés' }, { id: 'archives', label: 'Archives' }]} />
            <div className="input-group"><Search /><Input aria-label="Rechercher dans les messages" placeholder="Rechercher" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>
          {list.isLoading ? <LoadingBlock rows={6} /> : !list.data?.rows.length ? <Empty icon={<Inbox />} title={box === 'reception' ? 'Aucun message reçu' : box === 'envoyes' ? 'Aucun message envoyé' : 'Aucun message archivé'} /> : (
            <ul className="msg-list" role="list">
              {list.data.rows.map((m: any) => (
                <li key={m.id}>
                  <button className={`msg-item${openId === m.id ? ' active' : ''}${box !== 'envoyes' && !m.read_at ? ' unread' : ''}`} onClick={() => setSp({ m: m.id })}>
                    <Avatar name={box === 'envoyes' ? m.recipients : m.sender_name} size="sm" />
                    <span className="msg-item-main">
                      <span className="msg-item-top"><span className="truncate strong">{box === 'envoyes' ? `À : ${m.recipients}` : m.sender_name}</span><span className="xsmall muted">{relative(m.created_at)}</span></span>
                      <span className="msg-item-subject truncate">{m.priority === 'haute' && <AlertTriangle size={13} className="text-danger" aria-label="Priorité haute" />} {m.subject}</span>
                      <span className="xsmall muted truncate">{m.excerpt}</span>
                      {box === 'envoyes' && <span className="xsmall muted"><CheckCheck size={12} /> Lu par {m.read_n}/{m.to_n}</span>}
                      {box === 'reception' && !m.read_at && m.reminder_count > 0 && <Badge tone="warning">Non lu depuis {m.reminder_count === 2 ? 10 : 5} min</Badge>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="msg-thread-pane">
          {openId ? <Thread id={openId} box={box} onClose={() => setSp({})} onReplyAll={(to, subject) => setCompose({ to, subject })} /> : <Card><Empty icon={<MessagesSquare />} title="Sélectionnez un message">Ou écrivez à un collègue, à plusieurs, ou posez une question de travail à l’assistant IA.</Empty></Card>}
        </div>
      </div>
      <Compose open={!!compose} initial={compose ?? {}} onClose={() => setCompose(null)} onSent={(id) => { setCompose(null); setBox('envoyes'); setSp({ m: id }); }} />
    </>
  );
}

function Thread({ id, box, onClose }: { id: string; box: Box; onClose: () => void; onReplyAll: (to: string[], subject: string) => void }) {
  const { me } = useAuth();
  const qc = useQueryClient();
  const t = useApi<any>(['message', id], `/api/messages/${id}`);
  const [body, setBody] = useState('');
  const [askAi, setAskAi] = useState(false);
  useEffect(() => { setBody(''); setAskAi(false); qc.invalidateQueries({ queryKey: ['messages-unread'] }); }, [id, t.data?.thread_id]);
  const last = t.data?.messages.at(-1);
  // Réponse à tous les participants humains de la conversation, sauf soi-même
  const participants = useMemo(() => {
    const ids = new Set<string>();
    for (const m of t.data?.messages ?? []) { if (m.sender_id) ids.add(m.sender_id); for (const r of m.recipients) ids.add(r.id); }
    ids.delete(me?.id ?? '');
    return [...ids];
  }, [t.data, me?.id]);
  const reply = useAction((b: any) => api.post('/api/messages', b), { success: 'Réponse envoyée', invalidate: [['message', id], ['messages']], onSuccess: () => { setBody(''); setAskAi(false); } });
  const archive = useAction((archived: boolean) => api.post(`/api/messages/${id}/archive`, { archived }), { success: (r: any) => 'Conversation déplacée', invalidate: [['messages'], ['messages-unread']], onSuccess: onClose });
  if (t.isLoading) return <Card><LoadingBlock rows={6} /></Card>;
  if (t.error || !t.data) return <Card><Alert tone="danger">Message introuvable ou inaccessible.</Alert></Card>;
  return (
    <Card title={t.data.messages[0].subject} sub={`${t.data.messages.length} message(s)`}
      actions={<div className="row" style={{ gap: 4 }}>
        <Button size="sm" variant="ghost" icon={box === 'archives' ? <ArchiveRestore /> : <Archive />} onClick={() => archive.run(box !== 'archives')}>{box === 'archives' ? 'Restaurer' : 'Archiver'}</Button>
        <Button size="sm" variant="ghost" iconOnly icon={<X />} aria-label="Fermer" onClick={onClose} />
      </div>}>
      <div className="msg-thread">
        {t.data.messages.map((m: any) => (
          <article key={m.id} className={`msg-bubble${m.sender_id === me?.id ? ' mine' : ''}${m.sender_kind === 'assistant' ? ' ai' : ''}`}>
            <header>
              {m.sender_kind === 'assistant' ? <span className="ai-avatar"><Sparkles size={14} /></span> : <Avatar name={m.sender_name} size="sm" />}
              <span><strong>{m.sender_name}</strong>{m.sender_title ? <span className="xsmall muted"> · {m.sender_title}</span> : null}<div className="xsmall muted">{dateTime(m.created_at)} · à {m.recipients.map((r: any) => r.name).join(', ') || '—'}</div></span>
              {m.priority === 'haute' && <Badge tone="danger">Priorité haute</Badge>}
            </header>
            {m.sender_kind === 'assistant' ? <Markdown text={m.body} /> : <div className="msg-body">{m.body}</div>}
            {m.sender_id === me?.id && m.recipients.length > 0 && <div className="xsmall muted msg-receipts"><CheckCheck size={12} /> {m.recipients.map((r: any) => `${r.name} : ${r.read_at ? `lu ${relative(r.read_at)}` : 'non lu'}`).join(' · ')}</div>}
          </article>
        ))}
      </div>
      <div className="msg-reply">
        <Textarea aria-label="Votre réponse" placeholder={askAi ? 'Question de travail pour l’assistant (recherche, synthèse, brainstorming)…' : 'Votre réponse…'} value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <label className="checkbox small"><input type="checkbox" checked={askAi} onChange={(e) => setAskAi(e.target.checked)} /><Sparkles size={14} /> Demander à l’assistant IA (réponse à vous seul)</label>
          <Button variant="primary" icon={<Send />} loading={reply.isPending} disabled={!body.trim() || (!participants.length && !askAi)}
            onClick={() => reply.run({ to: askAi ? ['assistant'] : participants, body, parent_id: last.id })}>{askAi ? 'Demander' : 'Répondre'}</Button>
        </div>
        {reply.error && !Object.keys(reply.fieldErrors).length && <Alert tone="danger">{reply.error.message}</Alert>}
      </div>
    </Card>
  );
}

function Compose({ open, initial, onClose, onSent }: { open: boolean; initial: { to?: string[]; subject?: string }; onClose: () => void; onSent: (id: string) => void }) {
  const people = useApi<any>(['msg-recipients'], open ? '/api/messages/recipients' : null);
  const [to, setTo] = useState<string[]>([]);
  const [pick, setPick] = useState('');
  const [f, setF] = useState({ subject: '', body: '', priority: 'normale' });
  useEffect(() => { if (open) { setTo(initial.to ?? []); setF({ subject: initial.subject ?? '', body: '', priority: 'normale' }); setPick(''); } }, [open]);
  const send = useAction((b: any) => api.post('/api/messages', b), { success: 'Message envoyé', invalidate: [['messages']], onSuccess: (r: any) => onSent(r.id) });
  const rows: any[] = people.data?.rows ?? [];
  const name = (id: string) => (id === 'assistant' ? 'Assistant IA' : rows.find((r) => r.id === id)?.full_name ?? '…');
  const options = [{ value: 'assistant', label: 'Assistant IA (questions de travail)' }, ...rows.filter((r) => !to.includes(r.id)).map((r) => ({ value: r.id, label: `${r.full_name}${r.department_label ? ` · ${r.department_label}` : ''}${r.account_kind === 'service' ? ' (compte de service)' : ''}` }))].filter((o) => !to.includes(o.value));
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Nouveau message" description="Le destinataire est averti par une annonce vocale ; s’il n’ouvre pas le message, il est rappelé à 5 puis 10 minutes."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" icon={<Send />} loading={send.isPending} disabled={!to.length || !f.subject.trim() || !f.body.trim()} onClick={() => send.run({ to, ...f })}>Envoyer</Button></>}>
      <div className="form-grid">
        <Field label="Destinataires" required className="span-2" error={send.fieldErrors.to}>
          <div className="stack-sm">
            {to.length > 0 && <div className="row-wrap">{to.map((id) => <span key={id} className="chip">{name(id)}<button aria-label={`Retirer ${name(id)}`} onClick={() => setTo(to.filter((x) => x !== id))}><X size={12} /></button></span>)}</div>}
            <Select aria-label="Ajouter un destinataire" value={pick} placeholder="Ajouter un destinataire…" onChange={(e) => { if (e.target.value) setTo([...to, e.target.value]); setPick(''); }} options={options} />
          </div>
        </Field>
        <Field label="Objet" required className="span-2" error={send.fieldErrors.subject}><Input value={f.subject} maxLength={200} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
        <Field label="Message" required className="span-2" error={send.fieldErrors.body}><Textarea rows={6} value={f.body} maxLength={10000} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
        <Field label="Priorité"><Select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })} options={[{ value: 'normale', label: 'Normale' }, { value: 'haute', label: 'Haute' }]} /></Field>
        {send.error && !Object.keys(send.fieldErrors).length && <Alert tone="danger">{send.error.message}</Alert>}
      </div>
    </Modal>
  );
}
