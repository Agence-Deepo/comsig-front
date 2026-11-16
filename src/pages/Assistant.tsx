import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, MessageSquarePlus, Plus, Sparkles, Archive } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth, useCan } from '../lib/auth';
import { dateTime, relative } from '../lib/format';
import { KB_CATEGORY } from '../lib/labels';
import { Markdown } from '../lib/markdown';
import { AiChat, ActionCard } from '../components/AiPanel';
import { Alert, Badge, Button, Card, DataTable, Empty, Field, Input, LoadingBlock, Modal, PageHeader, Segmented, Select, Status, Tabs, Textarea } from '../components/ui';

type Tab = 'chat' | 'actions' | 'kb';

/** Assistant IA plein écran : conversations, actions proposées/exécutées, base de connaissances (§5.14). */
export default function Assistant({ tab: initial }: { tab?: string }) {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const tab = (initial === 'kb' ? 'kb' : (sp.get('tab') as Tab)) || 'chat';
  const setTab = (t: Tab) => (t === 'kb' ? nav('/assistant/connaissances') : nav(t === 'chat' ? '/assistant' : `/assistant?tab=${t}`));
  return (
    <>
      <PageHeader title={<span className="row"><Sparkles style={{ color: 'var(--brand-copper)' }} />Assistant IA</span>}
        subtitle="Recherche, analyse, rédaction et actions préparées — uniquement à partir des données du CRM que vous êtes autorisé à consulter" />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'chat', label: 'Conversations' }, { id: 'actions', label: 'Actions proposées' }, { id: 'kb', label: 'Base de connaissances' }]} />
      {tab === 'chat' && <Conversations conv={sp.get('c')} setConv={(c) => setSp(c ? { c } : {})} />}
      {tab === 'actions' && <Actions />}
      {tab === 'kb' && <KnowledgeBase />}
    </>
  );
}

