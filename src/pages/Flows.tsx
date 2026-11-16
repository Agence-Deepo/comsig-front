// Circuits de production : trois itinéraires depuis une opportunité commerciale, chaque passage tracé
import { useEffect, useState } from 'react';
import { PriorityBadge, PrioritySelect } from '../components/Priority';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Route as RouteIcon, Plus, ArrowRight, Undo2, UserCheck, Ban, MessageSquare, Flag, Shuffle, CircleCheck, Circle, CircleDot, CircleSlash, History, ClipboardList } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useAuth } from '../lib/auth';
import { date, dateTime, relative } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, ErrorState, Field, Input, Kpi, LoadingBlock, Modal, PageHeader, Select, Tabs, Textarea } from '../components/ui';

type Box = 'a_traiter' | 'en_cours' | 'termines' | 'tous';
const ST: Record<string, [string, 'info' | 'success' | 'neutral']> = { en_cours: ['En cours', 'info'], termine: ['Terminé', 'success'], annule: ['Annulé', 'neutral'] };
const EVENT: Record<string, string> = { creation: 'Création', transmission: 'Transmission', prise_en_charge: 'Prise en charge', retour: 'Retour', cloture: 'Clôture', annulation: 'Annulation', commentaire: 'Commentaire', orientation: 'Réorientation', ordre_travail: 'Ordre de travail' };
/** Schéma des itinéraires (affiché au lancement). */
const ROUTES: Record<number, string[]> = { 1: ['Commercial', 'Informatique et études (infographie)', 'Imprimerie · Atelier métallique · CNC', 'Commercial'], 2: ['Commercial', 'Régie publicitaire et médias', 'Commercial (ou clôture à la régie)'], 3: ['Commercial', 'Direction générale', 'Commercial'] };

export function ItineraryPath({ n }: { n: number }) {
  return <span className="itin-path">{ROUTES[n].map((s, i) => <span key={i}>{i > 0 && <ArrowRight size={12} aria-hidden />}<span className="itin-node">{s}</span></span>)}</span>;
}

export default function Flows() {
  const { me } = useAuth();
  const [sp, setSp] = useSearchParams();
  const [box, setBox] = useState<Box>('a_traiter');
  const [it, setIt] = useState('');
  const r = useApi<any>(['flows', box, it], `/api/flows${qs({ box, itinerary: it || undefined })}`);
  const stats = useApi<any>(['flows', 'stats'], '/api/flows/stats');
  const canCreate = me?.department_code === 'commercial' || me?.role_code === 'direction_generale';
  const [create, setCreate] = useState<string | null>(sp.get('nouveau'));
  const nav = useNavigate();
  const s = stats.data;
  return (
    <>
      <PageHeader title="Circuits de production" subtitle="Toute demande issue d’une opportunité commerciale suit l’un des trois itinéraires ; chaque transmission, prise en charge, retour et clôture est tracée"
        actions={<>{canCreate && <Button variant="primary" icon={<Plus />} onClick={() => setCreate('')}>Lancer un circuit</Button>}</>} />
      <div className="grid-4">
        <Kpi label="Circuits en cours" value={s ? String(s.open) : '…'} foot={s ? `${s.late} en retard` : ''} />
        <Kpi label="Terminés" value={s ? String(s.done) : '…'} foot={s?.avg_days != null ? `Durée moyenne ${s.avg_days} j` : 'Durée moyenne —'} />
        <Kpi label="Itinéraire 1 · Production" value={s ? String(s.it1) : '…'} foot="Infographie puis fabrication" />
        <Kpi label="Itinéraires 2 · Régie / 3 · Direction" value={s ? `${s.it2} / ${s.it3}` : '…'} foot="Tous statuts" />
      </div>
      <Card flush actions={<Select aria-label="Itinéraire" value={it} onChange={(e) => setIt(e.target.value)} options={[{ value: '', label: 'Tous les itinéraires' }, { value: '1', label: 'Itinéraire 1 — Production' }, { value: '2', label: 'Itinéraire 2 — Régie' }, { value: '3', label: 'Itinéraire 3 — Direction générale' }]} />}
        title={<Tabs value={box} onChange={setBox} tabs={[{ id: 'a_traiter', label: 'À traiter par mon service' }, { id: 'en_cours', label: 'En cours' }, { id: 'termines', label: 'Clos' }, { id: 'tous', label: 'Tous' }]} />}>
        {r.error ? <ErrorState error={r.error} /> : (
          <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(f: any) => nav(`/circuits/${f.id}`)} empty={<Empty icon={<RouteIcon />} title={box === 'a_traiter' ? 'Rien à traiter pour votre service' : 'Aucun circuit'} />}
            columns={[
              { key: 'ref', label: 'Circuit', render: (f: any) => <><div className="cell-title">{f.title}</div><div className="cell-sub">{f.ref} · {f.organization_name} · {f.opportunity_ref}</div></> },
              { key: 'it', label: 'Itinéraire', render: (f: any) => <Badge tone="neutral" dot={false}>{f.itinerary}</Badge> },
              { key: 'cur', label: 'Étape en cours', render: (f: any) => f.status === 'en_cours' ? <span className="small"><span className="dept-dot-inline" style={{ background: f.current_department_color }} />{f.current_department_label}<div className="xsmall muted">{f.current_label} · depuis {relative(f.current_since)}</div></span> : <span className="small muted">{f.outcome}</span> },
              { key: 'p', label: 'Avancement', render: (f: any) => <span className="small">{f.steps_done}/{f.steps_n}</span>, mobile: 'hide' },
              { key: 'prio', label: 'Priorité', render: (f: any) => <PriorityBadge level={f.priority_level} legacy={f.priority} />, mobile: 'hide' },
              { key: 'due', label: 'Échéance', render: (f: any) => <span className={`small${f.is_late ? ' text-danger' : ''}`}>{f.due_date ? date(f.due_date) : '—'}</span>, mobile: 'hide' },
              { key: 'st', label: 'Statut', render: (f: any) => <Badge tone={ST[f.status][1]}>{ST[f.status][0]}</Badge> },
            ]} />
        )}
      </Card>
      <NewFlow open={create !== null} oppId={create || undefined} onClose={() => { setCreate(null); if (sp.get('nouveau')) setSp({}); }} />
    </>
  );
}

