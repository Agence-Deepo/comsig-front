import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { FileBarChart2 } from 'lucide-react';

import { Card, DataTable, type Column } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { can, date, money, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, PageTitle } from './ui';

const KINDS: [string, string][] = [
  ['hebdomadaire', 'Hebdomadaire'],
  ['mensuel', 'Mensuel'],
  ['trimestriel', 'Trimestriel'],
  ['semestriel', 'Semestriel'],
  ['annuel', 'Annuel'],
];

const pad = (value: number) => String(value).padStart(2, '0');

function periodOptions(kind: string): { value: string; label: string }[] {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  if (kind === 'hebdomadaire')
    return Array.from({ length: 8 }, (_, index) => {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() - 7 * index);
      const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      const day = target.getUTCDay() || 7;
      target.setUTCDate(target.getUTCDate() + 4 - day);
      const isoYear = target.getUTCFullYear();
      const week = Math.ceil(((target.getTime() - Date.UTC(isoYear, 0, 1)) / 86400000 + 1) / 7);
      return { value: `${isoYear}-W${pad(week)}`, label: `Semaine ${week} ${isoYear}` };
    });
  if (kind === 'mensuel')
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(year, month - 1 - index, 1));
      return {
        value: `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`,
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
      };
    });
  if (kind === 'trimestriel')
    return Array.from({ length: 6 }, (_, index) => {
      const quarter = Math.ceil(month / 3) - index;
      const quarterYear = year + Math.floor((quarter - 1) / 4);
      const value = ((((quarter - 1) % 4) + 4) % 4) + 1;
      return { value: `${quarterYear}-T${value}`, label: `T${value} ${quarterYear}` };
    });
  if (kind === 'semestriel')
    return Array.from({ length: 4 }, (_, index) => {
      const half = (month <= 6 ? 1 : 2) - index;
      const halfYear = year + Math.floor((half - 1) / 2);
      const value = ((((half - 1) % 2) + 2) % 2) + 1;
      return { value: `${halfYear}-S${value}`, label: `S${value} ${halfYear}` };
    });
  return Array.from({ length: 3 }, (_, index) => ({
    value: `${year - index}`,
    label: `Année ${year - index}`,
  }));
}

