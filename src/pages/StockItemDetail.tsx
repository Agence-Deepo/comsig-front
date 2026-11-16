import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, ClipboardCheck, Factory, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan, useLookups } from '../lib/auth';
import { date, money, num } from '../lib/format';
import { Alert, Badge, Button, Card, ConfirmModal, DataTable, Dl, Empty, ErrorState, Field, Input, Kpi, LoadingBlock, Modal, MoneyInput, PageHeader, Select, Status, Textarea } from '../components/ui';
import { MovementsTable, StockItemForm } from './Stocks';
import { OrderForm } from './Production';

/** Fiche article : niveau de stock, CUMP, mouvements, nomenclature et coût de revient, opérations (réception, sortie, inventaire). */
export default function StockItemDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const can = useCan();
  const { label } = useLookups();
  const r = useApi<any>(['stock-item', id], `/api/stocks/items/${id}`);
  const [op, setOp] = useState<null | 'receive' | 'consume' | 'adjust' | 'edit' | 'bom' | 'order' | 'delete'>(null);
  const del = useAction(() => api.del(`/api/stocks/items/${id}`), { success: 'Article placé dans la corbeille', onSuccess: () => nav('/stocks'), invalidate: [['stock-items']] });
  if (r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  if (r.error) return <Card><ErrorState error={r.error} /></Card>;
  const { item: it, bom, used_in, movements, cost, bom_cost, orders } = r.data;
  const low = it.min_qty > 0 && it.qty_on_hand <= it.min_qty;
  const makeable = it.kind !== 'matiere_premiere';
  return (
    <>
      <PageHeader crumbs={[{ label: 'Stocks et matières', to: '/stocks' }, { label: it.code }]}
        title={<span className="row-wrap" style={{ gap: 10 }}>{it.label}<Status kind="stock_kind" code={it.kind} />{!it.is_active && <Badge>Inactif</Badge>}</span>}
        subtitle={`${it.code} · ${label('stock_category', it.category || null)} · unité : ${it.unit}${it.location ? ` · ${it.location}` : ''}`}
        actions={<>
          {can('stocks', 'create') && <Button variant="primary" icon={<ArrowDownToLine />} onClick={() => setOp('receive')}>Réception</Button>}
          {can('stocks', 'create') && <Button icon={<ArrowUpFromLine />} disabled={it.qty_on_hand <= 0} onClick={() => setOp('consume')}>Sortie</Button>}
          {can('stocks', 'validate') && <Button icon={<ClipboardCheck />} onClick={() => setOp('adjust')}>Inventaire</Button>}
          {makeable && can('production', 'create') && bom.length > 0 && <Button icon={<Factory />} onClick={() => setOp('order')}>Fabriquer</Button>}
          {can('stocks', 'update') && <Button variant="ghost" icon={<Pencil />} onClick={() => setOp('edit')}>Modifier</Button>}
        </>} />
      {low && <Alert tone="warning" title="Stock sous le seuil d’alerte">{num(it.qty_on_hand)} {it.unit} en stock pour un seuil de {num(it.min_qty)}. Les responsables du stock ont été alertés.</Alert>}
      <div className="grid-4">
        <Kpi label="En stock" value={num(it.qty_on_hand)} unit={it.unit} foot={<span>seuil d’alerte {num(it.min_qty)}</span>} action={low} />
        <Kpi label="Coût unitaire moyen (CUMP)" value={it.avg_cost ? money(Math.round(it.avg_cost)) : '—'} help={{ title: 'CUMP', formula: 'Recalculé à chaque entrée valorisée : (stock × CUMP + quantité reçue × coût) / nouveau stock. Les sorties sont valorisées au CUMP courant.' }}
          foot={<span>{it.last_purchase_price ? `dernier achat ${money(Math.round(it.last_purchase_price))}` : 'aucune réception'}</span>} />
        <Kpi label="Valeur en stock" value={money(it.stock_value)} />
        <Kpi label="Coût retenu pour le chiffrage" value={cost.cost ? money(Math.round(cost.cost)) : '—'} foot={<span>{cost.source === 'cump' ? 'CUMP' : cost.source === 'nomenclature' ? `coût de nomenclature${cost.complete ? '' : ' (incomplet)'}` : 'inconnu : réceptionnez ou définissez la nomenclature'}</span>} />
      </div>
      <div className="split">
        <div className="stack-lg" style={{ minWidth: 0 }}>
          {makeable && (
            <Card title="Nomenclature" sub="Composants consommés pour fabriquer une unité" flush actions={can('stocks', 'update') && <Button size="sm" icon={<Pencil />} onClick={() => setOp('bom')}>Modifier</Button>}>
              {!bom.length ? <Empty icon={<Factory />} title="Aucune nomenclature">Définissez les composants pour calculer le coût de revient et lancer des fabrications.</Empty> : (
                <>
                  <DataTable rows={bom} compact columns={[
                    { key: 'c', label: 'Composant', render: (b: any) => <Link to={`/stocks/${b.component_id}`}><span className="small strong">{b.code}</span> <span className="xsmall muted">{b.label}</span></Link> },
                    { key: 'q', label: 'Qté / unité', num: true, render: (b: any) => `${num(b.quantity)} ${b.unit}` },
                    { key: 'u', label: 'Coût unitaire', num: true, render: (b: any) => <span>{money(Math.round(b.unit_cost))}<div className="xsmall muted">{b.cost_source === 'cump' ? 'CUMP' : b.cost_source}</div></span> },
                    { key: 'l', label: 'Coût', num: true, render: (b: any) => money(b.line_cost) },
                    { key: 's', label: 'Disponible', num: true, render: (b: any) => <span className="small">{num(b.qty_on_hand)} {b.unit}</span>, mobile: 'hide' },
                  ]} />
                  {bom_cost && <div className="row" style={{ padding: '10px 20px', justifyContent: 'flex-end', gap: 16 }}><span className="small muted">Main-d’œuvre {money(it.labor_cost)}</span><span className="strong">Coût de revient : {money(Math.round(bom_cost.cost))} / {it.unit}</span></div>}
                </>
              )}
            </Card>
          )}
          <PurchasePrices itemId={it.id} canAdd={can('stocks', 'create')} />
          <Card title="Mouvements" sub="200 derniers" flush><MovementsTable rows={movements} /></Card>
        </div>
        <div className="stack-lg">
          <Card title="Informations"><Dl items={[['Fournisseur', it.supplier || '—'], ['Emplacement', it.location || '—'], ['Créé le', date(it.created_at)], ['Par', it.created_by_name]]} />
            {it.description && <p className="small secondary" style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{it.description}</p>}</Card>
          {used_in.length > 0 && <Card title="Entre dans la fabrication de"><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{used_in.map((u: any) => <li key={u.id}><Link to={`/stocks/${u.id}`}>{u.code}</Link> — {num(u.quantity)} {it.unit} / unité</li>)}</ul></Card>}
          {orders.length > 0 && <Card title="Ordres de fabrication"><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{orders.map((o: any) => <li key={o.id}><Link to={`/production?ordre=${o.id}`}>{o.number}</Link> · {num(o.quantity)} · <Status kind="production_order" code={o.status} /></li>)}</ul></Card>}
          {can('stocks', 'delete') && <Button variant="ghost" icon={<Trash2 />} disabled={it.qty_on_hand > 0} onClick={() => setOp('delete')}>Mettre à la corbeille</Button>}
        </div>
      </div>
      {op === 'receive' && <MoveModal kind="receive" item={it} onClose={() => setOp(null)} />}
      {op === 'consume' && <MoveModal kind="consume" item={it} onClose={() => setOp(null)} />}
      {op === 'adjust' && <MoveModal kind="adjust" item={it} onClose={() => setOp(null)} />}
      {op === 'edit' && <StockItemForm open initial={it} onClose={() => setOp(null)} />}
      {op === 'bom' && <BomEditor item={it} bom={bom} onClose={() => setOp(null)} />}
      {op === 'order' && <OrderForm open itemId={it.id} onClose={() => setOp(null)} />}
      <ConfirmModal open={op === 'delete'} onClose={() => setOp(null)} danger title="Mettre l’article à la corbeille ?" message="L’article et son historique restent consultables et restaurables par un administrateur." confirmLabel="Mettre à la corbeille" loading={del.isPending} onConfirm={() => del.run(undefined)} />
    </>
  );
}

