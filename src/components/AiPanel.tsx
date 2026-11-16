// Assistant IA : panneau conversationnel contextuel, sources, niveau de confiance, actions à accepter / modifier / rejeter
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, X, Send, FileSearch, Check, Ban, Pencil, Undo2, AlertTriangle, Bot, ExternalLink, Info } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { Markdown } from '../lib/markdown';
import { useToast } from '../lib/toast';
import { Badge, Button, Segmented, Textarea, Field, Input, Status } from './ui';
import { money, safePath, safeMailto } from '../lib/format';

type Mode = 'assistant' | 'copilote' | 'automatisation';
const RANK: Record<Mode, number> = { assistant: 0, copilote: 1, automatisation: 2 };
const MODE_HELP: Record<Mode, string> = {
  assistant: 'Recherche, analyse et rédaction. Aucune donnée n’est modifiée.',
  copilote: 'L’assistant prépare des actions ; rien n’est exécuté sans votre confirmation.',
  automatisation: 'Les actions à faible risque préautorisées sont exécutées et journalisées (annulables). Les autres restent soumises à confirmation.',
};
const CONF: Record<string, [string, 'success' | 'warning' | 'danger']> = { elevee: ['Confiance élevée', 'success'], moyenne: ['Confiance moyenne', 'warning'], faible: ['Confiance faible', 'danger'] };

