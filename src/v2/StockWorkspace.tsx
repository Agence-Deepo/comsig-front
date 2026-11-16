import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Boxes } from 'lucide-react';

import { Card } from '../components/ui';
import { api } from './api';
import { byPath } from './modules';
import { RecordDetail } from './Records';
import { money, type Row } from './types';
import { ErrorBox } from './ui';

const stockModule = byPath('stocks')!;

const quantity = (value: unknown) => Number(value ?? 0).toLocaleString('fr-CI', { maximumFractionDigits: 4 });

/**
 * Valorisation calculée depuis le solde et le CUMP renvoyés par Laravel.
 * Le journal des mouvements reste dans le panneau du dossier pour éviter
 * d'afficher deux fois la même liste sur la fiche.
 */
function Valuation({ row }: { row: Row }) {
  const onHand = Number(row.quantity_on_hand ?? 0);
  const cost = Number(row.average_cost ?? 0);
  const minimum = Number(row.minimum_quantity ?? 0);
  const value = onHand * cost;
  const low = onHand <= minimum;
  return (
    <Card
      className="stock-valuation"
      title={
        <span className="card-title-icon">
          <Boxes size={18} />
          Valorisation
        </span>
      }
      sub="Solde, coût moyen pondéré et seuil d’alerte fournis par le serveur."
    >
      <div className="quote-totals">
        <div>
          <span>Disponible</span>
          <strong>
            {quantity(onHand)} {row.unit || ''}
          </strong>
        </div>
        <div>
          <span>CUMP</span>
          <strong>{money(cost)}</strong>
        </div>
        <div className="grand-total">
          <span>Valeur du stock</span>
          <strong>{money(value)}</strong>
        </div>
        <div>
          <span>Seuil d’alerte</span>
          <strong>
            {quantity(minimum)} {row.unit || ''}
          </strong>
        </div>
      </div>
      {low && (
        <div className="notice warning" role="status">
          Seuil atteint ou dépassé : {quantity(onHand)} disponible pour un seuil de {quantity(minimum)}. Un
          réapprovisionnement reste une décision humaine, aucune commande n’est créée automatiquement.
        </div>
      )}
      <p className="xsmall muted">
        La valeur affichée est indicative : elle multiplie le solde par le dernier CUMP calculé par Laravel,
        sans réévaluation automatique ni écriture comptable. Les mouvements détaillés restent dans le panneau
        du dossier.
      </p>
      <p className="xsmall muted">
        <Link to="/nomenclatures">Nomenclatures</Link> ·{' '}
        <Link to="/ordres-production">Ordres de production</Link>
      </p>
    </Card>
  );
}

function StockExtras() {
  const { id } = useParams();
  const item = useQuery({
    queryKey: ['detail', 'stock-items', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/stock-items/${id}`, signal),
  });
  return (
    <>
      <ErrorBox error={item.error} retry={() => void item.refetch()} />
      {item.data?.data && <Valuation row={item.data.data} />}
    </>
  );
}

export default function StockWorkspace() {
  return (
    <>
      <RecordDetail module={stockModule} />
      <StockExtras />
    </>
  );
}
