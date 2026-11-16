import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Factory, Play, Plus, Ban } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan } from '../lib/auth';
import { date, dateTime, money, num } from '../lib/format';
import { Alert, Badge, Button, Card, ConfirmModal, DataTable, Dl, Empty, Field, Input, LoadingBlock, Modal, MoneyInput, PageHeader, Segmented, Select, Status, Textarea } from '../components/ui';

export function OrderForm({ open, onClose, itemId }: { open: boolean; onClose: () => void; itemId?: string }) {
  const items = useApi<any>(['stock-items', 'makeable'], open ? '/api/stocks/items' : null);
  const [f, setF] = useState<any>({ item_id: itemId ?? '', quantity: 1, planned_date: '', labor_cost: null, notes: '' });
  const [, setSp] = useSearchParams();
  const save = useAction((b: any) => api.post('/api/production/orders', b), {
    success: (r: any) => `Ordre ${r.number} créé`, invalidate: [['production-orders'], ['stock-item']], onSuccess: (r: any) => { onClose(); setSp({ ordre: r.id }); },
  });
  const makeable = (items.data?.rows ?? []).filter((x: any) => x.kind !== 'matiere_premiere');
  const sel = makeable.find((x: any) => x.id === f.item_id);
  return (
    <Modal open={open} onClose={onClose} title="Nouvel ordre de fabrication" description="Les besoins en matières sont calculés depuis la nomenclature. Les composants sont consommés à la clôture de l’ordre, au coût moyen pondéré."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.item_id} onClick={() => save.run({ item_id: f.item_id, quantity: Number(f.quantity), planned_date: f.planned_date || null, labor_cost: f.labor_cost ?? undefined, notes: f.notes })}>Créer l’ordre</Button></>}>
      <div className="form-grid">
        <Field label="Article à fabriquer" required className="span-2" error={save.fieldErrors.item_id}><Select value={f.item_id} onChange={(e) => setF({ ...f, item_id: e.target.value })} placeholder="Choisir…" options={makeable.map((x: any) => ({ value: x.id, label: `${x.code} — ${x.label}${x.bom_count ? '' : ' (sans nomenclature)'}` }))} /></Field>
        <Field label={`Quantité${sel ? ` (${sel.unit})` : ''}`} required error={save.fieldErrors.quantity}><Input type="number" min={0} step="any" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></Field>
        <Field label="Date prévue"><Input type="date" value={f.planned_date} onChange={(e) => setF({ ...f, planned_date: e.target.value })} /></Field>
        <Field label="Main-d’œuvre totale (FCFA)" hint={sel ? `Par défaut : ${money(sel.labor_cost * (Number(f.quantity) || 0))} (${money(sel.labor_cost)} / unité)` : undefined}><MoneyInput value={f.labor_cost} onChange={(v) => setF({ ...f, labor_cost: v })} /></Field>
        <Field label="Notes" className="span-2"><Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        {save.error && !Object.keys(save.fieldErrors).length && <div className="span-2"><Alert tone="danger">{save.error.message}</Alert></div>}
      </div>
    </Modal>
  );
}

/** Production : ordres de fabrication, disponibilité des matières, clôture valorisée. */
export default function Production() {
  const can = useCan();
  const [sp, setSp] = useSearchParams();
  const [filter, setFilter] = useState('1');
  const list = useApi<any>(['production-orders', filter], `/api/production/orders${filter ? '?open=1' : ''}`);
  const sel = sp.get('ordre');
  const [form, setForm] = useState(false);
  return (
    <>
      <PageHeader title="Production" subtitle="Ordres de fabrication des supports, semi-finis et produits finis — consommation des matières et coût de revient réel"
        actions={can('production', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setForm(true)}>Nouvel ordre</Button>} />
      <Segmented label="Filtre" value={filter} onChange={setFilter} options={[{ id: '1', label: 'En cours et planifiés' }, { id: '', label: 'Tous' }]} />
      <div className="split">
        <Card flush>
          <DataTable rows={list.data?.rows} loading={list.isLoading} onRowClick={(o: any) => setSp({ ordre: o.id })} rowClass={(o: any) => (o.id === sel ? 'highlight' : '')}
            empty={<Empty icon={<Factory />} title="Aucun ordre de fabrication" />}
            columns={[
              { key: 'n', label: 'Ordre', render: (o: any) => <><div className="cell-title">{o.number}</div><div className="cell-sub">{o.item_code} — {o.item_label}</div></> },
              { key: 'q', label: 'Quantité', num: true, render: (o: any) => `${num(o.quantity)} ${o.item_unit}` },
              { key: 'd', label: 'Prévu', render: (o: any) => <span className="small">{o.planned_date ? date(o.planned_date) : '—'}</span>, mobile: 'hide' },
              { key: 'm', label: 'Matières', render: (o: any) => (['planifie', 'en_cours'].includes(o.status) ? (o.materials_available ? <Badge tone="success">Disponibles</Badge> : <Badge tone="warning">Manquantes</Badge>) : o.unit_cost ? <span className="small">{money(Math.round(o.unit_cost))} / u</span> : '—') },
              { key: 's', label: 'Statut', render: (o: any) => <Status kind="production_order" code={o.status} /> },
            ]} />
        </Card>
        <div className="stack-lg">{sel ? <OrderPanel id={sel} /> : <Card><Empty icon={<Factory />} title="Sélectionnez un ordre">Le détail affiche les besoins en matières, les disponibilités et le coût estimé.</Empty></Card>}</div>
      </div>
      {form && <OrderForm open onClose={() => setForm(false)} />}
    </>
  );
}

