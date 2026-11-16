import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCheck,
  FileText,
  Users,
} from 'lucide-react';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { useOptions } from './forms';
import { can, date, label, money, parseDateTime, today, type ApiModule, type Page, type Row } from './types';
import { Empty, ErrorBox, Loading, PageTitle, Status } from './ui';

export function Dashboard() {
  const { user } = useAuth();
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/dashboard') });
  const tasks = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => api.get<Page>('/tasks?status=a_faire&per_page=5'),
    enabled: can(user, 'tasks.view'),
  });
  const quotes = useQuery({
    queryKey: ['dashboard-quotes'],
    queryFn: () => api.get<Page>('/quotes?per_page=5'),
    enabled: can(user, 'quotes.view'),
  });
  const data = dashboard.data?.data;
  const cards = [
    {
      key: 'organizations',
      label: 'Clients & prospects',
      icon: Users,
      to: '/clients',
      note: 'Dans votre portefeuille',
    },
    {
      key: 'opportunities',
      label: 'Opportunités',
      icon: BriefcaseBusiness,
      to: '/opportunites',
      note: data?.opportunities ? `${money(data.opportunities.open_amount)} en cours` : '',
    },
    {
      key: 'quotes',
      label: 'Devis & proformas',
      icon: FileText,
      to: '/devis',
      note: 'Toutes propositions confondues',
    },
    { key: 'tasks', label: 'Tâches', icon: CheckCheck, to: '/taches', note: 'Dans votre périmètre' },
  ].filter((card) => data?.[card.key]);
  const firstName = user?.name.split(' ')[0];
  return (
    <>
      <PageTitle
        eyebrow={`COMSIG / ${user?.department.label.toUpperCase()}`}
        title={`Bonjour ${firstName},`}
        description="Votre activité, vos priorités et vos affaires au même endroit."
        actions={
          can(user, 'quotes.create') ? (
            <Link className="button primary" to="/devis/nouveau">
              Nouveau devis
              <ArrowUpRight size={16} />
            </Link>
          ) : undefined
        }
      />
      <div className="welcome-band">
        <div>
          <span className="eyebrow">
            VOTRE ESPACE {user?.role.data_scope === 'own' ? 'PERSONNEL' : 'DE PILOTAGE'}
          </span>
          <h2>Une vue claire. La prochaine action.</h2>
          <p>Suivez les dossiers qui vous sont confiés et faites avancer les projets de COMSIG.</p>
        </div>
        <div className="welcome-mark" aria-hidden>
          <ArrowUpRight size={62} strokeWidth={1} />
        </div>
      </div>
      {dashboard.isLoading ? (
        <Loading />
      ) : (
        <ErrorBox error={dashboard.error} retry={() => void dashboard.refetch()} />
      )}
      <div className="kpis">
        {cards.map((card) => (
          <Link className="panel kpi" to={card.to} key={card.key}>
            <div>
              <span>{card.label}</span>
              <card.icon size={18} />
            </div>
            <strong>{data[card.key].count}</strong>
            <small>{card.note}</small>
          </Link>
        ))}
        {data?.finance && (
          <Link className="panel kpi" to="/factures">
            <div>
              <span>Créances internes</span>
              <ArrowDownRight size={18} />
            </div>
            <strong className="money-kpi">{money(data.finance.outstanding_amount)}</strong>
            <small>{data.finance.count} facture(s) dans votre périmètre</small>
          </Link>
        )}
      </div>
      {data?.erp && (
        <>
          <h2 className="erp-heading">Votre pilotage ERP</h2>
          <div className="kpis">
            {Object.entries(data.erp as Record<string, { count: number }>).map(([key, value]) => {
              const destinations: Record<string, [string, string]> = {
                treasury: ['Comptes de trésorerie', '/comptes-tresorerie'],
                accounting: ['Écritures comptables', '/ecritures'],
                hr: ['Collaborateurs', '/effectif'],
                payroll: ['Bulletins de paie', '/paie'],
                fleet: ['Véhicules', '/vehicules'],
                production: ['Ordres de production', '/ordres-production'],
                campaigns: ['Campagnes', '/campagnes'],
              };
              return (
                <Link className="panel kpi" to={destinations[key][1]} key={key}>
                  <div>
                    <span>{destinations[key][0]}</span>
                    <BriefcaseBusiness size={17} />
                  </div>
                  <strong>{value.count}</strong>
                  <small>Dossiers accessibles avec votre profil</small>
                </Link>
              );
            })}
          </div>
        </>
      )}
      <div className="dashboard-grid">
        {can(user, 'quotes.view') && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">SUIVI COMMERCIAL</span>
                <h2>Dernières propositions</h2>
              </div>
              <Link className="text-button" to="/devis">
                Tout voir →
              </Link>
            </div>
            {quotes.isLoading ? (
              <Loading />
            ) : quotes.error ? (
              <ErrorBox error={quotes.error} />
            ) : quotes.data?.data.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Dossier</th>
                      <th>Montant TTC</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.data.data.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <Link className="record-link" to={`/devis/${row.id}`}>
                            {row.title}
                          </Link>
                          <small className="block">{row.organization?.legal_name || row.number}</small>
                        </td>
                        <td>{money(row.total_ttc)}</td>
                        <td>
                          <Status value={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>Votre prochaine proposition apparaîtra ici.</Empty>
            )}
          </section>
        )}
        {can(user, 'tasks.view') && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">À FAIRE</span>
                <h2>Prochaines actions</h2>
              </div>
              <Link className="icon-button" aria-label="Voir le calendrier" to="/calendrier">
                <CalendarDays size={19} />
              </Link>
            </div>
            <div className="panel-body">
              {tasks.isLoading ? (
                <Loading />
              ) : tasks.error ? (
                <ErrorBox error={tasks.error} />
              ) : tasks.data?.data.length ? (
                tasks.data.data.map((task) => (
                  <Link className="task-preview" key={task.id} to={`/taches/${task.id}`}>
                    <span className="task-dot" />
                    <div>
                      <strong>{task.title}</strong>
                      <small>
                        {date(task.due_at)} · Priorité {task.priority_level}
                      </small>
                    </div>
                    <ArrowUpRight size={16} />
                  </Link>
                ))
              ) : (
                <Empty>Aucune tâche à faire dans votre périmètre.</Empty>
              )}
              <Link className="button full" to="/taches">
                Consulter mes tâches
              </Link>
            </div>
          </section>
        )}
      </div>
      <div className="workspace-footer">
        <span className="live-dot" />
        Données issues de l’API Laravel · Droits : {user?.role.label} · {label(user?.role.data_scope)}
      </div>
    </>
  );
}
export function Pipeline() {
  const opportunities = useOptions('opportunities');
  const stages = useQuery({ queryKey: ['stages'], queryFn: () => api.get('/pipeline/stages') });
  return (
    <>
      <PageTitle
        eyebrow="ESPACE COMMERCIAL"
        title="Pipeline commercial"
        description="Chaque colonne correspond à une étape réelle du circuit de vente."
        actions={
          <Link className="button" to="/opportunites">
            Vue liste
          </Link>
        }
      />
      <ErrorBox error={opportunities.error || stages.error} />
      {opportunities.isLoading || stages.isLoading ? (
        <Loading />
      ) : (
        <div className="kanban">
          {stages.data?.data.map((stage: Row) => {
            const rows = opportunities.data?.filter((row) => row.stage_code === stage.code) || [];
            return (
              <section className="kanban-column" key={stage.code}>
                <div className="kanban-heading">
                  <h2>
                    {stage.label}
                    <span>{rows.length}</span>
                  </h2>
                  <small>{money(rows.reduce((sum, row) => sum + Number(row.amount), 0))}</small>
                </div>
                {rows.map((row) => (
                  <Link className="kanban-card" key={row.id} to={`/opportunites/${row.id}`}>
                    <small>{row.organization?.legal_name}</small>
                    <h3>{row.title}</h3>
                    <strong>{money(row.amount)}</strong>
                    <div>
                      <span>{date(row.expected_close_date)}</span>
                      <ArrowUpRight size={16} />
                    </div>
                  </Link>
                ))}
                {!rows.length && <p className="kanban-empty">Aucune affaire</p>}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
export function Calendar() {
  const [calendarSearch] = useSearchParams();
  const { user } = useAuth();
  const [month, setMonth] = useState(today().slice(0, 7));
  const from = month + '-01 00:00:00';
  const until = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  const calendarQuery = queryString({
    from,
    to: month + '-' + until + ' 23:59:59',
    opportunity_id: calendarSearch.get('opportunity_id'),
  });
  const tasks = useOptions('tasks' + calendarQuery, can(user, 'tasks.view'));
  const activities = useOptions('activities' + calendarQuery, can(user, 'activities.view'));
  const entries: Row[] = [
    ...(tasks.data || []).map((row) => ({ ...row, path: 'taches', source: 'Tâche' })),
    ...(activities.data || []).map((row) => ({ ...row, path: 'activites', source: 'Activité' })),
  ];
  const rows = entries
    .filter((row) => {
      if (!row.due_at) return false;
      const timestamp = parseDateTime(row.due_at);
      return `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}` === month;
    })
    .sort((a, b) => parseDateTime(a.due_at).getTime() - parseDateTime(b.due_at).getTime());
  return (
    <>
      <PageTitle
        title="Calendrier des actions"
        description="Vue chronologique des tâches et activités ayant une échéance."
        actions={
          <input
            aria-label="Mois du calendrier"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        }
      />
      <ErrorBox error={tasks.error || activities.error} />
      {tasks.isLoading || activities.isLoading ? (
        <Loading />
      ) : (
        <section className="panel">
          {rows.length ? (
            rows.map((row) => (
              <Link className="agenda-row" to={`/${row.path}/${row.id}`} key={`${row.path}-${row.id}`}>
                <div className="agenda-date">
                  <strong>{parseDateTime(row.due_at).getDate()}</strong>
                  <span>{parseDateTime(row.due_at).toLocaleDateString('fr-CI', { weekday: 'short' })}</span>
                </div>
                <div>
                  <small>
                    {row.source} · Priorité {row.priority_level}
                  </small>
                  <h3>{row.title}</h3>
                  <p>
                    {parseDateTime(row.due_at).toLocaleTimeString('fr-CI', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Status value={row.status} />
                <ArrowUpRight size={17} />
              </Link>
            ))
          ) : (
            <Empty>Aucune échéance pour ce mois.</Empty>
          )}
        </section>
      )}
    </>
  );
}
export function Roadmap() {
  const result = useQuery({
    queryKey: ['modules'],
    queryFn: () => api.get<{ data: ApiModule[] }>('/modules'),
  });
  return (
    <>
      <PageTitle
        title="Modules & avancement"
        description="La fusion est progressive. Un écran conservé ne signifie pas que son API Laravel est déjà disponible."
      />
      <div className="notice info">
        Les sources de tous les écrans de l’ancien CRM sont conservées dans ce projet. Seuls les modules
        effectivement portés sont reliés à l’API V2.
      </div>
      <ErrorBox error={result.error} />
      {result.isLoading ? (
        <Loading />
      ) : (
        <div className="module-grid">
          {result.data?.data.map((module) => (
            <section className="panel module-card" key={module.code}>
              <span className={`status ${module.status === 'implemented' ? 'green' : 'neutral'}`}>
                {module.status === 'implemented' ? 'API disponible' : 'À porter'}
              </span>
              <h2>{module.label}</h2>
              <p>
                {module.status === 'planned'
                  ? 'Non connecté. Aucun enregistrement fictif ni appel vers l’ancien serveur Node.'
                  : module.accessible
                    ? 'Accessible selon les permissions de votre profil.'
                    : 'API disponible, accès non accordé à votre profil.'}
              </p>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
