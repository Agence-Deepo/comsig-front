import { ExcelButton } from '../components/ExportButton';
import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Archive, CalendarClock, CheckCheck, ClipboardCheck, Inbox, ListTodo, Mail, MailOpen, Paperclip, Play, RefreshCw, Server, ShieldCheck, Trash2, Upload, Sparkles, Undo2 } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { date, dateTime, money, relative } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, ErrorState, Field, Input, LoadingBlock, Modal, PageHeader, Segmented, Select, Tabs, Textarea } from '../components/ui';
import { DeptChip } from '../components/work';

export const MAIL_CAT: Record<string, string> = { devis: 'Devis / commande', facturation: 'Facturation', reclamation: 'Réclamation', production: 'Production', rendez_vous: 'Rendez-vous', administratif: 'Administratif', rh: 'RH', autre: 'Autre' };
const PRIO: Record<string, [string, 'danger' | 'neutral' | 'info']> = { haute: ['Prioritaire', 'danger'], normale: ['Normale', 'info'], basse: ['Basse', 'neutral'] };
const SEV: Record<string, [string, 'danger' | 'warning' | 'info']> = { critique: ['Critique', 'danger'], attention: ['Attention', 'warning'], info: ['Info', 'info'] };
const BLOCK_LABEL: Record<string, string> = { rendez_vous: 'Rendez-vous', tache: 'Tâche', courrier: 'Courrier', decision: 'Décisions', pause: 'Pause' };

/** Assistant administratif de chaque agent : organise la journée, résume le courrier, contrôle et alerte — sans décider. */
export default function MyAssistant() {
  const { me } = useAuth();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') ?? 'journee';
  return (
    <>
      <PageHeader eyebrow={me?.department_label ? <DeptChip label={`Assistant — ${me.department_label}`} color={me.department_color} /> : undefined}
        title="Mon assistant" subtitle="Il organise votre journée, lit et résume votre courrier, vérifie les données et vous alerte. Les décisions restent les vôtres." />
      <Tabs value={tab} onChange={(t) => setSp({ tab: t })} tabs={[
        { id: 'journee', label: <><CalendarClock aria-hidden /> Ma journée</> },
        { id: 'courrier', label: <><Mail aria-hidden /> Courrier</> },
        { id: 'controles', label: <><ShieldCheck aria-hidden /> Contrôles</> },
      ]} />
      {tab === 'journee' && <Day />}
      {tab === 'courrier' && <MailBox initial={sp.get('mail')} />}
      {tab === 'controles' && <Findings />}
    </>
  );
}

// ───────────────────────── Ma journée ─────────────────────────