function MoveModal({ kind, item, onClose }: { kind: 'receive' | 'consume' | 'adjust'; item: any; onClose: () => void }) {
  const [f, setF] = useState<any>({ quantity: '', unit_cost: item.last_purchase_price ? Math.round(item.last_purchase_price) : null, supplier: item.supplier ?? '', reference: '', reason: '', counted_qty: item.qty_on_hand });
  const campaigns = useApi<any>(['campaigns-pick'], kind === 'consume' ? '/api/campaigns?active=true' : null);
  const save = useAction((b: any) => api.post(`/api/stocks/items/${item.id}/${kind}`, b), {
    success: kind === 'receive' ? 'Réception enregistrée — CUMP recalculé, prix d’achat et écriture d’achat enregistrés' : kind === 'consume' ? 'Sortie enregistrée' : 'Inventaire enregistré',
    invalidate: [['stock-item', item.id], ['stock-prices', item.id], ['stock-items'], ['stock-valuation'], ['stock-movements']], onSuccess: onClose,
  });
  const submit = () => save.run(kind === 'receive' ? { quantity: Number(f.quantity), unit_cost: f.unit_cost ?? 0, supplier: f.supplier, reference: f.reference }
    : kind === 'consume' ? { quantity: Number(f.quantity), reason: f.reason, campaign_id: f.campaign_id || null } : { counted_qty: Number(f.counted_qty), reason: f.reason, unit_cost: f.unit_cost ?? undefined });
  const fe = save.fieldErrors;
  const preview = kind === 'receive' && Number(f.quantity) > 0 && f.unit_cost !== null ? (item.qty_on_hand * item.avg_cost + Number(f.quantity) * f.unit_cost) / (item.qty_on_hand + Number(f.quantity)) : null;
  const delta = kind === 'adjust' ? Number(f.counted_qty) - item.qty_on_hand : 0;
  return (
    <Modal open onClose={onClose} title={kind === 'receive' ? `Réception — ${item.code}` : kind === 'consume' ? `Sortie de stock — ${item.code}` : `Inventaire — ${item.code}`}
      description={kind === 'adjust' ? 'Saisissez la quantité comptée physiquement ; l’écart est enregistré comme ajustement motivé et valorisé.' : `${num(item.qty_on_hand)} ${item.unit} en stock · CUMP ${money(Math.round(item.avg_cost))}`}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={submit}>Enregistrer</Button></>}>
      <div className="form-grid">
        {kind !== 'adjust' && <Field label={`Quantité (${item.unit})`} required error={fe.quantity}><Input type="number" min={0} step="any" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></Field>}
        {kind === 'receive' && <>
          <Field label="Coût unitaire d’achat HT" required error={fe.unit_cost} hint={preview !== null ? `Nouveau CUMP estimé : ${money(Math.round(preview))}` : undefined}><MoneyInput value={f.unit_cost} onChange={(v) => setF({ ...f, unit_cost: v })} /></Field>
          <Field label="Fournisseur"><Input value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} /></Field>
          <Field label="Référence (bon de livraison, facture)"><Input value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} /></Field>
        </>}
        {kind === 'adjust' && <>
          <Field label={`Quantité comptée (${item.unit})`} required error={fe.counted_qty} hint={`Écart : ${delta > 0 ? '+' : ''}${num(delta)} ${item.unit}`}><Input type="number" min={0} step="any" value={f.counted_qty} onChange={(e) => setF({ ...f, counted_qty: e.target.value })} /></Field>
          {delta > 0 && !item.avg_cost && <Field label="Coût unitaire des quantités trouvées" error={fe.unit_cost}><MoneyInput value={f.unit_cost} onChange={(v) => setF({ ...f, unit_cost: v })} /></Field>}
        </>}
        {kind === 'consume' && <Field label="Campagne (facultatif)"><Select value={f.campaign_id ?? ''} onChange={(e) => setF({ ...f, campaign_id: e.target.value })} placeholder="—" options={(campaigns.data?.rows ?? []).map((c: any) => ({ value: c.id, label: `${c.ref} — ${c.title}` }))} /></Field>}
        {kind !== 'receive' && <Field label={kind === 'adjust' ? 'Motif de l’écart' : 'Motif de la sortie'} required className="span-2" error={fe.reason}><Textarea rows={2} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>}
        {save.error && !Object.keys(fe).length && <div className="span-2"><Alert tone="danger">{save.error.message}</Alert></div>}
      </div>
    </Modal>
  );
}

