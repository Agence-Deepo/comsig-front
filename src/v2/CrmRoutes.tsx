import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ClipboardList, LayoutGrid, ListTodo, Route as RouteIcon } from 'lucide-react';
import { Card, Empty, PageHeader } from '../components/ui';
import { api } from './api';
import { departmentColors } from './crmIdentity';
import { date, today, type Row } from './types';
import { ErrorBox } from './ui';
import CustomerReferences from './CustomerReferences';

export function LegacyAlias({ from, to }: { from: string; to: string }) {
  const location = useLocation();
  if (from === '/validations') return <Navigate replace to="/devis?status=soumis" />;
  return <Navigate replace to={to + location.pathname.slice(from.length) + location.search} />;
}
// Only redirect sections with an actual counterpart. Other sections retain an
// explicit pending screen instead of inventing /utilisateurs/:section URLs.
export function AdminSection() {
  const { section } = useParams();
  const location = useLocation();
  if (section === 'listes') return <CustomerReferences />;
  const destinations: Record<string, string> = {
    utilisateurs: '/utilisateurs',
    departements: '/gestion-services',
    catalogue: '/catalogue',
    audit: '/audit',
    listes: '/referentiels-clients',
  };
  const destination = destinations[section ?? ''];
  return destination ? <Navigate replace to={destination + location.search} /> : <PendingPage />;
}
export function CrmServices() {
  const palettes = useQuery({ queryKey: ['service-palettes'], queryFn: () => api.get<{ rows: Row[] }>('/services/palettes'), refetchInterval: 60_000 });
  const icons: Record<string, JSX.Element> = { circuit: <RouteIcon />, ordre: <ClipboardList />, tache: <ListTodo /> };
  const types: Record<string, string> = { circuit: 'Circuit', ordre: 'Ordre de travail', tache: 'Tâche' };
  return (
    <>
      <PageHeader title="Palettes des services" subtitle="Les entrées de chaque service : circuits arrivés à son étape, ordres de travail reçus et tâches en cours, en miniatures" />
      <ErrorBox error={palettes.error} retry={() => void palettes.refetch()} />
      {palettes.isLoading && <Card><p>Chargement des missions…</p></Card>}
      {palettes.data && !palettes.data.rows.length && <Card><Empty icon={<LayoutGrid />} title="Aucun service" /></Card>}
      {palettes.data && <div className="svc-palettes">{palettes.data.rows.map(service => <section key={service.code} className="svc-palette" style={{ ['--dept' as string]: departmentColors[service.code] ?? 'var(--primary)' }} aria-label={`Service ${service.label}`}>
        <header><h3>{service.label}</h3><div className="svc-palette-counts"><span title="Ordres de travail en cours"><ClipboardList size={13} /> {service.wo_open ?? '—'}</span><span title="Tâches ouvertes"><ListTodo size={13} /> {service.tasks_open ?? '—'}</span>{service.late > 0 && <span className="text-danger" title="Ordres en retard"><AlertTriangle size={13} /> {service.late}</span>}</div></header>
        {service.missions.length ? <div className="minis">{service.missions.map((mission: Row) => {
          const late = mission.due_date && String(mission.due_date).slice(0, 10) < today();
          const priority = Number(mission.priority) === 1 ? 'critique' : Number(mission.priority) === 2 ? 'haute' : 'normale';
          return <Link key={mission.type + mission.id} to={mission.link} className={`mini m-${mission.type} p-${priority}${late ? ' late' : ''}`} title={`${types[mission.type]} ${mission.ref ?? ''} — ${mission.title}`}><span className="mini-top">{icons[mission.type]}<span className="mini-ref">{mission.ref ?? '—'}</span>{mission.due_date && <span className="mini-due">{date(mission.due_date)}</span>}</span><span className="mini-title">{mission.title}</span><span className="mini-sub">{mission.who ?? 'Non affecté'}</span></Link>;
        })}</div> : <p className="xsmall muted">Aucune mission accessible en cours.</p>}
        {service.limited && <p className="xsmall muted">Aperçu limité aux six premières missions accessibles.</p>}
      </section>)}</div>}
    </>
  );
}
export function PendingPage() {
  const location = useLocation();
  const labels: Record<string, string> = {
    '/messagerie': 'Messagerie',
    '/todo': 'To-do et checklists',
    '/mon-assistant': 'Mon assistant',
    '/circuits': 'Circuits de production',
    '/reperages': 'Rapports de repérage',
    '/mon-espace-rh': 'Pointage et congés',
    '/protocole-priorites': 'Protocole des priorités',
    '/securite': 'Sécurité',
    '/mon-equipe/acces': 'Accès de mon équipe',
  };
  return (
    <>
      <PageHeader
        title={labels[location.pathname] || 'Écran non encore raccordé'}
        subtitle="Migration du CRM vers Laravel"
      />
      <Card>
        <Empty title="Raccordement à finaliser">
          Cet écran du CRM d’origine n’est pas encore relié à une API Laravel équivalente. Aucune opération
          n’a été exécutée.
        </Empty>
        <div className="row-wrap">
          <Link className="btn btn-primary" to="/modules">
            Voir les modules disponibles
          </Link>
          <Link className="btn" to="/">
            Tableau de bord
          </Link>
        </div>
      </Card>
    </>
  );
}
