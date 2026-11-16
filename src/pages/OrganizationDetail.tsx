import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Bell, CalendarPlus, CheckSquare, Edit3, Mail, MessageSquarePlus, Phone, Plus, Sparkles, Trash2, UserPlus, Users, Kanban, Merge, Calendar, MapPin, Globe, StickyNote, Video, Footprints, ClipboardList } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan, useLookups } from '../lib/auth';
import { date, dateTime, money, moneyShort, relative, pct } from '../lib/format';
import { ACTIVITY_KIND, DECISION_ROLE } from '../lib/labels';
import { Alert, Avatar, Badge, Button, Card, ConfirmModal, DataTable, Dl, Empty, ErrorState, Field, Input, LoadingBlock, Modal, PageHeader, Select, Status, Tabs, Textarea } from '../components/ui';
import { ActivityForm, ContactForm, OpportunityForm, OrganizationForm } from '../components/forms';
import { Documents } from '../components/Documents';
import { useAiPanel } from '../components/Layout';

export const KIND_ICON: Record<string, JSX.Element> = { appel: <Phone />, email: <Mail />, reunion: <Video />, visite: <Footprints />, note: <StickyNote />, tache: <CheckSquare />, relance: <Bell />, demande_interne: <ClipboardList /> };

export function Timeline({ items, empty }: { items: any[]; empty?: string }) {
  if (!items.length) return <Empty icon={<Calendar />} title={empty ?? 'Aucune activité'}>Consignez les appels, réunions et visites pour constituer l’historique.</Empty>;
  return (
    <div className="timeline">
      {items.map((a) => (
        <div key={a.id} className="tl-item">
          <span className="tl-icon" aria-hidden>{KIND_ICON[a.kind] ?? <CheckSquare />}</span>
          <div style={{ minWidth: 0 }}>
            <div className="row-wrap"><span className="tl-title">{a.subject}</span><Status kind="activity" code={a.status} />{a.priority === 'haute' || a.priority === 'critique' ? <Status kind="priority" code={a.priority} /> : null}
              {a.contact_result && <Badge tone={a.contact_result === 'joint' ? 'success' : a.contact_result === 'refus' ? 'danger' : 'warning'} dot={false}>{({ joint: 'Joint', injoignable: 'Injoignable', refus: 'Refus' } as any)[a.contact_result]}</Badge>}</div>
            <div className="tl-meta">{ACTIVITY_KIND[a.kind]} · {a.status === 'termine' ? `fait ${dateTime(a.done_at)}` : `échéance ${dateTime(a.due_at)}`} · {a.assigned_name}{a.contact_name ? ` · avec ${a.contact_name}` : ''}{a.opportunity_ref ? ` · ${a.opportunity_ref}` : ''}{a.auto_rule ? ' · automatique' : ''}</div>
            {(a.outcome || a.body) && <div className="tl-body">{a.outcome || a.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

const QUALIF = [['activite', 'Activité vérifiée'], ['besoin', 'Besoin probable'], ['budget', 'Budget / capacité d’achat'], ['calendrier', 'Calendrier'], ['decideur', 'Décideur identifié'], ['processus', 'Processus de décision'], ['potentiel', 'Potentiel']];

function QualifyModal({ open, onClose, org }: { open: boolean; onClose: () => void; org: any }) {
  const { lookups } = useLookups();
  const [q, setQ] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('en_cours');
  const [reason, setReason] = useState('');
  useEffect(() => { if (open) { setQ(org.qualification ?? {}); setStatus(org.qualification_status === 'a_qualifier' ? 'en_cours' : org.qualification_status); setReason(org.disqualification_reason ?? ''); } }, [open]);
  const filled = QUALIF.filter(([k]) => q[k]?.trim()).length;
  const save = useAction((b: any) => api.post(`/api/organizations/${org.id}/qualify`, b), { success: 'Qualification enregistrée', invalidate: [['org', org.id], ['organizations']], onSuccess: onClose });
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Qualification du compte" description="Renseignez au moins 5 critères sur 7 pour qualifier le compte. Le score est calculé par le CRM."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ qualification: q, status, disqualification_reason: status === 'disqualifie' ? reason : null })}>Enregistrer</Button></>}>
      <div className="stack-lg">
        <div className="row"><div className="kpi-bar" style={{ flex: 1 }}><span style={{ width: `${(filled / 7) * 100}%` }} /></div><span className="small strong num">{Math.round((filled / 7) * 100)} %</span></div>
        <div className="form-grid">
          {QUALIF.map(([k, l]) => <Field key={k} label={l}><Input value={q[k] ?? ''} onChange={(e) => setQ({ ...q, [k]: e.target.value })} /></Field>)}
          <Field label="Statut de qualification" error={save.fieldErrors.status}><Select value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'en_cours', label: 'En cours' }, { value: 'qualifie', label: 'Qualifié' }, { value: 'en_veille', label: 'En veille' }, { value: 'disqualifie', label: 'Disqualifié' }]} /></Field>
          {status === 'disqualifie' && <Field label="Motif de disqualification" required error={save.fieldErrors.disqualification_reason}><Select value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Choisir…" options={(lookups.disqualification_reason ?? []).map((x) => ({ value: x.code, label: x.label }))} /></Field>}
        </div>
        {save.error && !save.error.fields && <Alert tone="danger">{save.error.message}</Alert>}
      </div>
    </Modal>
  );
}

export default function OrganizationDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const can = useCan();
  const ai = useAiPanel();
  const { label } = useLookups();
  const r = useApi<any>(['org', id], `/api/organizations/${id}`);
  const [tab, setTab] = useState<string>('overview');
  const [modal, setModal] = useState<null | 'edit' | 'contact' | 'opp' | 'qualify' | 'interaction' | 'task' | 'relance' | 'delete' | 'merge'>(null);
  const [contactEdit, setContactEdit] = useState<any>(null);
  const [mergeId, setMergeId] = useState(''); const [mergeWhy, setMergeWhy] = useState('');
  const del = useAction(() => api.del(`/api/organizations/${id}`), { success: 'Organisation placée dans la corbeille', onSuccess: () => nav('/organisations'), invalidate: [['organizations']] });
  const merge = useAction(() => api.post(`/api/organizations/${id}/merge`, { source_id: mergeId, justification: mergeWhy }), { success: 'Fusion effectuée et historisée', invalidate: [['org', id]], onSuccess: () => setModal(null) });
  useEffect(() => { if (sp.get('contact')) setTab('contacts'); }, [sp]);
  if (r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  const d = r.data;
  const o = d.organization;
  const openOpps = (d.opportunities ?? []).filter((x: any) => !x.is_closed);
  const nextTasks = (d.activities ?? []).filter((a: any) => ['a_faire', 'en_cours', 'reporte'].includes(a.status)).sort((a: any, b: any) => String(a.due_at).localeCompare(String(b.due_at)));
  const history = (d.activities ?? []).filter((a: any) => a.status === 'termine');
  const canEdit = can('organizations', 'update');

  return (
    <>
      <PageHeader crumbs={[{ label: o.kind === 'prospect' ? 'Prospection' : 'Clients et contacts', to: o.kind === 'prospect' ? '/prospection' : '/organisations' }, { label: o.ref }]}
        title={<span className="row-wrap" style={{ gap: 10 }}>{o.legal_name}<Status kind="org_kind" code={o.kind} /></span>}
        subtitle={<span className="row-wrap" style={{ gap: 12 }}>
          {o.trade_name && <span>{o.trade_name}</span>}<span>{label('sector', o.sector)}</span>
          <span className="row" style={{ gap: 4 }}><MapPin size={14} />{label('commune', o.commune)}, {o.city}</span>
          <span>Responsable : <strong>{o.owner?.full_name ?? 'non attribué'}</strong></span>
          {o.client_since && <span>Client depuis {date(o.client_since)}</span>}
        </span>}
        actions={<>
          {can('ai') && <Button variant="soft" icon={<Sparkles />} onClick={() => ai.open({ context_type: 'organization', context_id: o.id, prompt: 'Résume cette fiche client' })}>Synthèse IA</Button>}
          {canEdit && <Button icon={<Edit3 />} onClick={() => setModal('edit')}>Modifier</Button>}
          {can('opportunities', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setModal('opp')}>Nouvelle opportunité</Button>}
        </>} />

      {can('activities', 'create') && (
        <div className="row-wrap" role="toolbar" aria-label="Actions rapides">
          <Button size="sm" icon={<MessageSquarePlus />} onClick={() => setModal('interaction')}>Consigner une interaction</Button>
          <Button size="sm" icon={<Bell />} onClick={() => setModal('relance')}>Programmer une relance</Button>
          <Button size="sm" icon={<CalendarPlus />} onClick={() => setModal('task')}>Créer une tâche</Button>
          {canEdit && <Button size="sm" icon={<UserPlus />} onClick={() => { setContactEdit(null); setModal('contact'); }}>Ajouter un contact</Button>}
          {canEdit && o.kind === 'prospect' && <Button size="sm" icon={<CheckSquare />} onClick={() => setModal('qualify')}>Qualifier</Button>}
        </div>
      )}

      {d.alerts.length > 0 && <Alert tone={d.alerts.some((a: any) => a.severity === 'critique') ? 'danger' : 'warning'} title="Points d’attention"><ul>{d.alerts.map((a: any, i: number) => <li key={i}>{a.message}</li>)}</ul></Alert>}

      <div className="split">
        <div className="stack-lg" style={{ minWidth: 0 }}>
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'overview', label: 'Vue d’ensemble' },
            { id: 'activities', label: 'Historique', count: history.length },
            { id: 'contacts', label: 'Contacts', count: d.contacts.length },
            { id: 'opps', label: 'Opportunités', count: d.opportunities?.length, hidden: !d.opportunities },
            { id: 'quotes', label: 'Propositions', count: d.quotes?.length, hidden: !d.quotes },
            { id: 'contracts', label: 'Contrats', count: d.contracts?.length, hidden: !d.contracts },
            { id: 'campaigns', label: 'Campagnes', count: d.campaigns?.length, hidden: !d.campaigns },
            { id: 'service', label: 'Réclamations et factures', hidden: !d.complaints && !d.invoices },
            { id: 'docs', label: 'Documents' },
            { id: 'decisions', label: 'Décisions' },
          ]} />

          {tab === 'overview' && (
            <>
              <Card title="Opportunités en cours" flush actions={can('opportunities', 'create') && <Button size="sm" variant="ghost" icon={<Plus />} onClick={() => setModal('opp')}>Ajouter</Button>}>
                <DataTable rows={openOpps} onRowClick={(x: any) => nav(`/opportunites/${x.id}`)} empty={<Empty icon={<Kanban />} title="Aucune opportunité ouverte">Créez une opportunité dès qu’un besoin est identifié.</Empty>}
                  columns={[
                    { key: 't', label: 'Opportunité', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.ref} · {x.owner_name}</div></> },
                    { key: 's', label: 'Étape', render: (x: any) => <span className="small">{x.stage_label}</span> },
                    { key: 'a', label: 'Montant', num: true, render: (x: any) => moneyShort(x.amount) },
                    { key: 'n', label: 'Prochaine étape', render: (x: any) => <span className="small">{x.next_step ?? '—'}{x.next_step_date ? ` · ${date(x.next_step_date)}` : ''}</span>, mobile: 'hide' },
                  ]} />
              </Card>
              <Card title="Prochaines tâches" flush>
                {!nextTasks.length ? <Empty icon={<CalendarPlus />} title="Aucune action planifiée" action={can('activities', 'create') && <Button size="sm" onClick={() => setModal('task')}>Planifier la prochaine action</Button>}>Un compte sans prochaine action risque d’être oublié.</Empty>
                  : <div className="card-body" style={{ paddingTop: 0 }}><Timeline items={nextTasks.slice(0, 6)} /></div>}
              </Card>
              <Card title="Derniers échanges"><Timeline items={history.slice(0, 5)} empty="Aucun échange consigné" /></Card>
            </>
          )}
          {tab === 'activities' && <Card><Timeline items={d.activities ?? []} /></Card>}
          {tab === 'contacts' && (
            <Card flush title="Interlocuteurs" actions={canEdit && <Button size="sm" icon={<UserPlus />} onClick={() => { setContactEdit(null); setModal('contact'); }}>Ajouter</Button>}>
              <DataTable rows={d.contacts} empty={<Empty icon={<Users />} title="Aucun contact" />} rowClass={(c: any) => (sp.get('contact') === c.id ? 'highlight' : '')}
                columns={[
                  { key: 'n', label: 'Contact', render: (c: any) => <div className="row"><Avatar name={`${c.first_name} ${c.last_name}`} size="sm" /><div><div className="cell-title">{[c.civility, c.first_name, c.last_name].filter(Boolean).join(' ')}{c.is_primary && <Badge tone="primary" dot={false}> Principal</Badge>}</div><div className="cell-sub">{c.job_title ?? '—'}{c.department ? ` · ${c.department}` : ''}</div></div></div> },
                  { key: 'r', label: 'Rôle', render: (c: any) => c.decision_role ? DECISION_ROLE[c.decision_role] : '—', mobile: 'hide' },
                  { key: 'c', label: 'Coordonnées', render: (c: any) => <div className="small">{c.email && <div><a href={`mailto:${c.email}`}>{c.email}</a></div>}{(c.mobile || c.phone) && <div>{c.mobile || c.phone}</div>}</div> },
                  { key: 'p', label: 'Préférences', render: (c: any) => c.opt_out ? <Badge tone="danger">Opposition</Badge> : <span className="small muted">{c.preferred_channel ?? '—'}</span>, mobile: 'hide' },
                  { key: 'x', label: '', render: (c: any) => canEdit && <Button size="sm" variant="ghost" iconOnly aria-label="Modifier le contact" icon={<Edit3 />} onClick={() => { setContactEdit(c); setModal('contact'); }} /> },
                ]} />
            </Card>
          )}
          {tab === 'opps' && (
            <Card flush><DataTable rows={d.opportunities} onRowClick={(x: any) => nav(`/opportunites/${x.id}`)} empty={<Empty title="Aucune opportunité" />}
              columns={[
                { key: 't', label: 'Opportunité', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.ref}</div></> },
                { key: 's', label: 'Étape', render: (x: any) => <Badge tone={x.is_won ? 'success' : x.is_closed ? 'neutral' : 'info'}>{x.stage_label}</Badge> },
                { key: 'a', label: 'Montant', num: true, render: (x: any) => money(x.amount) },
                { key: 'd', label: 'Clôture', render: (x: any) => date(x.expected_close_date), mobile: 'hide' },
              ]} /></Card>
          )}
          {tab === 'quotes' && (
            <Card flush><DataTable rows={d.quotes} onRowClick={(x: any) => nav(`/devis/${x.id}`)} empty={<Empty title="Aucune proposition" />}
              columns={[
                { key: 'n', label: 'Devis', render: (x: any) => <><div className="cell-title">{x.number} v{x.version}</div><div className="cell-sub">{x.title}</div></> },
                { key: 's', label: 'Statut', render: (x: any) => <Status kind="quote" code={x.status} /> },
                { key: 'a', label: 'Total HT', num: true, render: (x: any) => money(x.total_ht) },
                { key: 'm', label: 'Marge', num: true, render: (x: any) => pct(x.margin_pct), mobile: 'hide' },
                { key: 'e', label: 'Envoyé', render: (x: any) => date(x.sent_at), mobile: 'hide' },
              ]} /></Card>
          )}
          {tab === 'contracts' && (
            <Card flush><DataTable rows={d.contracts} onRowClick={(x: any) => nav(`/contrats/${x.id}`)} empty={<Empty title="Aucun contrat" />}
              columns={[
                { key: 'n', label: 'Contrat', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.ref}{x.confidential ? ' · confidentiel' : ''}</div></> },
                { key: 's', label: 'Statut', render: (x: any) => <Status kind="contract" code={x.status} /> },
                { key: 'v', label: 'Valeur HT', num: true, render: (x: any) => money(x.value_ht) },
                { key: 'e', label: 'Échéance', render: (x: any) => date(x.end_date) },
              ]} /></Card>
          )}
          {tab === 'campaigns' && (
            <Card flush><DataTable rows={d.campaigns} onRowClick={(x: any) => nav(`/campagnes/${x.id}`)} empty={<Empty title="Aucune campagne" />}
              columns={[
                { key: 'n', label: 'Campagne', render: (x: any) => <><div className="cell-title">{x.name}</div><div className="cell-sub">{x.ref}</div></> },
                { key: 's', label: 'Statut', render: (x: any) => <Status kind="campaign" code={x.status} /> },
                { key: 'p', label: 'Période', render: (x: any) => <span className="small">{date(x.start_date)} → {date(x.end_date)}</span> },
              ]} /></Card>
          )}
          {tab === 'service' && (
            <div className="stack-lg">
              {d.complaints && <Card title="Réclamations" flush><DataTable rows={d.complaints} empty={<Empty title="Aucune réclamation" />} columns={[
                { key: 'r', label: 'Réclamation', render: (x: any) => <><div className="cell-title">{x.subject}</div><div className="cell-sub">{x.ref}</div></> },
                { key: 's', label: 'Statut', render: (x: any) => <Status kind="complaint" code={x.status} /> },
                { key: 'd', label: 'Échéance', render: (x: any) => date(x.due_date) },
              ]} /></Card>}
              {d.invoices && <Card title="Factures référencées" flush><DataTable rows={d.invoices} empty={<Empty title="Aucune facture" />} columns={[
                { key: 'n', label: 'Facture', render: (x: any) => <span className="cell-title">{x.number}</span> },
                { key: 'e', label: 'Échéance', render: (x: any) => date(x.due_date) },
                { key: 't', label: 'TTC', num: true, render: (x: any) => money(x.amount_ttc) },
                { key: 's', label: 'Statut', render: (x: any) => <Status kind="invoice" code={x.status} /> },
              ]} /></Card>}
            </div>
          )}
          {tab === 'docs' && <Card><Documents entityType="organization" entityId={o.id} canEdit={canEdit} /></Card>}
          {tab === 'decisions' && (
            <Card title="Historique des décisions" sub="Créations, modifications, changements d’étape, validations — issus du journal d’audit">
              {!d.decisions.length ? <Empty title="Aucune décision enregistrée" /> : <div className="timeline">{d.decisions.map((x: any, i: number) => (
                <div key={i} className="tl-item"><span className="tl-icon"><ClipboardList /></span><div><div className="tl-title">{x.summary}</div><div className="tl-meta">{dateTime(x.at)} · {x.user_label}</div></div></div>
              ))}</div>}
            </Card>
          )}
        </div>

        <div className="stack-lg">
          <Card title="Coordonnées">
            <Dl items={[
              ['Référence', o.ref], ['Personne ressource', o.resource_person ? <>{o.resource_person}{o.resource_title ? <span className="muted"> — {o.resource_title}</span> : null}</> : null], ['Identifiant', o.legal_id], ['Structure', label('structure_type', o.structure_type)], ['Taille', o.size], ['Potentiel', o.potential],
              ['Téléphone', o.phone ? <a href={`tel:${o.phone}`}>{o.phone}</a> : null], ['E-mail', o.email ? <a href={`mailto:${o.email}`}>{o.email}</a> : null],
              ['Site web', o.website ? <span className="row" style={{ gap: 4 }}><Globe size={13} />{o.website}</span> : null], ['Adresse', o.address], ['Source', label('source', o.source)],
              ['Dernière activité', o.last_activity_at ? relative(o.last_activity_at) : 'Aucune'],
            ]} />
            {o.tags?.length > 0 && <div className="row-wrap" style={{ marginTop: 12 }}>{o.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}</div>}
            {o.notes && <p className="small secondary" style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{o.notes}</p>}
          </Card>
          <Card title="Qualification" actions={canEdit && <Button size="sm" variant="ghost" onClick={() => setModal('qualify')}>Mettre à jour</Button>}>
            <div className="stack">
              <div className="row"><Status kind="qualification" code={o.qualification_status} /><span className="spacer" /><span className="strong num">{o.qualification_score} %</span></div>
              <div className="kpi-bar"><span style={{ width: `${o.qualification_score}%` }} /></div>
              <Dl items={QUALIF.map(([k, l]) => [l, o.qualification?.[k] || <span className="muted">Non renseigné</span>])} />
            </div>
          </Card>
          {(can('quotes') || can('quotes', 'validate')) && <PricingCard orgId={o.id} />}
          <Card title="Contacts" flush actions={canEdit && <Button size="sm" variant="ghost" iconOnly aria-label="Ajouter un contact" icon={<UserPlus />} onClick={() => { setContactEdit(null); setModal('contact'); }} />}>
            {!d.contacts.length ? <Empty icon={<Users />} title="Aucun contact" /> : <div className="list">{d.contacts.slice(0, 5).map((c: any) => (
              <div key={c.id} className="list-item"><Avatar name={`${c.first_name} ${c.last_name}`} />
                <div style={{ minWidth: 0 }}><div className="small strong">{c.first_name} {c.last_name}</div><div className="xsmall muted">{c.job_title ?? '—'}{c.decision_role ? ` · ${DECISION_ROLE[c.decision_role]}` : ''}</div>
                  <div className="xsmall">{c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}</div>{c.opt_out && <Badge tone="danger">Opposition</Badge>}</div></div>
            ))}</div>}
          </Card>
          {(can('organizations', 'delete')) && (
            <Card title="Gestion de la fiche">
              <div className="stack">
                <Button size="sm" icon={<Merge />} onClick={() => setModal('merge')}>Fusionner un doublon dans cette fiche</Button>
                <Button size="sm" variant="ghost" icon={<Trash2 />} onClick={() => setModal('delete')} style={{ color: 'var(--danger)' }}>Mettre à la corbeille</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <OrganizationForm open={modal === 'edit'} onClose={() => setModal(null)} initial={o} />
      <ContactForm open={modal === 'contact'} onClose={() => setModal(null)} orgId={o.id} initial={contactEdit} />
      <OpportunityForm open={modal === 'opp'} onClose={() => setModal(null)} orgId={o.id} />
      <QualifyModal open={modal === 'qualify'} onClose={() => setModal(null)} org={o} />
      <ActivityForm open={modal === 'interaction'} onClose={() => setModal(null)} title="Consigner une interaction" preset={{ organization_id: o.id, kind: 'appel', status: 'termine' }} />
      <ActivityForm open={modal === 'task'} onClose={() => setModal(null)} title="Créer une tâche" preset={{ organization_id: o.id, kind: 'tache' }} />
      <ActivityForm open={modal === 'relance'} onClose={() => setModal(null)} title="Programmer une relance" preset={{ organization_id: o.id, kind: 'relance', subject: `Relance ${o.legal_name}` }} />
      <ConfirmModal open={modal === 'delete'} onClose={() => setModal(null)} danger title="Mettre cette fiche à la corbeille ?" confirmLabel="Mettre à la corbeille" loading={del.isPending} onConfirm={() => del.run(undefined)}
        message={<>La fiche « {o.legal_name} » ne sera plus visible. Un administrateur peut la restaurer. La suppression est refusée tant que des opportunités ouvertes ou des contrats actifs y sont liés.{del.error && <Alert tone="danger">{del.error.message}</Alert>}</>} />
      <Modal open={modal === 'merge'} onClose={() => setModal(null)} title="Fusionner un doublon" description={`La fiche choisie sera fusionnée dans « ${o.legal_name} » : contacts, opportunités, activités, devis, contrats et campagnes seront rattachés à cette fiche. L’opération est historisée.`}
        footer={<><Button onClick={() => setModal(null)}>Annuler</Button><Button variant="primary" loading={merge.isPending} disabled={!mergeId || !mergeWhy.trim()} onClick={() => merge.run(undefined)}>Fusionner</Button></>}>
        <MergePicker orgId={o.id} name={o.legal_name} value={mergeId} onChange={setMergeId} />
        <Field label="Justification" required><Textarea value={mergeWhy} onChange={(e) => setMergeWhy(e.target.value)} placeholder="Ex. : même entité juridique (RCCM identique)" /></Field>
        {merge.error && <Alert tone="danger">{merge.error.message}</Alert>}
      </Modal>
    </>
  );
}