function OrderPanel({ id }: { id: string }) {
  const can = useCan();
  const r = useApi<any>(['production-order', id], `/api/production/orders/${id}`);
  const [cancel, setCancel] = useState(false);
  const inv = [['production-order', id], ['production-orders'], ['stock-items'], ['stock-item'], ['stock-valuation']];
  const start = useAction(() => api.post(`/api/production/orders/${id}/start`), { success: 'Ordre lancé', invalidate: inv });
  const complete = useAction(() => api.post(`/api/production/orders/${id}/complete`), { success: (o: any) => `Fabrication clôturée — coût unitaire ${money(Math.round(o.unit_cost))}`, invalidate: inv });
  const cancelA = useAction((reason: string) => api.post(`/api/production/orders/${id}/cancel`, { reason }), { success: 'Ordre annulé', invalidate: inv, onSuccess: () => setCancel(false) });
  if (r.isLoading) return <Card><LoadingBlock rows={6} /></Card>;
  if (!r.data) return null;
  const { order: o, lines, estimated_cost, estimated_unit_cost } = r.data;
  const open = ['planifie', 'en_cours'].includes(o.status);
  const short = lines.filter((l: any) => l.shortage > 0);
  return (
    <>
      <Card title={<span className="row" style={{ gap: 8 }}>{o.number}<Status kind="production_order" code={o.status} /></span>} sub={<Link to={`/stocks/${o.item_id}`}>{num(o.quantity)} {o.item_unit} · {o.item_code} — {o.item_label}</Link>}
        footer={open && can('production', 'update') && <div className="row-wrap">
          {o.status === 'planifie' && <Button icon={<Play />} loading={start.isPending} onClick={() => start.run(undefined)}>Lancer</Button>}
          <Button variant="primary" icon={<CheckCircle2 />} disabled={short.length > 0} loading={complete.isPending} onClick={() => complete.run(undefined)}>Clôturer la fabrication</Button>
          <Button variant="ghost" icon={<Ban />} onClick={() => setCancel(true)}>Annuler</Button></div>}>
        <div className="stack">
          {open && short.length > 0 && <Alert tone="warning" title="Matières manquantes">{short.map((l: any) => `${l.code} : ${num(l.shortage)} ${l.unit}`).join(' · ')}. Réceptionnez-les avant de clôturer.</Alert>}
          {complete.error && <Alert tone="danger">{complete.error.message}</Alert>}
          <Dl items={[
            ['Date prévue', o.planned_date ? date(o.planned_date) : '—'], ['Main-d’œuvre', money(o.labor_cost)],
            [o.status === 'termine' ? 'Matières consommées' : 'Coût estimé', o.status === 'termine' ? money(o.materials_cost) : `${money(estimated_cost)} (${money(estimated_unit_cost)} / ${o.item_unit})`],
            ...(o.status === 'termine' ? [['Coût unitaire réel', <strong>{money(Math.round(o.unit_cost))}</strong>], ['Clôturé', dateTime(o.completed_at)]] as [string, any][] : []),
            ...(o.quote_number ? [['Devis lié', o.quote_number]] as [string, any][] : []), ...(o.campaign_ref ? [['Campagne', o.campaign_ref]] as [string, any][] : []),
            ...(o.cancelled_reason ? [['Motif d’annulation', o.cancelled_reason]] as [string, any][] : []),
          ]} />
          {o.notes && <p className="small secondary" style={{ margin: 0 }}>{o.notes}</p>}
        </div>
      </Card>
      <Card title="Besoins en matières" flush>
        <DataTable rows={lines.map((l: any) => ({ ...l, id: l.component_id }))} compact columns={[
          { key: 'c', label: 'Composant', render: (l: any) => <Link to={`/stocks/${l.component_id}`}><span className="small strong">{l.code}</span><div className="xsmall muted">{l.label}</div></Link> },
          { key: 'b', label: 'Besoin', num: true, render: (l: any) => `${num(l.quantity)} ${l.unit}` },
          { key: 'd', label: open ? 'Disponible' : 'Coût unitaire', num: true, render: (l: any) => (open ? <span style={l.shortage > 0 ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{num(l.qty_on_hand)}</span> : money(Math.round(l.unit_cost ?? 0))) },
        ]} />
      </Card>
      <ConfirmModal open={cancel} onClose={() => setCancel(false)} danger title={`Annuler ${o.number} ?`} message="Aucune matière n’a été consommée : l’annulation est sans effet sur les stocks." reason={{ label: 'Motif', required: true }} confirmLabel="Annuler l’ordre" loading={cancelA.isPending} onConfirm={(t) => cancelA.run(t)} />
    </>
  );
}
