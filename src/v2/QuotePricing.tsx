import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { can, date, money, today, type Row } from './types';
import { ActionForm, ErrorBox, Loading } from './ui';

const tiers: Record<string, string> = {
  standard: 'Standard',
  grand_compte: 'Grand compte',
  institutionnel: 'Institutionnel',
  revendeur: 'Revendeur',
};
export function ClientPricing({ id }: { id: string }) {
  const { user } = useAuth(),
    qc = useQueryClient();
  const [edit, setEdit] = useState(false);
  const q = useQuery({
    queryKey: ['client-pricing', id],
    queryFn: () => api.get('/organizations/' + id + '/pricing'),
  });
  return (
    <Card
      title="Conditions tarifaires"
      actions={
        can(user, 'organizations.update') &&
        q.data && (
          <button className="btn" onClick={() => setEdit(true)}>
            Modifier la tarification
          </button>
        )
      }
    >
      <ErrorBox error={q.error} />
      {q.isLoading ? (
        <Loading />
      ) : (
        q.data && (
          <>
            <p>
              {tiers[q.data.tier]} · majoration du coût : <strong>{q.data.markup_pct} %</strong>
            </p>
            <p className="small muted">
              {q.data.source === 'client'
                ? 'Taux propre au client, prioritaire sur sa catégorie.'
                : 'Taux de la catégorie.'}{' '}
              Les devis existants ne sont pas recalculés automatiquement.
            </p>
          </>
        )
      )}
      {edit && (
        <ActionForm
          title="Tarification du client"
          close={() => setEdit(false)}
          submit={async (f) => {
            await api.put('/organizations/' + id + '/pricing', {
              pricing_tier: f.get('pricing_tier'),
              use_category_markup: f.get('mode') === 'categorie',
              markup_pct: Number(f.get('markup_pct')),
            });
            await qc.invalidateQueries();
          }}
        >
          <label className="field">
            Catégorie tarifaire
            <select name="pricing_tier" defaultValue={q.data.tier}>
              {Object.entries(q.data.tiers).map(([key, value]) => (
                <option key={key} value={key}>
                  {tiers[key]} — {String(value)} %
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Taux à utiliser
            <select name="mode" defaultValue={q.data.source === 'client' ? 'client' : 'categorie'}>
              <option value="client">Taux propre au client</option>
              <option value="categorie">Taux de la catégorie</option>
            </select>
          </label>
          <label className="field">
            Taux propre (%)
            <input
              name="markup_pct"
              type="number"
              min="0"
              max="500"
              step="0.01"
              defaultValue={q.data.markup_pct}
              required
            />
          </label>
          <p>Ce choix servira aux nouveaux chiffrages ; il ne réécrit aucun devis existant.</p>
        </ActionForm>
      )}
    </Card>
  );
}

export function StockCostFields({
  id,
  value,
  change,
}: {
  id: string;
  value: Row;
  change: (patch: Row) => void;
}) {
  const q = useQuery({
    queryKey: ['stock-pricing', id],
    queryFn: () => api.get('/stock-items/' + id + '/pricing'),
    enabled: !!id,
  });
  const basis = value.cost_basis || 'cump';
  return (
    <>
      <ErrorBox error={q.error} />
      <label className="field">
        Base du coût d’achat
        <select
          aria-label="Base du coût d’achat"
          value={basis}
          onChange={(e) =>
            change({ cost_basis: e.target.value, purchase_price_id: undefined, bom_id: undefined })
          }
        >
          <option value="cump">CUMP (ou nomenclature si CUMP inconnu)</option>
          <option value="dernier">Dernière entrée valorisée</option>
          <option value="tarif">Tarif fournisseur</option>
          <option value="nomenclature">Nomenclature active</option>
        </select>
      </label>
      {basis === 'tarif' && (
        <label className="field">
          Tarif fournisseur
          <select
            aria-label="Tarif fournisseur"
            required
            value={value.purchase_price_id || ''}
            onChange={(e) => change({ purchase_price_id: Number(e.target.value) || undefined })}
          >
            <option value="">Choisir un prix d’achat</option>
            {q.data?.prices
              .filter(
                (p: Row) =>
                  p.is_active && p.valid_from <= today() && (!p.valid_until || p.valid_until >= today()),
              )
              .map((p: Row) => (
                <option key={p.id} value={p.id}>
                  {p.supplier} — {money(p.unit_price)}
                </option>
              ))}
          </select>
        </label>
      )}
      {basis === 'nomenclature' && (
        <label className="field">
          Nomenclature
          <select
            aria-label="Nomenclature"
            required
            value={value.bom_id || ''}
            onChange={(e) => change({ bom_id: e.target.value || undefined })}
          >
            <option value="">Choisir…</option>
            {q.data?.boms.map((b: Row) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );
}

export function StockPurchasePrices({ id }: { id: string }) {
  const { user } = useAuth(),
    qc = useQueryClient();
  const [edit, setEdit] = useState(false),
    [disable, setDisable] = useState<Row | null>(null);
  const q = useQuery({
    queryKey: ['stock-pricing', id],
    queryFn: () => api.get('/stock-items/' + id + '/pricing'),
  });
  return (
    <Card
      title="Prix d’achat fournisseurs"
      actions={
        can(user, 'stocks.update') && (
          <button className="btn" onClick={() => setEdit(true)}>
            Ajouter un tarif fournisseur
          </button>
        )
      }
    >
      <ErrorBox error={q.error} />
      <p className="small muted">
        Tarifs de chiffrage, sans entrée de stock. L’ancien prix reste conservé ; désactivez-le et ajoutez un
        nouveau tarif pour le remplacer.
      </p>
      {q.data?.prices.map((p: Row) => (
        <div className="list-item" key={p.id}>
          <div className="spacer">
            <strong>
              {p.supplier} · {money(p.unit_price)}
            </strong>
            <div>
              {date(p.valid_from)} — {p.valid_until ? date(p.valid_until) : 'sans échéance'} ·{' '}
              {p.is_active ? 'Actif' : 'Désactivé'}
            </div>
          </div>
          {p.is_active && can(user, 'stocks.update') && (
            <button className="btn btn-ghost" onClick={() => setDisable(p)}>
              Désactiver
            </button>
          )}
        </div>
      ))}
      {edit && (
        <ActionForm
          title="Tarif fournisseur"
          close={() => setEdit(false)}
          submit={async (f) => {
            await api.post('/stock-items/' + id + '/prices', {
              supplier: f.get('supplier'),
              unit_price: Number(f.get('unit_price')),
              valid_from: f.get('valid_from'),
              valid_until: f.get('valid_until') || null,
            });
            await qc.invalidateQueries({ queryKey: ['stock-pricing', id] });
          }}
        >
          <label className="field">
            Fournisseur
            <input name="supplier" required maxLength={150} />
          </label>
          <label className="field">
            Prix d’achat unitaire (FCFA)
            <input name="unit_price" type="number" min="1" max="1000000000000" step="1" required />
          </label>
          <label className="field">
            En vigueur le
            <input name="valid_from" type="date" defaultValue={today()} required />
          </label>
          <label className="field">
            Fin de validité
            <input name="valid_until" type="date" />
          </label>
        </ActionForm>
      )}
      {disable && (
        <ActionForm
          title="Désactiver ce tarif"
          close={() => setDisable(null)}
          submit={async () => {
            await api.post('/stock-items/' + id + '/prices/' + disable.id + '/disable');
            await qc.invalidateQueries({ queryKey: ['stock-pricing', id] });
          }}
        >
          <p>Les devis et leurs anciens coûts restent conservés.</p>
        </ActionForm>
      )}
    </Card>
  );
}