function MergePicker({ orgId, name, value, onChange }: { orgId: string; name: string; value: string; onChange: (v: string) => void }) {
  const [q, setQ] = useState(name.split(' ')[0]);
  const r = useApi<any>(['org-merge', q], `/api/organizations?pageSize=20&q=${encodeURIComponent(q)}`);
  return (
    <div className="stack" style={{ marginBottom: 12 }}>
      <Field label="Rechercher la fiche en doublon"><Input value={q} onChange={(e) => setQ(e.target.value)} /></Field>
      <Select aria-label="Fiche à fusionner" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Choisir la fiche à absorber…" options={(r.data?.rows ?? []).filter((x: any) => x.id !== orgId).map((x: any) => ({ value: x.id, label: `${x.legal_name} (${x.ref})` }))} />
    </div>
  );
}

/** Conditions tarifaires : catégorie du client et taux de marge appliqué au coût dans les devis et proformas. */
function PricingCard({ orgId }: { orgId: string }) {
  const can = useCan();
  const { lookups, label } = useLookups();
  const r = useApi<any>(['org-pricing', orgId], `/api/organizations/${orgId}/pricing`);
  const [edit, setEdit] = useState<any>(null);
  const save = useAction((b: any) => api.put(`/api/organizations/${orgId}/pricing`, b), { success: 'Conditions tarifaires enregistrées', invalidate: [['org-pricing', orgId]], onSuccess: () => setEdit(null) });
  const manage = can('quotes', 'validate') || can('opportunities', 'validate');
  const p = r.data;
  return (
    <Card title="Conditions tarifaires" sub="Taux appliqué au coût : prix = coût × (1 + taux)" actions={manage && p && <Button size="sm" variant="ghost" onClick={() => setEdit({ pricing_tier: p.tier, custom: p.source === 'client', markup_pct: p.markup_pct })}>Modifier</Button>}>
      {!p ? <LoadingBlock rows={2} /> : <Dl items={[['Catégorie', label('pricing_tier', p.tier)], ['Taux de marge', <strong>{p.markup_pct} %</strong>], ['Origine', p.source === 'client' ? 'Taux propre au client' : `Taux de la catégorie (${p.tier_markup_pct} %)`]]} />}
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Conditions tarifaires du client" description="Le taux proposé par défaut dans les devis et proformas de ce client. Les seuils de marge déclenchent toujours les validations."
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ pricing_tier: edit.pricing_tier, markup_pct: edit.custom ? Number(edit.markup_pct) : null })}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Catégorie tarifaire"><Select value={edit.pricing_tier} onChange={(e) => setEdit({ ...edit, pricing_tier: e.target.value })} options={(lookups.pricing_tier ?? []).map((x) => ({ value: x.code, label: x.label }))} /></Field>
          <Field label="Taux propre au client"><label className="checkbox"><input type="checkbox" checked={edit.custom} onChange={(e) => setEdit({ ...edit, custom: e.target.checked })} />Remplacer le taux de la catégorie</label></Field>
          {edit.custom && <Field label="Taux de marge (%)" error={save.fieldErrors.markup_pct}><Input type="number" min={0} max={500} step="0.5" value={edit.markup_pct} onChange={(e) => setEdit({ ...edit, markup_pct: e.target.value })} /></Field>}
        </div>}
      </Modal>
    </Card>
  );
}
