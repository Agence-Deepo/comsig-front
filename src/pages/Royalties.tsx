import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { Landmark, Plus, FileCheck2 } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs, ApiError } from '../lib/api';
import { useAuth, useCan, useLookups } from '../lib/auth';
import { useToast } from '../lib/toast';
import { date, money, today } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, Field, Input, Kpi, Modal, MoneyInput, PageHeader, Segmented, Select, Status, Tabs, Textarea } from '../components/ui';

export default function Royalties() {
  const can = useCan();
  const { me } = useAuth();
  const toast = useToast();
  const { lookups, label } = useLookups();
  const [tab, setTab] = useState('royalties');
  const [filter, setFilter] = useState('open');
  const [commune, setCommune] = useState('');
  const params = { open: filter === 'open' ? 1 : null, status: !['open', 'all'].includes(filter) ? filter : null, commune };
  const r = useApi<any>(['royalties', params], `/api/royalties${qs(params)}`);
  const recs = useApi<any>(['admin-records'], tab === 'records' ? '/api/admin-records' : null);
  const supports = useApi<any>(['supports-lite'], '/api/supports');
  const [edit, setEdit] = useState<any>(null);
  const [pay, setPay] = useState<any>(null);
  const [contest, setContest] = useState<any>(null);
  const save = useAction((b: any) => (edit?.id ? api.put(`/api/royalties/${edit.id}`, b) : api.post('/api/royalties', b)), { success: 'Redevance enregistrée', invalidate: [['royalties']], onSuccess: () => setEdit(null) });
  const act = useAction((v: { id: string; body: any }) => api.post(`/api/royalties/${v.id}/action`, v.body), { success: 'Redevance mise à jour', invalidate: [['royalties']], onSuccess: () => { setPay(null); setContest(null); } });
  const payWithProof = async () => {
    try {
      let proof: string | null = null;
      if (pay.file) {
        const fd = new FormData(); fd.append('entity_type', 'royalty'); fd.append('entity_id', pay.id); fd.append('kind', 'attestation'); fd.append('file', pay.file);
        proof = (await api.upload('/api/documents', fd)).id;
      }
      act.run({ id: pay.id, body: { action: 'paiement', amount: pay.amount, paid_at: pay.paid_at, proof_document_id: proof } });
    } catch (e) { toast('error', 'Justificatif non enregistré', (e as ApiError).message); }
  };
  const t = r.data?.totals;
  return (
    <>
      <PageHeader title="Redevances et dossiers administratifs" subtitle="Montants attendus, validés et payés par support, commune et période — justificatifs obligatoires"
        actions={<>{can('royalties', 'export') && <ExcelButton url={`/api/royalties${qs({ ...params, format: 'xlsx' })}`} />}
          {can('royalties', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setEdit({ commune: '', support_id: '', beneficiary: '', period_start: `${today().slice(0, 4)}-01-01`, period_end: `${today().slice(0, 4)}-12-31`, basis: '', basis_quantity: '', rate: null, expected_amount: null, due_date: '', notes: '' })}>Nouvelle redevance</Button>}</>} />
      <Alert tone="info">Les règles de calcul (base × taux) sont paramétrables et doivent être validées par COM&amp;SIG ; le CRM ne remplace pas l’avis juridique ou fiscal compétent. Chaque redevance est validée par une autre personne que celle qui l’a saisie.</Alert>
      {t && <div className="grid-3">
        <Kpi label="Montant attendu" value={money(t.expected)} />
        <Kpi label="Payé" value={money(t.paid)} progress={t.expected ? (t.paid / t.expected) * 100 : null} />
        <Kpi label="Restant à régulariser" value={money(t.remaining)} action={t.remaining > 0} />
      </div>}
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'royalties', label: 'Redevances' }, { id: 'records', label: 'Autorisations et pièces' }]} />
      {tab === 'royalties' ? (
        <>
          <div className="filter-bar">
            <Segmented label="Statut" value={filter} onChange={setFilter} options={[{ id: 'open', label: 'À traiter' }, { id: 'a_valider', label: 'À valider' }, { id: 'en_retard', label: 'En retard' }, { id: 'conteste', label: 'Contestées' }, { id: 'paye', label: 'Payées' }, { id: 'all', label: 'Toutes' }]} />
            <Select aria-label="Commune" value={commune} onChange={(e) => setCommune(e.target.value)} placeholder="Toutes communes" options={(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label }))} />
          </div>
          <Card flush>
            <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty icon={<Landmark />} title="Aucune redevance dans cette vue" />}
              columns={[
                { key: 'c', label: 'Commune / support', render: (x: any) => <><div className="cell-title">{label('commune', x.commune)}</div><div className="cell-sub">{x.support_code ?? 'Global'} · {x.beneficiary}</div></> },
                { key: 'p', label: 'Période', render: (x: any) => <span className="small nowrap">{date(x.period_start)} → {date(x.period_end)}</span>, mobile: 'hide' },
                { key: 'b', label: 'Base de calcul', render: (x: any) => <span className="xsmall">{x.basis}{x.basis_quantity ? ` (${x.basis_quantity} × ${money(x.rate)})` : ''}</span>, mobile: 'hide' },
                { key: 'e', label: 'Attendu', num: true, render: (x: any) => money(x.expected_amount) },
                { key: 'r', label: 'Restant', num: true, render: (x: any) => money(x.remaining) },
                { key: 'd', label: 'Échéance', render: (x: any) => <span className="small nowrap" style={x.due_date < today() && x.remaining > 0 ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{date(x.due_date)}</span> },
                { key: 's', label: 'Statut', render: (x: any) => <div className="row-wrap"><Status kind="royalty" code={x.status} />{x.proof_filename && <Badge tone="success" dot={false}><FileCheck2 size={11} />Justificatif</Badge>}</div> },
                { key: 'x', label: '', render: (x: any) => (
                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    {x.status === 'a_valider' && can('royalties', 'validate') && <Button size="sm" variant="primary" disabled={x.created_by === me?.id} title={x.created_by === me?.id ? 'Validation par une autre personne' : undefined} onClick={() => act.run({ id: x.id, body: { action: 'valider' } })}>Valider</Button>}
                    {['a_payer', 'partiellement_paye', 'en_retard'].includes(x.status) && can('royalties', 'update') && <Button size="sm" onClick={() => setPay({ id: x.id, amount: x.remaining, paid_at: today(), file: null, hasProof: !!x.proof_document_id, max: x.remaining })}>Paiement</Button>}
                    {['a_calculer', 'a_valider', 'conteste'].includes(x.status) && can('royalties', 'update') && <Button size="sm" variant="ghost" onClick={() => setEdit({ ...x, support_id: x.support_id ?? '', basis_quantity: x.basis_quantity ?? '', notes: x.notes ?? '' })}>Modifier</Button>}
                    {!['paye', 'conteste'].includes(x.status) && can('royalties', 'update') && <Button size="sm" variant="ghost" onClick={() => setContest(x)}>Contester</Button>}
                    {x.status === 'conteste' && can('royalties', 'validate') && <Button size="sm" variant="ghost" onClick={() => act.run({ id: x.id, body: { action: 'resoudre', comment: 'Contestation levée' } })}>Lever</Button>}
                  </div>) },
              ]} />
          </Card>
          {act.error && <Alert tone="danger">{act.error.message}</Alert>}
        </>
      ) : (
        <Card flush>
          <DataTable rows={recs.data?.rows} loading={recs.isLoading} empty={<Empty title="Aucune pièce administrative" />} columns={[
            { key: 't', label: 'Pièce', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.kind} · {x.reference ?? '—'}</div></> },
            { key: 's', label: 'Support', render: (x: any) => x.support_code ?? label('commune', x.commune) },
            { key: 'i', label: 'Délivrée', render: (x: any) => date(x.issued_at) },
            { key: 'e', label: 'Expiration', render: (x: any) => x.expires_at ? <Badge tone={x.expiring ? 'warning' : 'neutral'}>{date(x.expires_at)}</Badge> : '—' },
          ]} />
        </Card>
      )}
      <Modal open={!!edit} onClose={() => setEdit(null)} size="lg" title={edit?.id ? 'Modifier la redevance' : 'Nouvelle redevance'} description="Renseignez la base et le taux : le montant attendu est calculé par le CRM. À défaut, saisissez le montant notifié."
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ ...Object.fromEntries(Object.entries(edit).filter(([k]) => ['support_id', 'commune', 'beneficiary', 'period_start', 'period_end', 'basis', 'basis_quantity', 'rate', 'expected_amount', 'due_date', 'notes'].includes(k)).map(([k, v]) => [k, v === '' ? null : v])), basis: edit.basis ?? '', beneficiary: edit.beneficiary ?? '', basis_quantity: edit.basis_quantity === '' || edit.basis_quantity === null ? null : Number(edit.basis_quantity) })}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Commune" required error={save.fieldErrors.commune}><Select value={edit.commune} onChange={(e) => setEdit({ ...edit, commune: e.target.value })} placeholder="Choisir…" options={(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label }))} /></Field>
          <Field label="Support"><Select value={edit.support_id} onChange={(e) => setEdit({ ...edit, support_id: e.target.value })} placeholder="Global commune" options={(supports.data?.rows ?? []).map((s: any) => ({ value: s.id, label: `${s.code} — ${s.name}` }))} /></Field>
          <Field label="Bénéficiaire" className="span-2"><Input value={edit.beneficiary} onChange={(e) => setEdit({ ...edit, beneficiary: e.target.value })} placeholder="Mairie de …" /></Field>
          <Field label="Début de période" required error={save.fieldErrors.period_start}><Input type="date" value={edit.period_start} onChange={(e) => setEdit({ ...edit, period_start: e.target.value })} /></Field>
          <Field label="Fin de période" required error={save.fieldErrors.period_end}><Input type="date" value={edit.period_end} onChange={(e) => setEdit({ ...edit, period_end: e.target.value })} /></Field>
          <Field label="Base de calcul (description)" className="span-2"><Input value={edit.basis} onChange={(e) => setEdit({ ...edit, basis: e.target.value })} placeholder="Surface (m²) × taux communal" /></Field>
          <Field label="Quantité de base"><Input inputMode="decimal" value={edit.basis_quantity} onChange={(e) => setEdit({ ...edit, basis_quantity: e.target.value })} /></Field>
          <Field label="Taux unitaire"><MoneyInput value={edit.rate} onChange={(v) => setEdit({ ...edit, rate: v })} /></Field>
          <Field label="Montant notifié (si pas de calcul)"><MoneyInput value={edit.expected_amount} onChange={(v) => setEdit({ ...edit, expected_amount: v })} /></Field>
          <Field label="Échéance" required error={save.fieldErrors.due_date}><Input type="date" value={edit.due_date} onChange={(e) => setEdit({ ...edit, due_date: e.target.value })} /></Field>
          <Field label="Notes" className="span-2"><Textarea value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></Field>
          {save.error && !save.error.fields && <Alert tone="danger">{save.error.message}</Alert>}
        </div>}
      </Modal>
      <Modal open={!!pay} onClose={() => setPay(null)} title="Enregistrer un paiement" description="Le justificatif (quittance, reçu) est obligatoire. Le montant ne peut pas dépasser le restant dû."
        footer={<><Button onClick={() => setPay(null)}>Annuler</Button><Button variant="primary" loading={act.isPending} disabled={!pay?.amount || (!pay?.file && !pay?.hasProof)} onClick={payWithProof}>Enregistrer</Button></>}>
        {pay && <div className="form-grid">
          <Field label="Montant" hint={`Restant : ${money(pay.max)}`}><MoneyInput value={pay.amount} onChange={(v) => setPay({ ...pay, amount: v })} /></Field>
          <Field label="Date de paiement"><Input type="date" value={pay.paid_at} onChange={(e) => setPay({ ...pay, paid_at: e.target.value })} /></Field>
          <Field label="Justificatif" required={!pay.hasProof} className="span-2" hint={pay.hasProof ? 'Un justificatif est déjà joint ; vous pouvez en ajouter un nouveau.' : 'PDF ou photo de la quittance'}><input type="file" accept=".pdf,image/*" onChange={(e) => setPay({ ...pay, file: e.target.files?.[0] ?? null })} /></Field>
        </div>}
      </Modal>
      <Modal open={!!contest} onClose={() => setContest(null)} title="Contester la redevance" footer={<><Button onClick={() => setContest(null)}>Annuler</Button><Button variant="primary" loading={act.isPending} disabled={!contest?.comment} onClick={() => act.run({ id: contest.id, body: { action: 'contester', comment: contest.comment } })}>Contester</Button></>}>
        <Field label="Motif" required><Textarea value={contest?.comment ?? ''} onChange={(e) => setContest({ ...contest, comment: e.target.value })} /></Field>
      </Modal>
    </>
  );
}
