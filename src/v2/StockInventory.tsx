import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Warehouse } from 'lucide-react';

import { Card, DataTable, type Column } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { can, date, money, today, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, PageTitle, Status } from './ui';

const qty = (value: unknown) => Number(value ?? 0).toLocaleString('fr-CI', { maximumFractionDigits: 4 });

function WarehouseFilter({ value, change }: { value: string; change: (id: string) => void }) {
  const warehouses = useQuery({
    queryKey: ['stock-warehouses'],
    queryFn: () => api.get<{ data: Row[] }>('/stock-warehouses'),
  });
  return (
    <label className="field">
      Entrepôt
      <select value={value} onChange={(event) => change(event.target.value)}>
        {(warehouses.data?.data ?? []).map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.label}
            {warehouse.is_active ? '' : ' (inactif)'}
          </option>
        ))}
      </select>
    </label>
  );
}

function CountSession({ id }: { id: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, { counted: string; reason: string }>>({});
  const count = useQuery({
    queryKey: ['stock-count', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/stock-counts/${id}`, signal),
  });
  const record = count.data?.data;
  const editable = record?.status === 'brouillon' && can(user, 'stocks.update');
  const value = (line: Row) =>
    values[line.id] ?? { counted: String(line.counted ?? ''), reason: line.reason ?? '' };
  const update = (line: Row, patch: Partial<{ counted: string; reason: string }>) =>
    setValues({ ...values, [line.id]: { ...value(line), ...patch } });
  const lines: Row[] = record?.lines ?? [];
  const hasGap = lines.some((line) => Number(value(line).counted || 0) !== Number(line.theoretical || 0));
  return (
    <Card
      className="stock-count-session"
      title={
        <span className="card-title-icon">
          <Warehouse size={18} />
          Inventaire {record?.reference ?? ''}
        </span>
      }
      sub={
        record
          ? `${record.warehouse_label} · compté le ${date(record.counted_on)} · statut ${record.status}`
          : undefined
      }
      actions={
        <>
          <Link className="button" to="/stocks/inventaire">
            Retour
          </Link>
          {editable && (
            <button
              className="button primary"
              onClick={async () => {
                await api.patch(`/stock-counts/${record.id}`, {
                  submit: true,
                  lines: lines.map((line) => ({
                    stock_item_id: line.stock_item_id,
                    counted: Number(value(line).counted),
                    reason: value(line).reason || undefined,
                  })),
                });
                await qc.invalidateQueries();
              }}
            >
              Soumettre le comptage
            </button>
          )}
          {record?.status === 'compte' &&
            Number(record.owner_id) !== user?.id &&
            can(user, 'stocks.update') && (
              <button
                className="button primary"
                onClick={async () => {
                  await api.post(`/stock-counts/${record.id}/validate`);
                  await qc.invalidateQueries();
                }}
              >
                Valider et corriger le stock
              </button>
            )}
        </>
      }
      flush
    >
      <ErrorBox error={count.error} retry={() => void count.refetch()} />
      {record?.status === 'compte' && Number(record.owner_id) === user?.id && (
        <div className="panel-body">
          <div className="notice warning">
            Une autre personne doit valider cet inventaire : vous ne pouvez pas approuver votre propre
            comptage.
          </div>
        </div>
      )}
      <div className="table-scroll">
        <table className="table responsive">
          <thead>
            <tr>
              <th>Article</th>
              <th className="num">Théorique</th>
              <th className="num">Compté</th>
              <th className="num">Écart</th>
              <th>Motif de l’écart</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const current = value(line);
              const gap = Number(current.counted || 0) - Number(line.theoretical || 0);
              return (
                <tr key={line.id}>
                  <td>
                    <div className="cell-title">{line.label}</div>
                    <div className="cell-sub">{line.code}</div>
                  </td>
                  <td className="num">
                    {qty(line.theoretical)} {line.unit}
                  </td>
                  <td className="num">
                    <input
                      aria-label={`Quantité comptée ${line.label}`}
                      className="input num"
                      type="number"
                      min="0"
                      step="0.0001"
                      disabled={!editable}
                      value={current.counted}
                      onChange={(event) => update(line, { counted: event.target.value })}
                    />
                  </td>
                  <td className="num">{gap === 0 ? '—' : qty(gap)}</td>
                  <td>
                    <input
                      aria-label={`Motif de l’écart ${line.label}`}
                      className="input"
                      disabled={!editable || gap === 0}
                      value={current.reason}
                      onChange={(event) => update(line, { reason: event.target.value })}
                      placeholder={gap === 0 ? 'Aucun écart' : 'Obligatoire'}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="xsmall muted">
        {hasGap
          ? 'Chaque écart exige un motif. Le stock ne change qu’après validation par une autre personne.'
          : 'Aucun écart saisi pour le moment.'}
      </p>
    </Card>
  );
}

export function StockLevels() {
  const [warehouseId, setWarehouseId] = useState('');
  const levels = useQuery({
    queryKey: ['stock-levels', warehouseId],
    queryFn: ({ signal }) =>
      api.get<{ data: Row[] }>(`/stock-levels${queryString({ warehouse_id: warehouseId })}`, signal),
    enabled: Boolean(warehouseId),
  });
  const columns: Column<Row>[] = [
    {
      key: 'label',
      label: 'Article',
      render: (row) => (
        <>
          <Link className="cell-title record-link" to={'/stocks/' + row.stock_item_id}>
            {row.label}
          </Link>
          <div className="cell-sub">{row.code}</div>
        </>
      ),
    },
    {
      key: 'quantity',
      label: 'Disponible',
      num: true,
      render: (row) => (
        <>
          {qty(row.quantity)} {row.unit}
        </>
      ),
    },
    {
      key: 'minimum_quantity',
      label: 'Seuil',
      num: true,
      render: (row) => (
        <>
          {qty(row.minimum_quantity)} {row.unit}
        </>
      ),
    },
    { key: 'average_cost', label: 'CUMP', num: true, render: (row) => money(row.average_cost) },
    {
      key: 'alert',
      label: 'État',
      render: (row) =>
        Number(row.quantity) <= Number(row.minimum_quantity) ? (
          <Status value="alerte" />
        ) : (
          <span className="muted">Suffisant</span>
        ),
    },
  ];
  return (
    <Card
      title={
        <span className="card-title-icon">
          <MapPin size={18} />
          Stock par entrepôt
        </span>
      }
      sub="Le solde global reste calculé par Laravel ; cette vue détaille la répartition."
      flush
    >
      <div className="panel-body">
        <WarehouseFilter value={warehouseId} change={setWarehouseId} />
      </div>
      <ErrorBox error={levels.error} retry={() => void levels.refetch()} />
      <DataTable
        columns={columns}
        rows={levels.data?.data}
        loading={levels.isLoading}
        caption="Niveaux de stock de l’entrepôt"
        empty={<Empty>Choisissez un entrepôt pour afficher ses niveaux.</Empty>}
      />
    </Card>
  );
}

export default function StockInventory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [warehouseId, setWarehouseId] = useState('');
  const [creating, setCreating] = useState(false);
  const counts = useQuery({
    queryKey: ['stock-counts', warehouseId],
    queryFn: ({ signal }) =>
      api.get<Page>(`/stock-counts${queryString({ warehouse_id: warehouseId, per_page: 50 })}`, signal),
  });
  const columns: Column<Row>[] = [
    {
      key: 'reference',
      label: 'Inventaire',
      render: (row) => <Link to={'/stocks/inventaire/' + row.id}>{row.reference}</Link>,
    },
    { key: 'warehouse_label', label: 'Entrepôt' },
    { key: 'counted_on', label: 'Date', render: (row) => date(row.counted_on) },
    { key: 'status', label: 'Statut', render: (row) => <Status value={row.status} /> },
  ];
  return (
    <>
      <PageTitle
        eyebrow="STOCKS"
        title="Inventaire physique"
        description="Comptage contradictoire par entrepôt : aucune correction n’est appliquée sans motif ni validation indépendante."
        actions={
          can(user, 'stocks.update') ? (
            <button className="button primary" onClick={() => setCreating(true)}>
              <Plus size={16} />
              Nouvel inventaire
            </button>
          ) : undefined
        }
      />
      <StockLevels />
      <Card className="stock-counts" title="Sessions d’inventaire" flush>
        <div className="panel-body">
          <WarehouseFilter value={warehouseId} change={setWarehouseId} />
        </div>
        <ErrorBox error={counts.error} retry={() => void counts.refetch()} />
        <DataTable
          columns={columns}
          rows={counts.data?.data}
          loading={counts.isLoading}
          caption="Inventaires physiques"
          empty={<Empty>Aucun inventaire enregistré.</Empty>}
        />
      </Card>
      {creating && (
        <ActionForm
          title="Nouvel inventaire"
          submitLabel="Ouvrir l’inventaire"
          close={() => setCreating(false)}
          submit={async (form) => {
            await api.post('/stock-counts', Object.fromEntries(form));
            await qc.invalidateQueries();
          }}
        >
          <label className="field">
            Entrepôt *
            <select name="warehouse_id" required defaultValue={warehouseId}>
              <option value="">Sélectionner un entrepôt</option>
              <WarehouseOptions />
            </select>
          </label>
          <label className="field">
            Date du comptage *
            <input name="counted_on" type="date" required defaultValue={today()} max={today()} />
          </label>
          <label className="field">
            Observations
            <textarea name="notes" maxLength={2000} />
          </label>
          <p className="muted">
            Les quantités théoriques sont figées à l’ouverture. Un seul inventaire ouvert par entrepôt.
          </p>
        </ActionForm>
      )}
    </>
  );
}

export function WarehouseOptions({ includeDefault = false }: { includeDefault?: boolean } = {}) {
  const warehouses = useQuery({
    queryKey: ['stock-warehouses'],
    queryFn: () => api.get<{ data: Row[] }>('/stock-warehouses'),
  });
  return (
    <>
      {includeDefault && <option value="">Entrepôt principal</option>}
      {(warehouses.data?.data ?? []).map((warehouse) => (
        <option key={warehouse.id} value={warehouse.id}>
          {warehouse.label}
        </option>
      ))}
    </>
  );
}

export { CountSession };
