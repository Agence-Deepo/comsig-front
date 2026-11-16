import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, DataTable, Empty, Kpi } from '../components/ui';
import { api } from './api';
import { dateTime, money, type Row } from './types';
import { ErrorBox, Loading, Status } from './ui';
export default function CustomerOverview({ id }: { id: string }) {
  const q = useQuery({
    queryKey: ['customer-overview', id],
    queryFn: () => api.get<{ data: Row }>('/organizations/' + id + '/overview'),
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={() => void q.refetch()} />;
  const d = q.data!.data;
  return (
    <>
      {d.alerts.map((a: Row, i: number) => (
        <div className={'notice ' + (a.severity === 'critique' ? 'danger' : 'warning')} key={i} role="status">
          {a.message}
        </div>
      ))}
      {d.finance && (
        <div className="grid-3">
          <Kpi label="CA facturé HT · 12 mois" value={money(d.finance.revenue)} />
          <Kpi label="Solde TTC à recouvrer" value={money(d.finance.outstanding)} />
          <Kpi label="Échu TTC non soldé" value={money(d.finance.overdue_amount)} />
        </div>
      )}
      {d.open_opportunities && (
        <Card title="Opportunités en cours" flush>
          <DataTable<Row>
            rows={d.open_opportunities}
            columns={[
              {
                key: 'title',
                label: 'Opportunité',
                render: (r) => (
                  <Link to={'/opportunites/' + r.id}>
                    {r.title}
                    <div className="cell-sub">{r.ref}</div>
                  </Link>
                ),
              },
              { key: 'stage', label: 'Étape', render: (r) => <Status value={r.stage_code} /> },
              { key: 'amount', label: 'Montant déclaré', num: true, render: (r) => money(r.amount) },
              { key: 'next', label: 'Prochaine action', render: (r) => r.next_step || '—', mobile: 'hide' },
            ]}
            empty={<Empty title="Aucune opportunité ouverte" />}
          />
        </Card>
      )}
      {d.next_tasks && (
        <Card title="Prochaines tâches">
          <DataTable<Row>
            rows={d.next_tasks}
            columns={[
              { key: 'title', label: 'Tâche', render: (r) => <Link to={'/taches/' + r.id}>{r.title}</Link> },
              { key: 'due', label: 'Échéance', render: (r) => dateTime(r.due_at) },
            ]}
            empty={<Empty title="Aucune action planifiée" />}
          />
        </Card>
      )}
      {d.planned_activities && (
        <Card title="Activités et relances planifiées">
          <DataTable<Row>
            rows={d.planned_activities}
            columns={[
              {
                key: 'title',
                label: 'Action',
                render: (r) => <Link to={'/activites/' + r.id}>{r.title}</Link>,
              },
              { key: 'due', label: 'Échéance', render: (r) => dateTime(r.due_at) },
            ]}
            empty={<Empty title="Aucune activité planifiée" />}
          />
        </Card>
      )}
      {d.last_exchanges && (
        <Card title="Derniers échanges">
          {d.last_exchanges.length ? (
            <div className="timeline">
              {d.last_exchanges.map((r: Row) => (
                <div className="tl-item" key={r.id}>
                  <span className="tl-icon" aria-hidden>
                    •
                  </span>
                  <div>
                    <Link className="tl-title" to={'/activites/' + r.id}>
                      {r.title}
                    </Link>
                    <div className="tl-meta">
                      {r.done_at ? dateTime(r.done_at) : 'Date de réalisation non renseignée'}
                    </div>
                    <p className="tl-body">{r.outcome || r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Aucun échange consigné" />
          )}
        </Card>
      )}
    </>
  );
}
