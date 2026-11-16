// Base du prix d'achat d'une matière dans un devis : coût moyen (CUMP), dernier prix d'achat ou tarif d'un fournisseur
import { useApi } from '../lib/hooks';
import { money } from '../lib/format';

export function PriceBasis({ itemId, basis, priceId, onChange, disabled }: { itemId: string; basis?: string | null; priceId?: string | null; onChange: (v: { cost_basis: string; purchase_price_id: string | null }) => void; disabled?: boolean }) {
  const r = useApi<any>(['stock-prices', itemId], itemId ? `/api/stocks/items/${itemId}/prices` : null);
  const cur = basis === 'tarif' && priceId ? `tarif:${priceId}` : basis === 'dernier' ? 'dernier' : 'cump';
  const it = r.data?.item;
  const tariffs = (r.data?.rows ?? []).filter((p: any) => p.current);
  return (
    <select className="select select-sm" aria-label="Base du prix d’achat" disabled={disabled} value={cur} style={{ height: 26, maxWidth: 260 }}
      onChange={(e) => { const v = e.target.value; onChange(v.startsWith('tarif:') ? { cost_basis: 'tarif', purchase_price_id: v.slice(6) } : { cost_basis: v, purchase_price_id: null }); }}>
      <option value="cump">Coût moyen{it ? ` (${money(it.avg_cost)})` : ''}</option>
      {it?.last_purchase_price != null && <option value="dernier">Dernier achat ({money(it.last_purchase_price)})</option>}
      {tariffs.map((p: any) => <option key={p.id} value={`tarif:${p.id}`}>{p.source === 'tarif' ? 'Tarif' : 'Achat'} {p.supplier} — {money(p.unit_price)}</option>)}
    </select>
  );
}
