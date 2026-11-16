import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { BookOpen, CheckCircle2, Plus, Scale, Trash2 } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan } from '../lib/auth';
import { date, money, today } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, ErrorState, Field, Input, Kpi, Modal, PageHeader, Segmented, Select, Tabs } from '../components/ui';

const JOURNAL: Record<string, string> = { VE: 'Ventes', AC: 'Achats', BQ: 'Banque', CA: 'Caisse', OD: 'Opérations diverses' };
const ST: Record<string, [string, 'warning' | 'success' | 'neutral']> = { provisoire: ['À contrôler', 'warning'], valide: ['Validée', 'success'], contrepassee: ['Contre-passée', 'neutral'] };
const yearStart = () => `${new Date().getFullYear()}-01-01`;

/** Comptabilité générale : écritures automatiques des devis validés à contrôler, validation (quatre yeux), balance et grand livre. */
export default function Accounting() {
  const can = useCan();
  const [tab, setTab] = useState<'ecritures' | 'balance' | 'grand-livre'>('ecritures');
  const [status, setStatus] = useState('provisoire');
  const [open, setOpen] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const r = useApi<any>(['acc-entries', status], `/api/accounting/entries${status ? `?status=${status}` : ''}`);
  return (
    <>
      <PageHeader title="Comptabilité générale" subtitle="Tout devis validé est comptabilisé automatiquement (factures à établir) ; la comptabilité contrôle puis valide chaque écriture"
        actions={<>{can('accounting', 'export') && <ExcelButton url={`/api/xlsx/accounting/journal${status ? `?status=${status}` : ''}`} label="Journal Excel" />}{can('accounting', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setManual(true)}>Écriture manuelle</Button>}</>} />
      {r.data && <div className="grid-3">
        <Kpi label="Écritures à contrôler" value={r.data.totals.provisional} foot={money(r.data.totals.provisional_amount)} />
        <Kpi label="Validées ce mois" value={r.data.totals.validated_month} />
        <Kpi label="Plan comptable" value="SYSCOHADA" foot="Comptes paramétrables (Administration › Paramètres)" />
      </div>}
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'ecritures', label: <><BookOpen aria-hidden /> Journal</> }, { id: 'balance', label: <><Scale aria-hidden /> Balance</> }, { id: 'grand-livre', label: 'Grand livre' }]} />
      {tab === 'ecritures' && <>
        <Segmented label="Statut" value={status} onChange={setStatus} options={[{ id: 'provisoire', label: 'À contrôler' }, { id: 'valide', label: 'Validées' }, { id: 'contrepassee', label: 'Contre-passées' }, { id: '', label: 'Toutes' }]} />
        <Card flush>
          {r.error ? <ErrorState error={r.error} onRetry={() => r.refetch()} /> : (
            <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(e: any) => setOpen(e.id)} empty={<Empty icon={<BookOpen />} title="Aucune écriture" />}
              columns={[
                { key: 'n', label: 'Écriture', render: (e: any) => <><div className="cell-title">{e.label}</div><div className="cell-sub">{e.number} · {JOURNAL[e.journal]}{e.created_by ? ` · saisie par ${e.created_by_name}` : ' · automatique'}</div></> },
                { key: 'd', label: 'Date', render: (e: any) => <span className="small">{date(e.entry_date)}</span> },
                { key: 'm', label: 'Montant', num: true, render: (e: any) => money(e.total_debit) },
                { key: 's', label: 'Statut', render: (e: any) => <Badge tone={ST[e.status][1]}>{ST[e.status][0]}</Badge> },
              ]} />
          )}
        </Card>
      </>}
      {tab === 'balance' && <Balance />}
      {tab === 'grand-livre' && <Ledger />}
      <EntryModal id={open} onClose={() => setOpen(null)} />
      <ManualEntry open={manual} onClose={() => setManual(false)} />
    </>
  );
}

function EntryModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const can = useCan();
  const r = useApi<any>(['acc-entry', id], id ? `/api/accounting/entries/${id}` : null);
  const v = useAction(() => api.post(`/api/accounting/entries/${id}/validate`), { success: 'Écriture validée', invalidate: [['acc-entries'], ['acc-entry', id], ['acc-balance']], onSuccess: onClose });
  const e = r.data;
  return (
    <Modal open={!!id} onClose={onClose} size="lg" title={e ? `${e.number} — ${JOURNAL[e.journal]}` : 'Écriture'} description={e?.label}
      footer={<><Button onClick={onClose}>Fermer</Button>{e?.status === 'provisoire' && can('accounting', 'validate') && <Button variant="primary" icon={<CheckCircle2 />} loading={v.isPending} onClick={() => v.run(undefined)}>Valider l’écriture</Button>}</>}>
      {e && <div className="stack">
        <div className="row-wrap small"><Badge tone={ST[e.status][1]}>{ST[e.status][0]}</Badge><span>Date : {date(e.entry_date)}</span>{e.source_ref && <span>Pièce : {e.source_ref}</span>}{e.organization_name && <span>Tiers : {e.organization_name}</span>}{e.reversal_of_number && <span>Annule {e.reversal_of_number}</span>}{e.validated_by_name && <span>Validée par {e.validated_by_name}</span>}</div>
        <DataTable compact rows={e.lines} columns={[
          { key: 'a', label: 'Compte', render: (l: any) => <><strong>{l.account_code}</strong> <span className="small muted">{l.account_label}</span></> },
          { key: 'l', label: 'Libellé', render: (l: any) => <span className="small">{l.label}</span> },
          { key: 'd', label: 'Débit', num: true, render: (l: any) => (l.debit ? money(l.debit) : '') },
          { key: 'c', label: 'Crédit', num: true, render: (l: any) => (l.credit ? money(l.credit) : '') },
        ]} />
        <div className="row small strong"><span className="spacer">Totaux</span><span>{money(e.total_debit)}</span><span>{money(e.total_credit)}</span></div>
        {e.source_type === 'quote' && e.status === 'provisoire' && <Alert tone="info">Écriture générée à la validation du devis : vérifiez les comptes et montants avant validation. Elle sera contre-passée automatiquement si le devis est annulé, refusé ou expire.</Alert>}
      </div>}
    </Modal>
  );
}

function Balance() {
  const [from, setFrom] = useState(yearStart());
  const [to, setTo] = useState(today());
  const [prov, setProv] = useState(false);
  const r = useApi<any>(['acc-balance', from, to, prov], `/api/accounting/balance?from=${from}&to=${to}${prov ? '&provisoires=1' : ''}`);
  return (
    <Card title="Balance des comptes" actions={<div className="row-wrap"><ExcelButton size="sm" url={`/api/xlsx/accounting/balance?from=${from}&to=${to}${prov ? '&provisoires=1' : ''}`} /><Input type="date" aria-label="Du" value={from} onChange={(e) => setFrom(e.target.value)} /><Input type="date" aria-label="Au" value={to} onChange={(e) => setTo(e.target.value)} /><label className="checkbox small"><input type="checkbox" checked={prov} onChange={(e) => setProv(e.target.checked)} /> Inclure les écritures à contrôler</label></div>} flush>
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty title="Aucun mouvement" />} columns={[
        { key: 'c', label: 'Compte', render: (x: any) => <><strong>{x.code}</strong> <span className="small">{x.label}</span></> },
        { key: 'd', label: 'Débit', num: true, render: (x: any) => money(x.debit) },
        { key: 'k', label: 'Crédit', num: true, render: (x: any) => money(x.credit) },
        { key: 's', label: 'Solde', num: true, render: (x: any) => <span className={x.balance < 0 ? 'strong' : ''}>{money(Math.abs(x.balance))} {x.balance > 0 ? 'D' : x.balance < 0 ? 'C' : ''}</span> },
      ]} />
      {r.data && <div className="table-foot row strong"><span className="spacer">Totaux</span><span>{money(r.data.total.debit)}</span><span>{money(r.data.total.credit)}</span>{r.data.total.debit !== r.data.total.credit && <Badge tone="danger">Déséquilibre</Badge>}</div>}
    </Card>
  );
}

