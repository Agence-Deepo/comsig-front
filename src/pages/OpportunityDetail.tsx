import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Bell, CalendarPlus, CheckCircle2, ClipboardList, Edit3, FilePlus2, History, MessageSquarePlus, Sparkles, Megaphone, XCircle, PauseCircle, Trophy, AlertTriangle, RotateCcw , Workflow } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth, useCan, useLookups, useUsers } from '../lib/auth';
import { date, dateTime, money, pct, relative, addDays, today } from '../lib/format';
import { Alert, Badge, Button, ButtonLink, Card, DataTable, Dl, Empty, ErrorState, Field, Input, LoadingBlock, Modal, PageHeader, Select, Status, Tabs, Textarea } from '../components/ui';
import { ActivityForm, OpportunityForm } from '../components/forms';
import { StageMoveModal } from '../components/StageMove';
import { Documents } from '../components/Documents';
import { Timeline } from './OrganizationDetail';
import { useAiPanel } from '../components/Layout';

const FIELD_LABEL: Record<string, string> = { stage_code: 'Étape', amount: 'Montant', probability: 'Probabilité', owner_id: 'Responsable', expected_close_date: 'Date de clôture', estimated_margin_pct: 'Marge estimée' };

function BriefEditor({ d, canEdit }: { d: any; canEdit: boolean }) {
  const o = d.opportunity;
  const [brief, setBrief] = useState<Record<string, string>>(o.brief ?? {});
  useEffect(() => setBrief(o.brief ?? {}), [o.id]);
  const save = useAction((validate: boolean) => api.put(`/api/opportunities/${o.id}/brief`, { brief, validate }), { success: (r: any) => r.opportunity.brief_status === 'valide' ? 'Brief validé' : 'Brief enregistré', invalidate: [['opp', o.id]] });
  const req: string[] = d.brief_required;
  const missing = req.filter((k) => !brief[k]?.trim());
  return (
    <Card title="Brief de découverte" sub={`Checklist pour une offre « ${o.offer_type} » — ${req.length - missing.length}/${req.length} éléments obligatoires renseignés`} actions={<Status kind="brief" code={o.brief_status} />}
      footer={canEdit && <><Button loading={save.isPending && save.variables === false} onClick={() => save.run(false)}>Enregistrer</Button><Button variant="primary" disabled={missing.length > 0} loading={save.isPending && save.variables === true} onClick={() => save.run(true)}>Valider le brief avec le client</Button></>}>
      <div className="form-grid">
        {Object.entries(d.brief_fields as Record<string, string>).map(([k, l]) => (
          <Field key={k} label={l} required={req.includes(k)}>
            <Textarea rows={2} value={brief[k] ?? ''} disabled={!canEdit} onChange={(e) => setBrief({ ...brief, [k]: e.target.value })} invalid={req.includes(k) && !brief[k]?.trim() && o.brief_status === 'incomplet'} />
          </Field>
        ))}
      </div>
      {missing.length > 0 && <p className="xsmall muted" style={{ marginTop: 10 }}>Manquant pour valider : {missing.map((k) => d.brief_fields[k]).join(', ')}.</p>}
    </Card>
  );
}

