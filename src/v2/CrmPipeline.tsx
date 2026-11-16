import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Avatar, Badge } from '../components/ui';
import { money, date, today, can, type Row } from './types';
import { useAuth } from './auth';
import { StageMove } from './Opportunities';

export function CrmPipeline({ rows, stages, totals }: { rows: Row[]; stages: Row[]; totals?: Row[] }) {
  const [search] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [move, setMove] = useState<{ row: Row; stage: Row } | null>(null);
  return (
    <>
      <div className="kanban crm-pipeline" aria-label="Pipeline par étape">
        {stages
          .filter((s) => !s.is_closed)
          .map((s) => {
            const items = rows.filter((o) => o.stage_code === s.code);
            const total = totals?.find((t) => t.stage_code === s.code);
            const listSearch = new URLSearchParams(search);
            listSearch.set('view', 'list');
            listSearch.set('stage', s.code);
            listSearch.delete('page');
            return (
              <section
                key={s.code}
                className={'kanban-col' + (dragOver === s.code ? ' drop' : '')}
                aria-label={s.label + ', ' + items.length + ' opportunités'}
                onDragOver={(e) => {
                  if (can(user, 'opportunities.update')) {
                    e.preventDefault();
                    setDragOver(s.code);
                  }
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  const row = rows.find((o) => o.id === e.dataTransfer.getData('text/plain'));
                  if (row && row.stage_code !== s.code && can(user, 'opportunities.update'))
                    setMove({ row, stage: s });
                }}
              >
                <div className="kanban-head">
                  <h3>
                    <span>{s.label}</span>
                    <span className="muted">{total?.n ?? items.length}</span>
                  </h3>
                  <div className="muted">
                    {money(total?.gross ?? items.reduce((sum, o) => sum + Number(o.amount), 0))} ·{' '}
                    {s.probability} %
                  </div>
                </div>
                {items.map((o) => (
                  <article
                    key={o.id}
                    className={
                      'kanban-card' + (String(o.expected_close_date).slice(0, 10) < today() ? ' flag' : '')
                    }
                    draggable={can(user, 'opportunities.update')}
                    tabIndex={0}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', o.id)}
                    onClick={() => nav('/opportunites/' + o.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') nav('/opportunites/' + o.id);
                    }}
                    aria-label={o.title + ', ' + o.organization?.legal_name + ', ' + money(o.amount)}
                  >
                    <div className="title">{o.title}</div>
                    <div className="xsmall secondary truncate">{o.organization?.legal_name}</div>
                    <div className="meta">
                      <strong className="num" style={{ color: 'var(--text)' }}>
                        {money(o.amount)}
                      </strong>
                      <span>{date(o.expected_close_date)}</span>
                    </div>
                    <div className="meta">
                      <span className="row" style={{ gap: 6 }}>
                        <Avatar
                          name={o.owner?.name || (o.owner_id === user?.id ? user?.name : undefined)}
                          size="sm"
                        />
                        <span className="truncate">
                          {o.owner?.name ||
                            (o.owner_id === user?.id ? user?.name : 'Collaborateur #' + o.owner_id)}
                        </span>
                      </span>
                      {String(o.expected_close_date).slice(0, 10) < today() && (
                        <Badge tone="danger">
                          <Clock size={11} />
                          Date dépassée
                        </Badge>
                      )}
                    </div>
                  </article>
                ))}
                {!items.length && (
                  <p className="xsmall muted" style={{ padding: '4px 6px' }}>
                    Aucune opportunité
                  </p>
                )}
                {!!total && Number(total.n) > items.length && (
                  <Link to={'/opportunites?' + listSearch}>Voir les {total.n} affaires de cette étape</Link>
                )}
              </section>
            );
          })}
      </div>
      {move && <StageMove row={move.row} stage={move.stage} close={() => setMove(null)} />}
    </>
  );
}
