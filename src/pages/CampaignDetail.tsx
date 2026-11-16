import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Camera, CheckCircle2, ClipboardCheck, Flag, MapPin, Plus, Sparkles, Trash2, Wrench } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, ApiError, fileUrl, demoNotice } from '../lib/api';
import { useCan, useUsers } from '../lib/auth';
import { useToast } from '../lib/toast';
import { date, dateTime, money, pct } from '../lib/format';
import { COST_CATEGORY, CTASK_KIND } from '../lib/labels';
import { Alert, Badge, Button, Card, ConfirmModal, DataTable, Dl, Empty, ErrorState, Field, Input, Kpi, LoadingBlock, Modal, MoneyInput, PageHeader, Select, Status, Tabs, Textarea } from '../components/ui';
import { Documents } from '../components/Documents';
import { InterventionForm } from './Maintenance';
import { useAiPanel } from '../components/Layout';

const FLOW = ['preparation', 'production', 'pose', 'en_cours', 'depose', 'terminee'];

export default function CampaignDetail() {
  const { id } = useParams();
  const can = useCan();
  const users = useUsers();
  const toast = useToast();
  const ai = useAiPanel();
  const r = useApi<any>(['campaign', id], `/api/campaigns/${id}`);
  const [tab, setTab] = useState('execution');
  const [modal, setModal] = useState<string | null>(null);
  const [cost, setCost] = useState<any>(null);
  const [proof, setProof] = useState<any>({ kind: 'pose', status: 'conforme', face_id: '', comment: '' });
  const [res, setRes] = useState<any>({ face_id: '', start_date: '', end_date: '', reason: '' });
  const [conflict, setConflict] = useState<any[] | null>(null);
  const [bilan, setBilan] = useState<any>(null);
  const [blocked, setBlocked] = useState<any>(null);
  const [handover, setHandover] = useState<any>({ ops_owner_id: '', notes: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const inv = [['campaign', id], ['campaigns']];
  const upd = useAction((b: any) => api.patch(`/api/campaigns/${id}`, b), { success: 'Campagne mise à jour', invalidate: inv, onSuccess: () => setModal(null) });
  const accept = useAction(() => api.post(`/api/campaigns/${id}/accept`, { ops_owner_id: handover.ops_owner_id || null, notes: handover.notes || null }), { success: 'Passation acceptée — dossier pris en charge', invalidate: inv, onSuccess: () => setModal(null) });
  const task = useAction((t: any) => api.put(`/api/campaigns/${id}/tasks/${t.id}`, { kind: t.kind, label: t.label, due_date: t.due_date, assigned_to: t.assigned_to, provider: t.provider, status: t.status, comment: t.comment, face_id: t.face_id }), { success: 'Tâche mise à jour', invalidate: inv });
  const saveCost = useAction((c: any) => (c.id ? api.put(`/api/campaigns/${id}/costs/${c.id}`, c) : api.post(`/api/campaigns/${id}/costs`, c)), { success: 'Coût enregistré', invalidate: inv, onSuccess: () => setCost(null) });
  const reserve = useAction(async () => {
    try { return await api.post('/api/reservations', { campaign_id: id, face_id: res.face_id, start_date: res.start_date, end_date: res.end_date, status: 'reserve' }); }
    catch (e) { if ((e as ApiError).status === 409) setConflict((e as ApiError).details?.conflicts ?? []); throw e; }
  }, { success: 'Face réservée', invalidate: inv, onSuccess: () => setModal(null), silent: true });
  const derog = useAction(() => api.post('/api/reservations/derogation', { campaign_id: id, face_id: res.face_id, start_date: res.start_date, end_date: res.end_date, reason: res.reason }), { success: 'Demande de dérogation envoyée', invalidate: inv, onSuccess: () => { setModal(null); setConflict(null); } });
  const cancelRes = useAction((rid: string) => api.post(`/api/reservations/${rid}/cancel`), { success: 'Réservation annulée', invalidate: inv });
  const faces = useApi<any>(['faces-camp', id, res.start_date, res.end_date], modal === 'reserve' && res.start_date && res.end_date ? `/api/supports?from=${res.start_date}&to=${res.end_date}` : null);

  if (r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  if (r.error) return <Card><ErrorState error={r.error} /></Card>;
  const d = r.data; const c = d.campaign; const b = d.bilan;
  const canUpd = can('campaigns', 'update');
  const next = FLOW[FLOW.indexOf(c.status) + 1];
  const uploadProof = async (file: File) => {
    const fd = new FormData();
    fd.append('entity_type', 'campaign'); fd.append('entity_id', c.id); fd.append('kind', 'photo'); fd.append('file', file);
    const pos: GeolocationPosition | null = await new Promise((ok) => (navigator.geolocation ? navigator.geolocation.getCurrentPosition(ok, () => ok(null), { timeout: 4000 }) : ok(null)));
    if (pos) { fd.append('latitude', String(pos.coords.latitude)); fd.append('longitude', String(pos.coords.longitude)); }
    try {
      const doc = await api.upload('/api/documents', fd);
      await api.post(`/api/campaigns/${c.id}/proofs`, { ...proof, face_id: proof.face_id || null, document_id: doc.id, latitude: pos?.coords.latitude ?? null, longitude: pos?.coords.longitude ?? null, comment: proof.comment || null });
      toast('success', 'Preuve d’exécution enregistrée', pos ? 'Photo horodatée et géolocalisée' : 'Photo horodatée (localisation non autorisée)');
      setModal(null); r.refetch();
    } catch (e) { toast('error', 'Preuve non enregistrée', (e as ApiError).message); }
  };

  return (
    <>
      <PageHeader crumbs={[{ label: 'Campagnes', to: '/campagnes' }, { label: c.ref }]}
        title={<span className="row-wrap" style={{ gap: 10 }}>{c.name}<Status kind="campaign" code={c.status} /></span>}
        subtitle={<><Link to={`/organisations/${c.organization_id}`}>{c.organization_name}</Link> · {date(c.start_date)} → {date(c.end_date)}{c.contract_ref && <> · contrat <Link to={`/contrats/${c.contract_id}`}>{c.contract_ref}</Link></>}{c.opportunity_ref && <> · <Link to={`/opportunites/${c.opportunity_id}`}>{c.opportunity_ref}</Link></>}</>}
        actions={<>
          {can('ai') && <Button variant="soft" icon={<Sparkles />} onClick={() => ai.open({ context_type: 'campaign', context_id: c.id, prompt: 'Fais le point sur l’exécution de cette campagne' })}>Point IA</Button>}
          {c.status === 'a_accepter' && can('campaigns', 'validate') && <Button variant="primary" icon={<ClipboardCheck />} onClick={() => setModal('accept')}>Accepter la passation</Button>}
          {canUpd && next && c.status !== 'a_accepter' && <Button variant="primary" icon={<Flag />} loading={upd.isPending} onClick={() => upd.run({ status: next })}>Passer à « {({ production: 'Production', pose: 'Pose', en_cours: 'En cours', depose: 'Dépose', terminee: 'Terminée' } as any)[next]} »</Button>}
          {canUpd && c.status === 'terminee' && <Button variant="primary" icon={<CheckCircle2 />} onClick={() => { setBilan({ closing_report: c.closing_report ?? '', lessons: c.lessons ?? '', satisfaction: c.satisfaction ?? '' }); setModal('close'); }}>Bilan et clôture</Button>}
        </>} />
      {upd.error && <Alert tone="danger" title="Action impossible">{upd.error.message}</Alert>}
      {c.status === 'a_accepter' && (
        <Alert tone="warning" title="Passation en attente d’acceptation par les opérations">
          {c.handover_notes && <div style={{ whiteSpace: 'pre-wrap' }}>{c.handover_notes}</div>}
          {c.handover_missing?.length > 0 && <div>Informations manquantes signalées : <strong>{c.handover_missing.join(', ')}</strong></div>}
        </Alert>
      )}
      <div className="grid-4">
        <Kpi label="Exécution" value={b.execution_rate === null ? '—' : pct(b.execution_rate, 0)} progress={b.execution_rate} foot={<span>{b.faces_done}/{b.faces_planned} faces posées conformes</span>} />
        <Kpi label="Budget vendu" value={b.budget_ht === null ? '—' : money(b.budget_ht)} />
        <Kpi label="Coûts réels / prévus" value={b.cost_planned === null ? '—' : money(b.cost_actual)} foot={b.cost_planned !== null && <span>prévu {money(b.cost_planned)}{b.cost_actual > b.cost_planned ? ' · dépassement' : ''}</span>} action={b.cost_actual > b.cost_planned} />
        <Kpi label="Marge estimée" value={b.margin_estimated === null ? '—' : money(b.margin_estimated)} foot={b.margin_actual !== null && <span>sur coûts réels : {money(b.margin_actual)} · {b.incidents} incident(s)</span>} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'execution', label: 'Faces et preuves', count: d.reservations.length }, { id: 'tasks', label: 'Planning des tâches', count: d.tasks.length }, { id: 'costs', label: 'Coûts', count: d.costs.length }, { id: 'docs', label: 'Documents' }, { id: 'info', label: 'Dossier' }]} />
      {tab === 'execution' && (
        <div className="stack-lg">
          <Card title="Faces réservées" flush actions={canUpd && c.status !== 'a_accepter' && <>
            <Button size="sm" icon={<Camera />} onClick={() => setModal('proof')}>Ajouter une preuve</Button>
            <Button size="sm" icon={<Plus />} onClick={() => { setRes({ face_id: '', start_date: c.start_date, end_date: c.end_date, reason: '' }); setConflict(null); setModal('reserve'); }}>Réserver une face</Button></>}>
            <DataTable rows={d.reservations} empty={<Empty icon={<MapPin />} title="Aucune face réservée">Réservez les faces prévues au plan média ; les conflits sont bloqués automatiquement.</Empty>}
              columns={[
                { key: 'f', label: 'Face', render: (x: any) => <><div className="cell-title">{x.support_code}-{x.face_code}</div><div className="cell-sub">{x.support_name} · {x.commune}</div></> },
                { key: 'p', label: 'Période', render: (x: any) => <span className="small nowrap">{date(x.start_date)} → {date(x.end_date)}</span> },
                { key: 's', label: 'Réservation', render: (x: any) => <div className="row-wrap"><Status kind="face" code={x.status} />{x.derogation_reason && <Badge tone="warning">Dérogation</Badge>}</div> },
                { key: 'pr', label: 'Preuve de pose', render: (x: any) => { const p = d.proofs.find((y: any) => y.face_id === x.face_id && y.kind === 'pose'); return p ? <Badge tone={p.status === 'conforme' ? 'success' : 'danger'}>{p.status === 'conforme' ? `Conforme · ${date(p.taken_at)}` : p.status.replace('_', ' ')}</Badge> : <Badge tone="warning">Manquante</Badge>; } },
                { key: 'x', label: '', render: (x: any) => canUpd && <Button size="sm" variant="ghost" iconOnly aria-label="Annuler la réservation" icon={<Trash2 />} onClick={() => cancelRes.run(x.id)} /> },
              ]} />
          </Card>
          <Card title="Preuves d’exécution" sub="Photos horodatées, localisation si autorisée, statut et commentaire terrain">
            {!d.proofs.length ? <Empty icon={<Camera />} title="Aucune preuve" /> : (
              <div className="grid-3">{d.proofs.map((p: any) => (
                <figure key={p.id} className="card" style={{ margin: 0, overflow: 'hidden', boxShadow: 'none' }}>
                  {p.document_id && <a href={fileUrl(p.document_id) ?? '#'} onClick={(e) => { if (!fileUrl(p.document_id)) demoNotice(e); }} target="_blank" rel="noopener"><img src={fileUrl(p.document_id)} alt={`Preuve ${p.kind} ${p.support_code ?? ''}-${p.face_code ?? ''}`} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', background: 'var(--surface-sunken)' }} loading="lazy" /></a>}
                  <figcaption style={{ padding: 10 }} className="stack" >
                    <div className="row-wrap"><Badge tone={p.status === 'conforme' ? 'success' : 'danger'}>{p.status.replace('_', ' ')}</Badge><span className="xsmall strong">{p.kind}</span><span className="xsmall muted">{p.support_code ? `${p.support_code}-${p.face_code}` : ''}</span></div>
                    <div className="xsmall muted">{dateTime(p.taken_at)} · {p.created_by_name}{p.latitude ? ` · ${Number(p.latitude).toFixed(4)}, ${Number(p.longitude).toFixed(4)}` : ''}</div>
                    {p.comment && <div className="xsmall">{p.comment}</div>}
                  </figcaption>
                </figure>
              ))}</div>
            )}
          </Card>
          {(d.interventions.length > 0 || can('interventions', 'create')) && (
            <Card title="Incidents et interventions" flush actions={can('interventions', 'create') && <Button size="sm" icon={<Wrench />} onClick={() => setModal('ticket')}>Ouvrir un ticket</Button>}>
              <DataTable rows={d.interventions} empty={<Empty title="Aucun incident" />} columns={[
                { key: 't', label: 'Intervention', render: (x: any) => <Link to={`/maintenance/${x.id}`}>{x.ref} — {x.title}</Link> },
                { key: 's', label: 'Statut', render: (x: any) => <Status kind="intervention" code={x.status} /> },
                { key: 'p', label: 'Priorité', render: (x: any) => <Status kind="priority" code={x.priority} /> },
              ]} />
            </Card>
          )}
        </div>
      )}
      {tab === 'tasks' && (
        <Card flush>
          <DataTable rows={d.tasks} columns={[
            { key: 'k', label: 'Étape', render: (t: any) => <Badge tone="neutral" dot={false}>{CTASK_KIND[t.kind]}</Badge>, width: 110 },
            { key: 'l', label: 'Tâche', render: (t: any) => <><div className="cell-title">{t.label}</div>{t.comment && <div className="cell-sub">{t.comment}</div>}</> },
            { key: 'd', label: 'Échéance', render: (t: any) => <span className="small nowrap" style={t.due_date && t.due_date < new Date().toISOString().slice(0, 10) && !['termine', 'annule'].includes(t.status) ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{date(t.due_date)}</span> },
            { key: 'a', label: 'Responsable', render: (t: any) => canUpd ? <Select aria-label="Responsable" value={t.assigned_to ?? ''} onChange={(e) => task.run({ ...t, assigned_to: e.target.value || null })} placeholder="—" options={users.filter((u) => ['operations', 'technicien'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name }))} style={{ height: 30, width: 170 }} /> : <span className="small">{t.assigned_name ?? '—'}</span>, mobile: 'hide' },
            { key: 's', label: 'Statut', render: (t: any) => canUpd ? <Select aria-label="Statut" value={t.status} onChange={(e) => { const v = e.target.value; if (v === 'bloque') setBlocked(t); else task.run({ ...t, status: v }); }} options={[{ value: 'a_faire', label: 'À faire' }, { value: 'en_cours', label: 'En cours' }, { value: 'termine', label: 'Terminé' }, { value: 'bloque', label: 'Bloqué' }, { value: 'annule', label: 'Annulé' }]} style={{ height: 30, width: 130 }} /> : <Status kind="ctask" code={t.status} /> },
          ]} />
        </Card>
      )}
      {tab === 'costs' && (
        <Card flush title="Coûts prévus et réels" sub="Impression, production, pose, transport, maintenance, sous-traitance, redevances" actions={canUpd && <Button size="sm" icon={<Plus />} onClick={() => setCost({ category: 'impression', label: '', planned: null, actual: null, supplier: '' })}>Ajouter un coût</Button>}>
          <DataTable rows={d.costs} onRowClick={canUpd ? (x: any) => setCost(x) : undefined} empty={<Empty title="Aucun coût saisi">Les coûts réels sont obligatoires pour clôturer la campagne.</Empty>}
            columns={[
              { key: 'c', label: 'Poste', render: (x: any) => <><div className="cell-title">{x.label}</div><div className="cell-sub">{COST_CATEGORY[x.category]}{x.supplier ? ` · ${x.supplier}` : ''}</div></> },
              { key: 'p', label: 'Prévu', num: true, render: (x: any) => money(x.planned) },
              { key: 'a', label: 'Réel', num: true, render: (x: any) => x.actual === null ? <Badge tone="warning">À saisir</Badge> : money(x.actual) },
              { key: 'e', label: 'Écart', num: true, render: (x: any) => x.actual === null || x.planned === null ? '—' : <span style={{ color: x.actual > x.planned ? 'var(--danger)' : 'var(--success)' }}>{x.actual > x.planned ? '+' : ''}{money(x.actual - x.planned)}</span> },
            ]} />
        </Card>
      )}
      {tab === 'docs' && <Card><Documents entityType="campaign" entityId={c.id} canEdit={canUpd} kinds={['autre', 'photo', 'pv', 'attestation']} /></Card>}
      {tab === 'info' && (
        <div className="grid-2">
          <Card title="Dossier de campagne"><Dl items={[['Annonceur', c.organization_name], ['Objectifs', c.objectives], ['Création', c.creative_status], ['Responsable opérations', c.ops_owner_name], ['Commercial', c.sales_owner_name], ['Devis', c.quote_number ? `${c.quote_number} v${c.quote_version}` : null], ['Passation acceptée', c.handover_accepted_at ? `${dateTime(c.handover_accepted_at)} par ${c.handover_accepted_name}` : 'Non']]} />
            {canUpd && <div style={{ marginTop: 12 }}><Field label="Statut de la création"><Select value={c.creative_status} onChange={(e) => upd.run({ creative_status: e.target.value })} options={[{ value: 'attendue', label: 'Attendue' }, { value: 'recue', label: 'Reçue' }, { value: 'validee', label: 'Validée (BAT)' }, { value: 'imprimee', label: 'Imprimée' }]} /></Field></div>}</Card>
          <Card title="Notes de passation"><p className="small" style={{ whiteSpace: 'pre-wrap' }}>{c.handover_notes || '—'}</p>{c.closing_report && <><hr className="divider" /><div className="section-title">Bilan</div><p className="small" style={{ whiteSpace: 'pre-wrap' }}>{c.closing_report}</p><div className="small">Satisfaction client : {c.satisfaction ?? '—'}/5</div></>}</Card>
        </div>
      )}

      <Modal open={modal === 'accept'} onClose={() => setModal(null)} title="Accepter la passation" description="Vous prenez en charge l’exécution. Les tâches de lancement, création, impression, pose, contrôle, dépose et bilan sont attribuées au responsable."
        footer={<><Button onClick={() => setModal(null)}>Annuler</Button><Button variant="primary" loading={accept.isPending} onClick={() => accept.run(undefined)}>Accepter le dossier</Button></>}>
        <div className="stack">
          {c.handover_missing?.length > 0 && <Alert tone="warning">À compléter avec le commercial : {c.handover_missing.join(', ')}.</Alert>}
          <Field label="Responsable opérationnel" hint="Par défaut : vous"><Select value={handover.ops_owner_id} onChange={(e) => setHandover({ ...handover, ops_owner_id: e.target.value })} placeholder="—" options={users.filter((u) => u.role_code === 'operations').map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
          <Field label="Notes"><Textarea value={handover.notes} onChange={(e) => setHandover({ ...handover, notes: e.target.value })} /></Field>
        </div>
      </Modal>
      <Modal open={modal === 'reserve'} onClose={() => setModal(null)} size="lg" title="Réserver une face" description="La disponibilité est vérifiée sur la période ; une face déjà engagée ne peut être réservée qu’avec une dérogation approuvée."
        footer={<><Button onClick={() => setModal(null)}>Annuler</Button>
          {conflict ? <Button variant="primary" loading={derog.isPending} disabled={!res.reason.trim()} onClick={() => derog.run(undefined)}>Demander une dérogation</Button>
            : <Button variant="primary" loading={reserve.isPending} disabled={!res.face_id} onClick={() => reserve.run(undefined)}>Réserver</Button>}</>}>
        <div className="stack">
          <div className="form-grid">
            <Field label="Du"><Input type="date" value={res.start_date} onChange={(e) => { setRes({ ...res, start_date: e.target.value }); setConflict(null); }} /></Field>
            <Field label="Au"><Input type="date" value={res.end_date} onChange={(e) => { setRes({ ...res, end_date: e.target.value }); setConflict(null); }} /></Field>
          </div>
          <Field label="Face"><Select value={res.face_id} onChange={(e) => { setRes({ ...res, face_id: e.target.value }); setConflict(null); }} placeholder="Choisir…" options={(faces.data?.rows ?? []).flatMap((s: any) => s.faces.map((f: any) => ({ value: f.id, label: `${s.code}-${f.code} · ${s.name} — ${({ disponible: 'disponible', pre_reserve: 'pré-réservée', reserve: 'réservée', occupe: 'occupée', en_maintenance: 'en maintenance', indisponible: 'indisponible' } as any)[f.state]}` })))} /></Field>
          {conflict && <Alert tone="danger" title="Conflit de réservation"><ul>{conflict.map((x: any) => <li key={x.id}>{x.organization_name}{x.campaign_ref ? ` (${x.campaign_ref})` : ''} du {date(x.start_date)} au {date(x.end_date)}</li>)}</ul>Choisissez une autre face ou période, ou justifiez une dérogation (validée par la direction commerciale et tracée).</Alert>}
          {conflict && <Field label="Justification de la dérogation" required><Textarea value={res.reason} onChange={(e) => setRes({ ...res, reason: e.target.value })} /></Field>}
          {reserve.error && !conflict && <Alert tone="danger">{reserve.error.message}</Alert>}
        </div>
      </Modal>
      <Modal open={modal === 'proof'} onClose={() => setModal(null)} title="Ajouter une preuve d’exécution" description="Prenez la photo sur le terrain : elle est horodatée et, si vous l’autorisez, géolocalisée.">
        <div className="stack">
          <div className="form-grid">
            <Field label="Type"><Select value={proof.kind} onChange={(e) => setProof({ ...proof, kind: e.target.value })} options={[{ value: 'pose', label: 'Pose' }, { value: 'controle', label: 'Contrôle' }, { value: 'depose', label: 'Dépose' }, { value: 'incident', label: 'Incident' }]} /></Field>
            <Field label="Constat"><Select value={proof.status} onChange={(e) => setProof({ ...proof, status: e.target.value })} options={[{ value: 'conforme', label: 'Conforme' }, { value: 'non_conforme', label: 'Non conforme' }, { value: 'a_reprendre', label: 'À reprendre' }]} /></Field>
            <Field label="Face" className="span-2"><Select value={proof.face_id} onChange={(e) => setProof({ ...proof, face_id: e.target.value })} placeholder="—" options={d.reservations.map((x: any) => ({ value: x.face_id, label: `${x.support_code}-${x.face_code} · ${x.support_name}` }))} /></Field>
            <Field label="Commentaire terrain" required={proof.status !== 'conforme'} className="span-2"><Textarea value={proof.comment} onChange={(e) => setProof({ ...proof, comment: e.target.value })} /></Field>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && uploadProof(e.target.files[0])} />
          <Button variant="primary" size="lg" icon={<Camera />} disabled={(proof.status !== 'conforme' && !proof.comment.trim())} onClick={() => fileRef.current?.click()}>Prendre / choisir la photo</Button>
        </div>
      </Modal>
      <Modal open={!!cost} onClose={() => setCost(null)} title={cost?.id ? 'Modifier le coût' : 'Ajouter un coût'} footer={<><Button onClick={() => setCost(null)}>Annuler</Button><Button variant="primary" loading={saveCost.isPending} disabled={!cost?.label} onClick={() => saveCost.run({ ...cost, planned: cost.planned ?? 0 })}>Enregistrer</Button></>}>
        {cost && <div className="form-grid">
          <Field label="Catégorie"><Select value={cost.category} onChange={(e) => setCost({ ...cost, category: e.target.value })} options={Object.entries(COST_CATEGORY).map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="Fournisseur"><Input value={cost.supplier ?? ''} onChange={(e) => setCost({ ...cost, supplier: e.target.value })} /></Field>
          <Field label="Libellé" required className="span-2"><Input value={cost.label} onChange={(e) => setCost({ ...cost, label: e.target.value })} /></Field>
          <Field label="Montant prévu"><MoneyInput value={cost.planned} onChange={(v) => setCost({ ...cost, planned: v })} /></Field>
          <Field label="Montant réel"><MoneyInput value={cost.actual} onChange={(v) => setCost({ ...cost, actual: v })} /></Field>
        </div>}
      </Modal>
      <Modal open={modal === 'close'} onClose={() => setModal(null)} size="lg" title="Bilan et clôture de la campagne" description="La clôture exige une preuve de pose pour chaque face réservée et le montant réel de chaque coût. Une action de fidélisation est créée pour le commercial."
        footer={<><Button onClick={() => setModal(null)}>Annuler</Button><Button variant="primary" loading={upd.isPending} disabled={!bilan?.closing_report?.trim()} onClick={() => upd.run({ status: 'cloturee', closing_report: bilan.closing_report, lessons: bilan.lessons || undefined, satisfaction: bilan.satisfaction ? Number(bilan.satisfaction) : undefined })}>Clôturer</Button></>}>
        {bilan && <div className="stack">
          <Dl items={[['Faces livrées', `${b.faces_done}/${b.faces_planned}`], ['Coûts réels', money(b.cost_actual)], ['Marge réalisée', money(b.margin_actual)], ['Incidents', b.incidents]]} />
          <Field label="Bilan (supports livrés, périodes, écarts, incidents)" required><Textarea rows={5} value={bilan.closing_report} onChange={(e) => setBilan({ ...bilan, closing_report: e.target.value })} /></Field>
          <Field label="Enseignements pour les prochaines campagnes"><Textarea value={bilan.lessons} onChange={(e) => setBilan({ ...bilan, lessons: e.target.value })} /></Field>
          <Field label="Satisfaction client (1 à 5)"><Select value={String(bilan.satisfaction)} onChange={(e) => setBilan({ ...bilan, satisfaction: e.target.value })} placeholder="—" options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}/5` }))} /></Field>
          {upd.error && <Alert tone="danger">{upd.error.message}</Alert>}
        </div>}
      </Modal>
      {modal === 'ticket' && <InterventionForm open onClose={() => setModal(null)} preset={{ campaign_id: c.id, organization_id: c.organization_id, source: 'campagne' }} />}
      <ConfirmModal open={!!blocked} onClose={() => setBlocked(null)} title="Tâche bloquée" confirmLabel="Enregistrer" reason={{ label: 'Motif du blocage', required: true }}
        message={blocked?.label} onConfirm={(t) => { task.run({ ...blocked, status: 'bloque', comment: t }); setBlocked(null); }} />
    </>
  );
}