function BomEditor({ item, bom, onClose }: { item: any; bom: any[]; onClose: () => void }) {
  const all = useApi<any>(['stock-items', 'bom-pick'], '/api/stocks/items');
  const [lines, setLines] = useState<{ component_id: string; quantity: number | string }[]>(bom.map((b) => ({ component_id: b.component_id, quantity: b.quantity })));
  useEffect(() => { if (!lines.length) setLines([{ component_id: '', quantity: 1 }]); }, []);
  const save = useAction(() => api.put(`/api/stocks/items/${item.id}/bom`, { lines: lines.filter((l) => l.component_id).map((l) => ({ component_id: l.component_id, quantity: Number(l.quantity) })) }), {
    success: 'Nomenclature enregistrée', invalidate: [['stock-item', item.id], ['stock-items']], onSuccess: onClose,
  });
  const options = (all.data?.rows ?? []).filter((x: any) => x.id !== item.id && x.kind !== 'produit_fini').map((x: any) => ({ value: x.id, label: `${x.code} — ${x.label} (${x.unit})` }));
  return (
    <Modal open onClose={onClose} size="lg" title={`Nomenclature — ${item.code}`} description={`Composants nécessaires pour fabriquer 1 ${item.unit}. Seuls des matières premières et des semi-finis peuvent être des composants.`}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run(undefined)}>Enregistrer</Button></>}>
      <div className="stack">
        {lines.map((l, i) => (
          <div key={i} className="row">
            <Select aria-label="Composant" value={l.component_id} onChange={(e) => { const n = [...lines]; n[i] = { ...l, component_id: e.target.value }; setLines(n); }} placeholder="Choisir un composant…" options={options} />
            <Input aria-label="Quantité par unité" type="number" min={0} step="any" value={l.quantity} onChange={(e) => { const n = [...lines]; n[i] = { ...l, quantity: e.target.value }; setLines(n); }} style={{ width: 110 }} />
            <Button variant="ghost" iconOnly aria-label="Retirer le composant" icon={<Trash2 />} onClick={() => setLines(lines.filter((_, j) => j !== i))} />
          </div>
        ))}
        <div><Button size="sm" icon={<Plus />} onClick={() => setLines([...lines, { component_id: '', quantity: 1 }])}>Ajouter un composant</Button></div>
        {save.error && <Alert tone="danger">{save.error.message}</Alert>}
      </div>
    </Modal>
  );
}