export function ActionCard({ action, onChange }: { action: any; onChange?: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [payload, setPayload] = useState<any>(action.payload);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState(action);
  const decide = async (accept: boolean) => {
    setBusy(true);
    try {
      const r = await api.post(`/api/ai/actions/${state.id}/decide`, { accept, payload: edit ? payload : undefined });
      setState({ ...state, status: r.status, result: r.result, payload: edit ? payload : state.payload });
      setEdit(false);
      toast('success', accept ? 'Action exécutée' : 'Proposition rejetée', accept ? state.label : undefined);
      qc.invalidateQueries();
      onChange?.();
    } catch (e) { toast('error', 'Action impossible', (e as ApiError).message); } finally { setBusy(false); }
  };
  const undo = async () => {
    setBusy(true);
    try { await api.post(`/api/ai/actions/${state.id}/undo`); setState({ ...state, status: 'annulee' }); toast('success', 'Action annulée'); qc.invalidateQueries(); }
    catch (e) { toast('error', 'Annulation impossible', (e as ApiError).message); } finally { setBusy(false); }
  };
  const t = state.action_type;
  const result = state.result ?? {};
  return (
    <div className={`ai-action${state.status === 'executee' ? ' done' : ''}${['rejetee', 'annulee', 'echouee'].includes(state.status) ? ' rejected' : ''}`}>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <Bot size={16} style={{ marginTop: 2, flex: 'none', color: 'var(--primary)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="strong">{state.label}</div>
          <div className="row-wrap xsmall muted" style={{ marginTop: 2 }}>
            <Status kind="ai_action" code={state.status} />
            <span>Risque {state.risk}</span>
            {state.mode === 'automatisation' && <span>· automatisation contrôlée</span>}
          </div>
        </div>
      </div>
      {!edit && t === 'draft_email' && <div className="small" style={{ whiteSpace: 'pre-wrap', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 8 }}><strong>{state.payload.objet}</strong>{'\n\n'}{state.payload.corps}</div>}
      {!edit && t === 'log_activity' && <div className="small" style={{ whiteSpace: 'pre-wrap' }}>{state.payload.compte_rendu}</div>}
      {!edit && (t === 'create_task' || t === 'update_next_step') && state.payload.justification && <div className="xsmall secondary">Justification : {state.payload.justification}</div>}
      {!edit && t === 'create_quote_draft' && <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{state.payload.lignes?.map((l: any, i: number) => <li key={i}>{l.code_catalogue ?? `${l.code_support}-${l.face ?? 'A'}`} × {l.quantite}{l.duree ? ` sur ${l.duree} période(s)` : ''}</li>)}<li className="muted">Prix, coûts et marges appliqués par le moteur du CRM à l’acceptation.</li></ul>}
      {edit && (
        <div className="stack">
          {'objet' in payload && <Field label="Objet"><Input value={payload.objet} onChange={(e) => setPayload({ ...payload, objet: e.target.value })} /></Field>}
          {'corps' in payload && <Field label="Message"><Textarea rows={8} value={payload.corps} onChange={(e) => setPayload({ ...payload, corps: e.target.value })} /></Field>}
          {'compte_rendu' in payload && <Field label="Compte rendu"><Textarea rows={6} value={payload.compte_rendu} onChange={(e) => setPayload({ ...payload, compte_rendu: e.target.value })} /></Field>}
          {'prochaine_etape' in payload && <Field label="Prochaine étape"><Input value={payload.prochaine_etape} onChange={(e) => setPayload({ ...payload, prochaine_etape: e.target.value })} /></Field>}
          {'echeance' in payload && <Field label="Échéance"><Input type="date" value={payload.echeance} onChange={(e) => setPayload({ ...payload, echeance: e.target.value })} /></Field>}
          {'date' in payload && <Field label="Date"><Input type="date" value={payload.date} onChange={(e) => setPayload({ ...payload, date: e.target.value })} /></Field>}
        </div>
      )}
      {state.status === 'executee' && (
        <div className="row-wrap small">
          {safePath(result.link, '') && <Link to={safePath(result.link)}>Ouvrir <ExternalLink size={12} /></Link>}
          {safeMailto(result.mailto) && <a href={safeMailto(result.mailto)}>Ouvrir dans la messagerie <ExternalLink size={12} /></a>}
          {result.number && <span>Devis {result.number} · {money(result.total_ht)} HT · marge {result.margin_pct} %{result.approval_required ? ' · validation requise' : ''}</span>}
          {result.missing?.length > 0 && <span className="muted">Non repris : {result.missing.join(' ; ')}</span>}
          {result.undo && <Button size="sm" variant="ghost" icon={<Undo2 />} onClick={undo} loading={busy}>Annuler l’action</Button>}
        </div>
      )}
      {state.status === 'echouee' && <div className="xsmall" style={{ color: 'var(--danger)' }}>{state.error}</div>}
      {state.status === 'proposee' && (
        <div className="row-wrap">
          <Button size="sm" variant="primary" icon={<Check />} loading={busy} onClick={() => decide(true)}>{edit ? 'Enregistrer et accepter' : 'Accepter'}</Button>
          {!edit && t !== 'create_quote_draft' && <Button size="sm" icon={<Pencil />} onClick={() => setEdit(true)}>Modifier</Button>}
          <Button size="sm" variant="ghost" icon={<Ban />} onClick={() => decide(false)} disabled={busy}>Rejeter</Button>
        </div>
      )}
    </div>
  );
}

export function AiMessage({ m, actions }: { m: any; actions: any[] }) {
  if (m.role === 'user') return <div className="ai-msg user"><div className="ai-bubble">{m.content}</div></div>;
  const conf = m.confidence ? CONF[m.confidence] : null;
  return (
    <div className="ai-msg assistant">
      <div className="ai-bubble"><Markdown text={m.content} /></div>
      {m.warnings?.length > 0 && (
        <div className="alert alert-warning" style={{ padding: '8px 10px' }}><AlertTriangle /><div className="xsmall"><strong>Limites et informations manquantes</strong><ul>{m.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul></div></div>
      )}
      {actions.map((a) => <ActionCard key={a.id} action={a} />)}
      <div className="row-wrap xsmall muted">
        {conf && <Badge tone={conf[1]}>{conf[0]}</Badge>}
        {m.provider && <span>{m.provider === 'regles' ? 'Moteur de règles' : m.model}</span>}
      </div>
      {m.sources?.length > 0 && (
        <div className="ai-sources" aria-label="Sources utilisées">
          <span className="muted">Sources :</span>
          {m.sources.map((s: any) => safePath(s.link, '') ? <Link key={s.type + s.id} className="ai-source" to={safePath(s.link)}><FileSearch />{s.label}</Link> : <span key={s.type + s.id} className="ai-source"><FileSearch />{s.label}</span>)}
        </div>
      )}
    </div>
  );
}

export function AiChat({ contextType, contextId, initialPrompt, compact, conversationId: initialConv }: { contextType?: string; contextId?: string; initialPrompt?: string; compact?: boolean; conversationId?: string | null }) {
  const status = useQuery({ queryKey: ['ai-status'], queryFn: () => api.get('/api/ai/status') });
  const sugg = useQuery({ queryKey: ['ai-sugg', contextType], queryFn: () => api.get(`/api/ai/suggestions?context_type=${contextType ?? ''}`) });
  const [messages, setMessages] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [conv, setConv] = useState<string | null>(initialConv ?? null);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>('assistant');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    setConv(initialConv ?? null);
    if (!initialConv) { setMessages([]); setActions([]); return; }
    api.get(`/api/ai/conversations/${initialConv}`).then((r) => { setMessages(r.messages); setActions(r.actions); });
  }, [initialConv]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy]);
  useEffect(() => { if (status.data && RANK[mode] > RANK[status.data.max_mode as Mode]) setMode(status.data.max_mode); }, [status.data]);

  const send = async (msg: string) => {
    const m = msg.trim();
    if (!m || busy) return;
    setErr(null); setBusy(true); setText('');
    setMessages((x) => [...x, { id: 'tmp' + Date.now(), role: 'user', content: m }]);
    try {
      const r = await api.post('/api/ai/chat', { conversation_id: conv, message: m, mode, context_type: contextType ?? null, context_id: contextId ?? null });
      setConv(r.conversation_id);
      setMessages((x) => [...x, r.message]);
      setActions((x) => [...x, ...r.actions.map((a: any) => ({ ...a, message_id: r.message.id }))]);
      status.refetch();
    } catch (e) {
      setErr((e as ApiError).message);
    } finally { setBusy(false); }
  };
  useEffect(() => { if (initialPrompt && !sentInitial.current && status.data) { sentInitial.current = true; send(initialPrompt); } }, [initialPrompt, status.data]);

  // Rattache une action rechargée au premier message de l'assistant postérieur à sa création
  const ownerMessage = (a: any) => messages.find((m) => m.role === 'assistant' && new Date(m.created_at).getTime() >= new Date(a.created_at).getTime() - 1000)?.id;
  const st = status.data;
  const allowed: Mode[] = (['assistant', 'copilote', 'automatisation'] as Mode[]).filter((x) => st && RANK[x] <= RANK[st.max_mode as Mode]);
  const disabled = st && !st.enabled;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <div className="ai-panel-head" style={compact ? undefined : { borderBottom: '1px solid var(--border)' }}>
        <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
          {allowed.length > 1 ? <Segmented label="Mode de l’assistant" value={mode} onChange={setMode} options={allowed.map((x) => ({ id: x, label: x === 'assistant' ? 'Assistant' : x === 'copilote' ? 'Copilote' : 'Automatisation' }))} /> : <Badge tone="info">Mode assistant</Badge>}
          {st && <span className="xsmall muted">{st.generative ? st.model : 'Moteur de règles'} · {st.used_today}/{st.daily_quota} aujourd’hui</span>}
        </div>
        <div className="xsmall secondary">{MODE_HELP[mode]}</div>
        {st && !st.generative && st.enabled && <div className="xsmall muted row" style={{ alignItems: 'flex-start' }}><Info size={13} style={{ flex: 'none', marginTop: 2 }} />Aucun fournisseur d’IA générative n’est configuré : les réponses sont construites par le moteur de règles du CRM, à partir des mêmes données et des mêmes droits.</div>}
      </div>
      <div className="ai-messages" aria-live="polite">
        {disabled && <div className="alert alert-warning"><AlertTriangle /><div>L’assistant est désactivé par l’administrateur. Toutes les autres fonctions du CRM restent disponibles.</div></div>}
        {!messages.length && !disabled && (
          <div className="stack">
            <div className="row secondary small"><Sparkles size={16} style={{ color: 'var(--brand-copper)' }} />{contextType ? 'Questions suggérées pour cet écran' : 'Comment puis-je vous aider ?'}</div>
            <div className="chips">{(sugg.data?.suggestions ?? []).map((s: string) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div>
            <p className="xsmall muted">L’assistant n’invente jamais un prix, une disponibilité ou un chiffre : il cite les données du CRM qu’il a consultées et signale ce qui manque.</p>
          </div>
        )}
        {messages.map((m) => <AiMessage key={m.id} m={m} actions={actions.filter((a) => (a.message_id ?? ownerMessage(a)) === m.id)} />)}
        {busy && <div className="ai-msg assistant"><div className="ai-bubble row"><span className="spinner" />Analyse des données autorisées…</div></div>}
        {err && <div className="alert alert-danger"><AlertTriangle /><div>{err}</div></div>}
        <div ref={end} />
      </div>
      <form className="ai-composer" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <label htmlFor="ai-input" className="sr-only">Votre message à l’assistant</label>
        <Textarea id="ai-input" value={text} disabled={!!disabled} onChange={(e) => setText(e.target.value)} placeholder="Posez une question, collez des notes de réunion à structurer…"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text); } }} />
        <div className="row"><span className="xsmall muted">Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne</span><div className="spacer" />
          <Button type="submit" variant="primary" size="sm" icon={<Send />} loading={busy} disabled={!text.trim() || !!disabled}>Envoyer</Button></div>
      </form>
    </div>
  );
}

export function AiPanel({ contextType, contextId, initialPrompt, onClose }: { contextType?: string; contextId?: string; initialPrompt?: string; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, []);
  return createPortal(
    <aside className="drawer" role="dialog" aria-label="Assistant IA">
      <div className="row" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <Sparkles size={18} style={{ color: 'var(--brand-copper)' }} />
        <div style={{ flex: 1 }}><strong>Assistant COM&amp;SIG</strong>{contextType && <div className="xsmall muted">Contexte : {({ organization: 'fiche client', opportunity: 'opportunité', quote: 'devis', contract: 'contrat', campaign: 'campagne' } as any)[contextType]}</div>}</div>
        <Link to="/assistant" className="btn btn-ghost btn-sm" onClick={onClose}>Historique</Link>
        <Button variant="ghost" iconOnly size="sm" aria-label="Fermer l’assistant" onClick={onClose} icon={<X />} />
      </div>
      <AiChat contextType={contextType} contextId={contextId} initialPrompt={initialPrompt} compact />
    </aside>,
    document.body,
  );
}
