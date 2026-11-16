import { ExcelButton } from '../components/ExportButton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useApi } from '../lib/hooks';
import { useCan } from '../lib/auth';
import { qs } from '../lib/api';
import { date, money, pct } from '../lib/format';
import { Badge, Button, Card, DataTable, Empty, Input, PageHeader, Segmented, Status } from '../components/ui';

export default function Quotes() {
  const nav = useNavigate();
  const can = useCan();
  const [sp, setSp] = useSearchParams();
  const status = sp.get('status') ?? '';
  const [q, setQ] = useState(sp.get('q') ?? '');
  const params = { status, q: sp.get('q') };
  const r = useApi<any>(['quotes', params], `/api/quotes${qs(params)}`);
  const set = (o: Record<string, string>) => { const n = new URLSearchParams(sp); for (const [k, v] of Object.entries(o)) { if (v) n.set(k, v); else n.delete(k); } setSp(n, { replace: true }); };
  return (
    <>
      <PageHeader title="Devis et propositions" subtitle="Propositions chiffrées à partir du catalogue et de l’inventaire, validées selon les seuils de marge et de remise"
        actions={<>{can('quotes', 'export') && <ExcelButton url={`/api/quotes${qs({ ...params, format: 'xlsx' })}`} />}{can('quotes', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => nav('/devis/nouveau')}>Nouveau devis</Button>}</>} />
      <div className="filter-bar">
        <Segmented label="Statut" value={status} onChange={(v) => set({ status: v })} options={[{ id: '', label: 'Tous' }, { id: 'brouillon', label: 'Brouillons' }, { id: 'soumis', label: 'En validation' }, { id: 'valide', label: 'Validés' }, { id: 'envoye', label: 'Envoyés' }, { id: 'accepte', label: 'Acceptés' }, { id: 'refuse', label: 'Refusés' }]} />
        <form className="input-group search" role="search" onSubmit={(e) => { e.preventDefault(); set({ q }); }}><Search /><Input aria-label="Rechercher" placeholder="Numéro, intitulé, client…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set({ q })} /></form>
      </div>
      <Card flush>
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(x: any) => nav(`/devis/${x.id}`)}
          empty={<Empty icon={<FileText />} title="Aucune proposition">Les propositions se préparent depuis une opportunité (« Préparer une proposition »).</Empty>}
          columns={[
            { key: 'n', label: 'Proposition', render: (x: any) => <><div className="cell-title">{x.number} <span className="muted">v{x.version}</span>{x.doc_type === 'proforma' && <> <Badge tone="accent">Proforma</Badge></>}</div><div className="cell-sub">{x.title}</div></> },
            { key: 'c', label: 'Client', render: (x: any) => <><div className="small">{x.organization_name}</div><div className="xsmall muted">{x.opportunity_ref}</div></> },
            { key: 's', label: 'Statut', render: (x: any) => <div className="row-wrap"><Status kind="quote" code={x.status} />{x.is_expired && <Badge tone="danger">Validité dépassée</Badge>}</div> },
            { key: 't', label: 'Total HT', num: true, render: (x: any) => money(x.total_ht) },
            { key: 'm', label: 'Marge', num: true, render: (x: any) => x.margin_pct === null ? '—' : <span style={x.approval_required ? { color: 'var(--warning)', fontWeight: 600 } : undefined}>{pct(x.margin_pct)}</span>, mobile: 'hide' },
            { key: 'v', label: 'Validité', render: (x: any) => <span className="small nowrap">{date(x.valid_until)}</span>, mobile: 'hide' },
            { key: 'o', label: 'Responsable', render: (x: any) => <span className="small">{x.owner_name}</span>, mobile: 'hide' },
          ]} />
      </Card>
    </>
  );
}
