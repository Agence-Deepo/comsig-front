import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { Plus, Upload, Wallet } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useAuth, useCan } from '../lib/auth';
import { addDays, date, money, today } from '../lib/format';
import { Alert, Button, ButtonLink, Card, DataTable, Empty, Field, Input, Kpi, Modal, MoneyInput, PageHeader, Segmented, Select, Status, Tabs } from '../components/ui';
import { HBars } from '../components/charts';

/** Finance de gestion : factures référencées (saisie ou import), encaissements, rapprochement à quatre yeux, balance âgée. */
export default function Finance() {
  const can = useCan();
  const { me } = useAuth();
  const [tab, setTab] = useState('invoices');
  const [filter, setFilter] = useState('');
  const params = { status: ['emise', 'partiellement_payee', 'payee'].includes(filter) ? filter : null, overdue: filter === 'overdue' ? 1 : null };
  const inv = useApi<any>(['invoices', params], `/api/invoices${qs(params)}`);
  const pays = useApi<any>(['payments'], tab === 'payments' ? '/api/payments' : null);
  const [newInv, setNewInv] = useState<any>(null);
  const [pay, setPay] = useState<any>(null);
  const [orgQ, setOrgQ] = useState('');
  const orgs = useApi<any>(['org-pick', orgQ], newInv ? `/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}` : null);
  const createInv = useAction((b: any) => api.post('/api/invoices', b), { success: 'Facture référencée', invalidate: [['invoices']], onSuccess: () => setNewInv(null) });
  const addPay = useAction((v: any) => api.post(`/api/invoices/${v.id}/payments`, v.body), { success: 'Encaissement saisi — à rapprocher par un autre membre de la finance', invalidate: [['invoices'], ['payments']], onSuccess: () => setPay(null) });
  const validate = useAction((v: { id: string; approve: boolean }) => api.post(`/api/payments/${v.id}/validate`, { approve: v.approve }), { success: 'Rapprochement enregistré', invalidate: [['invoices'], ['payments']] });
  const a = inv.data?.aging;
  return (
    <>
      <PageHeader title="Factures et encaissements" subtitle="Suivi de gestion à partir des factures du logiciel comptable — aucun paiement n’est considéré validé sans rapprochement"
        actions={<>{can('finance', 'export') && <ExcelButton url={`/api/invoices${qs({ ...params, format: 'xlsx' })}`} />}
          {can('finance', 'create') && <ButtonLink to="/admin/imports?entity=invoices" icon={<Upload size={16} />}>Importer des factures</ButtonLink>}
          {can('finance', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setNewInv({ number: '', organization_id: '', issue_date: today(), due_date: addDays(today(), 30), amount_ht: null, amount_ttc: null })}>Référencer une facture</Button>}</>} />
      {a && <div className="split">
        <div className="grid-3">
          <Kpi label="Encours total" value={money(a.a_echoir + a.j0_30 + a.j31_60 + a.j61_90 + a.plus_90)} />
          <Kpi label="Créances échues" value={money(a.j0_30 + a.j31_60 + a.j61_90 + a.plus_90)} action={a.j0_30 + a.j31_60 + a.j61_90 + a.plus_90 > 0} onClick={() => setFilter('overdue')} />
          <Kpi label="Échues à plus de 60 jours" value={money(a.j61_90 + a.plus_90)} action={a.j61_90 + a.plus_90 > 0} />
        </div>
        <Card title="Balance âgée" sub="Solde TTC non rapproché, FCFA">
          <HBars caption="Balance âgée" data={[{ label: 'À échoir', value: a.a_echoir }, { label: '1–30 j', value: a.j0_30 }, { label: '31–60 j', value: a.j31_60 }, { label: '61–90 j', value: a.j61_90 }, { label: '> 90 j', value: a.plus_90 }]} />
        </Card>
      </div>}
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'invoices', label: 'Factures' }, { id: 'payments', label: 'Encaissements à rapprocher' }]} />
      {tab === 'invoices' ? (
        <>
          <Segmented label="Filtre" value={filter} onChange={setFilter} options={[{ id: '', label: 'Toutes' }, { id: 'overdue', label: 'Échues non soldées' }, { id: 'emise', label: 'Émises' }, { id: 'partiellement_payee', label: 'Partiellement payées' }, { id: 'payee', label: 'Payées' }]} />
          <Card flush>
            <DataTable rows={inv.data?.rows} loading={inv.isLoading} empty={<Empty icon={<Wallet />} title="Aucune facture">Importez les factures du logiciel comptable ou référencez-les une à une.</Empty>}
              columns={[
                { key: 'n', label: 'Facture', render: (x: any) => <><div className="cell-title">{x.number}</div><div className="cell-sub">{x.organization_name}{x.contract_ref ? ` · ${x.contract_ref}` : ''} · {x.source}</div></> },
                { key: 'i', label: 'Émise', render: (x: any) => date(x.issue_date), mobile: 'hide' },
                { key: 'd', label: 'Échéance', render: (x: any) => <span style={x.balance > 0 && x.days_overdue > 0 ? { color: 'var(--danger)', fontWeight: 600 } : undefined} className="small nowrap">{date(x.due_date)}{x.balance > 0 && x.days_overdue > 0 ? ` (+${x.days_overdue} j)` : ''}</span> },
                { key: 't', label: 'TTC', num: true, render: (x: any) => money(x.amount_ttc) },
                { key: 'p', label: 'Encaissé rapproché', num: true, render: (x: any) => <>{money(x.paid_validated)}{x.paid_pending > 0 && <div className="xsmall" style={{ color: 'var(--warning)' }}>+ {money(x.paid_pending)} à rapprocher</div>}</>, mobile: 'hide' },
                { key: 'b', label: 'Solde', num: true, render: (x: any) => <strong>{money(x.balance)}</strong> },
                { key: 's', label: 'Statut', render: (x: any) => <Status kind="invoice" code={x.status} /> },
                { key: 'x', label: '', render: (x: any) => x.balance > 0 && can('finance', 'create') && <Button size="sm" onClick={() => setPay({ id: x.id, number: x.number, max: x.balance - x.paid_pending, body: { amount: x.balance - x.paid_pending, paid_at: today(), method: 'virement', reference: '' } })}>Encaissement</Button> },
              ]} />
          </Card>
        </>
      ) : (
        <Card flush>
          <DataTable rows={pays.data?.rows} loading={pays.isLoading} empty={<Empty title="Aucun encaissement" />}
            columns={[
              { key: 'i', label: 'Facture', render: (x: any) => <><div className="cell-title">{x.invoice_number}</div><div className="cell-sub">{x.organization_name}</div></> },
              { key: 'a', label: 'Montant', num: true, render: (x: any) => money(x.amount) },
              { key: 'd', label: 'Payé le', render: (x: any) => <span className="small">{date(x.paid_at)} · {x.method ?? '—'} {x.reference ?? ''}</span> },
              { key: 'e', label: 'Saisi par', render: (x: any) => <span className="small">{x.entered_by_name}</span>, mobile: 'hide' },
              { key: 's', label: 'Statut', render: (x: any) => <><Status kind="payment" code={x.status} />{x.validated_by_name && <div className="xsmall muted">par {x.validated_by_name}</div>}</> },
              { key: 'x', label: '', render: (x: any) => x.status === 'a_rapprocher' && can('finance', 'validate') && (x.entered_by === me?.id ? <span className="xsmall muted">Saisi par vous : validation par un collègue</span> : <div className="row"><Button size="sm" variant="primary" onClick={() => validate.run({ id: x.id, approve: true })}>Rapprocher</Button><Button size="sm" variant="ghost" onClick={() => validate.run({ id: x.id, approve: false })}>Rejeter</Button></div>) },
            ]} />
        </Card>
      )}
      <Modal open={!!newInv} onClose={() => setNewInv(null)} title="Référencer une facture" description="La facture est émise par le logiciel comptable ; le CRM en conserve la référence pour le suivi de gestion."
        footer={<><Button onClick={() => setNewInv(null)}>Annuler</Button><Button variant="primary" loading={createInv.isPending} onClick={() => createInv.run({ ...newInv, amount_ht: newInv.amount_ht ?? 0, amount_ttc: newInv.amount_ttc ?? 0 })}>Enregistrer</Button></>}>
        {newInv && <div className="form-grid">
          <Field label="Numéro" required error={createInv.fieldErrors.number}><Input value={newInv.number} onChange={(e) => setNewInv({ ...newInv, number: e.target.value })} /></Field>
          <Field label="Client" required error={createInv.fieldErrors.organization_id}><div className="row"><Input placeholder="Rechercher…" value={orgQ} onChange={(e) => setOrgQ(e.target.value)} aria-label="Rechercher" /><Select value={newInv.organization_id} onChange={(e) => setNewInv({ ...newInv, organization_id: e.target.value })} placeholder="Choisir…" options={(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name }))} /></div></Field>
          <Field label="Date d’émission"><Input type="date" value={newInv.issue_date} onChange={(e) => setNewInv({ ...newInv, issue_date: e.target.value })} /></Field>
          <Field label="Échéance" error={createInv.fieldErrors.due_date}><Input type="date" value={newInv.due_date} onChange={(e) => setNewInv({ ...newInv, due_date: e.target.value })} /></Field>
          <Field label="Montant HT"><MoneyInput value={newInv.amount_ht} onChange={(v) => setNewInv({ ...newInv, amount_ht: v, amount_ttc: v === null ? null : Math.round(v * 1.18) })} /></Field>
          <Field label="Montant TTC" error={createInv.fieldErrors.amount_ttc} hint="Pré-calculé à 18 % ; ajustez selon la facture"><MoneyInput value={newInv.amount_ttc} onChange={(v) => setNewInv({ ...newInv, amount_ttc: v })} /></Field>
        </div>}
      </Modal>
      <Modal open={!!pay} onClose={() => setPay(null)} title={`Encaissement — ${pay?.number}`} description="L’encaissement sera rapproché par un autre membre de la finance avant d’être pris en compte dans le solde."
        footer={<><Button onClick={() => setPay(null)}>Annuler</Button><Button variant="primary" loading={addPay.isPending} onClick={() => addPay.run({ id: pay.id, body: { ...pay.body, reference: pay.body.reference || null } })}>Saisir</Button></>}>
        {pay && <div className="form-grid">
          <Field label="Montant" hint={`Maximum : ${money(pay.max)}`}><MoneyInput value={pay.body.amount} onChange={(v) => setPay({ ...pay, body: { ...pay.body, amount: v } })} /></Field>
          <Field label="Date"><Input type="date" value={pay.body.paid_at} onChange={(e) => setPay({ ...pay, body: { ...pay.body, paid_at: e.target.value } })} /></Field>
          <Field label="Mode"><Select value={pay.body.method} onChange={(e) => setPay({ ...pay, body: { ...pay.body, method: e.target.value } })} options={['virement', 'chèque', 'espèces', 'mobile money'].map((x) => ({ value: x, label: x }))} /></Field>
          <Field label="Référence"><Input value={pay.body.reference} onChange={(e) => setPay({ ...pay, body: { ...pay.body, reference: e.target.value } })} /></Field>
          {addPay.error && <Alert tone="danger">{addPay.error.message}</Alert>}
        </div>}
      </Modal>
    </>
  );
}