function Conversations({ conv, setConv }: { conv: string | null; setConv: (c: string | null) => void }) {
  const list = useApi<any>(['ai-conversations'], '/api/ai/conversations');
  const [fresh, setFresh] = useState(0);
  return (
    <div className="ai-page">
      <Card title="Historique" flush actions={<Button size="sm" icon={<MessageSquarePlus />} onClick={() => { setConv(null); setFresh((n) => n + 1); }}>Nouvelle</Button>}>
        {list.isLoading ? <div style={{ padding: 12 }}><LoadingBlock rows={5} /></div> : !list.data?.rows.length ? <Empty title="Aucune conversation">Vos échanges avec l’assistant apparaîtront ici.</Empty> : (
          <ul className="conv-list">
            {list.data.rows.map((c: any) => (
              <li key={c.id}><button className={c.id === conv ? 'active' : ''} onClick={() => setConv(c.id)}>
                <span className="conv-title">{c.title || 'Conversation'}</span>
                <span className="xsmall muted">{relative(c.updated_at)}{c.context_type ? ` · ${({ organization: 'client', opportunity: 'opportunité', quote: 'devis', contract: 'contrat', campaign: 'campagne' } as any)[c.context_type]}` : ''}</span>
              </button></li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="ai-page-chat" flush><AiChat key={conv ?? `new-${fresh}`} conversationId={conv} /></Card>
    </div>
  );
}

function Actions() {
  const [status, setStatus] = useState('proposee');
  const r = useApi<any>(['ai-actions', status], `/api/ai/actions${status ? `?status=${status}` : ''}`);
  return (
    <>
      <Segmented label="Statut" value={status} onChange={setStatus} options={[{ id: 'proposee', label: 'À valider' }, { id: 'executee', label: 'Exécutées' }, { id: 'rejetee', label: 'Rejetées' }, { id: '', label: 'Toutes' }]} />
      {r.isLoading ? <Card><LoadingBlock /></Card> : !r.data?.rows.length ? <Card><Empty icon={<Sparkles />} title="Aucune action">Les propositions de l’assistant en mode copilote ou automatisation apparaissent ici.</Empty></Card> : (
        <div className="grid-2">
          {r.data.rows.map((a: any) => <div key={a.id} className="stack"><div className="xsmall muted">{dateTime(a.created_at)}</div><ActionCard action={a} onChange={() => r.refetch()} /></div>)}
        </div>
      )}
    </>
  );
}

const ROLE_OPTIONS = [
  ['direction_generale', 'Direction générale'], ['direction_commerciale', 'Direction commerciale'], ['commercial', 'Commercial'], ['operations', 'Opérations'],
  ['technicien', 'Technicien'], ['marketing', 'Marketing'], ['finance', 'Finance'], ['juridique', 'Juridique'], ['admin_tech', 'Administration'], ['auditeur', 'Auditeur'],
];

function KnowledgeBase() {
  const { me } = useAuth();
  const can = useCan();
  const manage = can('admin', 'update') || ['direction_generale', 'direction_commerciale'].includes(me?.role_code ?? '');
  const [all, setAll] = useState('');
  const [cat, setCat] = useState('');
  const list = useApi<any>(['kb', all], `/api/kb${all ? '?all=1' : ''}`);
  const [open, setOpen] = useState<string | null>(null);
  const doc = useApi<any>(['kb-doc', open], open ? `/api/kb/${open}` : null);
  const [edit, setEdit] = useState<any>(null);
  const save = useAction((b: any) => (b.id ? api.put(`/api/kb/${b.id}`, b.body) : api.post('/api/kb', b.body)), {
    success: (r: any) => `« ${r.title} » publié (version ${r.version})`, invalidate: [['kb']], onSuccess: (r: any) => { setEdit(null); setOpen(r.id); },
  });
  const archive = useAction((id: string) => api.post(`/api/kb/${id}/archive`), { success: 'Document archivé', invalidate: [['kb'], ['kb-doc']] });
  const rows = (list.data?.rows ?? []).filter((d: any) => !cat || d.category === cat);
  const d = doc.data?.document;
  return (
    <>
      <Alert tone="info">Seuls les documents <strong>actifs</strong> servent de source à l’assistant. Une modification crée une nouvelle version ; l’ancienne est archivée et n’est plus citée.</Alert>
      <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
        <div className="row-wrap">
          <Select aria-label="Catégorie" style={{ width: 240 }} value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Toutes les catégories" options={Object.entries(KB_CATEGORY).map(([value, label]) => ({ value, label }))} />
          {manage && <Segmented label="Visibilité" value={all} onChange={setAll} options={[{ id: '', label: 'Actifs' }, { id: '1', label: 'Tous (y compris archives)' }]} />}
        </div>
        {manage && <Button variant="primary" icon={<Plus />} onClick={() => setEdit({ title: '', category: 'procedure', body: '', confidential: false, allowed_roles: [], status: 'actif' })}>Nouveau document</Button>}
      </div>
      <div className="grid-2">
        <Card flush>
          <DataTable rows={rows} loading={list.isLoading} onRowClick={(x: any) => setOpen(x.id)} rowClass={(x: any) => (x.id === open ? 'highlight' : '')}
            empty={<Empty icon={<BookOpen />} title="Aucun document" />}
            columns={[
              { key: 't', label: 'Document', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{KB_CATEGORY[x.category]} · v{x.version}{x.confidential ? ' · confidentiel' : ''}</div></> },
              { key: 's', label: 'Statut', render: (x: any) => <Status kind="kb" code={x.status} /> },
              { key: 'u', label: 'Mis à jour', render: (x: any) => <span className="small">{relative(x.updated_at)}</span>, mobile: 'hide' },
            ]} />
        </Card>
        <Card title={d?.title ?? 'Aperçu'} sub={d ? `${KB_CATEGORY[d.category]} · version ${d.version} · ${dateTime(d.updated_at)}` : 'Sélectionnez un document'}
          actions={d && manage && d.status !== 'archive' && <>
            <Button size="sm" onClick={() => setEdit({ id: d.id, title: d.title, category: d.category, body: d.body, confidential: d.confidential, allowed_roles: d.allowed_roles, status: d.status })}>Nouvelle version</Button>
            <Button size="sm" variant="ghost" icon={<Archive />} loading={archive.isPending} onClick={() => archive.run(d.id)}>Archiver</Button></>}>
          {!open ? <Empty icon={<BookOpen />} title="Aucun document sélectionné" /> : doc.isLoading ? <LoadingBlock rows={6} /> : d && (
            <div className="stack">
              <div className="row-wrap"><Status kind="kb" code={d.status} />{d.confidential && <Badge tone="warning">Confidentiel</Badge>}{d.allowed_roles?.length > 0 && <Badge tone="info">Réservé : {d.allowed_roles.join(', ')}</Badge>}</div>
              <div className="kb-body"><Markdown text={d.body} /></div>
              {doc.data.versions.length > 1 && <div className="xsmall muted">Versions : {doc.data.versions.map((v: any) => `v${v.version} (${v.status})`).join(' · ')}</div>}
            </div>
          )}
        </Card>
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} size="xl" title={edit?.id ? 'Nouvelle version du document' : 'Nouveau document'}
        description="Rédigez en Markdown simple (titres ##, listes -, **gras**). Ne saisissez pas de tarif non validé : l’assistant le citerait comme source."
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ id: edit.id, body: { title: edit.title, category: edit.category, body: edit.body, confidential: edit.confidential, allowed_roles: edit.allowed_roles, status: edit.status } })}>Publier</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Titre" required className="span-2" error={save.fieldErrors.title}><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
          <Field label="Catégorie"><Select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} options={Object.entries(KB_CATEGORY).map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="Statut"><Select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} options={[{ value: 'actif', label: 'Actif (utilisé par l’assistant)' }, { value: 'brouillon', label: 'Brouillon' }]} /></Field>
          <Field label="Contenu" required className="span-2" error={save.fieldErrors.body}><Textarea rows={14} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} /></Field>
          <Field label="Confidentialité"><label className="checkbox"><input type="checkbox" checked={edit.confidential} onChange={(e) => setEdit({ ...edit, confidential: e.target.checked })} />Réservé aux profils habilités aux informations confidentielles</label></Field>
          <Field label="Rôles autorisés" hint="Aucun coché : tous les rôles ayant accès à l’assistant">
            <div className="chips">{ROLE_OPTIONS.map(([code, label]) => (
              <label key={code} className="checkbox xsmall"><input type="checkbox" checked={edit.allowed_roles.includes(code)} onChange={(e) => setEdit({ ...edit, allowed_roles: e.target.checked ? [...edit.allowed_roles, code] : edit.allowed_roles.filter((x: string) => x !== code) })} />{label}</label>
            ))}</div>
          </Field>
        </div>}
      </Modal>
    </>
  );
}
