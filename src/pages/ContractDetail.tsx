import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Edit3, FilePlus2, Lock, PenTool, Plus, RefreshCw, ScrollText, Send, ShieldCheck, Sparkles, XOctagon } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth, useCan } from '../lib/auth';
import { date, money, today } from '../lib/format';
import { CONTRACT_KIND } from '../lib/labels';
import { Alert, Badge, Button, Card, ConfirmModal, DataTable, Dl, Empty, ErrorState, Field, Input, LoadingBlock, Modal, PageHeader, Select, Status, Textarea } from '../components/ui';
import { Documents } from '../components/Documents';
import { ContractForm } from './Contracts';
import { useAiPanel } from '../components/Layout';

const ITEM_KIND: Record<string, string> = { piece: 'Pièce', livrable: 'Livrable', caution: 'Caution', garantie: 'Garantie', pv: 'Procès-verbal', attestation: 'Attestation' };
const ITEM_STATUS: Record<string, [string, any]> = { attendu: ['Attendu', 'info'], recu: ['Reçu', 'primary'], valide: ['Validé', 'success'], en_retard: ['En retard', 'danger'], sans_objet: ['Sans objet', 'neutral'] };

export default function ContractDetail() {
  const { id } = useParams();
  const can = useCan();
  const { me } = useAuth();
  const ai = useAiPanel();
  const r = useApi<any>(['contract', id], `/api/contracts/${id}`);
  const [modal, setModal] = useState<string | null>(null);
  const [amend, setAmend] = useState<any>({ title: '', description: '', value_delta: null, new_end_date: '' });
  const [item, setItem] = useState<any>({ kind: 'piece', label: '', due_date: '' });
  const [comment, setComment] = useState('');
  const flow = useAction((b: any) => api.post(`/api/contracts/${id}/workflow`, b), { success: 'Contrat mis à jour', invalidate: [['contract', id], ['contracts']], onSuccess: () => { setModal(null); setComment(''); } });
  const addAmend = useAction(() => api.post(`/api/contracts/${id}/amendments`, { ...amend, value_delta: amend.value_delta ?? 0, new_end_date: amend.new_end_date || null }), { success: 'Avenant créé', invalidate: [['contract', id]], onSuccess: () => setModal(null) });
  const signAmend = useAction((aid: string) => api.post(`/api/amendments/${aid}/sign`), { success: 'Avenant signé : valeur et échéance mises à jour', invalidate: [['contract', id]] });
  const addItem = useAction(() => api.post(`/api/contracts/${id}/items`, { ...item, due_date: item.due_date || null }), { success: 'Pièce ajoutée', invalidate: [['contract', id]], onSuccess: () => setModal(null) });
  const updItem = useAction((x: any) => api.put(`/api/contracts/${id}/items/${x.id}`, { kind: x.kind, label: x.label, due_date: x.due_date, status: x.status }), { success: 'Pièce mise à jour', invalidate: [['contract', id]] });
  if (r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  if (r.error) return <Card><ErrorState error={r.error} /></Card>;
  const d = r.data; const c = d.contract;
  const run = (action: string, extra: any = {}) => flow.run({ action, comment: comment || null, ...extra });
  const signed = ['signe', 'actif', 'a_renouveler'].includes(c.status);
  const reviewer = (me?.role_code === 'juridique' || me?.role_code === 'direction_generale') && c.legal_review === 'a_faire';
  const finReviewer = (me?.role_code === 'finance' || me?.role_code === 'direction_generale') && c.finance_review === 'a_faire';
  return (
    <>
      <PageHeader crumbs={[{ label: 'Contrats', to: '/contrats' }, { label: c.ref }]}
        title={<span className="row-wrap" style={{ gap: 10 }}>{c.confidential && <Lock size={20} aria-label="Confidentiel" />}{c.title}<Status kind="contract" code={c.status} /></span>}
        subtitle={<><Link to={`/organisations/${c.organization_id}`}>{d.organization.legal_name}</Link> · {CONTRACT_KIND[c.kind]} · responsable {d.owner.full_name}</>}
        actions={<>
          {can('ai') && <Button variant="soft" icon={<Sparkles />} onClick={() => ai.open({ context_type: 'contract', context_id: c.id, prompt: 'Résume les obligations et échéances de ce contrat' })}>Résumé IA</Button>}
          {can('contracts', 'update') && <Button icon={<Edit3 />} onClick={() => setModal('edit')}>Modifier</Button>}
          {c.status === 'brouillon' && can('contracts', 'update') && <Button variant="primary" icon={<Send />} loading={flow.isPending} onClick={() => run('soumettre_revue')}>Soumettre en revue</Button>}
          {c.status === 'en_revue' && can('contracts', 'validate') && <Button variant="primary" icon={<ShieldCheck />} loading={flow.isPending} onClick={() => run('valider')}>Valider pour signature</Button>}
          {c.status === 'valide' && can('contracts', 'update') && <Button variant="primary" icon={<PenTool />} onClick={() => setModal('sign')}>Marquer comme signé</Button>}
          {signed && can('contracts', 'update') && <Button icon={<FilePlus2 />} onClick={() => setModal('amend')}>Avenant</Button>}
        </>} />
      {flow.error && <Alert tone="danger" title="Action impossible">{flow.error.message}</Alert>}
      {signed && c.days_to_end <= 120 && !c.renewal_decision && (
        <Alert tone={c.days_to_end <= 30 ? 'danger' : 'warning'} title={`Échéance dans ${c.days_to_end} jours (${date(c.end_date)})`}
          action={can('contracts', 'update') && <Select aria-label="Décision de renouvellement" value="" onChange={(e) => e.target.value && run('decision_renouvellement', { renewal_decision: e.target.value })} placeholder="Décision…" options={[{ value: 'renouveler', label: 'Renouveler' }, { value: 'renegocier', label: 'Renégocier' }, { value: 'ne_pas_renouveler', label: 'Ne pas renouveler' }]} style={{ width: 170 }} />}>
          Préavis : {c.notice_days} jours. L’alerte reste active jusqu’à la décision de renouvellement.
        </Alert>
      )}
      {c.renewal_decision === 'renouveler' && signed && can('contracts', 'create') && <Alert tone="info" title="Décision : renouveler" action={<Button size="sm" icon={<RefreshCw />} onClick={() => run('renouveler')}>Créer le contrat de renouvellement</Button>}>Un nouveau contrat brouillon reprendra les conditions et repassera par les revues.</Alert>}
      {c.status === 'en_revue' && (
        <Card title="Revues avant signature">
          <div className="grid-2">
            <div className="stack"><div className="row"><strong className="small">Revue juridique</strong><Status kind="review" code={c.legal_review} /></div>
              {reviewer && <><Textarea placeholder="Commentaire (commencez par « Réserve » pour émettre une réserve)" value={comment} onChange={(e) => setComment(e.target.value)} /><Button size="sm" variant="primary" icon={<CheckCircle2 />} onClick={() => run('revue_juridique')}>Enregistrer la revue juridique</Button></>}</div>
            <div className="stack"><div className="row"><strong className="small">Revue financière</strong><Status kind="review" code={c.finance_review} /></div>
              {finReviewer && <><Textarea placeholder="Commentaire" value={comment} onChange={(e) => setComment(e.target.value)} /><Button size="sm" variant="primary" icon={<CheckCircle2 />} onClick={() => run('revue_financiere')}>Enregistrer la revue financière</Button></>}</div>
          </div>
        </Card>
      )}
      <div className="split">
        <div className="stack-lg" style={{ minWidth: 0 }}>
          <Card title="Objet et obligations"><div className="stack small"><p style={{ whiteSpace: 'pre-wrap' }}>{c.object || <span className="muted">Non renseigné</span>}</p>
            {c.obligations && <><div className="section-title">Obligations</div><p style={{ whiteSpace: 'pre-wrap' }}>{c.obligations}</p></>}
            {c.special_conditions && <><div className="section-title">Conditions particulières</div><p style={{ whiteSpace: 'pre-wrap' }}>{c.special_conditions}</p></>}</div></Card>
          <Card title="Pièces, livrables et garanties" flush actions={can('contracts', 'update') && <Button size="sm" variant="ghost" icon={<Plus />} onClick={() => setModal('item')}>Ajouter</Button>}>
            <DataTable rows={d.items} empty={<Empty icon={<ScrollText />} title="Aucune pièce suivie">Suivez attestations, PV, cautions et livrables avec leur échéance.</Empty>}
              columns={[
                { key: 'l', label: 'Pièce', render: (x: any) => <><div className="cell-title">{x.label}</div><div className="cell-sub">{ITEM_KIND[x.kind]}</div></> },
                { key: 'd', label: 'Échéance', render: (x: any) => <span className="small" style={x.due_date && x.due_date < today() && ['attendu', 'en_retard'].includes(x.status) ? { color: 'var(--danger)' } : undefined}>{date(x.due_date)}</span> },
                { key: 's', label: 'Statut', render: (x: any) => can('contracts', 'update') ? <Select aria-label="Statut de la pièce" value={x.status} onChange={(e) => updItem.run({ ...x, status: e.target.value })} options={Object.entries(ITEM_STATUS).map(([value, [label]]) => ({ value, label }))} style={{ height: 30, width: 140 }} /> : <Badge tone={ITEM_STATUS[x.status][1]}>{ITEM_STATUS[x.status][0]}</Badge> },
              ]} />
          </Card>
          <Card title="Avenants" flush>
            <DataTable rows={d.amendments} empty={<Empty title="Aucun avenant">Après signature, tout changement de périmètre passe par un avenant.</Empty>}
              columns={[
                { key: 'n', label: 'N°', render: (x: any) => x.number, width: 50 },
                { key: 't', label: 'Avenant', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.description}</div></> },
                { key: 'v', label: 'Impact HT', num: true, render: (x: any) => (x.value_delta >= 0 ? '+' : '') + money(x.value_delta) },
                { key: 'e', label: 'Nouvelle échéance', render: (x: any) => date(x.new_end_date) },
                { key: 's', label: 'Statut', render: (x: any) => x.status === 'signe' ? <Badge tone="success">Signé</Badge> : can('contracts', 'validate') ? <Button size="sm" onClick={() => signAmend.run(x.id)}>Signer</Button> : <Badge>{x.status}</Badge> },
              ]} />
          </Card>
          <Card title="Documents" sub={c.confidential ? 'Documents confidentiels : consultation journalisée' : undefined}><Documents entityType="contract" entityId={c.id} canEdit={can('contracts', 'update')} kinds={['contrat', 'attestation', 'pv', 'autre']} /></Card>
        </div>
        <div className="stack-lg">
          <Card title="Conditions"><Dl items={[['Référence', c.ref], ['Valeur HT', <strong>{money(c.value_ht)}</strong>], ['Début', date(c.start_date)], ['Fin', date(c.end_date)], ['Renouvellement', c.renewal === 'tacite' ? 'Tacite reconduction' : c.renewal === 'manuel' ? 'Sur décision' : 'Aucun'], ['Préavis', `${c.notice_days} jours`], ['Paiement', c.payment_terms], ['Exclusivité', c.exclusivity ? 'Oui' : 'Non'], ['Signé le', date(c.signed_at)], ['Revue juridique', <Status kind="review" code={c.legal_review} />], ['Revue financière', <Status kind="review" code={c.finance_review} />]]} /></Card>
          {(d.quote || d.campaigns.length > 0) && <Card title="Liens"><div className="stack small">{d.quote && <Link to={`/devis/${d.quote.id}`}>Devis {d.quote.number} v{d.quote.version} — {money(d.quote.total_ht)}</Link>}{d.campaigns.map((x: any) => <Link key={x.id} to={`/campagnes/${x.id}`}>{x.ref} — {x.name}</Link>)}</div></Card>}
          {d.invoices.length > 0 && <Card title="Facturation"><div className="stack small">{d.invoices.map((i: any) => <div key={i.id} className="row"><span>{i.number}</span><span className="spacer" />{money(i.amount_ttc)} <Status kind="invoice" code={i.status} /></div>)}</div></Card>}
          {signed && can('contracts', 'validate') && <Button variant="ghost" icon={<XOctagon />} style={{ color: 'var(--danger)' }} onClick={() => setModal('terminate')}>Résilier le contrat</Button>}
        </div>
      </div>
      {modal === 'edit' && <ContractForm open onClose={() => setModal(null)} initial={c} />}
      <ConfirmModal open={modal === 'sign'} onClose={() => setModal(null)} title="Marquer le contrat comme signé" confirmLabel="Confirmer la signature" loading={flow.isPending} onConfirm={() => run('signer')}
        message="Joignez d’abord l’exemplaire signé (document de type « Contrat signé »). Après signature, toute modification passe par un avenant." />
      <ConfirmModal open={modal === 'terminate'} onClose={() => setModal(null)} danger title="Résilier ce contrat ?" confirmLabel="Résilier" reason={{ label: 'Motif de résiliation', required: true }} loading={flow.isPending} onConfirm={(t) => flow.run({ action: 'resilier', comment: t })} message="La résiliation est définitive et journalisée." />
      <Modal open={modal === 'amend'} onClose={() => setModal(null)} title="Nouvel avenant" footer={<><Button onClick={() => setModal(null)}>Annuler</Button><Button variant="primary" loading={addAmend.isPending} disabled={!amend.title} onClick={() => addAmend.run(undefined)}>Créer l’avenant</Button></>}>
        <div className="form-grid">
          <Field label="Intitulé" required className="span-2"><Input value={amend.title} onChange={(e) => setAmend({ ...amend, title: e.target.value })} /></Field>
          <Field label="Impact sur la valeur HT" hint="Montant négatif possible"><Input type="number" value={amend.value_delta ?? ''} onChange={(e) => setAmend({ ...amend, value_delta: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
          <Field label="Nouvelle échéance"><Input type="date" value={amend.new_end_date} onChange={(e) => setAmend({ ...amend, new_end_date: e.target.value })} /></Field>
          <Field label="Description" className="span-2"><Textarea value={amend.description} onChange={(e) => setAmend({ ...amend, description: e.target.value })} /></Field>
        </div>
      </Modal>
      <Modal open={modal === 'item'} onClose={() => setModal(null)} title="Ajouter une pièce à suivre" footer={<><Button onClick={() => setModal(null)}>Annuler</Button><Button variant="primary" loading={addItem.isPending} disabled={!item.label} onClick={() => addItem.run(undefined)}>Ajouter</Button></>}>
        <div className="form-grid">
          <Field label="Type"><Select value={item.kind} onChange={(e) => setItem({ ...item, kind: e.target.value })} options={Object.entries(ITEM_KIND).map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="Échéance"><Input type="date" value={item.due_date} onChange={(e) => setItem({ ...item, due_date: e.target.value })} /></Field>
          <Field label="Libellé" required className="span-2"><Input value={item.label} onChange={(e) => setItem({ ...item, label: e.target.value })} /></Field>
        </div>
      </Modal>
    </>
  );
}