function NewFlow({ open, oppId, onClose }: { open: boolean; oppId?: string; onClose: () => void }) {
  const nav = useNavigate();
  const opps = useApi<any>(['opps-flow'], open ? '/api/opportunities?status=ouvertes&pageSize=500' : null);
  const [f, setF] = useState<any>({});
  useEffect(() => { if (open) setF({ opportunity_id: oppId ?? '', itinerary: 1, fabrication: 'imprimerie', title: '', brief: '', priority_level: null, due_date: '' }); }, [open, oppId]);
  const save = useAction((b: any) => api.post('/api/flows', b), { success: (x: any) => `Circuit ${x.ref} lancé`, invalidate: [['flows']], onSuccess: (x: any) => { onClose(); nav(`/circuits/${x.id}`); } });
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Lancer un circuit de production" description="Le service suivant est prévenu ; les étapes de production créent automatiquement l’ordre de travail du service concerné."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.opportunity_id || !f.title?.trim() || !f.priority_level}
        onClick={() => save.run({ ...f, itinerary: Number(f.itinerary), fabrication: Number(f.itinerary) === 1 ? f.fabrication : undefined, due_date: f.due_date || null })}>Lancer</Button></>}>
      <div className="form-grid">
        <Field label="Opportunité" required className="span-2" error={save.fieldErrors.opportunity_id}>
          <Select value={f.opportunity_id ?? ''} onChange={(e) => setF({ ...f, opportunity_id: e.target.value, title: f.title || (opps.data?.rows.find((o: any) => o.id === e.target.value)?.title ?? '') })} placeholder="Choisir une opportunité ouverte"
            options={(opps.data?.rows ?? opps.data?.data ?? []).map((o: any) => ({ value: o.id, label: `${o.ref} — ${o.title} (${o.organization_name ?? o.organization?.legal_name ?? 'client'})` }))} />
        </Field>
        <div className="span-2 itin-choice" role="radiogroup" aria-label="Itinéraire">
          {[1, 2, 3].map((n) => (
            <label key={n} className={`itin-card${Number(f.itinerary) === n ? ' active' : ''}`}>
              <input type="radio" name="itinerary" checked={Number(f.itinerary) === n} onChange={() => setF({ ...f, itinerary: n })} />
              <strong>Itinéraire {n}</strong><ItineraryPath n={n} />
            </label>
          ))}
        </div>
        {Number(f.itinerary) === 1 && <Field label="Service de fabrication" required hint="Modifiable tant que la fabrication n’a pas commencé"><Select value={f.fabrication} onChange={(e) => setF({ ...f, fabrication: e.target.value })} options={[{ value: 'imprimerie', label: 'Imprimerie' }, { value: 'atelier', label: 'Atelier métallique' }, { value: 'cnc', label: 'CNC' }]} /></Field>}
        <Field label="Intitulé" required error={save.fieldErrors.title}><Input value={f.title ?? ''} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <PrioritySelect value={f.priority_level} onChange={(v) => setF({ ...f, priority_level: v })} error={save.fieldErrors.priority_level} />
        <Field label="Échéance souhaitée"><Input type="date" value={f.due_date ?? ''} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>
        <Field label="Brief pour les services" className="span-2"><Textarea rows={4} value={f.brief ?? ''} onChange={(e) => setF({ ...f, brief: e.target.value })} placeholder="Besoin, formats, quantités, lieu, délais, contraintes…" /></Field>
        {save.error && !Object.keys(save.fieldErrors).length && <div className="span-2"><Alert tone="danger">{save.error.message}</Alert></div>}
      </div>
    </Modal>
  );
}

