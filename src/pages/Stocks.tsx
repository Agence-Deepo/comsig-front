import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Boxes, Plus, AlertTriangle } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useCan, useLookups } from '../lib/auth';
import { dateTime, money, moneyShort, num, relative } from '../lib/format';
import { MOVE_KIND, STOCK_KIND } from '../lib/labels';
import { Badge, Button, Card, DataTable, Empty, Field, Input, Kpi, Modal, MoneyInput, PageHeader, Segmented, Select, Status, Tabs, Textarea } from '../components/ui';
import { HBars } from '../components/charts';

export function StockItemForm({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: any }) {
  const nav = useNavigate();
  const { lookups } = useLookups();
  const empty = { code: '', label: '', kind: 'matiere_premiere', category: '', unit: '', min_qty: 0, labor_cost: 0, location: '', supplier: '', description: '', initial_qty: '', initial_unit_cost: null as number | null };
  const [f, setF] = useState<any>(() => (initial ? { ...empty, ...Object.fromEntries(Object.entries(initial).filter(([k]) => k in empty).map(([k, v]) => [k, v ?? ''])) } : empty));
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e?.target ? e.target.value : e });
  const save = useAction((b: any) => (initial ? api.patch(`/api/stocks/items/${initial.id}`, b) : api.post('/api/stocks/items', b)), {
    success: 'Article enregistré', invalidate: [['stock-items'], ['stock-item'], ['stock-valuation']], onSuccess: (r: any) => { onClose(); if (!initial) nav(`/stocks/${r.id}`); },
  });
  const submit = () => {
    const b: any = { code: f.code, label: f.label, kind: f.kind, category: f.category, unit: f.unit, min_qty: Number(f.min_qty) || 0, labor_cost: Number(f.labor_cost) || 0, location: f.location, supplier: f.supplier, description: f.description };
    if (!initial && Number(f.initial_qty) > 0) { b.initial_qty = Number(f.initial_qty); b.initial_unit_cost = f.initial_unit_cost ?? undefined; }
    if (initial) delete b.code;
    save.run(b);
  };
  const fe = save.fieldErrors;
  return (
    <Modal open={open} onClose={onClose} size="lg" title={initial ? `Modifier ${initial.code}` : 'Nouvel article de stock'}
      description="Le coût moyen (CUMP) n’est jamais saisi : il est calculé à chaque réception valorisée."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={submit}>Enregistrer</Button></>}>
      <div className="form-grid">
        <Field label="Code" required error={fe.code}><Input value={f.code} onChange={set('code')} disabled={!!initial} placeholder="MP-TUBE-80" /></Field>
        <Field label="Nature" required><Select value={f.kind} onChange={set('kind')} options={Object.entries(STOCK_KIND).map(([value, label]) => ({ value, label }))} /></Field>
        <Field label="Désignation" required className="span-2" error={fe.label}><Input value={f.label} onChange={set('label')} /></Field>
        <Field label="Catégorie"><Select value={f.category} onChange={set('category')} placeholder="—" options={(lookups.stock_category ?? []).map((x) => ({ value: x.code, label: x.label }))} /></Field>
        <Field label="Unité de stock" required error={fe.unit}><Input value={f.unit} onChange={set('unit')} placeholder="pièce, m², litre, barre…" /></Field>
        <Field label="Seuil d’alerte" hint="Alerte quand le stock passe à ce niveau (0 = aucune)"><Input type="number" min={0} step="any" value={f.min_qty} onChange={set('min_qty')} /></Field>
        {f.kind !== 'matiere_premiere' && <Field label="Main-d’œuvre par unité fabriquée (FCFA)"><MoneyInput value={Number(f.labor_cost) || 0} onChange={set('labor_cost')} /></Field>}
        <Field label="Emplacement"><Input value={f.location} onChange={set('location')} /></Field>
        <Field label="Fournisseur habituel"><Input value={f.supplier} onChange={set('supplier')} /></Field>
        {!initial && <>
          <Field label="Stock d’ouverture" hint="Reprise d’inventaire (facultatif)"><Input type="number" min={0} step="any" value={f.initial_qty} onChange={set('initial_qty')} /></Field>
          <Field label="Coût unitaire d’achat du stock d’ouverture" error={fe.initial_unit_cost}><MoneyInput value={f.initial_unit_cost} onChange={set('initial_unit_cost')} /></Field>
        </>}
        <Field label="Description" className="span-2"><Textarea rows={2} value={f.description} onChange={set('description')} /></Field>
      </div>
    </Modal>
  );
}

