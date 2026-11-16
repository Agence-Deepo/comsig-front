import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileSignature, Lock, Plus, Search } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useCan, useUsers } from '../lib/auth';
import { addDays, date, money, today } from '../lib/format';
import { CONTRACT_KIND } from '../lib/labels';
import { Badge, Button, Card, DataTable, Empty, Field, Input, Modal, MoneyInput, PageHeader, Segmented, Select, Status, Textarea } from '../components/ui';

export function ContractForm({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: any }) {
  const nav = useNavigate();
  const users = useUsers();
  const [orgQ, setOrgQ] = useState('');
  const orgs = useApi<any>(['org-pick', orgQ], open && !initial ? `/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}` : null);
  const empty = { organization_id: '', title: '', object: '', kind: 'contrat', value_ht: null as number | null, start_date: today(), end_date: addDays(today(), 364), renewal: 'manuel', notice_days: 60, owner_id: '', confidential: false, obligations: '', payment_terms: '', exclusivity: false, special_conditions: '' };
  const [f, setF] = useState<any>(initial ? { ...empty, ...initial } : empty);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e });
  const save = useAction((b: any) => (initial ? api.patch(`/api/contracts/${initial.id}`, b) : api.post('/api/contracts', b)), {
    success: initial ? 'Contrat mis à jour' : 'Contrat créé', invalidate: [['contracts'], ['contract']], onSuccess: (r: any) => { onClose(); if (!initial) nav(`/contrats/${r.id}`); },
  });
  const fe = save.fieldErrors;
  const submit = () => {
    const b: any = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' ? null : v]));
    b.value_ht = f.value_ht ?? 0; b.notice_days = Number(f.notice_days); b.object = f.object ?? '';
    if (initial) { for (const k of ['id', 'ref', 'organization_id', 'quote_id', 'status', 'created_at', 'updated_at', 'created_by', 'deleted_at', 'deleted_by', 'signed_at', 'legal_review', 'finance_review', 'renewal_decision', 'renewed_from_id', 'days_to_end', 'opportunity_id']) delete b[k]; }
    save.run(b);
  };
  return (
    <Modal open={open} onClose={onClose} size="lg" title={initial ? `Modifier ${initial.ref}` : 'Nouveau contrat'} description="Les revues juridique et financière sont déclenchées automatiquement selon le montant, l’exclusivité et les conditions particulières."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={submit} disabled={!f.title || (!initial && !f.organization_id)}>Enregistrer</Button></>}>
      <div className="form-grid">
        {!initial && <Field label="Client" required error={fe.organization_id} className="span-2"><div className="row"><Input placeholder="Rechercher…" value={orgQ} onChange={(e) => setOrgQ(e.target.value)} style={{ maxWidth: 200 }} aria-label="Rechercher un client" /><Select value={f.organization_id} onChange={set('organization_id')} placeholder="Choisir…" options={(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name }))} /></div></Field>}
        <Field label="Intitulé" required error={fe.title} className="span-2"><Input value={f.title} onChange={set('title')} /></Field>
        <Field label="Type"><Select value={f.kind} onChange={set('kind')} options={Object.entries(CONTRACT_KIND).map(([value, label]) => ({ value, label }))} /></Field>
        <Field label="Valeur HT" error={fe.value_ht}><MoneyInput value={f.value_ht} onChange={set('value_ht')} /></Field>
        <Field label="Début" required error={fe.start_date}><Input type="date" value={f.start_date} onChange={set('start_date')} /></Field>
        <Field label="Fin" required error={fe.end_date}><Input type="date" value={f.end_date} onChange={set('end_date')} /></Field>
        <Field label="Renouvellement"><Select value={f.renewal} onChange={set('renewal')} options={[{ value: 'manuel', label: 'Sur décision' }, { value: 'tacite', label: 'Tacite reconduction' }, { value: 'aucun', label: 'Aucun' }]} /></Field>
        <Field label="Préavis (jours)"><Input type="number" min={0} value={f.notice_days} onChange={set('notice_days')} /></Field>
        <Field label="Responsable"><Select value={f.owner_id ?? ''} onChange={set('owner_id')} placeholder="Moi" options={users.filter((u) => ['commercial', 'direction_commerciale', 'direction_generale', 'juridique'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
        <div className="stack" style={{ justifyContent: 'flex-end' }}>
          <label className="checkbox"><input type="checkbox" checked={f.confidential} onChange={set('confidential')} />Contrat confidentiel</label>
          <label className="checkbox"><input type="checkbox" checked={f.exclusivity} onChange={set('exclusivity')} />Clause d’exclusivité</label>
        </div>
        <Field label="Objet" className="span-2"><Textarea value={f.object} onChange={set('object')} /></Field>
        <Field label="Conditions de paiement" className="span-2"><Input value={f.payment_terms ?? ''} onChange={set('payment_terms')} /></Field>
        <Field label="Obligations" className="span-2"><Textarea value={f.obligations ?? ''} onChange={set('obligations')} /></Field>
        <Field label="Conditions particulières" className="span-2"><Textarea value={f.special_conditions ?? ''} onChange={set('special_conditions')} /></Field>
      </div>
    </Modal>
  );
}

export default function Contracts() {
  const nav = useNavigate();
  const can = useCan();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [create, setCreate] = useState(false);
  const status = sp.get('status') ?? '';
  const expiring = sp.get('expiring') ?? '';
  const params = { status, q: sp.get('q'), expiring_days: expiring };
  const r = useApi<any>(['contracts', params], `/api/contracts${qs(params)}`);
  const set = (o: Record<string, string>) => { const n = new URLSearchParams(sp); for (const [k, v] of Object.entries(o)) { if (v) n.set(k, v); else n.delete(k); } setSp(n, { replace: true }); };
  return (
    <>
      <PageHeader title="Contrats" subtitle="Contrats, bons de commande et marchés — échéances, revues, avenants et pièces"
        actions={<>{can('contracts', 'export') && <ExcelButton url={`/api/contracts${qs({ ...params, format: 'xlsx' })}`} />}
          {can('contracts', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Nouveau contrat</Button>}</>} />
      <div className="filter-bar">
        <Segmented label="Statut" value={expiring ? 'exp' : status} onChange={(v) => set(v === 'exp' ? { expiring: '120', status: '' } : { status: v, expiring: '' })} options={[{ id: '', label: 'Tous' }, { id: 'exp', label: 'Échéance < 120 j' }, { id: 'en_revue', label: 'En revue' }, { id: 'actif', label: 'Actifs' }, { id: 'a_renouveler', label: 'À renouveler' }, { id: 'brouillon', label: 'Brouillons' }, { id: 'expire', label: 'Expirés' }]} />
        <form className="input-group search" role="search" onSubmit={(e) => { e.preventDefault(); set({ q }); }}><Search /><Input aria-label="Rechercher" placeholder="Référence, intitulé, client…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set({ q })} /></form>
      </div>
      <Card flush>
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(c: any) => nav(`/contrats/${c.id}`)} empty={<Empty icon={<FileSignature />} title="Aucun contrat">Un contrat se crée sans ressaisie depuis un devis accepté.</Empty>}
          columns={[
            { key: 't', label: 'Contrat', render: (c: any) => <><div className="cell-title row" style={{ gap: 6 }}>{c.confidential && <Lock size={13} aria-label="Confidentiel" />}{c.title}</div><div className="cell-sub">{c.ref} · {CONTRACT_KIND[c.kind]}</div></> },
            { key: 'o', label: 'Client', render: (c: any) => <span className="small">{c.organization_name}</span> },
            { key: 's', label: 'Statut', render: (c: any) => <div className="row-wrap"><Status kind="contract" code={c.status} />{c.late_items > 0 && <Badge tone="danger">{c.late_items} pièce(s) en retard</Badge>}</div> },
            { key: 'v', label: 'Valeur HT', num: true, render: (c: any) => money(c.value_ht) },
            { key: 'e', label: 'Échéance', render: (c: any) => <><div className="small nowrap">{date(c.end_date)}</div>{['signe', 'actif', 'a_renouveler'].includes(c.status) && c.days_to_end <= 120 && <Badge tone={c.renewal_decision ? 'success' : c.days_to_end <= 30 ? 'danger' : 'warning'}>{c.renewal_decision ? `Décision : ${c.renewal_decision.replace(/_/g, ' ')}` : `J-${c.days_to_end}`}</Badge>}</> },
            { key: 'w', label: 'Responsable', render: (c: any) => <span className="small">{c.owner_name}</span>, mobile: 'hide' },
          ]} />
      </Card>
      <ContractForm open={create} onClose={() => setCreate(false)} />
    </>
  );
}
