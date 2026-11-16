import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Wrench } from 'lucide-react';

import { Card, DataTable, type Column } from '../components/ui';
import { api, queryString } from './api';
import { byPath } from './modules';
import { RecordDetail } from './Records';
import { date, money, type Page, type Row } from './types';
import { Empty, ErrorBox, Status } from './ui';

const supportModule = byPath('supports')!;

/** Carte statique : la position vient du dossier serveur, aucune géolocalisation implicite. */
function Location({ row }: { row: Row }) {
  const lat = Number(row.latitude);
  const lng = Number(row.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (!lat && !lng))
    return (
      <p className="muted">
        <MapPin size={14} /> Coordonnées non renseignées.
      </p>
    );
  const latSpan = 0.01;
  const lngSpan = 0.01;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - lngSpan}%2C${lat - latSpan}%2C${lng + lngSpan}%2C${lat + latSpan}&marker=${lat}%2C${lng}`;
  return (
    <div className="support-map">
      <iframe
        title={`Localisation de ${row.label || row.code}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin"
      />
      <p className="xsmall muted">
        Aperçu cartographique OpenStreetMap en lecture seule · {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
    </div>
  );
}

function SupportActivity() {
  const { id } = useParams();
  const [tab, setTab] = useState<'reservations' | 'interventions'>('reservations');
  const support = useQuery({
    queryKey: ['detail', 'erp/supports', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/erp/supports/${id}`, signal),
  });
  const reservations = useQuery({
    queryKey: ['support-reservations', id],
    queryFn: ({ signal }) =>
      api.get<Page>(`/erp/reservations${queryString({ support_id: id, per_page: 100 })}`, signal),
  });
  const interventions = useQuery({
    queryKey: ['support-interventions', id],
    queryFn: ({ signal }) =>
      api.get<Page>(`/erp/interventions${queryString({ support_id: id, per_page: 100 })}`, signal),
  });
  const reservationColumns: Column<Row>[] = [
    {
      key: 'campaign',
      label: 'Campagne',
      render: (row) => <Link to={'/campagnes/' + row.campaign_id}>{row.campaign_title || 'Campagne'}</Link>,
    },
    { key: 'starts_on', label: 'Début', render: (row) => date(row.starts_on) },
    { key: 'ends_on', label: 'Fin', render: (row) => date(row.ends_on) },
    { key: 'amount', label: 'Montant', num: true, render: (row) => money(row.amount) },
    { key: 'status', label: 'Statut', render: (row) => <Status value={row.status} /> },
  ];
  const interventionColumns: Column<Row>[] = [
    {
      key: 'title',
      label: 'Intervention',
      render: (row) => <Link to={'/maintenance/' + row.id}>{row.title}</Link>,
    },
    { key: 'severity', label: 'Gravité', render: (row) => <Status value={row.severity} /> },
    { key: 'due_date', label: 'Échéance', render: (row) => date(row.due_date) },
    { key: 'assignee_name', label: 'Intervenant' },
    { key: 'status', label: 'Statut', render: (row) => <Status value={row.status} /> },
  ];
  const row = support.data?.data;
  return (
    <>
      <Card
        className="support-location"
        title={
          <span className="card-title-icon">
            <MapPin size={18} />
            Emplacement
          </span>
        }
        sub={row ? `${row.address || '—'} · ${row.municipality || '—'}, ${row.city || '—'}` : undefined}
      >
        <ErrorBox error={support.error} retry={() => void support.refetch()} />
        {row && <Location row={row} />}
      </Card>
      <Card
        className="support-occupation"
        title={
          <span className="card-title-icon">
            {tab === 'reservations' ? <Wrench size={18} /> : null}
            Occupation et maintenance
          </span>
        }
        actions={
          <div className="row">
            <button
              className="button"
              aria-pressed={tab === 'reservations'}
              onClick={() => setTab('reservations')}
            >
              Réservations ({reservations.data?.data.length ?? 0})
            </button>
            <button
              className="button"
              aria-pressed={tab === 'interventions'}
              onClick={() => setTab('interventions')}
            >
              Interventions ({interventions.data?.data.length ?? 0})
            </button>
          </div>
        }
        flush
      >
        <ErrorBox
          error={tab === 'reservations' ? reservations.error : interventions.error}
          retry={() => {
            void reservations.refetch();
            void interventions.refetch();
          }}
        />
        {tab === 'reservations' ? (
          <DataTable
            columns={reservationColumns}
            rows={reservations.data?.data}
            loading={reservations.isLoading}
            caption="Réservations de la face"
            empty={<Empty>Aucune réservation enregistrée pour cette face.</Empty>}
          />
        ) : (
          <DataTable
            columns={interventionColumns}
            rows={interventions.data?.data}
            loading={interventions.isLoading}
            caption="Interventions de la face"
            empty={<Empty>Aucune intervention enregistrée pour cette face.</Empty>}
          />
        )}
        <p className="xsmall muted">
          Une intervention ne bloque pas la face : la disponibilité commerciale dépend uniquement des
          réservations et du statut actif du support.
        </p>
      </Card>
    </>
  );
}

export default function SupportWorkspace() {
  return (
    <>
      <RecordDetail module={supportModule} />
      <SupportActivity />
    </>
  );
}