/** Stocks : articles (MP, semi-finis, produits finis), journal des mouvements, valorisation comptable au CUMP. */
export default function Stocks() {
  const nav = useNavigate();
  const can = useCan();
  const { lookups, label } = useLookups();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') ?? 'articles';
  const kind = sp.get('kind') ?? '';
  const alert = sp.get('alert') === '1';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const set = (o: Record<string, string>) => { const n = new URLSearchParams(sp); for (const [k, v] of Object.entries(o)) { if (v) n.set(k, v); else n.delete(k); } setSp(n, { replace: true }); };
  const params = { kind, q: search, category, alert: alert ? 1 : null };
  const items = useApi<any>(['stock-items', params], tab === 'articles' ? `/api/stocks/items${qs(params)}` : null);
  const val = useApi<any>(['stock-valuation'], '/api/stocks/valuation');
  const [mvKind, setMvKind] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const mv = useApi<any>(['stock-movements', mvKind, from, to], tab === 'mouvements' ? `/api/stocks/movements${qs({ kind: mvKind, from, to })}` : null);
  const [form, setForm] = useState(false);
  const v = val.data;
  const k = (code: string) => v?.by_kind.find((x: any) => x.kind === code);
  const low = (v?.by_kind ?? []).reduce((s: number, x: any) => s + x.low, 0);
  return (
    <>
      <PageHeader title="Stocks et matières" subtitle="Matières premières, semi-finis et produits finis — quantités, coût moyen pondéré (CUMP) et mouvements tracés"
        actions={<>{can('stocks', 'export') && <ExcelButton url={tab === 'mouvements' ? `/api/stocks/movements${qs({ kind: mvKind, from, to, format: 'xlsx' })}` : `/api/stocks/items${qs({ ...params, format: 'xlsx' })}`} />}
          {can('stocks', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setForm(true)}>Nouvel article</Button>}</>} />
      {v && <div className="grid-4">
        <Kpi label="Valeur du stock" value={moneyShort(v.total)} unit="FCFA" help={{ title: 'Valorisation', formula: 'Somme des quantités en stock × coût unitaire moyen pondéré (CUMP) de chaque article actif.' }} />
        <Kpi label="Matières premières" value={moneyShort(k('matiere_premiere')?.value ?? 0)} unit="FCFA" foot={<span>{k('matiere_premiere')?.items ?? 0} articles</span>} onClick={() => set({ tab: 'articles', kind: 'matiere_premiere', alert: '' })} />
        <Kpi label="Semi-finis et produits finis" value={moneyShort((k('semi_fini')?.value ?? 0) + (k('produit_fini')?.value ?? 0))} unit="FCFA" foot={<span>{(k('semi_fini')?.items ?? 0) + (k('produit_fini')?.items ?? 0)} articles</span>} />
        <Kpi label="Sous le seuil d’alerte" value={low} action={low > 0} foot={<span>À réapprovisionner</span>} onClick={() => set({ tab: 'articles', alert: '1', kind: '' })} />
      </div>}
      <Tabs value={tab} onChange={(t) => set({ tab: t === 'articles' ? '' : t })} tabs={[{ id: 'articles', label: 'Articles' }, { id: 'mouvements', label: 'Mouvements' }, { id: 'valorisation', label: 'Valorisation' }]} />
      {tab === 'articles' && (
        <>
          <div className="row-wrap">
            <Input placeholder="Rechercher (code, désignation, fournisseur)…" aria-label="Rechercher" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
            <Segmented label="Nature" value={kind} onChange={(x) => set({ kind: x })} options={[{ id: '', label: 'Tous' }, ...Object.entries(STOCK_KIND).map(([id, l]) => ({ id, label: l }))]} />
            <Select aria-label="Catégorie" style={{ width: 220 }} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Toutes catégories" options={(lookups.stock_category ?? []).map((x) => ({ value: x.code, label: x.label }))} />
            {alert && <Button size="sm" variant="ghost" onClick={() => set({ alert: '' })}>Retirer le filtre « sous le seuil »</Button>}
          </div>
          <Card flush>
            <DataTable rows={items.data?.rows} loading={items.isLoading} onRowClick={(x: any) => nav(`/stocks/${x.id}`)} rowClass={(x: any) => (x.is_low ? 'row-warning' : '')}
              empty={<Empty icon={<Boxes />} title="Aucun article">{can('stocks', 'create') ? 'Créez vos matières premières, semi-finis et produits finis.' : 'Aucun article ne correspond aux filtres.'}</Empty>}
              columns={[
                { key: 'c', label: 'Article', render: (x: any) => <><div className="cell-title">{x.label}</div><div className="cell-sub">{x.code} · {label('stock_category', x.category || null)}{x.bom_count ? ` · nomenclature ${x.bom_count} composant(s)` : ''}</div></> },
                { key: 'k', label: 'Nature', render: (x: any) => <Status kind="stock_kind" code={x.kind} />, mobile: 'hide' },
                { key: 'q', label: 'En stock', num: true, render: (x: any) => <span className={x.is_low ? 'strong' : ''} style={x.is_low ? { color: 'var(--warning)' } : undefined}>{num(x.qty_on_hand)} {x.unit}{x.is_low && <div className="xsmall row" style={{ justifyContent: 'flex-end', gap: 4 }}><AlertTriangle size={12} />seuil {num(x.min_qty)}</div>}</span> },
                { key: 'p', label: 'CUMP', num: true, render: (x: any) => (x.avg_cost ? money(Math.round(x.avg_cost)) : <span className="muted">—</span>) },
                { key: 'v', label: 'Valeur', num: true, render: (x: any) => money(x.stock_value), mobile: 'hide' },
                { key: 'm', label: 'Dernier mouvement', render: (x: any) => <span className="small">{x.last_movement_at ? relative(x.last_movement_at) : '—'}</span>, mobile: 'hide' },
              ]} />
          </Card>
        </>
      )}
      {tab === 'mouvements' && (
        <>
          <div className="row-wrap">
            <Select aria-label="Type de mouvement" style={{ width: 260 }} value={mvKind} onChange={(e) => setMvKind(e.target.value)} placeholder="Tous les mouvements" options={Object.entries(MOVE_KIND).map(([value, l]) => ({ value, label: l }))} />
            <Field label="Du"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="Au"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          </div>
          <Card flush title="Journal des mouvements" sub="En ajout seul : une erreur se corrige par un mouvement inverse ou un ajustement motivé">
            <MovementsTable rows={mv.data?.rows} loading={mv.isLoading} showItem />
          </Card>
        </>
      )}
      {tab === 'valorisation' && v && (
        <div className="grid-2">
          <Card title="Valeur par catégorie" sub="FCFA, au CUMP">
            <HBars caption="Valeur du stock par catégorie" data={v.by_category.filter((c: any) => c.value > 0).map((c: any) => ({ label: label('stock_category', c.category || null), value: c.value, sub: `${c.items} art.` }))} />
          </Card>
          <Card title="Flux valorisés des 6 derniers mois" sub="Achats réceptionnés, consommations, production et ajustements (FCFA)" flush>
            <DataTable rows={v.flows.map((f: any) => ({ ...f, id: f.month }))} compact empty={<Empty title="Aucun mouvement" />} columns={[
              { key: 'm', label: 'Mois', render: (f: any) => f.month },
              { key: 'a', label: 'Achats', num: true, render: (f: any) => money(f.purchases) },
              { key: 'c', label: 'Consommations', num: true, render: (f: any) => money(f.consumption) },
              { key: 'p', label: 'Production', num: true, render: (f: any) => money(f.production) },
              { key: 'j', label: 'Ajustements', num: true, render: (f: any) => <span style={f.adjustments < 0 ? { color: 'var(--danger)' } : undefined}>{money(f.adjustments)}</span> },
            ]} />
          </Card>
        </div>
      )}
      {form && <StockItemForm open onClose={() => setForm(false)} />}
    </>
  );
}