export default function PeriodicReports() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState('mensuel');
  const [period, setPeriod] = useState(`${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}`);
  const [filter, setFilter] = useState('');
  const allowed =
    can(user, 'reporting.view') || user?.role.data_scope === 'all' || can(user, 'reporting.export');
  const reports = useQuery({
    queryKey: ['periodic-reports', filter],
    queryFn: ({ signal }) =>
      api.get<Page>(`/periodic-reports${queryString({ kind: filter, per_page: 50 })}`, signal),
    enabled: allowed,
  });
  if (!allowed)
    return (
      <Card>
        <Empty>Votre profil ne permet pas de consulter les rapports périodiques.</Empty>
      </Card>
    );
  const columns: Column<Row>[] = [
    {
      key: 'label',
      label: 'Période',
      render: (row) => <Link to={`/rapports/${row.id}`}>{row.label}</Link>,
    },
    { key: 'period_kind', label: 'Périodicité' },
    {
      key: 'department_code',
      label: 'Périmètre',
      render: (row) => row.department_code || 'Direction générale',
    },
    { key: 'created_at', label: 'Généré le', render: (row) => date(row.created_at) },
  ];
  return (
    <>
      <PageTitle
        eyebrow="PILOTAGE"
        title="Rapports périodiques"
        description="Chiffres calculés depuis les dossiers au moment de la génération, puis figés. Aucune projection."
        actions={
          can(user, 'reporting.export') || user?.role.data_scope === 'all' ? (
            <button className="button primary" onClick={() => setCreating(true)}>
              <FileBarChart2 size={16} />
              Générer un rapport
            </button>
          ) : undefined
        }
      />
      <Card
        title="Registre"
        actions={
          <select
            aria-label="Filtrer par périodicité"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Toutes</option>
            {KINDS.map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        }
        flush
      >
        <ErrorBox error={reports.error} retry={() => void reports.refetch()} />
        <DataTable
          columns={columns}
          rows={reports.data?.data}
          loading={reports.isLoading}
          caption="Rapports périodiques"
          empty={<Empty>Aucun rapport généré.</Empty>}
        />
        <p className="xsmall muted panel-body">
          Un rapport déjà généré conserve ses chiffres : régénérer la même période est refusé pour préserver
          l’historique.
        </p>
      </Card>
      {creating && (
        <ActionForm
          title="Générer un rapport"
          submitLabel="Générer"
          close={() => setCreating(false)}
          submit={async (form) => {
            const values: Row = Object.fromEntries(form);
            const response = await api.post<{ data: Row }>('/periodic-reports', values);
            await qc.invalidateQueries({ queryKey: ['periodic-reports'] });
            window.location.assign(
              `${import.meta.env.BASE_URL}rapports/${response.data.id}`.replace('//', '/'),
            );
          }}
        >
          <label className="field">
            Périodicité *
            <select
              name="kind"
              required
              value={kind}
              onChange={(event) => {
                setKind(event.target.value);
                setPeriod(periodOptions(event.target.value)[0].value);
              }}
            >
              {KINDS.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Période *
            <select name="key" required value={period} onChange={(event) => setPeriod(event.target.value)}>
              {periodOptions(kind).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {user?.role.data_scope === 'all' && (
            <label className="field">
              Périmètre
              <input name="department" maxLength={30} placeholder="Vide = direction générale consolidée" />
            </label>
          )}
          <p className="muted">
            Les chiffres sont figés à la génération. Un service ne peut produire que son propre rapport.
          </p>
        </ActionForm>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function ReportView() {
  const { id } = useParams();
  const report = useQuery({
    queryKey: ['periodic-report', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/periodic-reports/${id}`, signal),
    enabled: Boolean(id),
  });
  const row = report.data?.data;
  const payload = row?.payload;
  return (
    <>
      <PageTitle
        eyebrow="RAPPORT"
        title={payload ? `Rapport ${payload.period.label}` : 'Rapport'}
        description={
          payload
            ? `Du ${date(payload.period.from)} au ${date(payload.period.to)} · périmètre ${
                payload.scope.department
              }`
            : undefined
        }
      />
      <ErrorBox error={report.error} retry={() => void report.refetch()} />
      {payload && (
        <>
          <Card title="Commercial" sub="Devis et opportunités créés sur la période">
            <div className="quote-totals">
              <Metric label="Devis créés" value={payload.commercial.quotes_created} />
              <Metric label="Devis acceptés" value={payload.commercial.quotes_accepted} />
              <Metric label="Taux d’acceptation" value={`${payload.commercial.conversion_pct} %`} />
              <div className="grand-total">
                <Metric label="Montant accepté HT" value={money(payload.commercial.accepted_ht)} />
              </div>
              <Metric label="Pipeline ouvert" value={money(payload.commercial.pipeline_open_amount)} />
            </div>
          </Card>
          <Card className="report-finance" title="Finance" sub="Factures créées sur la période">
            <div className="quote-totals">
              <Metric label="Factures" value={payload.finance.invoices_created} />
              <Metric label="Facturé TTC" value={money(payload.finance.invoiced_ttc)} />
              <Metric label="Encaissé" value={money(payload.finance.collected)} />
              <div className="grand-total">
                <Metric label="Reste dû" value={money(payload.finance.outstanding)} />
              </div>
              <Metric label="Échu à la fin de période" value={money(payload.finance.overdue)} />
            </div>
          </Card>
          <Card className="report-operations" title="Clients, production et régie">
            <div className="quote-totals">
              <Metric label="Nouveaux tiers" value={payload.clients.new_organizations} />
              <Metric label="Ordres ouverts" value={payload.production.orders_opened} />
              <Metric label="Ordres livrés" value={payload.production.orders_delivered} />
              <Metric label="Campagnes ouvertes" value={payload.regie.campaigns_opened} />
              <Metric label="Montant réservé" value={money(payload.regie.reserved_amount)} />
            </div>
          </Card>
          <Card className="report-hr" title="Ressources humaines">
            <div className="quote-totals">
              <Metric label="Effectif actif" value={payload.hr.active_employees} />
              <Metric label="Entrées" value={payload.hr.hires} />
              <Metric label="Jours de congé approuvés" value={payload.hr.leave_days} />
            </div>
          </Card>
          <p className="xsmall muted">{payload.notice}</p>
        </>
      )}
      <p className="xsmall muted">
        <Link to="/rapports">Retour aux rapports</Link>
      </p>
    </>
  );
}
