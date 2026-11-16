// Tableau de bord général d'un département : indicateurs, évolutions sur 12 mois (courbes) et répartitions (camemberts)
import { Link } from 'react-router-dom';
import { useApi } from '../lib/hooks';
import { moneyShort } from '../lib/format';
import { Card, Kpi, LoadingBlock } from './ui';
import { DonutChart, LineChart } from './charts';

const n = (v: number) => new Intl.NumberFormat('fr-FR').format(Math.round(v));

export function DeptDashboard({ department }: { department?: string }) {
  const r = useApi<any>(['dept-dashboard', department ?? ''], `/api/department-dashboard${department ? `?department=${department}` : ''}`);
  if (!r.data) return r.error ? null : <Card><LoadingBlock rows={6} /></Card>;
  const d = r.data, k = d.kpis, p = d.pies;
  return (
    <section className="stack-lg" aria-label="Tableau de bord général">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Tableau de bord général — {d.scope === 'entreprise' ? 'toute l’entreprise' : d.department.label}</h2>
        {d.scope === 'departement' && <span className="xsmall muted">Département et ses services ({d.departments.length})</span>}
      </div>
      <div className="grid-4">
        <Kpi label="Ordres de travail en cours" value={n(k.wo_open)} foot={<span className={k.wo_late ? 'text-danger' : ''}>{k.wo_late} en retard</span>} />
        <Kpi label="Tâches ouvertes" value={n(k.tasks_open)} foot={<span className={k.tasks_late ? 'text-danger' : ''}>{k.tasks_late} en retard</span>} />
        <Kpi label="Circuits à traiter ici" value={n(k.flows_here)} foot={<Link to="/circuits">Voir les circuits</Link>} />
        <Kpi label="Repérages à valider" value={n(k.surveys_pending)} foot={`${k.members} collaborateur(s)`} />
      </div>
      <div className="grid-2">
        <Card title="Activité sur 12 mois" sub="Ordres reçus et terminés, tâches terminées, circuits reçus — par mois">
          <LineChart labels={d.activity.labels} fullLabels={d.activity.full} series={d.activity.series} format={n} caption="Évolution mensuelle de l’activité du département" />
        </Card>
        {d.finance ? (
          <Card title="Évolution financière sur 12 mois" sub="Montants HT en FCFA, issus des opportunités, factures et encaissements">
            <LineChart labels={d.finance.labels} fullLabels={d.finance.full} series={d.finance.series} format={moneyShort} caption="Évolution mensuelle des montants" />
          </Card>
        ) : (
          <Card title="Ordres de travail par statut" sub="Créés sur 12 mois"><DonutChart data={p.work_orders} format={n} caption="Répartition des ordres de travail par statut" centerLabel="ordres" /></Card>
        )}
      </div>
      <div className="grid-3">
        {d.finance && <Card title="Ordres de travail par statut" sub="Créés sur 12 mois"><DonutChart data={p.work_orders} format={n} caption="Répartition des ordres de travail par statut" centerLabel="ordres" /></Card>}
        <Card title="Tâches par statut" sub="Créées sur 12 mois"><DonutChart data={p.tasks} format={n} caption="Répartition des tâches par statut" centerLabel="tâches" /></Card>
        {p.by_service.length > 0 && <Card title="Travail en cours par service"><DonutChart data={p.by_service} format={n} caption="Ordres de travail en cours par service" centerLabel="en cours" /></Card>}
        {p.flows.length > 0 && <Card title="Circuits par itinéraire" sub="Passés par le département sur 12 mois"><DonutChart data={p.flows} format={n} caption="Circuits par itinéraire" centerLabel="circuits" /></Card>}
        {p.workload.length > 0 && <Card title="Charge par personne" sub="Tâches ouvertes"><DonutChart data={p.workload} format={n} caption="Tâches ouvertes par personne" centerLabel="tâches" /></Card>}
      </div>
    </section>
  );
}