export function MovementsTable({ rows, loading, showItem }: { rows: any[] | undefined; loading?: boolean; showItem?: boolean }) {
  const nav = useNavigate();
  return (
    <DataTable rows={rows} loading={loading} compact onRowClick={showItem ? (m: any) => nav(`/stocks/${m.item_id}`) : undefined} empty={<Empty title="Aucun mouvement" />} columns={[
      { key: 'd', label: 'Date', render: (m: any) => <span className="xsmall nowrap">{dateTime(m.created_at)}</span> },
      ...(showItem ? [{ key: 'i', label: 'Article', render: (m: any) => <><div className="small strong">{m.item_code}</div><div className="xsmall muted">{m.item_label}</div></> }] : []),
      { key: 'k', label: 'Mouvement', render: (m: any) => <><Badge tone={m.quantity > 0 ? 'success' : 'neutral'}>{MOVE_KIND[m.kind] ?? m.kind}</Badge><div className="xsmall muted">{[m.reference, m.supplier, m.reason, m.order_number && !String(m.reason).includes(m.order_number) ? m.order_number : null, m.quote_number, m.campaign_ref].filter(Boolean).join(' · ')}</div></> },
      { key: 'q', label: 'Quantité', num: true, render: (m: any) => <span className="strong">{m.quantity > 0 ? '+' : ''}{num(m.quantity)}{m.item_unit ? ` ${m.item_unit}` : ''}</span> },
      { key: 'c', label: 'Coût unitaire', num: true, render: (m: any) => money(Math.round(m.unit_cost)), mobile: 'hide' },
      { key: 'v', label: 'Valeur', num: true, render: (m: any) => money(m.value) },
      { key: 'a', label: 'Stock après', num: true, render: (m: any) => <span className="small">{num(m.qty_after)} · CUMP {money(Math.round(m.avg_cost_after))}</span>, mobile: 'hide' },
      { key: 'u', label: 'Par', render: (m: any) => <span className="xsmall">{m.created_by_name}</span>, mobile: 'hide' },
    ]} />
  );
}
