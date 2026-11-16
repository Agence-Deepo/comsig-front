import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Factory, PackageCheck, PackageX, Plus } from 'lucide-react';

import { Badge, Card, DataTable, Segmented, type Column } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { RecordForm } from './forms';
import { byPath } from './modules';
import { RecordDetail } from './Records';
import { can, date, money, type Page, type Row } from './types';
import { Empty, ErrorBox, PageTitle, Status } from './ui';

const orderModule = byPath('ordres-production')!;

const quantity = (value: unknown) => Number(value ?? 0).toLocaleString('fr-CI', { maximumFractionDigits: 4 });

/** Disponibilité réelle des matières, calculée depuis le stock renvoyé par Laravel. */
function Materials({ order }: { order: Row }) {
  const stock = useQuery({
    queryKey: ['workshop-materials'],
    queryFn: async ({ signal }) => {
      const page = await api.get<Page>('/stock-items?per_page=100', signal);
      return page.data;
    },
  });
  const lines = (order.materials ?? []) as Row[];
  if (!lines.length) return <p className="muted">Aucune matière déclarée.</p>;
  if (stock.isLoading) return <p className="muted">Vérification des matières…</p>;
  if (stock.error) return <ErrorBox error={stock.error} retry={() => void stock.refetch()} />;
  const byId = new Map((stock.data ?? []).map((item) => [item.id, item]));
  const shortages = lines.filter((line) => {
    const item = byId.get(line.stock_item_id);
    return !item || Number(item.quantity_on_hand) < Number(line.quantity);
  });
  return (
    <>
      {shortages.length > 0 && (
        <div className="notice warning" role="status">
          Matières insuffisantes : {shortages.length} ligne{shortages.length > 1 ? 's' : ''}. Une réception de
          stock est nécessaire avant la fabrication.
        </div>
      )}
      <ul className="material-check">
        {lines.map((line) => {
          const item = byId.get(line.stock_item_id);
          const enough = item ? Number(item.quantity_on_hand) >= Number(line.quantity) : false;
          return (
            <li key={line.stock_item_id} className={enough ? 'ok' : 'short'}>
              {enough ? <PackageCheck size={15} /> : <PackageX size={15} />}
              <span>
                {item?.label ?? 'Matière inconnue'} — besoin {quantity(line.quantity)} {item?.unit ?? ''},
                disponible {quantity(item?.quantity_on_hand)} {item?.unit ?? ''}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Vue atelier : file des ordres à gauche, fiche de l’ordre sélectionné à droite. */
export default function ProductionWorkshop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'open' | 'all'>('open');
  const [creating, setCreating] = useState(false);
  const orders = useQuery({
    queryKey: ['workshop-orders'],
    queryFn: ({ signal }) => api.get<Page>('/erp/production-orders?per_page=100', signal),
  });
  const rows = (orders.data?.data ?? []).filter((order) =>
    view === 'open' ? !['livre', 'annule'].includes(order.status) : true,
  );
  const columns: Column<Row>[] = [
    {
      key: 'number',
      label: 'Ordre',
      render: (order) => (
        <>
          <div className="cell-title">{order.number || order.title}</div>
          <div className="cell-sub">{order.title}</div>
        </>
      ),
    },
    { key: 'due_date', label: 'Échéance', render: (order) => date(order.due_date) },
    { key: 'quantity', label: 'Quantité', num: true, render: (order) => quantity(order.quantity) },
    {
      key: 'actual_cost',
      label: 'Coût réel',
      num: true,
      render: (order) =>
        Number(order.actual_cost) > 0 ? money(order.actual_cost) : <span className="muted">—</span>,
    },
    { key: 'status', label: 'Statut', render: (order) => <Status value={order.status} /> },
  ];
  return (
    <>
      <PageTitle
        eyebrow="PRODUCTION"
        title="Atelier — file de fabrication"
        description="Un ordre à la fois : ouvrez une ligne pour consulter la fiche et la disponibilité réelle des matières."
        actions={
          can(user, 'production.create') ? (
            <button className="button primary" onClick={() => setCreating(true)}>
              <Plus size={16} />
              Créer un ordre de production
            </button>
          ) : undefined
        }
      />
      <Card
        title={
          <span className="card-title-icon">
            <Factory size={18} />
            Ordres de fabrication
          </span>
        }
        sub="Filtrer la file puis ouvrir un ordre."
        actions={
          <Segmented
            label="Filtre"
            value={view}
            onChange={setView}
            options={[
              { id: 'open', label: 'En cours' },
              { id: 'all', label: 'Tous' },
            ]}
          />
        }
        flush
      >
        <ErrorBox error={orders.error} retry={() => void orders.refetch()} />
        <DataTable
          columns={columns}
          rows={rows}
          loading={orders.isLoading}
          onRowClick={(order) => navigate(`/ordres-production/${order.id}`)}
          caption="Ordres de fabrication"
          empty={<Empty>Aucun ordre de fabrication dans ce filtre.</Empty>}
        />
      </Card>
      {creating && (
        <RecordForm
          title="Créer un ordre de production"
          fields={orderModule.fields}
          path="/erp/production-orders"
          close={() => setCreating(false)}
          saved={(order) => navigate(`/ordres-production/${order.id}`)}
        />
      )}
      <p className="xsmall muted">
        <Link to="/nomenclatures">Nomenclatures</Link> · <Link to="/stocks">Stocks et matières</Link>
      </p>
    </>
  );
}

/** Fiche d’un ordre : les opérations du circuit restent dans le panneau du dossier. */
export function WorkshopOrderRoute() {
  const { id } = useParams();
  const order = useQuery({
    queryKey: ['detail', 'erp/production-orders', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/erp/production-orders/${id}`, signal),
    enabled: Boolean(id),
  });
  const row = order.data?.data;
  const { user } = useAuth();
  return (
    <>
      <RecordDetail module={orderModule} key={id} />
      <ErrorBox error={order.error} retry={() => void order.refetch()} />
      {row && (
        <Card
          className="workshop-materials"
          title={
            <span className="card-title-icon">
              <PackageCheck size={18} />
              Disponibilité des matières
            </span>
          }
          sub={
            <>
              <Badge tone="neutral">{row.number || row.title}</Badge> Quantité demandée :{' '}
              {quantity(row.quantity)}
            </>
          }
        >
          <Materials order={row} />
        </Card>
      )}
      <p className="xsmall muted">
        <Link to="/ordres-production">Retour à la file d’atelier</Link>
        {can(user, 'production.update')
          ? ' · Vous pouvez faire avancer le circuit depuis la fiche.'
          : ' · Consultation seule.'}
      </p>
    </>
  );
}