const STEP_ICON: Record<string, JSX.Element> = { termine: <CircleCheck />, en_cours: <CircleDot />, a_venir: <Circle />, saute: <CircleSlash /> };

export function FlowDetail() {
  const { id } = useParams();
  const r = useApi<any>(['flow', id], `/api/flows/${id}`);
  const [dlg, setDlg] = useState<null | 'advance' | 'close' | 'return' | 'cancel' | 'comment' | 'orient'>(null);
  const [note, setNote] = useState('');
  const [fab, setFab] = useState('imprimerie');
  const inv = [['flow', id], ['flows']];
  const act = useAction((v: { path: string; body?: any }) => api.post(`/api/flows/${id}/${v.path}`, v.body ?? {}), { success: 'Circuit mis à jour', invalidate: inv, onSuccess: () => { setDlg(null); setNote(''); } });
  if (r.error) return <Card><ErrorState error={r.error} /></Card>;
  if (!r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const f = r.data;
  const cur = f.steps.find((s: any) => s.seq === f.current_seq);
  const DLG: Record<string, [string, string, string, any]> = {
    advance: [cur?.department_code === 'direction' ? 'Transmettre la décision' : f.current_seq === f.steps.length ? 'Clore le circuit' : 'Transmettre à l’étape suivante', cur?.department_code === 'direction' ? 'Décision de la direction générale (obligatoire)' : 'Note de transmission', 'advance', { note }],
    close: ['Clore à la régie (sans retour au commercial)', 'Motif', 'advance', { note, close_here: true }],
    return: ['Retourner à l’étape précédente', 'Motif du retour (obligatoire)', 'return', { note }],
    cancel: ['Annuler le circuit', 'Motif de l’annulation (obligatoire)', 'cancel', { note }],
    comment: ['Ajouter un commentaire', 'Commentaire', 'comment', { note }],
    orient: ['Changer le service de fabrication', '', 'orient', { fabrication: fab }],
  };
  return (
    <>
      <PageHeader title={f.title} crumbs={[{ label: 'Circuits de production', to: '/circuits' }, { label: f.ref }]}
        subtitle={<>{f.itinerary_label} · lancé {relative(f.created_at)} · opportunité <Link to={`/opportunites/${f.opportunity.id}`}>{f.opportunity.ref}</Link> — {f.opportunity.organization_name}</>}
        actions={<Badge tone={ST[f.status][1]}>{ST[f.status][0]}</Badge>} />
      <Card title="Itinéraire" sub={f.itinerary_description}>
        <ol className="circ-steps">
          {f.steps.map((s: any) => (
            <li key={s.id} className={`circ-step st-${s.status}`} style={{ ['--dept' as any]: s.department_color }}>
              <span className="circ-step-icon" aria-hidden>{STEP_ICON[s.status]}</span>
              <span className="circ-step-main">
                <strong>{s.department_label}</strong><span className="small">{s.label}</span>
                <span className="xsmall muted">{s.status === 'termine' ? `Terminé ${relative(s.completed_at)}${s.assigned_name ? ` · ${s.assigned_name}` : ''}` : s.status === 'en_cours' ? `En cours depuis ${relative(s.started_at)}${s.assigned_name ? ` · pris en charge par ${s.assigned_name}` : ' · non pris en charge'}` : s.status === 'saute' ? 'Non nécessaire' : 'À venir'}</span>
                {s.work_order_ref && <Link className="xsmall" to={`/ordres-travail/${s.work_order_id}`}><ClipboardList size={12} /> {s.work_order_ref} · {s.work_order_status}</Link>}
                {s.note && <span className="xsmall">« {s.note} »</span>}
              </span>
            </li>
          ))}
        </ol>
        {f.status === 'en_cours' && (
          <div className="row-wrap" style={{ marginTop: 12 }}>
            {f.waiting_work_order && <Alert tone="info">Étape de production : le circuit avancera automatiquement à la clôture de l’ordre de travail {f.waiting_work_order}.</Alert>}
            {f.can_take && <Button icon={<UserCheck />} onClick={() => act.run({ path: 'take' })}>Prendre en charge</Button>}
            {f.can_act && !f.waiting_work_order && <Button variant="primary" icon={f.current_seq === f.steps.length ? <Flag /> : <ArrowRight />} onClick={() => setDlg('advance')}>{DLG.advance[0]}</Button>}
            {f.can_close_here && <Button icon={<Flag />} onClick={() => setDlg('close')}>Clore à la régie</Button>}
            {f.can_return && <Button icon={<Undo2 />} onClick={() => setDlg('return')}>Retourner</Button>}
            {f.can_orient && <Button icon={<Shuffle />} onClick={() => setDlg('orient')}>Changer d’atelier</Button>}
            <Button variant="ghost" icon={<MessageSquare />} onClick={() => setDlg('comment')}>Commenter</Button>
            {f.can_cancel && <Button variant="ghost" icon={<Ban />} onClick={() => setDlg('cancel')}>Annuler</Button>}
          </div>
        )}
      </Card>
      <div className="grid-2">
        <Card title="Brief"><p className="msg-body">{f.brief || <span className="muted">Aucun brief.</span>}</p><div className="xsmall muted"><PriorityBadge level={f.priority_level} legacy={f.priority} />{f.due_date ? ` · échéance ${date(f.due_date)}` : ''}{f.outcome ? ` · ${f.outcome}` : ''}</div></Card>
        <Card title={<><History size={16} /> Traçabilité des flux</>} sub="Journal inaltérable : chaque passage est horodaté et attribué">
          <ol className="circ-log">
            {f.events.map((e: any) => (
              <li key={e.id} className={`ev-${e.kind}`}>
                <span className="xsmall muted">{dateTime(e.created_at)}</span>
                <span className="small"><strong>{EVENT[e.kind] ?? e.kind}</strong>{e.from_label || e.to_label ? ` · ${[e.from_label, e.to_label].filter(Boolean).join(' → ')}` : ''}{e.user_name ? ` · ${e.user_name}` : ''}</span>
                {e.note && <span className="xsmall">{e.note}</span>}
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <Modal open={!!dlg} onClose={() => setDlg(null)} title={dlg ? DLG[dlg][0] : ''}
        footer={<><Button onClick={() => setDlg(null)}>Fermer</Button><Button variant={dlg === 'cancel' ? 'danger' : 'primary'} loading={act.isPending} onClick={() => dlg && act.run({ path: DLG[dlg][2], body: DLG[dlg][3] })}>Confirmer</Button></>}>
        {dlg === 'orient' ? <Field label="Service de fabrication"><Select value={fab} onChange={(e) => setFab(e.target.value)} options={[{ value: 'imprimerie', label: 'Imprimerie' }, { value: 'atelier', label: 'Atelier métallique' }, { value: 'cnc', label: 'CNC' }]} /></Field>
          : dlg && <Field label={DLG[dlg][1]} error={act.fieldErrors.note}><Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} autoFocus /></Field>}
        {act.error && !Object.keys(act.fieldErrors).length && <Alert tone="danger">{act.error.message}</Alert>}
      </Modal>
    </>
  );
}
