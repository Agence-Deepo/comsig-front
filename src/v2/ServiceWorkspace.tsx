import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Kpi, PageHeader } from '../components/ui';
import { api } from './api';
import { can, dateTime, label, type Row } from './types';
import { HBars, LineChart } from '../components/charts';
import { money as chartMoney } from '../lib/format';
import { useAuth } from './auth';
import { ErrorBox, Loading, Status } from './ui';
import './workspaces.css';

const destinations: Record<string, string> = {
  projects: '/projets',
  'production-orders': '/ordres-production',
  campaigns: '/campagnes',
  'leave-requests': '/conges',
  'vehicle-usages': '/missions-vehicules',
  'journal-entries': '/ecritures',
};
export default function ServiceWorkspace() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const department = sp.get('service') || '';
  const q = useQuery({
    queryKey: ['service-workspace', department],
    queryFn: () =>
      api.get('/workspace' + (department ? '?department=' + encodeURIComponent(department) : '')),
  });
  const d = q.data;
  return (
    <>
      <PageHeader
        title={d?.department.label || 'Mon espace de service'}
        eyebrow="ESPACE DE SERVICE"
        subtitle="Le travail confié à votre service et vos prochaines échéances, selon vos droits."
        actions={
          <>
            {d?.departments.length > 0 && (
              <label className="field">
                Service affiché
                <select
                  value={department}
                  onChange={(e) => setSp(e.target.value ? { service: e.target.value } : {})}
                >
                  <option value="">Mon service</option>
                  {d.departments.map((s: Row) => (
                    <option key={s.code} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {can(user, 'tasks.create') && (
              <Link className="btn btn-primary" to="/taches">
                Créer une tâche
              </Link>
            )}
            {can(user, 'tasks.view') && (
              <Link className="btn" to="/calendrier">
                Calendrier
              </Link>
            )}
          </>
        }
      />
      <ErrorBox error={q.error} />
      {q.isLoading && <Loading />}
      {d && (
        <>
          {d.tasks && (
            <div className="grid-4 kpi-grid">
              <Kpi label="Tâches ouvertes" value={d.tasks.open} />
              <Kpi label="Tâches en retard" value={d.tasks.late} />
              <Kpi label="Urgentes et importantes" value={d.tasks.urgent_important} />
              <Kpi label="Terminées cette semaine" value={d.tasks.done_week} />
            </div>
          )}
          {d.work_orders && (
            <Card title="Demandes entre services">
              <div className="p06-shortcuts">
                <Link className="btn" to="/ordres-travail">
                  {d.work_orders.received_open} demande(s) reçue(s) en cours
                </Link>
                <Link className="btn" to="/ordres-travail?vue=sent">
                  {d.work_orders.sent_open} demande(s) émise(s) en cours
                </Link>
                <span>{d.work_orders.received_late} reçue(s) en retard</span>
              </div>
            </Card>
          )}
          {(d.tasks || d.work_orders) && <Card title="Évolution de l’activité" sub="Douze derniers mois dans votre périmètre"><LineChart labels={d.charts?.monthly?.labels ?? []} series={[...(d.tasks ? [{ key: 'tasks', label: 'Tâches terminées', values: d.charts.monthly.tasks_done }] : []), ...(d.work_orders ? [{ key: 'received', label: 'Ordres reçus', values: d.charts.monthly.orders_received }, { key: 'done', label: 'Ordres terminés', values: d.charts.monthly.orders_done }] : [])]} format={n => String(Math.round(n))} caption="Évolution mensuelle des tâches et des ordres de travail" /></Card>}
          {!!d.charts?.financial?.length && <Card title="Évolution commerciale et financière" sub="Douze derniers mois ; factures et paiements selon vos droits"><LineChart labels={d.charts.monthly.labels} series={d.charts.financial} format={chartMoney} caption="Montants commerciaux, factures et encaissements mensuels" /></Card>}
          <div className="p06-columns">
            {d.tasks && <Card title="Répartition des tâches" sub="Tous les statuts dans votre périmètre"><HBars caption="Répartition des tâches par statut" data={(d.charts?.tasks ?? []).map((x: Row) => ({ label: label(x.label), value: x.value }))} format={n => String(n)} /></Card>}
            {d.work_orders && <Card title="Ordres de travail reçus" sub="Demandes ouvertes par statut"><HBars caption="Ordres de travail reçus par statut" data={(d.charts?.work_orders ?? []).map((x: Row) => ({ label: label(x.label), value: x.value }))} format={n => String(n)} /></Card>}
          </div>
          <div className="p06-columns">
            {d.tasks && (
              <Card
                title="Échéances proches"
                sub="Retards compris, jusqu’aux 14 prochains jours"
                actions={<Link to="/taches?vue=kanban">File de travail</Link>}
              >
                {d.upcoming.length ? (
                  d.upcoming.map((t: Row) => (
                    <div className="list-item" key={t.id}>
                      <div className="spacer">
                        <Link to={'/taches/' + t.id}>
                          <strong>{t.title}</strong>
                        </Link>
                        <div className="small muted">
                          {dateTime(t.due_at)} · Priorité {t.priority_level}
                        </div>
                      </div>
                      <Status value={t.status} />
                    </div>
                  ))
                ) : (
                  <p className="muted">Aucune échéance à afficher dans ce périmètre.</p>
                )}
              </Card>
            )}
            <Card
              title="Équipe accessible"
              sub={
                d.scope === 'own'
                  ? 'Vue personnelle : votre compte uniquement.'
                  : 'Membres actifs du service, 100 maximum.'
              }
            >
              {d.members.map((m: Row) => (
                <div className="list-item" key={m.id}>
                  {m.name}
                  {m.id === user?.id ? ' · Vous' : ''}
                </div>
              ))}
            </Card>
          </div>
          {!!d.dossiers.length && (
            <Card title="Dossiers métier du service">
              <div className="p06-shortcuts">
                {d.dossiers.map((item: Row) => (
                  <Link key={item.resource} to={destinations[item.resource]} className="panel panel-body">
                    <strong>{item.count}</strong>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
          <p className="small muted">
            Les compteurs et graphiques sont calculés par l’API dans votre périmètre.
          </p>
        </>
      )}
    </>
  );
}

export function AdministrationWorkspace() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ['administration-workspace'],
    queryFn: () => api.get('/workspace/administration'),
    enabled: can(user, 'admin.view'),
  });
  if (!can(user, 'admin.view'))
    return <div className="notice warning">Cet espace est réservé à l’administration.</div>;
  return (
    <>
      <PageHeader title="Espace administration" subtitle="Comptes, sécurité et organisation des services." />
      <ErrorBox error={q.error} />
      {q.isLoading && <Loading />}
      {q.data && (
        <>
          <div className="grid-4">
            <Kpi label="Comptes actifs" value={q.data.active} />
            <Kpi label="Comptes désactivés" value={q.data.inactive} />
            <Kpi label="Double authentification activée" value={q.data.mfa_enabled} />
            <Kpi label="Mot de passe à renouveler" value={q.data.password_change_required} />
          </div>
          <Card title="Administration de la plateforme">
            <div className="row-wrap">
              <Link className="btn" to="/utilisateurs">
                Gérer les comptes
              </Link>
              <Link className="btn" to="/gestion-services">
                Services actifs : {q.data.departments}
              </Link>
              <Link className="btn" to="/audit">
                Journal d’audit
              </Link>
              <Link className="btn" to="/profil">
                Ma sécurité et double authentification
              </Link>
            </div>
            <p className="small muted">
              Les droits d’administration n’ajoutent aucun droit métier implicite. La gouvernance avancée des
              accès relève de P07.
            </p>
          </Card>
        </>
      )}
    </>
  );
}
