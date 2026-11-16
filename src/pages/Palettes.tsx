// Palettes des services : chaque service et les miniatures des missions qui lui sont rattachées (circuits, ordres de travail, tâches)
import { Link } from 'react-router-dom';
import { Route as RouteIcon, ClipboardList, ListTodo, LayoutGrid, AlertTriangle } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { date } from '../lib/format';
import { Card, Empty, ErrorState, LoadingBlock, PageHeader } from '../components/ui';

const ICON: Record<string, JSX.Element> = { circuit: <RouteIcon />, ordre: <ClipboardList />, tache: <ListTodo /> };
const TYPE: Record<string, string> = { circuit: 'Circuit', ordre: 'Ordre de travail', tache: 'Tâche' };

export default function Palettes() {
  const r = useApi<any>(['palettes'], '/api/services/palettes', { refetchInterval: 60_000 });
  return (
    <>
      <PageHeader title="Palettes des services" subtitle="Les entrées de chaque service : circuits arrivés à son étape, ordres de travail reçus et tâches en cours, en miniatures" />
      {r.error ? <Card><ErrorState error={r.error} /></Card> : !r.data ? <Card><LoadingBlock rows={8} /></Card> : !r.data.rows.length ? <Card><Empty icon={<LayoutGrid />} title="Aucun service" /></Card> : (
        <div className="svc-palettes">
          {r.data.rows.map((s: any) => (
            <section key={s.code} className="svc-palette" style={{ ['--dept' as any]: s.color }} aria-label={`Service ${s.label}`}>
              <header>
                <div><h3>{s.label}</h3>{s.parent_label && <span className="xsmall muted">{s.parent_label}</span>}</div>
                <div className="svc-palette-counts">
                  <span title="Ordres de travail en cours"><ClipboardList size={13} /> {s.wo_open ?? 0}</span>
                  <span title="Tâches ouvertes"><ListTodo size={13} /> {s.tasks_open ?? 0}</span>
                  {s.late > 0 && <span className="text-danger" title="Ordres en retard"><AlertTriangle size={13} /> {s.late}</span>}
                </div>
              </header>
              {s.missions.length ? (
                <div className="minis">
                  {s.missions.map((m: any) => (
                    <Link key={m.type + m.id} to={m.link} className={`mini m-${m.type} p-${m.priority}${m.late ? ' late' : ''}`} title={`${TYPE[m.type]} ${m.ref} — ${m.title}`}>
                      <span className="mini-top">{ICON[m.type]}<span className="mini-ref">{m.ref}</span>{m.due_date && <span className="mini-due">{date(m.due_date).replace(/\s\d{4}$/, '')}</span>}</span>
                      <span className="mini-title">{m.title}</span>
                      <span className="mini-sub">{m.who ?? 'Non affecté'}</span>
                    </Link>
                  ))}
                </div>
              ) : <p className="xsmall muted">Aucune mission en cours.</p>}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