function Day() {
  const r = useApi<any>(['assistant-day'], '/api/assistant-admin/day');
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (!r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const d = r.data;
  const longDay = new Date(d.day + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <div className="assist-grid">
      <Card title={<span style={{ textTransform: 'capitalize' }}>{longDay}</span>} sub={`Journée de travail ${d.hours.start} – ${d.hours.end} · proposition d’organisation`}>
        <ol className="day-timeline">
          {d.blocks.map((b: any, i: number) => (
            <li key={i} className={`day-block k-${b.kind}${b.quadrant ? ` q-${b.quadrant}` : ''}`}>
              <div className="day-time"><strong>{b.start}</strong><span>{b.end}</span></div>
              <div className="day-body">
                <div className="day-kind">{BLOCK_LABEL[b.kind]}{b.ref && <> · {b.ref}</>}{b.partial && <> · à poursuivre</>}</div>
                <div className="day-title">{b.link ? <Link to={b.link}>{b.title}</Link> : b.title}</div>
                {(b.reason || b.detail) && <div className="xsmall muted">{b.reason ?? b.detail}</div>}
              </div>
            </li>
          ))}
        </ol>
        {d.unplanned.length > 0 && (
          <Alert tone="warning" title={`${d.unplanned.length} élément(s) ne tiennent pas dans la journée`}>
            <ul>{d.unplanned.map((u: any, i: number) => <li key={i}>{u.title} <span className="muted">({u.minutes} min)</span></li>)}</ul>
            À reporter, déléguer ou renégocier : c’est à vous de choisir.
          </Alert>
        )}
        <p className="xsmall muted">{d.note}</p>
      </Card>
      <div className="stack">
        <Card title="Recommandations de l’assistant">
          <ul className="advice-list">
            {d.advice.map((a: any, i: number) => <li key={i} className={`adv-${a.level}`}>{a.level !== 'info' && <AlertTriangle className="ic-xs" aria-hidden />} {a.text}</li>)}
          </ul>
        </Card>
        {(d.approvals.length > 0 || d.leaves.length > 0) && (
          <Card title="Décisions qui vous attendent">
            <ul className="plain-list">
              {d.approvals.map((a: any) => <li key={a.id}><Link to="/validations">{a.entity_label ?? a.kind}</Link> <span className="xsmall muted">— {a.reason} · {a.requested_by_name}</span></li>)}
              {d.leaves.map((l: any) => <li key={l.id}><Link to="/rh?vue=conges">{l.ref} — {l.employee}</Link> <span className="xsmall muted">du {date(l.start_date)} au {date(l.end_date)} ({l.days} j)</span></li>)}
            </ul>
          </Card>
        )}
        <Card title="Courrier à lire" sub={`${d.mail_counts.unread} non lu(s) · ${d.mail_counts.actions} demande(nt) une action`} actions={<Link className="btn btn-sm" to="/mon-assistant?tab=courrier">Ouvrir</Link>}>
          {d.mails.length ? <ul className="plain-list">{d.mails.map((m: any) => (
            <li key={m.id}><Link to={`/mon-assistant?tab=courrier&mail=${m.id}`}><strong>{m.from_name || m.from_addr}</strong> — {m.subject}</Link>
              {m.priority === 'haute' && <> <Badge tone="danger">Prioritaire</Badge></>}<div className="xsmall muted">{m.summary}</div></li>
          ))}</ul> : <p className="muted small">Aucun message non lu.</p>}
        </Card>
        <Card title="Mes contrôles ouverts" actions={<Link className="btn btn-sm" to="/mon-assistant?tab=controles">Tout voir</Link>}>
          {d.findings.length ? <ul className="plain-list">{d.findings.map((f: any) => (
            <li key={f.id}><Badge tone={SEV[f.severity][1]}>{SEV[f.severity][0]}</Badge> {f.link ? <Link to={f.link}>{f.title}</Link> : f.title}<div className="xsmall muted">{f.recommendation}</div></li>
          ))}</ul> : <p className="muted small">Aucune anomalie détectée sur vos dossiers.</p>}
        </Card>
        {d.day_items.length > 0 && (
          <Card title="Échéances du jour">
            <ul className="plain-list">{d.day_items.map((e: any) => <li key={`${e.source}-${e.id}`}><Badge tone="neutral" dot={false}>{e.source}</Badge> {e.link ? <Link to={e.link}>{e.title}</Link> : e.title}</li>)}</ul>
          </Card>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Courrier ─────────────────────────

function MailBox({ initial }: { initial: string | null }) {
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState<'actifs' | 'traite' | 'archive' | ''>('actifs');
  const [cat, setCat] = useState('');
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState<string | null>(initial);
  const [accounts, setAccounts] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const qs = new URLSearchParams({ ...(owner ? { owner_id: owner } : {}), ...(status ? { status } : {}), ...(cat ? { category: cat } : {}), ...(search ? { q: search } : {}) }).toString();
  const r = useApi<any>(['mail', qs], `/api/mail?${qs}`);
  const imp = useAction((fd: FormData) => api.upload('/api/mail/import', fd), {
    success: (x: any) => `${x.imported} message(s) importé(s)${x.duplicates ? `, ${x.duplicates} doublon(s)` : ''}${x.errors.length ? `, ${x.errors.length} erreur(s)` : ''}`, invalidate: [['mail'], ['assistant-day']],
  });
  const onFiles = (fl: FileList | null) => {
    if (!fl?.length) return;
    const fd = new FormData();
    for (const f of Array.from(fl)) fd.append('file', f, f.name);
    imp.run(fd);
    if (file.current) file.current.value = '';
  };
  const c = r.data?.counts;
  return (
    <>
      <div className="filter-bar toolbar-gap">
        {r.data?.mailboxes?.length > 1 && <Select aria-label="Boîte" value={owner} onChange={(e) => { setOwner(e.target.value); setSel(null); }} options={r.data.mailboxes.map((b: any, i: number) => ({ value: i === 0 ? '' : b.id, label: i === 0 ? b.full_name : `Courrier de ${b.full_name} (délégué)` }))} />}
        <Segmented label="Statut" value={status} onChange={setStatus} options={[{ id: 'actifs', label: 'À traiter' }, { id: 'traite', label: 'Traités' }, { id: 'archive', label: 'Archivés' }, { id: '', label: 'Tous' }]} />
        <Select aria-label="Catégorie" value={cat} onChange={(e) => setCat(e.target.value)} options={[{ value: '', label: 'Toutes catégories' }, ...Object.entries(MAIL_CAT).map(([value, label]) => ({ value, label }))]} />
        <Input aria-label="Rechercher" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 220 }} />
        <span className="spacer" />
        <input ref={file} type="file" accept=".eml,message/rfc822" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        <Button icon={<Upload />} loading={imp.isPending} onClick={() => file.current?.click()}>Importer des .eml</Button>
        <Button icon={<Server />} onClick={() => setAccounts(true)}>Comptes de messagerie</Button>
        <ExcelButton url={`/api/xlsx/mail${qs ? `?${qs}` : ''}`} />
      </div>
      {!owner && <MailBriefing onOpen={setSel} />}
      {c && <div className="mail-counters"><span><Inbox className="ic-xs" aria-hidden /> {c.unread} non lu(s)</span><span><ListTodo className="ic-xs" aria-hidden /> {c.actions} action(s) demandée(s)</span><span className="text-danger"><AlertTriangle className="ic-xs" aria-hidden /> {c.urgent} prioritaire(s)</span></div>}
      {r.error ? <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card> : !r.data ? <Card><LoadingBlock rows={8} /></Card> : (
        <div className="mail-layout">
          <Card flush className="mail-list">
            {!r.data.rows.length ? <Empty icon={<MailOpen />} title="Aucun message">Importez des fichiers .eml ou configurez un compte IMAP : l’assistant résume et classe chaque message reçu.</Empty> : (
              <ul>
                {r.data.rows.map((m: any) => (
                  <li key={m.id}>
                    <button type="button" className={`mail-item${sel === m.id ? ' active' : ''}${m.status === 'non_lu' ? ' unread' : ''} p-${m.priority}`} onClick={() => setSel(m.id)}>
                      <div className="row"><strong className="truncate">{m.from_name || m.from_addr}</strong><span className="spacer" /><span className="xsmall muted">{relative(m.received_at)}</span></div>
                      <div className="truncate">{m.subject || '(sans objet)'}</div>
                      <div className="xsmall muted mail-snippet">{m.summary}</div>
                      <div className="mail-tags">
                        {m.priority !== 'normale' && <Badge tone={PRIO[m.priority][1]}>{PRIO[m.priority][0]}</Badge>}
                        {m.action_required && m.status !== 'traite' && <Badge tone="warning">Action demandée</Badge>}
                        <Badge tone="neutral" dot={false}>{MAIL_CAT[m.category] ?? m.category}</Badge>
                        {m.attachments > 0 && <Paperclip className="ic-xs muted" aria-label="Pièces jointes" />}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {sel ? <MailDetail id={sel} onClose={() => setSel(null)} /> : <Card className="mail-detail"><Empty icon={<Mail />} title="Sélectionnez un message">Le résumé, les demandes, les dates et les montants détectés s’affichent ici.</Empty></Card>}
        </div>
      )}
      <Accounts open={accounts} onClose={() => setAccounts(false)} />
    </>
  );
}

function MailDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const r = useApi<any>(['mail', 'detail', id], `/api/mail/${id}`);
  const [task, setTask] = useState<any>(null);
  const [full, setFull] = useState(false);
  const st = useAction((s: string) => api.patch(`/api/mail/${id}`, { status: s }), { invalidate: [['mail'], ['assistant-day']], success: 'Statut mis à jour' });
  const mk = useAction((b: any) => api.post(`/api/mail/${id}/task`, b), { success: (t: any) => `Tâche ${t.ref} créée`, invalidate: [['mail'], ['tasks'], ['assistant-day']], onSuccess: () => setTask(null) });
  if (r.error) return <Card className="mail-detail"><ErrorState error={r.error} /></Card>;
  if (!r.data) return <Card className="mail-detail"><LoadingBlock rows={6} /></Card>;
  const m = r.data;
  return (
    <Card className="mail-detail" title={m.subject || '(sans objet)'} sub={<>{m.from_name ? `${m.from_name} <${m.from_addr}>` : m.from_addr} · {dateTime(m.received_at)}</>}
      actions={<Button size="sm" variant="ghost" onClick={onClose}>Fermer</Button>}>
      <div className="mail-tags">
        <Badge tone={PRIO[m.priority][1]}>{PRIO[m.priority][0]}</Badge>
        <Badge tone="neutral" dot={false}>{MAIL_CAT[m.category] ?? m.category}</Badge>
        {m.action_required && <Badge tone="warning">Action demandée</Badge>}
        {m.organization_name && <Badge tone="accent">Client : {m.organization_name}</Badge>}
        <Badge tone="neutral" dot={false}>{m.source === 'imap' ? 'Relevé IMAP' : 'Import .eml'}</Badge>
      </div>
      <div className="mail-summary">
        <div className="xsmall muted"><Sparkles className="ic-xs" aria-hidden /> Résumé {m.summary_source === 'ia' ? 'par l’assistant IA' : 'automatique (règles locales, aucun envoi externe)'}</div>
        <p>{m.summary}</p>
        {m.key_points.length > 0 && <ul>{m.key_points.map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>}
      </div>
      {(m.detected_dates.length > 0 || m.detected_amounts.length > 0) && (
        <div className="row small">
          {m.detected_dates.map((d: string) => <Badge key={d} tone="info" dot={false}><CalendarClock className="ic-xs" aria-hidden /> {date(d)}</Badge>)}
          {m.detected_amounts.map((a: number) => <Badge key={a} tone="success" dot={false}>{money(a)}</Badge>)}
        </div>
      )}
      {m.attachments.length > 0 && <div className="small muted"><Paperclip className="ic-xs" aria-hidden /> {m.attachments.map((a: any) => a.filename).join(', ')} <em>(métadonnées seulement)</em></div>}
      <div className="row" style={{ marginTop: 12 }}>
        {m.task_id ? <Link className="btn btn-sm" to="/taches">Tâche {m.task_ref}</Link> : <Button size="sm" variant="primary" icon={<ClipboardCheck />} onClick={() => setTask({ title: `Courrier : ${m.subject}`.slice(0, 300), due_date: m.detected_dates.find((d: string) => d >= new Date().toISOString().slice(0, 10)) ?? '', urgent: m.priority === 'haute', important: true })}>Créer une tâche</Button>}
        {m.status !== 'traite' && <Button size="sm" icon={<CheckCheck />} onClick={() => st.run('traite')}>Marquer traité</Button>}
        {m.status !== 'archive' && <Button size="sm" icon={<Archive />} onClick={() => st.run('archive')}>Archiver</Button>}
        {m.status !== 'non_lu' && <Button size="sm" variant="ghost" icon={<Mail />} onClick={() => st.run('non_lu')}>Non lu</Button>}
      </div>
      <MailDrafts id={id} ownerId={m.user_id} />
      <details className="mail-body" open={full} onToggle={(e) => setFull((e.target as HTMLDetailsElement).open)}>
        <summary>Message complet</summary>
        <pre>{m.body_text}</pre>
      </details>
      <Modal open={!!task} onClose={() => setTask(null)} title="Créer une tâche à partir du message" footer={<><Button onClick={() => setTask(null)}>Annuler</Button><Button variant="primary" loading={mk.isPending} onClick={() => mk.run({ ...task, due_date: task.due_date || null })}>Créer</Button></>}>
        {task && <>
          <Field label="Intitulé"><Input value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} /></Field>
          <Field label="Échéance" hint="Proposée à partir des dates détectées dans le message"><Input type="date" value={task.due_date} onChange={(e) => setTask({ ...task, due_date: e.target.value })} /></Field>
          <div className="row">
            <label className="checkbox"><input type="checkbox" checked={task.urgent} onChange={(e) => setTask({ ...task, urgent: e.target.checked })} /> Urgent</label>
            <label className="checkbox"><input type="checkbox" checked={task.important} onChange={(e) => setTask({ ...task, important: e.target.checked })} /> Important</label>
          </div>
        </>}
      </Modal>
    </Card>
  );
}

/** Synthèse de la boîte : priorités expliquées, alertes, classement par catégorie. */
function MailBriefing({ onOpen }: { onOpen: (id: string) => void }) {
  const b = useApi<any>(['mail', 'briefing'], '/api/mail/briefing');
  if (!b.data || !b.data.total) return null;
  return (
    <Card title="Ce que l’assistant vous conseille de traiter d’abord" sub={`${b.data.total} message(s) à traiter · ${b.data.unread} non lu(s) · classement : ${b.data.groups.map((g: any) => `${g.label} ${g.n}`).join(', ')}`}>
      {b.data.alerts.map((a: string) => <Alert key={a} tone="warning">{a}</Alert>)}
      <ol className="mail-prio">
        {b.data.priorities.slice(0, 5).map((m: any) => (
          <li key={m.id}>
            <button type="button" onClick={() => onOpen(m.id)}>
              <span className={`mail-score s${m.score >= 70 ? 3 : m.score >= 40 ? 2 : 1}`} title="Score de priorité">{m.score}</span>
              <span className="mail-prio-main"><strong className="truncate">{m.subject || '(sans objet)'}</strong><span className="xsmall muted">{m.from_name || m.from_addr} · {m.reasons.join(' · ') || 'à lire'}</span>
                <span className="xsmall">{m.recommendations[0]}</span></span>
              {m.draft_id && <Badge tone="success">Brouillon prêt</Badge>}
            </button>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** Préparation de la réponse dans un brouillon (jamais envoyé) ; modification et abandon. */
function MailDrafts({ id, ownerId }: { id: string; ownerId: string }) {
  const { me } = useAuth();
  const mine = me?.id === ownerId;
  const r = useApi<any>(['mail', 'drafts', id], mine ? `/api/mail/${id}/drafts` : null);
  const [edit, setEdit] = useState<Record<string, string>>({});
  const mk = useAction(() => api.post(`/api/mail/${id}/draft`), {
    success: (d: any) => d.mailbox?.saved ? `Brouillon déposé dans « ${d.mailbox.folder} »` : 'Brouillon préparé (non envoyé)', invalidate: [['mail', 'drafts', id], ['mail', 'briefing']],
  });
  const save = useAction((v: { id: string; body?: string; status?: string }) => api.patch(`/api/mail-drafts/${v.id}`, v), { success: 'Brouillon mis à jour', invalidate: [['mail', 'drafts', id], ['mail', 'briefing']] });
  if (!mine) return null;
  const d = r.data?.rows?.[0];
  return (
    <div className="mail-draft">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong className="small"><Sparkles className="ic-xs" aria-hidden /> Réponse préparée par l’assistant</strong>
        <Button size="sm" variant={d ? 'ghost' : 'primary'} loading={mk.isPending} onClick={() => mk.run(undefined)}>{d ? 'Préparer un autre brouillon' : 'Préparer la réponse (brouillon)'}</Button>
      </div>
      {mk.error && <Alert tone="danger">{mk.error.message}</Alert>}
      {d && <>
        <div className="xsmall muted">À : {d.to_addr} · Objet : {d.subject} · {d.source === 'ia' ? 'rédigé par l’IA' : 'modèle de réponse (règles)'} · {d.status === 'depose' ? `déposé dans votre boîte ${relative(d.imap_saved_at)}` : 'conservé dans le CRM'}{d.imap_error ? ` · dépôt impossible : ${d.imap_error}` : ''}</div>
        <Textarea rows={9} aria-label="Brouillon de réponse" value={edit[d.id] ?? d.body} onChange={(e) => setEdit({ ...edit, [d.id]: e.target.value })} />
        <div className="row">
          <Button size="sm" disabled={(edit[d.id] ?? d.body) === d.body} loading={save.isPending} onClick={() => save.run({ id: d.id, body: edit[d.id] })}>Enregistrer</Button>
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(edit[d.id] ?? d.body)}>Copier</Button>
          <Button size="sm" variant="ghost" onClick={() => save.run({ id: d.id, status: 'abandonne' })}>Abandonner</Button>
          <span className="xsmall muted">Rien n’est envoyé : relisez, complétez les passages [à compléter] et envoyez depuis votre messagerie.</span>
        </div>
      </>}
    </div>
  );
}

function Accounts({ open, onClose }: { open: boolean; onClose: () => void }) {
  const r = useApi<any>(['mail-accounts'], '/api/mail/accounts', { enabled: open });
  const [f, setF] = useState({ label: '', imap_host: '', imap_port: 993, imap_secure: true, username: '', password: '', mailbox: 'INBOX' });
  const add = useAction((b: any) => api.post('/api/mail/accounts', b), { success: 'Compte enregistré (mot de passe chiffré)', invalidate: [['mail-accounts']], onSuccess: () => setF({ ...f, label: '', username: '', password: '' }) });
  const sync = useAction((id: string) => api.post(`/api/mail/accounts/${id}/sync`), { success: (x: any) => `${x.imported} nouveau(x) message(s)`, invalidate: [['mail-accounts'], ['mail'], ['assistant-day']] });
  const del = useAction((id: string) => api.del(`/api/mail/accounts/${id}`), { success: 'Compte supprimé', invalidate: [['mail-accounts']] });
  const drafts = useAction((v: { id: string; save_drafts: boolean; drafts_mailbox: string }) => api.post(`/api/mail/accounts/${v.id}/drafts`, v), { success: 'Réglage enregistré', invalidate: [['mail-accounts']] });
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Comptes de messagerie (IMAP)" description="Relève en lecture seule : aucun message n’est envoyé, supprimé ni marqué comme lu sur le serveur. Relève automatique toutes les heures. Sur votre accord, l’assistant peut déposer ses brouillons de réponse dans le dossier Brouillons (ajout uniquement, jamais d’envoi).">
      {r.data?.rows?.length > 0 && (
        <DataTable compact rows={r.data.rows} columns={[
          { key: 'label', label: 'Compte', render: (a: any) => <><strong>{a.label}</strong><div className="xsmall muted">{a.username} @ {a.imap_host}:{a.imap_port}</div></> },
          { key: 'sync', label: 'Dernière relève', render: (a: any) => a.last_error ? <span className="text-danger small">{a.last_error}</span> : a.last_sync_at ? dateTime(a.last_sync_at) : 'Jamais' },
          { key: 'drafts', label: 'Brouillons', render: (a: any) => <label className="checkbox xsmall" title="Les brouillons de réponse préparés par l’assistant sont ajoutés au dossier Brouillons de la boîte ; rien n’est envoyé."><input type="checkbox" checked={a.save_drafts} onChange={(e) => drafts.run({ id: a.id, save_drafts: e.target.checked, drafts_mailbox: a.drafts_mailbox })} />Déposer dans « {a.drafts_mailbox} »</label> },
          { key: 'act', label: '', render: (a: any) => <div className="row"><Button size="sm" icon={<RefreshCw />} loading={sync.isPending} onClick={() => sync.run(a.id)}>Relever</Button><Button size="sm" variant="ghost" iconOnly icon={<Trash2 />} aria-label="Supprimer" onClick={() => del.run(a.id)} /></div> },
        ]} />
      )}
      <h3 className="section-title">Ajouter un compte</h3>
      <div className="grid-2">
        <Field label="Libellé" error={add.fieldErrors.label}><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="Boîte professionnelle" /></Field>
        <Field label="Serveur IMAP" error={add.fieldErrors.imap_host}><Input value={f.imap_host} onChange={(e) => setF({ ...f, imap_host: e.target.value })} placeholder="imap.exemple.ci" /></Field>
        <Field label="Port"><Input type="number" value={f.imap_port} onChange={(e) => setF({ ...f, imap_port: Number(e.target.value) })} /></Field>
        <Field label="Dossier"><Input value={f.mailbox} onChange={(e) => setF({ ...f, mailbox: e.target.value })} /></Field>
        <Field label="Identifiant" error={add.fieldErrors.username}><Input value={f.username} autoComplete="off" onChange={(e) => setF({ ...f, username: e.target.value })} /></Field>
        <Field label="Mot de passe" error={add.fieldErrors.password} hint="Chiffré sur le serveur, jamais réaffiché"><Input type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
      </div>
      <label className="checkbox"><input type="checkbox" checked={f.imap_secure} onChange={(e) => setF({ ...f, imap_secure: e.target.checked })} /> Connexion chiffrée (TLS)</label>
      <div className="row" style={{ marginTop: 12 }}><span className="spacer" /><Button variant="primary" loading={add.isPending} onClick={() => add.run(f)}>Enregistrer le compte</Button></div>
    </Modal>
  );
}

// ───────────────────────── Contrôles ─────────────────────────

function Findings() {
  const { me } = useAuth();
  const [status, setStatus] = useState<'ouvert' | 'ignore' | 'resolu'>('ouvert');
  const [check, setCheck] = useState('');
  const [dismiss, setDismiss] = useState<any>(null);
  const qs = new URLSearchParams({ status, ...(check ? { check } : {}) }).toString();
  const r = useApi<any>(['findings', qs], `/api/assistant-admin/findings?${qs}`);
  const handle = useAction((b: any) => api.post(`/api/assistant-admin/findings/${b.id}`, { status: b.status, comment: b.comment }), { success: 'Constat mis à jour', invalidate: [['findings'], ['assistant-day']], onSuccess: () => setDismiss(null) });
  const run = useAction(() => api.post('/api/assistant-admin/controls/run'), { success: (x: any) => `Contrôles exécutés : ${x.opened} nouveau(x) constat(s)`, invalidate: [['findings']] });
  return (
    <>
      <Alert tone="info" title="Contrôles de cohérence">L’assistant vérifie chaque jour les devis, la comptabilité, les factures, les tâches, les ordres de travail, le pointage, les congés, les projets et les dossiers du personnel. Il signale et recommande ; il ne modifie aucune donnée. Un constat disparaît de lui-même quand la situation est corrigée.</Alert>
      <div className="filter-bar toolbar-gap">
        <Segmented label="Statut" value={status} onChange={setStatus} options={[{ id: 'ouvert', label: 'Ouverts' }, { id: 'ignore', label: 'Écartés' }, { id: 'resolu', label: 'Résolus' }]} />
        <Select aria-label="Contrôle" value={check} onChange={(e) => setCheck(e.target.value)} options={[{ value: '', label: 'Tous les contrôles' }, ...(r.data?.checks ?? []).map((c: any) => ({ value: c.code, label: c.label }))]} />
        <span className="spacer" />
        <ExcelButton url={`/api/xlsx/findings?${qs}`} />
        {me?.cross_department && me.role_code !== 'auditeur' && <Button icon={<Play />} loading={run.isPending} onClick={() => run.run(undefined)}>Lancer les contrôles</Button>}
      </div>
      <Card flush>
        {r.error ? <ErrorState error={r.error} onRetry={() => r.refetch()} /> : (
          <DataTable loading={!r.data} rows={r.data?.rows} empty={<Empty icon={<ShieldCheck />} title={status === 'ouvert' ? 'Aucune anomalie détectée' : 'Aucun constat'} />}
            rowClass={(f: any) => `sev-${f.severity}`}
            columns={[
              { key: 'severity', label: 'Niveau', render: (f: any) => <Badge tone={SEV[f.severity][1]}>{SEV[f.severity][0]}</Badge> },
              { key: 'title', label: 'Constat', render: (f: any) => <><div className="xsmall muted">{f.check_label}</div><strong>{f.link ? <Link to={f.link}>{f.title}</Link> : f.title}</strong>{f.detail && <div className="xsmall muted">{f.detail}</div>}</> },
              { key: 'reco', label: 'Recommandation', render: (f: any) => <span className="small">{f.recommendation}</span>, mobile: 'hide' },
              { key: 'who', label: 'Concerne', render: (f: any) => <>{f.owner_name ?? 'Service'}{f.department_label && <div><DeptChip label={f.department_label} color={f.department_color} /></div>}</>, mobile: 'hide' },
              { key: 'seen', label: 'Depuis', render: (f: any) => <span className="small">{relative(f.first_seen_at)}</span> },
              { key: 'act', label: '', render: (f: any) => f.status === 'ouvert' ? <Button size="sm" variant="ghost" onClick={() => setDismiss({ id: f.id, title: f.title, comment: '' })}>Écarter</Button>
                : f.status === 'ignore' ? <div className="xsmall"><span className="muted">« {f.comment} » — {f.handled_by_name}</span><br /><Button size="sm" variant="ghost" icon={<Undo2 />} onClick={() => handle.run({ id: f.id, status: 'ouvert' })}>Rouvrir</Button></div>
                : <span className="xsmall muted">Résolu {relative(f.resolved_at)}</span> },
            ]} />
        )}
      </Card>
      <Modal open={!!dismiss} onClose={() => setDismiss(null)} title="Écarter ce constat" description={dismiss?.title}
        footer={<><Button onClick={() => setDismiss(null)}>Annuler</Button><Button variant="primary" loading={handle.isPending} onClick={() => handle.run({ id: dismiss.id, status: 'ignore', comment: dismiss.comment })}>Écarter</Button></>}>
        {dismiss && <Field label="Motif (obligatoire)" error={handle.fieldErrors.comment} hint="Le motif est conservé et visible des responsables."><Textarea rows={3} value={dismiss.comment} onChange={(e) => setDismiss({ ...dismiss, comment: e.target.value })} /></Field>}
      </Modal>
    </>
  );
}
