import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { useApi } from '../lib/hooks';
import { useCan, useLookups } from '../lib/auth';
import { qs } from '../lib/api';
import { addDays, date, money, moneyShort, pct, today } from '../lib/format';
import { Card, DataTable, Field, Help, Input, Kpi, PageHeader, Segmented, Tabs } from '../components/ui';
import { HBars } from '../components/charts';

/** Reporting par rôle, période, équipe, client, prestation, support et commune (§5.13, §6). */
export default function Reporting() {
  const can = useCan();
  const { label } = useLookups();
  const [tab, setTab] = useState('sales');
  const [from, setFrom] = useState(`${today().slice(0, 4)}-01-01`);
  const [to, setTo] = useState(today());
  const [group, setGroup] = useState('owner');
  const sales = useApi<any>(['rep-sales', from, to, group], tab === 'sales' ? `/api/reports/sales${qs({ from, to, group })}` : null);
  const dash = useApi<any>(['dashboard', 'rep', from, to], tab === 'sales' ? `/api/dashboard${qs({ from, to })}` : null);
  const ops = useApi<any>(['rep-ops', from, to], tab === 'ops' ? `/api/reports/operations${qs({ from, to })}` : null);
  const adoption = useApi<any>(['rep-adoption'], tab === 'adoption' ? '/api/reports/adoption' : null);
  const def = dash.data?.definitions ?? {};
  const s = dash.data?.sales;
  return (
    <>
      <PageHeader title="Reporting" subtitle="Indicateurs calculés par le CRM — chaque indicateur indique sa définition, sa formule et sa période"
        actions={<div className="row-wrap"><Field label="Du"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field><Field label="Au"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          <Segmented label="Raccourcis" value="" onChange={(v) => { if (v === 'm') { setFrom(today().slice(0, 8) + '01'); setTo(today()); } if (v === 'q') { setFrom(addDays(today(), -90)); setTo(today()); } if (v === 'y') { setFrom(`${today().slice(0, 4)}-01-01`); setTo(today()); } }} options={[{ id: 'm', label: 'Mois' }, { id: 'q', label: '90 j' }, { id: 'y', label: 'Année' }]} /></div>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'sales', label: 'Ventes et pipeline' }, ...(can('supports') ? [{ id: 'ops', label: 'Inventaire, campagnes et maintenance' }] : []), { id: 'adoption', label: 'Qualité des données et adoption' }]} />
      {tab === 'sales' && (
        <>
          {s && <div className="grid-4">
            <Kpi label="CA gagné" value={moneyShort(s.won_revenue)} unit="FCFA" help={{ title: def.won_revenue?.label, formula: def.won_revenue?.formula, period: `${date(from)} → ${date(to)}` }} foot={<span>objectif {moneyShort(s.target)}</span>} progress={s.target ? (s.won_revenue / s.target) * 100 : null} />
            <Kpi label="Taux de gain" value={s.win_rate === null ? '—' : pct(s.win_rate, 0)} help={{ title: def.win_rate?.label, formula: def.win_rate?.formula }} />
            <Kpi label="Cycle de vente moyen" value={s.cycle_days ?? '—'} unit="jours" help={{ title: def.cycle_days?.label, formula: def.cycle_days?.formula }} />
            <Kpi label="Précision des prévisions" value={s.forecast_accuracy === null ? '—' : pct(s.forecast_accuracy, 0)} help={{ title: def.forecast_accuracy?.label, formula: def.forecast_accuracy?.formula }} foot={<span>gagné {moneyShort(s.forecast.won)} / prévu pondéré {moneyShort(s.forecast.forecast)}</span>} />
          </div>}
          <Card title="Performance commerciale" flush actions={<>
            <Segmented label="Regroupement" value={group} onChange={setGroup} options={[{ id: 'owner', label: 'Commercial' }, { id: 'source', label: 'Source' }, { id: 'sector', label: 'Secteur' }, { id: 'offer_type', label: 'Prestation' }, { id: 'commune', label: 'Commune' }]} />
            {can('reporting', 'export') && <ExcelButton size="sm" url={`/api/reports/sales${qs({ from, to, group, format: 'xlsx' })}`} />}</>}>
            <DataTable rows={sales.data?.rows} loading={sales.isLoading} columns={[
              { key: 'label', label: 'Regroupement', render: (x: any) => <span className="cell-title">{x.label}</span> },
              { key: 'c', label: 'Créées', num: true, render: (x: any) => x.created },
              { key: 'o', label: 'Ouvertes', num: true, render: (x: any) => x.open, mobile: 'hide' },
              { key: 'p', label: 'Pipeline brut', num: true, render: (x: any) => moneyShort(x.pipeline), mobile: 'hide' },
              { key: 'w', label: 'Pondéré', num: true, render: (x: any) => moneyShort(x.weighted) },
              { key: 'g', label: 'Gagnées', num: true, render: (x: any) => x.won },
              { key: 'a', label: 'CA gagné', num: true, render: (x: any) => <strong>{money(x.won_amount)}</strong> },
              { key: 'r', label: 'Taux de gain', num: true, render: (x: any) => (x.win_rate === null ? '—' : pct(x.win_rate, 0)) },
              { key: 'cy', label: 'Cycle (j)', num: true, render: (x: any) => x.cycle_days ?? '—', mobile: 'hide' },
            ]} />
          </Card>
          {s && <div className="grid-2">
            <Card title={<span className="row">Conversion par étape<Help title={def.conversion?.label}>{def.conversion?.formula}</Help></span>} sub={`${date(from)} → ${date(to)}`}>
              <HBars caption="Conversion par étape" format={(n) => `${n} %`} data={s.conversion.filter((c: any) => c.entered > 0).map((c: any) => ({ label: c.label, value: c.rate ?? 0, sub: `${c.advanced}/${c.entered}` }))} />
            </Card>
            <Card title="Motifs de perte" sub={`${date(from)} → ${date(to)}`}>
              <HBars caption="Motifs de perte" format={(n) => `${n}`} data={s.loss_reasons.map((l: any) => ({ label: l.reason, value: l.n, sub: moneyShort(l.amount) }))} emptyLabel="Aucune perte sur la période." />
            </Card>
          </div>}
        </>
      )}
      {tab === 'ops' && ops.data && (
        <>
          <div className="grid-4">
            <Kpi label="Campagnes en cours" value={ops.data.campaigns.running} foot={<span>{ops.data.campaigns.active} actives au total</span>} />
            <Kpi label="Taux d’exécution" value={ops.data.execution.rate === null ? '—' : pct(ops.data.execution.rate, 0)} foot={<span>{ops.data.execution.done}/{ops.data.execution.planned} faces posées (campagnes démarrées)</span>} help={{ title: 'Taux d’exécution', formula: 'Faces réservées ayant une preuve de pose conforme / faces réservées, pour les campagnes démarrées sur la période.' }} />
            <Kpi label="Respect des délais de maintenance" value={ops.data.maintenance?.sla_pct === null || !ops.data.maintenance ? '—' : pct(ops.data.maintenance.sla_pct, 0)} foot={<span>résolution moyenne {ops.data.maintenance?.avg_resolution_hours ?? '—'} h</span>} />
            <Kpi label="Taux de renouvellement" value={ops.data.renewal_rate === null ? '—' : pct(ops.data.renewal_rate, 0)} help={{ title: def.renewal_rate?.label ?? 'Renouvellement', formula: 'Contrats renouvelés / contrats arrivés à échéance sur la période.' }} foot={<span>{ops.data.renewals.renewed}/{ops.data.renewals.ended} contrats</span>} />
          </div>
          <div className="grid-2">
            <Card title="Occupation par commune" sub="Faces réservées aujourd’hui / faces actives" flush>
              <DataTable rows={ops.data.by_commune} columns={[
                { key: 'c', label: 'Commune', render: (x: any) => label('commune', x.commune) },
                { key: 's', label: 'Supports', num: true, render: (x: any) => x.supports },
                { key: 'f', label: 'Faces', num: true, render: (x: any) => x.faces },
                { key: 'b', label: 'Occupation', num: true, render: (x: any) => pct((x.booked / Math.max(1, x.faces)) * 100, 0) },
                { key: 'u', label: 'Indispo.', num: true, render: (x: any) => x.unavailable || '—' },
              ]} />
            </Card>
            <Card title="Occupation par type de support" flush>
              <DataTable rows={ops.data.by_type} columns={[
                { key: 't', label: 'Type', render: (x: any) => x.type },
                { key: 'f', label: 'Faces', num: true, render: (x: any) => x.faces },
                { key: 'b', label: 'Occupation', num: true, render: (x: any) => pct((x.booked / Math.max(1, x.faces)) * 100, 0) },
                { key: 'r', label: 'Tarif moyen', num: true, render: (x: any) => moneyShort(x.avg_rate) },
              ]} />
            </Card>
          </div>
          <Card title="Revenus et coûts par support" sub="Revenus des devis acceptés sur la période ; coût annuel récurrent et maintenance" flush>
            <DataTable rows={ops.data.revenue_by_support} columns={[
              { key: 'c', label: 'Support', render: (x: any) => <><div className="cell-title">{x.code}</div><div className="cell-sub">{x.name}</div></> },
              { key: 'r', label: 'Revenus', num: true, render: (x: any) => money(x.revenue) },
              { key: 'a', label: 'Coût annuel', num: true, render: (x: any) => money(x.annual_cost) },
              { key: 'm', label: 'Maintenance', num: true, render: (x: any) => money(x.maintenance) },
            ]} />
          </Card>
        </>
      )}
      {tab === 'adoption' && adoption.data && (
        <div className="grid-3">
          <Kpi label="Utilisateurs actifs (7 j)" value={`${adoption.data.active_users_7d} / ${adoption.data.users}`} progress={(adoption.data.active_users_7d / Math.max(1, adoption.data.users)) * 100} />
          <Kpi label="Activités consignées (7 j)" value={adoption.data.activities_7d} />
          <Kpi label="Tâches en retard" value={adoption.data.overdue_tasks} action={adoption.data.overdue_tasks > 0} />
          <Kpi label="Fiches incomplètes" value={adoption.data.incomplete_records} foot={<span>Sans secteur, commune, responsable ou contact</span>} action={adoption.data.incomplete_records > 0} />
          <Kpi label="Doublons probables" value={adoption.data.probable_duplicates} foot={<span>Raisons sociales similaires à plus de 70 %</span>} action={adoption.data.probable_duplicates > 0} />
        </div>
      )}
    </>
  );
}
