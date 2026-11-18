import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HBars } from '../components/charts';
import { Card, DataTable, Help, Kpi, PageHeader, Segmented, Tabs, type Column } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { can, date, money, today, type Row } from './types';
import ExportButton from './ExportButton';
import { ErrorBox, Loading } from './ui';
import './direction-reporting.css';

type TabKey = 'sales' | 'operations' | 'adoption';
type GroupKey = 'owner' | 'source' | 'sector' | 'offer_type' | 'commune';
const groupOptions: { id: GroupKey; label: string }[] = [
  { id: 'owner', label: 'Commercial' }, { id: 'source', label: 'Source' }, { id: 'sector', label: 'Secteur' },
  { id: 'offer_type', label: 'Prestation' }, { id: 'commune', label: 'Commune' },
];
const moneyShort = (amount: number) => new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(amount ?? 0));
const percent = (value: number | null | undefined) => value == null ? '—' : `${Number(value).toLocaleString('fr-FR')} %`;
const daysAgo = (value: string, days: number) => {
  const result = new Date(`${value}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() - days);
  return result.toISOString().slice(0, 10);
};

export default function DirectionReporting() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('sales');
  const [from, setFrom] = useState(`${today().slice(0, 4)}-01-01`);
  const [to, setTo] = useState(today());
  const [group, setGroup] = useState<GroupKey>('owner');
  const validDates = Boolean(from && to && from <= to);
  const sales = useQuery({
    queryKey: ['reporting-sales', from, to, group],
    queryFn: () => api.get(`/reports/sales${queryString({ from, to, group })}`),
    enabled: tab === 'sales' && validDates,
    staleTime: 60_000,
  });
  const operations = useQuery({
    queryKey: ['reporting-operations', from, to],
    queryFn: () => api.get(`/indicators${queryString({ from, to })}`),
    enabled: tab === 'operations' && validDates,
    staleTime: 60_000,
  });
  const adoption = useQuery({
    queryKey: ['reporting-adoption'], queryFn: () => api.get('/reports/adoption'),
    enabled: tab === 'adoption', staleTime: 60_000,
  });
  const columns: Column<Row>[] = [
    { key: 'label', label: 'Regroupement', render: (row) => <strong>{row.label}</strong> },
    { key: 'created', label: 'Créées', num: true, render: (row) => row.created },
    { key: 'open', label: 'Ouvertes', num: true, render: (row) => row.open, mobile: 'hide' },
    { key: 'pipeline', label: 'Pipeline brut', num: true, render: (row) => moneyShort(row.pipeline), mobile: 'hide' },
    { key: 'weighted', label: 'Pondéré', num: true, render: (row) => moneyShort(row.weighted) },
    { key: 'won', label: 'Gagnées', num: true, render: (row) => row.won },
    { key: 'won_amount', label: 'CA gagné', num: true, render: (row) => <strong>{money(row.won_amount)}</strong> },
    { key: 'win_rate', label: 'Taux de gain', num: true, render: (row) => percent(row.win_rate) },
    { key: 'cycle_days', label: 'Cycle (j)', num: true, render: (row) => row.cycle_days ?? '—', mobile: 'hide' },
  ];
  const setShortcut = (shortcut: 'month' | '90d' | 'year') => {
    const end = today();
    setTo(end);
    setFrom(shortcut === 'month' ? `${end.slice(0, 8)}01` : shortcut === '90d' ? daysAgo(end, 89) : `${end.slice(0, 4)}-01-01`);
  };

  return <div className="direction-reporting">
    <PageHeader title="Reporting" subtitle="Indicateurs calculés par le CRM — chaque indicateur précise sa définition, sa formule et sa période."
      actions={<div className="report-period-controls">
        <label className="field">Du<input type="date" aria-label="Du" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label className="field">Au<input type="date" aria-label="Au" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        <Segmented label="Raccourcis de période" value="" onChange={(value) => setShortcut(value as 'month' | '90d' | 'year')} options={[
          { id: 'month', label: 'Mois' }, { id: '90d', label: '90 j' }, { id: 'year', label: 'Année' },
        ]} />
      </div>} />
    <Tabs value={tab} onChange={setTab} tabs={[
      { id: 'sales', label: 'Ventes et pipeline' }, { id: 'operations', label: 'Inventaire, campagnes et maintenance' },
      { id: 'adoption', label: 'Qualité des données et adoption' },
    ]} />
    {!validDates && <p className="notice warning">La date de fin doit suivre la date de début.</p>}
    {tab === 'sales' && <>
      <ErrorBox error={sales.error} retry={() => void sales.refetch()} />{sales.isLoading && <Loading />}
      {sales.data && <>
        <div className="grid-4 report-kpis">
          <Kpi label="CA gagné" value={moneyShort(sales.data.summary.won_revenue)} unit="FCFA" help={{ title: sales.data.definitions.won_revenue.label, formula: sales.data.definitions.won_revenue.formula, period: `${date(from)} → ${date(to)}` }} foot={<>objectif {moneyShort(sales.data.summary.target)}</>} progress={sales.data.summary.target > 0 ? sales.data.summary.won_revenue / sales.data.summary.target * 100 : null} />
          <Kpi label="Taux de gain" value={percent(sales.data.summary.win_rate)} help={{ title: sales.data.definitions.win_rate.label, formula: sales.data.definitions.win_rate.formula }} />
          <Kpi label="Cycle de vente moyen" value={sales.data.summary.cycle_days ?? '—'} unit="jours" help={{ title: sales.data.definitions.cycle_days.label, formula: sales.data.definitions.cycle_days.formula }} />
          <Kpi label="Précision des prévisions" value={percent(sales.data.summary.forecast_accuracy)} help={{ title: sales.data.definitions.forecast_accuracy.label, formula: sales.data.definitions.forecast_accuracy.formula }} foot={<>gagné {moneyShort(sales.data.summary.forecast.won)} / prévu pondéré {moneyShort(sales.data.summary.forecast.forecast)}</>} />
        </div>
        <Card title="Performance commerciale" flush className="report-performance" actions={<div className="report-actions">
          <Segmented label="Regroupement du tableau" value={group} onChange={setGroup} options={groupOptions} />
          {can(user, 'reporting.export') && <ExportButton path={`/reports/sales${queryString({ from, to, group, export: 1 })}`} filename={`reporting-ventes-${from}-${to}.xlsx`} label="Excel" />}
        </div>}>
          <DataTable rows={sales.data.rows} columns={columns} caption="Performance commerciale regroupée" empty={<p className="muted">Aucune opportunité sur la période.</p>} />
        </Card>
        <div className="grid-2">
          <Card title={<span className="row">Conversion par étape <Help title={sales.data.definitions.conversion.label}>{sales.data.definitions.conversion.formula}</Help></span>} sub={`${date(from)} → ${date(to)}`}>
            <HBars caption="Conversion par étape" format={(value) => `${value} %`} data={sales.data.conversion.filter((row: Row) => row.entered > 0).map((row: Row) => ({ label: row.label, value: row.rate ?? 0, sub: `${row.advanced}/${row.entered}` }))} />
          </Card>
          <Card title="Motifs de perte" sub={`${date(from)} → ${date(to)}`}>
            <HBars caption="Motifs de perte" format={(value) => `${value}`} data={sales.data.loss_reasons.map((row: Row) => ({ label: row.reason, value: Number(row.n), sub: moneyShort(row.amount) }))} emptyLabel="Aucune perte sur la période." />
          </Card>
        </div>
      </>}
    </>}
    {tab === 'operations' && <OperationsReporting query={operations} from={from} to={to} />}
    {tab === 'adoption' && <AdoptionReporting query={adoption} />}
  </div>;
}

function OperationsReporting({ query, from, to }: { query: any; from: string; to: string }) {
  const data = query.data?.data;
  return <>
    <p className="small muted">Période du {date(from)} au {date(to)}. Les données sont limitées à votre périmètre autorisé.</p>
    <ErrorBox error={query.error} retry={() => void query.refetch()} />{query.isLoading && <Loading />}
    {data && <>
      {data.stock && <><h2>Inventaire et production</h2><div className="grid-4"><Kpi label="Valeur du stock" value={money(data.stock.value)} /><Kpi label="Articles sous seuil" value={data.stock.below_minimum} /></div></>}
      {data.regie && <><h2>Campagnes et maintenance</h2><div className="grid-4"><Kpi label="Campagnes actives" value={data.regie.active} /><Kpi label="Interventions en retard" value={data.regie.interventions_late} /><Kpi label="Délai de résolution moyen" value={data.regie.resolution_days == null ? '—' : `${data.regie.resolution_days} j`} /><Kpi label="Satisfaction des campagnes" value={data.regie.satisfaction == null ? '—' : `${Number(data.regie.satisfaction).toLocaleString('fr-FR')} / 5`} /></div></>}
      {data.orders && <><h2>Production et délais</h2><div className="grid-4"><Kpi label="Ordres ouverts" value={data.orders.open} /><Kpi label="Ordres en retard" value={data.orders.late} /><Kpi label="Ordres terminés" value={data.orders.completed} /><Kpi label="Terminés à temps" value={percent(data.orders.on_time_rate)} /></div></>}
      {!data.stock && !data.regie && !data.orders && <Card><p className="muted">Aucun indicateur opérationnel n’est disponible pour les permissions de ce profil.</p></Card>}
    </>}
  </>;
}

function AdoptionReporting({ query }: { query: any }) {
  const data = query.data;
  return <>
    <p className="small muted">Activité des sept derniers jours et qualité des fiches visibles par la Direction générale.</p>
    <ErrorBox error={query.error} retry={() => void query.refetch()} />{query.isLoading && <Loading />}
    {data && <div className="grid-3 report-adoption">
      <Kpi label="Utilisateurs actifs (7 j)" value={`${data.active_users_7d} / ${data.users}`} progress={Number(data.active_users_7d) / Math.max(1, Number(data.users)) * 100} />
      <Kpi label="Activités consignées (7 j)" value={data.activities_7d} />
      <Kpi label="Tâches et activités en retard" value={data.overdue_tasks} />
      <Kpi label="Fiches clients incomplètes" value={data.incomplete_records} foot="Sans secteur, commune, responsable ou contact principal" />
      <Kpi label="Doublons probables" value={data.probable_duplicates} foot="Noms de clients identiques après normalisation" />
    </div>}
  </>;
}
