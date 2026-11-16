import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Factory, PackageCheck, PackageX } from 'lucide-react';

import { Card, DataTable, type Column } from '../components/ui';
import { api, queryString } from './api';
import { byPath } from './modules';
import { RecordDetail } from './Records';
import { date, money, type Page, type Row } from './types';
import { Empty, ErrorBox, Status } from './ui';

const projectModule = byPath('projets')!;

/** Disponibilité matière calculée depuis le stock serveur, jamais estimée côté navigateur. */
function Materials({ order }: { order: Row }) {
  const stock = useQuery({
    queryKey: ['project-materials', order.id],
    queryFn: async ({ signal }) => {
      const ids = new Set<string>((order.materials ?? []).map((line: Row) => line.stock_item_id));
      if (!ids.size) return [] as Row[];
      const page = await api.get<Page>('/stock-items?per_page=100', signal);
      return page.data.filter((item) => ids.has(item.id));
    },
  });
  if (!order.materials?.length) return <p className="muted">Aucune matière déclarée.</p>;
  if (stock.isLoading) return <p className="muted">Vérification des matières…</p>;
  if (stock.error) return <ErrorBox error={stock.error} retry={() => void stock.refetch()} />;
  const byId = new Map((stock.data ?? []).map((item) => [item.id, item]));
  return (
    <ul className="material-check">
      {order.materials.map((line: Row) => {
        const item = byId.get(line.stock_item_id);
        const needed = Number(line.quantity);
        const available = Number(item?.quantity_on_hand ?? 0);
        const enough = item ? available >= needed : false;
        return (
          <li key={line.stock_item_id} className={enough ? 'ok' : 'short'}>
            {enough ? <PackageCheck size={15} /> : <PackageX size={15} />}
            <span>
              {item?.label ?? 'Matière inconnue'} — besoin {needed.toLocaleString('fr-CI')} {item?.unit ?? ''}
              , disponible {available.toLocaleString('fr-CI')} {item?.unit ?? ''}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ProjectOrders() {
  const { id } = useParams();
  const orders = useQuery({
    queryKey: ['project-orders', id],
    queryFn: ({ signal }) => api.get<Page>(`/erp/production-orders${queryString({ per_page: 50 })}`, signal),
  });
  const rows = (orders.data?.data ?? []).filter((order) => order.project_id === id);
  const columns: Column<Row>[] = [
    {
      key: 'number',
      label: 'Ordre',
      render: (order) => <Link to={'/ordres-production/' + order.id}>{order.number || order.title}</Link>,
    },
    { key: 'title', label: 'Travaux' },
    { key: 'due_date', label: 'Échéance', render: (order) => date(order.due_date) },
    {
      key: 'actual_cost',
      label: 'Coût réel',
      num: true,
      render: (order) => money(order.actual_cost),
    },
    { key: 'status', label: 'Statut', render: (order) => <Status value={order.status} /> },
  ];
  return (
    <Card
      className="project-orders"
      title={
        <span className="card-title-icon">
          <Factory size={18} />
          Ordres de production du projet
        </span>
      }
      sub="Disponibilité des matières vérifiée sur le stock réel ; la consommation reste décidée par le circuit de fabrication."
      flush
    >
      <ErrorBox error={orders.error} retry={() => void orders.refetch()} />
      <DataTable
        columns={columns}
        rows={rows}
        loading={orders.isLoading}
        caption="Ordres de production liés au projet"
        empty={<Empty>Aucun ordre de production rattaché à ce projet.</Empty>}
      />
      {rows
        .filter((order) => !['livre', 'annule'].includes(order.status))
        .map((order) => (
          <div className="project-order-materials" key={order.id}>
            <h3>{order.number || order.title}</h3>
            <Materials order={order} />
          </div>
        ))}
      <p className="xsmall muted">
        <Link to="/nomenclatures">Nomenclatures</Link> ·{' '}
        <Link to="/ordres-production">Tous les ordres de production</Link>
      </p>
    </Card>
  );
}

export default function ProjectWorkspace() {
  return (
    <>
      <RecordDetail module={projectModule} />
      <ProjectOrders />
    </>
  );
}
