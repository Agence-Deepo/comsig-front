import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, CalendarClock, ListTodo } from 'lucide-react';
import { DonutChart, LineChart } from '../components/charts';
import { Card, Empty, Kpi, PageHeader } from '../components/ui';
import { moneyShort } from '../lib/format';
import { api, queryString } from './api';
import { ErrorBox, Loading } from './ui';
import type { Row } from './types';
import './direction-dashboard.css';

const count = (value: unknown) => new Intl.NumberFormat('fr-FR').format(Number(value ?? 0));
const chartMoney = (value: number) => moneyShort(value);
const date = (value?: string) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value)) : 'Sans échéance';

export default function DirectionDashboard() {
  const [params, setParams] = useSearchParams();
  const department = params.get('service') ?? '';
  const query = useQuery({
    queryKey: ['direction-dashboard', department],
    queryFn: () => api.get(`/workspace/direction-dashboard${queryString({ department: department || undefined })}`),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const data = query.data;
  const service = data?.service ?? {};
  const company = data?.company ?? {};
  const activity = data?.activity ?? { labels: [], series: [] };
  const financial = data?.financial ?? { labels: [], series: [] };
  const pies = data?.pies ?? {};

  return <div className="direction-dashboard">
    <PageHeader
      eyebrow="ESPACE DE SERVICE"
      title={data?.department?.label ?? 'Direction'}
      subtitle="Direction générale et pilotage de l’entreprise."
      actions={<>
        {data?.departments?.length > 0 && <label className="field direction-service-select">Mon service
          <select value={department} onChange={(event) => setParams(event.target.value ? { service: event.target.value } : {})}>
            <option value="">{data.department?.label ?? 'Mon service'}</option>
            {data.departments.map((item: Row) => <option key={item.code} value={item.code}>{item.label}</option>)}
          </select>
        </label>}
        <Link className="btn btn-primary" to="/taches"><ListTodo size={16} /> Tâche</Link>
      </>}
    />
    <ErrorBox error={query.error} retry={() => void query.refetch()} />
    {query.isLoading && <Loading />}
    {data && <>
      <section className="grid-4 direction-kpis" aria-label="Activité du service sélectionné">
        <Kpi label="Tâches ouvertes" value={count(service.tasks_open)} foot={`${count(service.tasks_done_week)} terminée(s) cette semaine`} />
        <Kpi label="Tâches en retard" value={count(service.tasks_late)} foot={<span className={service.tasks_late ? 'text-danger' : ''}>À traiter dans le service</span>} />
        <Kpi label="Ordres reçus en cours" value={count(service.orders_open)} foot={`${count(service.orders_late)} en retard`} />
        <Kpi label="Demandes émises en cours" value={count(service.orders_sent_open)} foot="Auprès des autres services" />
      </section>

      <section className="direction-company" aria-label="Tableau de bord général de l’entreprise">
        <h2 className="section-title">Tableau de bord général — toute l’entreprise</h2>
        <div className="grid-4 direction-kpis">
          <Kpi label="Ordres de travail en cours" value={count(company.orders_open)} foot={<span className={company.orders_late ? 'text-danger' : ''}>{count(company.orders_late)} en retard</span>} />
          <Kpi label="Tâches ouvertes" value={count(company.tasks_open)} foot={<span className={company.tasks_late ? 'text-danger' : ''}>{count(company.tasks_late)} en retard</span>} />
          <Kpi label="Circuits à traiter ici" value={count(service.flows_here)} foot={<Link to="/circuits">Voir les circuits</Link>} />
          <Kpi label="Repérages à valider" value={count(company.surveys_pending)} foot="Rapports soumis par les équipes" />
        </div>

        <div className="grid-2 direction-charts">
          <Card title="Activité sur 12 mois" sub="Ordres reçus et terminés, tâches terminées et circuits transmis">
            <LineChart labels={activity.labels} fullLabels={activity.full} series={activity.series} format={count} caption="Évolution mensuelle de l’activité de l’entreprise" />
          </Card>
          {financial.series?.length > 0 && <Card title="Évolution financière sur 12 mois" sub="Montants en FCFA issus des opportunités, factures et encaissements">
            <LineChart labels={financial.labels} fullLabels={financial.full} series={financial.series} format={chartMoney} caption="Évolution financière mensuelle de l’entreprise" />
          </Card>}
        </div>

        <div className="grid-3 direction-donuts">
          <Card title="Ordres de travail par statut" sub="Créés sur 12 mois"><DonutChart data={pies.work_orders ?? []} format={count} caption="Répartition des ordres de travail" centerLabel="ordres" /></Card>
          <Card title="Tâches par statut" sub="Créées sur 12 mois"><DonutChart data={pies.tasks ?? []} format={count} caption="Répartition des tâches" centerLabel="tâches" /></Card>
          <Card title="Travail en cours par service"><DonutChart data={pies.by_service ?? []} format={count} caption="Travail en cours par service" centerLabel="ordres" /></Card>
          <Card title="Circuits par itinéraire" sub="Créés sur 12 mois"><DonutChart data={pies.flows ?? []} format={count} caption="Répartition des circuits par itinéraire" centerLabel="circuits" /></Card>
          <Card title="Charge par personne" sub="Tâches ouvertes"><DonutChart data={pies.workload ?? []} format={count} caption="Tâches ouvertes par personne" centerLabel="tâches" /></Card>
        </div>

        <div className="grid-2 direction-lower">
          <Card title="Échéances proches" sub="Tâches et ordres de travail, retards compris" actions={<Link to="/taches">Toutes les tâches <ArrowRight size={14} /></Link>}>
            {data.upcoming?.length ? <div className="list">{data.upcoming.map((item: Row) => <div className="list-item" key={`${item.ref}-${item.id}`}>
              <CalendarClock size={16} />
              <span className="spacer"><strong>{item.title}</strong><span className="small muted">{item.ref} · {item.owner}</span></span>
              <span className={`badge ${item.due_at < new Date().toISOString() ? 'badge-danger' : 'badge-info'}`}>{item.due_at < new Date().toISOString() && <AlertTriangle size={12} />}{date(item.due_at)}</span>
            </div>)}</div> : <Empty title="Aucune échéance proche" />}
          </Card>
          <Card title="Équipe" sub={`${count(data.team?.length)} membre(s)`}>
            {data.team?.length ? <div className="list">{data.team.map((member: Row) => <div className="list-item" key={member.id}>
              <span className="direction-avatar">{member.name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
              <span className="spacer"><strong>{member.name}</strong><span className="small muted">{data.department?.label ?? 'Direction générale'}</span></span>
            </div>)}</div> : <Empty title="Aucun membre à afficher" />}
          </Card>
        </div>
        <p className="xsmall muted direction-data-note">Données calculées par Laravel · actualisées à l’ouverture du tableau de bord.</p>
      </section>
    </>}
  </div>;
}