function FeasibilityCard({ o, canEdit }: { o: any; canEdit: boolean }) {
  const users = useUsers();
  const [status, setStatus] = useState(o.feasibility_status);
  const [notes, setNotes] = useState(o.feasibility_notes ?? '');
  const [req, setReq] = useState(false);
  const [r, setR] = useState({ subject: 'Vérifier la disponibilité des supports et les contraintes de pose', assigned_to: '', due_date: addDays(today(), 3), expected: 'Disponibilités confirmées, coûts de pose et délais' });
  useEffect(() => { setStatus(o.feasibility_status); setNotes(o.feasibility_notes ?? ''); }, [o.id, o.feasibility_status]);
  const save = useAction(() => api.put(`/api/opportunities/${o.id}/feasibility`, { status, notes }), { success: 'Faisabilité mise à jour', invalidate: [['opp', o.id]] });
  const send = useAction(() => api.post(`/api/opportunities/${o.id}/internal-request`, r), { success: 'Demande interne envoyée', invalidate: [['opp', o.id]], onSuccess: () => setReq(false) });
  return (
    <Card title="Faisabilité et chiffrage" sub="Disponibilité des supports, contraintes, autorisations, coûts et délais" actions={<Status kind="feasibility" code={o.feasibility_status} />}
      footer={canEdit && <><Button onClick={() => setReq(true)}>Demande interne</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run(undefined)}>Enregistrer</Button></>}>
      <div className="form-grid">
        <Field label="Statut"><Select value={status} disabled={!canEdit} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'non_evaluee', label: 'Non évaluée' }, { value: 'en_cours', label: 'En cours de vérification' }, { value: 'confirmee', label: 'Confirmée' }, { value: 'avec_reserve', label: 'Confirmée avec réserve' }, { value: 'impossible', label: 'Impossible' }]} /></Field>
        <div className="xsmall muted" style={{ alignSelf: 'end' }}>Pour vérifier la disponibilité réelle, consultez le <Link to="/planning">planning des faces</Link>.</div>
        <Field label="Hypothèses, réserves, coûts" className="span-2" error={save.fieldErrors.notes}><Textarea value={notes} disabled={!canEdit} onChange={(e) => setNotes(e.target.value)} /></Field>
      </div>
      <Modal open={req} onClose={() => setReq(false)} title="Demande interne" description="Étude technique, vérification de disponibilité, autorisation municipale ou visite terrain : le responsable reçoit une tâche avec échéance."
        footer={<><Button onClick={() => setReq(false)}>Annuler</Button><Button variant="primary" loading={send.isPending} disabled={!r.assigned_to} onClick={() => send.run(undefined)}>Envoyer</Button></>}>
        <div className="form-grid">
          <Field label="Objet" required className="span-2"><Input value={r.subject} onChange={(e) => setR({ ...r, subject: e.target.value })} /></Field>
          <Field label="Responsable" required error={send.fieldErrors.assigned_to}><Select value={r.assigned_to} onChange={(e) => setR({ ...r, assigned_to: e.target.value })} placeholder="Choisir…" options={users.filter((u) => ['operations', 'technicien', 'finance', 'juridique', 'direction_commerciale'].includes(u.role_code)).map((u) => ({ value: u.id, label: `${u.full_name} — ${u.role_label}` }))} /></Field>
          <Field label="Échéance" required><Input type="date" value={r.due_date} onChange={(e) => setR({ ...r, due_date: e.target.value })} /></Field>
          <Field label="Résultat attendu" required className="span-2"><Textarea value={r.expected} onChange={(e) => setR({ ...r, expected: e.target.value })} /></Field>
        </div>
      </Modal>
    </Card>
  );
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const can = useCan();
  const { me } = useAuth();
  const ai = useAiPanel();
  const { label } = useLookups();
  const r = useApi<any>(['opp', id], `/api/opportunities/${id}`);
  const [tab, setTab] = useState('summary');
  const [modal, setModal] = useState<string | null>(null);
  const [move, setMove] = useState<string | null>(null);
  if (r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  const d = r.data;
  const o = d.opportunity;
  const stages = d.stages.filter((s: any) => !s.is_closed);
  const cur = d.stages.find((s: any) => s.code === o.stage_code);
  const canEdit = can('opportunities', 'update') && (!cur.is_closed || can('opportunities', 'validate'));
  const preset = { organization_id: o.organization_id, opportunity_id: o.id, contact_id: o.primary_contact_id ?? undefined };
  const openTasks = d.activities.filter((a: any) => ['a_faire', 'en_cours', 'reporte'].includes(a.status));

  return (
    <>
      <PageHeader crumbs={[{ label: 'Opportunités', to: '/opportunites' }, { label: o.ref }]}
        title={o.title}
        subtitle={<span className="row-wrap" style={{ gap: 10 }}><Link to={`/organisations/${o.organization_id}`}>{d.organization.legal_name}</Link><span>·</span><span>{label('offer_type', o.offer_type)}</span><span>·</span><span>{d.owner.full_name}</span>
          <Badge tone={cur.is_won ? 'success' : cur.is_closed ? 'neutral' : 'info'}>{cur.label}</Badge></span>}
        actions={<>
          {can('ai') && <Button variant="soft" icon={<Sparkles />} onClick={() => ai.open({ context_type: 'opportunity', context_id: o.id, prompt: 'Analyse cette opportunité' })}>Analyse IA</Button>}
          {canEdit && <Button icon={<Edit3 />} onClick={() => setModal('edit')}>Modifier</Button>}
          {!cur.is_closed && (me?.department_code === 'commercial' || me?.role_code === 'direction_generale') && <ButtonLink to={`/circuits?nouveau=${o.id}`} icon={<Workflow />}>Lancer un circuit</ButtonLink>}
          {!cur.is_closed && d.next_stage && canEdit && <Button variant="primary" icon={<ArrowRight />} onClick={() => setMove(d.next_stage.code)}>Passer à « {d.next_stage.label} »</Button>}
          {cur.is_closed && can('opportunities', 'validate') && <Button icon={<RotateCcw />} onClick={() => setMove('qualifie')}>Rouvrir</Button>}
        </>} />

      <Card>
        <div className="stepper" aria-label={`Étape actuelle : ${cur.label}`}>
          {stages.map((s: any) => {
            const state = cur.is_closed ? (cur.is_won ? 'done' : '') : s.sort_order < cur.sort_order ? 'done' : s.code === cur.code ? 'current' : '';
            return <div key={s.code} className={`step ${state}`} title={`${s.label} — ${s.probability} %`}><div className="step-bar" /><div className="step-label">{s.label}</div></div>;
          })}
        </div>
        {!cur.is_closed && canEdit && (
          <div className="row-wrap" style={{ marginTop: 14 }}>
            <span className="small muted">Clôturer :</span>
            <Button size="sm" icon={<Trophy />} onClick={() => setMove('gagne')}>Gagnée</Button>
            <Button size="sm" icon={<XCircle />} onClick={() => setMove('perdu')}>Perdue</Button>
            <Button size="sm" icon={<PauseCircle />} onClick={() => setMove('suspendu')}>Suspendue</Button>
            <span className="spacer" />
            <Select aria-label="Aller à une étape" value="" onChange={(e) => e.target.value && setMove(e.target.value)} placeholder="Autre étape…" options={stages.filter((s: any) => s.code !== o.stage_code).map((s: any) => ({ value: s.code, label: s.label }))} style={{ width: 200, height: 30 }} />
          </div>
        )}
        {cur.is_closed && (
          <div style={{ marginTop: 14 }}>
            {cur.is_won ? <Alert tone="success" title={`Gagnée le ${date(o.won_at)}`}>Preuve d’engagement : {({ devis_accepte: 'devis accepté', contrat_signe: 'contrat signé', bon_commande: 'bon de commande' } as any)[o.won_proof_type]}.{d.campaign && <> Dossier opérationnel : <Link to={`/campagnes/${d.campaign.id}`}>{d.campaign.ref}</Link> (<Status kind="campaign" code={d.campaign.status} />).</>}</Alert>
              : <Alert tone="warning" title={`${cur.label} le ${date(o.closed_at)}`}>Motif : {label('loss_reason', o.lost_reason)}{o.lost_comment ? ` — ${o.lost_comment}` : ''}{o.competitor ? ` · concurrent : ${o.competitor}` : ''}{o.reactivation_date ? ` · réactivation prévue le ${date(o.reactivation_date)}` : ''}</Alert>}
          </div>
        )}
      </Card>

      {d.pending_approval && <Alert tone="info" title="Dérogation en attente">{d.pending_approval.reason} — demandée {relative(d.pending_approval.requested_at)}.</Alert>}
      {d.duplicates.length > 0 && <Alert tone="warning" title="Opportunité similaire ouverte">{d.duplicates.map((x: any) => <span key={x.id}><Link to={`/opportunites/${x.id}`}>{x.ref} — {x.title}</Link> ({x.owner_name}) </span>)}</Alert>}

      {can('activities', 'create') && !cur.is_closed && (
        <div className="row-wrap" role="toolbar" aria-label="Actions rapides">
          <Button size="sm" icon={<MessageSquarePlus />} onClick={() => setModal('interaction')}>Consigner une interaction</Button>
          <Button size="sm" icon={<Bell />} onClick={() => setModal('relance')}>Programmer une relance</Button>
          <Button size="sm" icon={<CalendarPlus />} onClick={() => setModal('task')}>Créer une tâche</Button>
          {can('quotes', 'create') && <ButtonLink size="sm" to={`/devis/nouveau?opportunity=${o.id}`} icon={<FilePlus2 size={14} />}>Préparer une proposition</ButtonLink>}
          {can('quotes', 'create') && <ButtonLink size="sm" to={`/devis/nouveau?opportunity=${o.id}&type=proforma`} icon={<FilePlus2 size={14} />}>Facture proforma</ButtonLink>}
        </div>
      )}

      <div className="split">
        <div className="stack-lg" style={{ minWidth: 0 }}>
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'summary', label: 'Synthèse' }, { id: 'brief', label: 'Brief et faisabilité' }, { id: 'activities', label: 'Activités', count: d.activities.length },
            { id: 'quotes', label: 'Propositions', count: d.quotes.length, hidden: !can('quotes') }, { id: 'docs', label: 'Documents' }, { id: 'history', label: 'Historique', count: d.history.length },
          ]} />
          {tab === 'summary' && (
            <>
              {d.next_stage && !cur.is_closed && (
                <Card title={`Pour passer à « ${d.next_stage.label} »`} sub={d.next_stage.exit_criteria}>
                  {d.next_gates.length ? <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>{d.next_gates.map((g: any, i: number) => <li key={i}><span style={{ color: g.derogable ? 'var(--warning)' : 'var(--danger)' }}><AlertTriangle size={12} /></span> {g.message}</li>)}</ul>
                    : <div className="row small" style={{ color: 'var(--success)' }}><CheckCircle2 size={16} />Tous les critères sont remplis.</div>}
                </Card>
              )}
              <Card title="Besoin et prochaine étape">
                <div className="stack">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{o.need || <span className="muted">Besoin non décrit.</span>}</p>
                  <hr className="divider" />
                  <Dl items={[['Prochaine étape', o.next_step], ['Date prévue', o.next_step_date ? <>{date(o.next_step_date)} <span className="muted">({relative(o.next_step_date)})</span></> : null], ['Dernière activité', relative(o.last_activity_at)], ['Source', label('source', o.source)], ['Commune', label('commune', o.commune)], ['Support', label('support_type', o.support_type)]]} />
                </div>
              </Card>
              <Card title="Tâches ouvertes" flush>
                {openTasks.length ? <div className="card-body" style={{ paddingTop: 0 }}><Timeline items={openTasks} /></div> : <Empty icon={<ClipboardList />} title="Aucune tâche ouverte" action={can('activities', 'create') && !cur.is_closed && <Button size="sm" onClick={() => setModal('task')}>Planifier la prochaine action</Button>} />}
              </Card>
            </>
          )}
          {tab === 'brief' && <><BriefEditor d={d} canEdit={canEdit} /><FeasibilityCard o={o} canEdit={canEdit} /></>}
          {tab === 'activities' && <Card><Timeline items={d.activities} /></Card>}
          {tab === 'quotes' && (
            <Card flush actions={can('quotes', 'create') && !cur.is_closed && <ButtonLink size="sm" to={`/devis/nouveau?opportunity=${o.id}`} icon={<FilePlus2 size={14} />}>Nouvelle proposition</ButtonLink>}>
              <DataTable rows={d.quotes} onRowClick={(x: any) => nav(`/devis/${x.id}`)} empty={<Empty title="Aucune proposition">Préparez une proposition à partir du catalogue et de l’inventaire des supports.</Empty>}
                columns={[
                  { key: 'n', label: 'Devis', render: (x: any) => <><div className="cell-title">{x.number} v{x.version}</div><div className="cell-sub">{x.title}</div></> },
                  { key: 's', label: 'Statut', render: (x: any) => <Status kind="quote" code={x.status} /> },
                  { key: 't', label: 'Total HT', num: true, render: (x: any) => money(x.total_ht) },
                  { key: 'm', label: 'Marge', num: true, render: (x: any) => x.margin_pct === null ? '—' : pct(x.margin_pct), mobile: 'hide' },
                  { key: 'v', label: 'Validité', render: (x: any) => date(x.valid_until), mobile: 'hide' },
                ]} />
            </Card>
          )}
          {tab === 'docs' && <Card><Documents entityType="opportunity" entityId={o.id} canEdit={can('opportunities', 'update')} kinds={['autre', 'contrat', 'bon_commande', 'devis_accepte']} /></Card>}
          {tab === 'history' && (
            <Card title="Historique des changements" sub="Étape, montant, probabilité, responsable et date de clôture — avec dérogations">
              <div className="timeline">{d.history.map((h: any) => (
                <div key={h.id} className="tl-item"><span className="tl-icon"><History /></span>
                  <div><div className="tl-title">{FIELD_LABEL[h.field] ?? h.field} : {h.field === 'stage_code' ? `${d.stages.find((s: any) => s.code === h.old_value)?.label ?? '—'} → ${d.stages.find((s: any) => s.code === h.new_value)?.label}` : h.field === 'amount' ? `${money(Number(h.old_value))} → ${money(Number(h.new_value))}` : `${h.old_value ?? '—'} → ${h.new_value ?? '—'}`}</div>
                    <div className="tl-meta">{dateTime(h.changed_at)} · {h.changed_by_name ?? 'système'}</div>
                    {h.derogation && <div className="tl-body"><Badge tone="warning">Dérogation</Badge> {h.derogation}</div>}</div></div>
              ))}</div>
            </Card>
          )}
        </div>
        <div className="stack-lg">
          <Card title="Valeur">
            <div className="stack">
              <div><div className="xsmall muted">Montant estimé HT</div><div style={{ fontSize: 24, fontWeight: 620 }} className="num">{money(o.amount)}</div></div>
              <Dl items={[['Probabilité (étape)', `${o.probability} %`], ['Montant pondéré', money(o.weighted)], ['Marge estimée', o.estimated_margin_pct === null ? 'Non renseignée' : pct(o.estimated_margin_pct)], ['Clôture prévue', <span style={o.expected_close_date < today() && !cur.is_closed ? { color: 'var(--danger)' } : undefined}>{date(o.expected_close_date)}</span>]]} />
            </div>
          </Card>
          <Card title="Client">
            <div className="stack">
              <Link to={`/organisations/${o.organization_id}`} className="strong">{d.organization.legal_name}</Link>
              <Dl items={[['Secteur', label('sector', d.organization.sector)], ['Commune', label('commune', d.organization.commune)], ['Interlocuteur', d.contact ? `${d.contact.first_name} ${d.contact.last_name}` : <span style={{ color: 'var(--warning)' }}>Non désigné</span>], ['Fonction', d.contact?.job_title], ['E-mail', d.contact?.email ? <a href={`mailto:${d.contact.email}`}>{d.contact.email}</a> : null], ['Téléphone', d.contact?.mobile || d.contact?.phone]]} />
              {d.contact?.opt_out && <Badge tone="danger">Opposition aux sollicitations</Badge>}
            </div>
          </Card>
          {(d.campaign || d.contracts.length > 0) && (
            <Card title="Exécution">
              <div className="stack small">
                {d.contracts.map((c: any) => <Link key={c.id} to={`/contrats/${c.id}`} className="row"><Status kind="contract" code={c.status} />{c.ref} — {c.title}</Link>)}
                {d.campaign && <Link to={`/campagnes/${d.campaign.id}`} className="row"><Megaphone size={14} />{d.campaign.ref} · <Status kind="campaign" code={d.campaign.status} /></Link>}
              </div>
            </Card>
          )}
        </div>
      </div>

      <OpportunityForm open={modal === 'edit'} onClose={() => setModal(null)} initial={o} orgId={o.organization_id} />
      <ActivityForm open={modal === 'interaction'} onClose={() => setModal(null)} title="Consigner une interaction" preset={{ ...preset, kind: 'appel', status: 'termine' }} />
      <ActivityForm open={modal === 'relance'} onClose={() => setModal(null)} title="Programmer une relance" preset={{ ...preset, kind: 'relance', subject: `Relance — ${o.title}` }} />
      <ActivityForm open={modal === 'task'} onClose={() => setModal(null)} title="Créer une tâche" preset={{ ...preset, kind: 'tache' }} />
      <StageMoveModal opp={move ? o : null} target={move} stages={d.stages} onClose={() => setMove(null)} />
    </>
  );
}
