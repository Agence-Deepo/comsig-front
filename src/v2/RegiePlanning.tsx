import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarRange } from 'lucide-react';

import { Card, DataTable, Segmented, type Column } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { allRecords } from './forms';
import { can, date, money, type Page, type Row } from './types';
import { Empty, ErrorBox, PageTitle, Status } from './ui';

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / DAY);

function defaultWindow() {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 7);
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + 60);
  return { from: iso(start), to: iso(end) };
}

/** Planning en lecture seule : une ligne par face, une barre par réservation active. */
function Timeline({ supports, reservations }: { supports: Row[]; reservations: Row[] }) {
  const rows = supports
    .map((support) => ({
      support,
      items: reservations.filter((item) => item.support_id === support.id),
    }))
    .filter((row) => row.items.length > 0 || row.support.is_active !== false);
  const bounds = reservations.length
    ? reservations.reduce(
        (acc, item) => ({
          from: item.starts_on < acc.from ? item.starts_on : acc.from,
          to: item.ends_on > acc.to ? item.ends_on : acc.to,
        }),
        { from: reservations[0].starts_on, to: reservations[0].ends_on },
      )
    : { from: todayIso(), to: todayIso() };
  const span = Math.max(1, dayDiff(bounds.from, bounds.to) + 1);
  if (!rows.length) return <Empty>Aucune face active. Créez un support ou vérifiez vos droits.</Empty>;
  return (
    <div className="planning-timeline">
      <div className="planning-scale" aria-hidden>
        <span>{date(bounds.from)}</span>
        <span>{date(bounds.to)}</span>
      </div>
      {rows.map(({ support, items }) => (
        <div className="planning-row" key={support.id}>
          <div className="planning-label">
            <Link to={'/supports/' + support.id}>{support.label || support.code}</Link>
            <small>
              {support.municipality || '—'} · {support.dimensions || '—'}
              {items.length ? '' : ' · libre sur la période'}
            </small>
          </div>
          <div className={`planning-track${items.length ? '' : ' planning-free'}`}>
            {items.map((item) => {
              const left = (dayDiff(bounds.from, item.starts_on) / span) * 100;
              const width = Math.max(((dayDiff(item.starts_on, item.ends_on) + 1) / span) * 100, 2);
              return (
                <Link
                  key={item.id}
                  to={'/reservations/' + item.id}
                  className="planning-bar"
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${item.campaign_title || 'Campagne'} · ${date(item.starts_on)} → ${date(item.ends_on)} · ${money(item.amount)}`}
                >
                  {item.campaign_title || 'Campagne'}
                </Link>
              );
            })}
            {!items.length && <span className="planning-free-label">Libre</span>}
          </div>
        </div>
      ))}
      <p className="xsmall muted">
        Barres calculées depuis les réservations confirmées du serveur. Les faces sans réservation
        apparaissent libres sur la période ; aucune réservation ne peut être créée depuis cet écran.
      </p>
    </div>
  );
}
const todayIso = () => new Date().toISOString().slice(0, 10);

export default function Planning() {
  const { user } = useAuth();
  const allowed = can(user, 'campaigns.view');
  const [window, setWindow] = useState(defaultWindow);
  const [view, setView] = useState<'timeline' | 'list'>('timeline');
  const reservations = useQuery({
    queryKey: ['planning-reservations', window],
    queryFn: ({ signal }) =>
      api.get<Page>(
        '/erp/reservations' +
          queryString({ from: window.from, to: window.to, status: 'reserve', per_page: 100 }),
        signal,
      ),
    enabled: allowed,
  });
  const supports = useQuery({
    queryKey: ['planning-supports'],
    queryFn: ({ signal }) => allRecords('erp/supports', signal),
    enabled: allowed,
  });
  const supportById = useMemo(
    () => new Map((supports.data ?? []).map((row) => [row.id, row])),
    [supports.data],
  );
  const rows = (reservations.data?.data ?? []).map((row) => ({
    ...row,
    support_label: supportById.get(row.support_id)?.label ?? row.support_label,
    municipality: supportById.get(row.support_id)?.municipality ?? '—',
  }));
  const columns: Column<Row>[] = [
    {
      key: 'campaign',
      label: 'Campagne',
      render: (row) => <Link to={'/campagnes/' + row.campaign_id}>{row.campaign_title || 'Campagne'}</Link>,
    },
    {
      key: 'support',
      label: 'Face',
      render: (row) => <Link to={'/supports/' + row.support_id}>{row.support_label || 'Face'}</Link>,
    },
    { key: 'municipality', label: 'Commune' },
    { key: 'starts_on', label: 'Début', render: (row) => date(row.starts_on) },
    { key: 'ends_on', label: 'Fin', render: (row) => date(row.ends_on) },
    { key: 'amount', label: 'Montant', num: true, render: (row) => money(row.amount) },
  ];
  return (
    <>
      <PageTitle
        eyebrow="RÉGIE"
        title="Planning des faces"
        description="Occupation des supports publicitaires sur une période, calculée depuis les réservations du serveur."
        actions={
          <Segmented
            label="Affichage"
            value={view}
            onChange={setView}
            options={[
              { id: 'timeline', label: 'Frise' },
              { id: 'list', label: 'Liste' },
            ]}
          />
        }
      />
      {!allowed ? (
        <Card>
          <Empty>Votre profil ne permet pas de consulter le planning de la régie.</Empty>
        </Card>
      ) : (
        <>
          <Card
            title={
              <span className="card-title-icon">
                <CalendarRange size={18} />
                Période affichée
              </span>
            }
            sub="Les réservations actives qui chevauchent la période sont affichées, jamais rognées."
          >
            <div className="toolbar">
              <label>
                Du
                <input
                  type="date"
                  value={window.from}
                  max={window.to}
                  onChange={(e) => setWindow({ ...window, from: e.target.value })}
                />
              </label>
              <label>
                Au
                <input
                  type="date"
                  value={window.to}
                  min={window.from}
                  onChange={(e) => setWindow({ ...window, to: e.target.value })}
                />
              </label>
              <button className="button" onClick={() => setWindow(defaultWindow())}>
                Période par défaut
              </button>
            </div>
            <ErrorBox
              error={reservations.error || supports.error}
              retry={() => {
                void reservations.refetch();
                void supports.refetch();
              }}
            />
            {reservations.isLoading || supports.isLoading ? (
              <p className="muted">Chargement du planning…</p>
            ) : view === 'timeline' ? (
              <Timeline supports={supports.data ?? []} reservations={reservations.data?.data ?? []} />
            ) : (
              <DataTable
                columns={columns}
                rows={rows}
                caption="Réservations de la période"
                empty={<Empty>Aucune réservation sur cette période.</Empty>}
              />
            )}
            <p className="xsmall muted">
              {rows.length} réservation{rows.length > 1 ? 's' : ''} active{rows.length > 1 ? 's' : ''} ·{' '}
              <Status value="reserve" /> Les faces libres n’apparaissent pas encore : le registre complet
              reste dans Supports et espaces.
            </p>
          </Card>
        </>
      )}
    </>
  );
}