function Ledger() {
  const accounts = useApi<any>(['acc-accounts'], '/api/accounting/accounts');
  const [acc, setAcc] = useState('4181');
  const r = useApi<any>(['acc-ledger', acc], `/api/accounting/ledger/${acc}?from=${yearStart()}&to=${today()}`);
  return (
    <Card title="Grand livre" actions={<div className="row"><ExcelButton size="sm" url={`/api/xlsx/accounting/ledger/${acc}?from=${yearStart()}&to=${today()}`} /><Select aria-label="Compte" value={acc} onChange={(e) => setAcc(e.target.value)} options={(accounts.data?.rows ?? []).map((a: any) => ({ value: a.code, label: `${a.code} — ${a.label}` }))} /></div>} flush>
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty title="Aucun mouvement sur ce compte" />} columns={[
        { key: 'd', label: 'Date', render: (x: any) => date(x.entry_date) }, { key: 'n', label: 'Écriture', render: (x: any) => <span className="small">{x.number} · {x.label}</span> },
        { key: 's', label: 'Statut', render: (x: any) => <Badge tone={ST[x.status][1]}>{ST[x.status][0]}</Badge> },
        { key: 'db', label: 'Débit', num: true, render: (x: any) => (x.debit ? money(x.debit) : '') }, { key: 'cr', label: 'Crédit', num: true, render: (x: any) => (x.credit ? money(x.credit) : '') },
        { key: 'r', label: 'Solde cumulé', num: true, render: (x: any) => money(x.running) },
      ]} />
    </Card>
  );
}

function ManualEntry({ open, onClose }: { open: boolean; onClose: () => void }) {
  const accounts = useApi<any>(['acc-accounts'], open ? '/api/accounting/accounts' : null);
  const [f, setF] = useState<any>({ journal: 'OD', entry_date: today(), label: '', lines: [{ account_code: '', debit: '', credit: '' }, { account_code: '', debit: '', credit: '' }] });
  const save = useAction((b: any) => api.post('/api/accounting/entries', b), { success: 'Écriture enregistrée (à valider par une autre personne)', invalidate: [['acc-entries']], onSuccess: onClose });
  const d = f.lines.reduce((s: number, l: any) => s + (Number(l.debit) || 0), 0), c = f.lines.reduce((s: number, l: any) => s + (Number(l.credit) || 0), 0);
  const opts = (accounts.data?.rows ?? []).map((a: any) => ({ value: a.code, label: `${a.code} — ${a.label}` }));
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Écriture manuelle" description="Validée ensuite par une autre personne (contrôle des quatre yeux)."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.label.trim() || d !== c || d === 0}
        onClick={() => save.run({ ...f, lines: f.lines.filter((l: any) => l.account_code).map((l: any) => ({ account_code: l.account_code, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 })) })}>Enregistrer</Button></>}>
      <div className="form-grid">
        <Field label="Journal"><Select value={f.journal} onChange={(e) => setF({ ...f, journal: e.target.value })} options={Object.entries(JOURNAL).map(([value, label]) => ({ value, label }))} /></Field>
        <Field label="Date"><Input type="date" value={f.entry_date} onChange={(e) => setF({ ...f, entry_date: e.target.value })} /></Field>
        <Field label="Libellé" required className="span-2"><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></Field>
      </div>
      <div className="stack">
        {f.lines.map((l: any, i: number) => (
          <div key={i} className="row">
            <Select aria-label="Compte" value={l.account_code} onChange={(e) => setF({ ...f, lines: f.lines.map((x: any, j: number) => (j === i ? { ...x, account_code: e.target.value } : x)) })} placeholder="Compte…" options={opts} />
            <Input type="number" min={0} aria-label="Débit" placeholder="Débit" value={l.debit} onChange={(e) => setF({ ...f, lines: f.lines.map((x: any, j: number) => (j === i ? { ...x, debit: e.target.value, credit: '' } : x)) })} />
            <Input type="number" min={0} aria-label="Crédit" placeholder="Crédit" value={l.credit} onChange={(e) => setF({ ...f, lines: f.lines.map((x: any, j: number) => (j === i ? { ...x, credit: e.target.value, debit: '' } : x)) })} />
            <Button size="sm" variant="ghost" iconOnly icon={<Trash2 />} aria-label="Retirer" disabled={f.lines.length <= 2} onClick={() => setF({ ...f, lines: f.lines.filter((_: any, j: number) => j !== i) })} />
          </div>
        ))}
        <Button size="sm" icon={<Plus />} onClick={() => setF({ ...f, lines: [...f.lines, { account_code: '', debit: '', credit: '' }] })}>Ligne</Button>
        <div className={`small strong${d !== c ? ' text-danger' : ''}`}>Débit {money(d)} · Crédit {money(c)}{d !== c ? ' — écriture déséquilibrée' : ''}</div>
      </div>
    </Modal>
  );
}