/** Prix d'achat de l'article : réceptions (comptabilisées) et tarifs fournisseurs — utilisés pour chiffrer les devis. */
function PurchasePrices({ itemId, canAdd }: { itemId: string; canAdd: boolean }) {
  const r = useApi<any>(['stock-prices', itemId], `/api/stocks/items/${itemId}/prices`);
  const [f, setF] = useState<any>(null);
  const add = useAction((b: any) => api.post(`/api/stocks/items/${itemId}/prices`, b), { success: 'Tarif fournisseur enregistré', invalidate: [['stock-prices', itemId]], onSuccess: () => setF(null) });
  return (
    <Card title="Prix d’achat" sub="Réceptions (avec leur écriture d’achat) et tarifs fournisseurs ; choisis par le commercial pour chiffrer un devis" flush
      actions={canAdd && <Button size="sm" icon={<Plus />} onClick={() => setF({ supplier: '', unit_price: null, reference: '', valid_to: '' })}>Tarif fournisseur</Button>}>
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty title="Aucun prix d’achat enregistré" />} columns={[
        { key: 's', label: 'Fournisseur', render: (p: any) => <><div className="cell-title">{p.supplier}</div><div className="cell-sub">{p.reference || '—'}</div></> },
        { key: 'src', label: 'Origine', render: (p: any) => <Badge tone={p.source === 'tarif' ? 'info' : 'success'}>{p.source === 'tarif' ? 'Tarif' : 'Réception'}</Badge> },
        { key: 'p', label: 'Prix unitaire HT', num: true, render: (p: any) => money(p.unit_price) },
        { key: 'd', label: 'Validité', render: (p: any) => <span className="small">{date(p.valid_from)}{p.valid_to ? ` → ${date(p.valid_to)}` : ''}{!p.current && <> <Badge>Échu</Badge></>}</span>, mobile: 'hide' },
        { key: 'c', label: 'Comptabilité', render: (p: any) => p.entry_number ? <span className="small">{p.entry_number} · {p.entry_status}</span> : <span className="xsmall muted">{p.source === 'tarif' ? 'Pas d’achat' : '—'}</span>, mobile: 'hide' },
      ]} />
      <Modal open={!!f} onClose={() => setF(null)} title="Tarif fournisseur" description="Prix proposé par un fournisseur, sans réception : disponible pour chiffrer les devis, sans écriture comptable tant qu’aucun achat n’a lieu."
        footer={<><Button onClick={() => setF(null)}>Annuler</Button><Button variant="primary" loading={add.isPending} onClick={() => add.run({ ...f, unit_price: f.unit_price ?? 0, valid_to: f.valid_to || null })}>Enregistrer</Button></>}>
        {f && <div className="form-grid">
          <Field label="Fournisseur" required error={add.fieldErrors.supplier}><Input value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} /></Field>
          <Field label="Prix unitaire HT" required error={add.fieldErrors.unit_price}><MoneyInput value={f.unit_price} onChange={(v) => setF({ ...f, unit_price: v })} /></Field>
          <Field label="Référence (devis fournisseur)"><Input value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} /></Field>
          <Field label="Valable jusqu’au"><Input type="date" value={f.valid_to} onChange={(e) => setF({ ...f, valid_to: e.target.value })} /></Field>
        </div>}
      </Modal>
    </Card>
  );
}
