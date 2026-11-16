import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, PageHeader } from '../components/ui';
import { api, downloadFile, queryString } from './api';
import { useAuth } from './auth';
import { allRecords, RecordForm } from './forms';
import { modules } from './modules';
import { RecordList } from './Records';
import { can, date, label, today, type Row } from './types';
import { ActionForm, ErrorBox, Loading, Modal } from './ui';
import TaskModal from './TaskModal';
import './workspaces.css';
import './task-flow.css';

const module = modules.find((m) => m.key === 'tasks')!;
const statuses = ['a_faire', 'en_cours', 'en_attente', 'termine', 'annule'];

/** Quadrants alignés sur la démonstration : libellé, sous-titre et tonalité. */
const QUADRANTS = [
  {
    key: 'faire',
    title: 'Urgent et important',
    sub: 'À faire tout de suite',
    tone: 'danger',
    cls: 'q-faire',
  },
  {
    key: 'planifier',
    title: 'Important, non urgent',
    sub: 'À planifier (zone de performance)',
    tone: 'primary',
    cls: 'q-planifier',
  },
  {
    key: 'deleguer',
    title: 'Urgent, non important',
    sub: 'À déléguer ou traiter vite',
    tone: 'warning',
    cls: 'q-deleguer',
  },
  {
    key: 'eliminer',
    title: 'Ni urgent ni important',
    sub: 'À abandonner ou reporter',
    tone: 'neutral',
    cls: 'q-eliminer',
  },
] as const;

type Scope = 'service' | 'moi' | 'confiees';

export const taskQuadrant = (task: Row): string =>
  task.urgent == null || task.important == null
    ? 'eliminer'
    : task.urgent
      ? task.important
        ? 'faire'
        : 'deleguer'
      : task.important
        ? 'planifier'
        : 'eliminer';

/** Niveaux P1 à P5 identiques à la démonstration. */
const PRIORITY: { level: number; code: string; label: string; color: string; response: string }[] = [
  { level: 1, code: 'P1', label: 'Critique', color: '#C81E1E', response: 'sous 4 heures' },
  { level: 2, code: 'P2', label: 'Haute', color: '#EA580C', response: 'sous 24 heures' },
  { level: 3, code: 'P3', label: 'Moyenne', color: '#CA8A04', response: 'sous 3 jours ouvrés' },
  { level: 4, code: 'P4', label: 'Normale', color: '#2563EB', response: 'sous 7 jours' },
  { level: 5, code: 'P5', label: 'Basse', color: '#64748B', response: 'sous 30 jours' },
];

function PriorityBadge({ level }: { level: number | null | undefined }) {
  const info = PRIORITY.find((item) => item.level === Number(level)) ?? PRIORITY[3];
  return (
    <span
      className={`prio-badge prio-${info.level}`}
      style={{ ['--prio' as string]: info.color }}
      title={`Priorité ${info.code} — ${info.label} : prise en charge ${info.response}`}
    >
      <span className="prio-dot" aria-hidden />
      {info.code}
    </span>
  );
}

function TaskCard({
  task,
  quadrant,
  onMove,
  onOpen,
}: {
  task: Row;
  quadrant: string;
  onMove: (task: Row, quadrant: string) => void;
  onOpen: (task: Row) => void;
}) {
  const { user } = useAuth();
  const movable = can(user, 'tasks.update');
  return (
    <article
      className={`kanban-card task-card ${quadrant ? 'q-' + quadrant : ''}`}
      draggable={movable}
      tabIndex={0}
      onDragStart={(event) => event.dataTransfer.setData('text/task', task.id)}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen(task);
      }}
    >
      <div className="title">
        <PriorityBadge level={task.priority_level} /> {task.title}
      </div>
      <div className="meta">
        <span>{task.reference ?? '—'}</span>
        <span>{task.due_at ? date(task.due_at) : 'Sans échéance'}</span>
      </div>
      <div className="meta">
        <span>{task.owner?.name ?? task.owner_name ?? '—'}</span>
        <span className="row">
          {task.important && <span className="badge badge-primary no-dot">Important</span>}
          {task.urgent && <span className="badge no-dot">Urgent</span>}
        </span>
      </div>
      {movable && (
        <label className="sr-only" onClick={(event) => event.stopPropagation()}>
          Requalifier {task.title}
          <select
            aria-label={`Requalifier ${task.title}`}
            value={quadrant}
            onChange={(event) => onMove(task, event.target.value)}
          >
            {QUADRANTS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      )}
    </article>
  );
}

export default function TaskWorkspace() {
  const [sp, setSp] = useSearchParams();
  const view = sp.get('vue') || 'kanban';
  const scope = (sp.get('perimetre') as Scope) || 'service';
  const { user } = useAuth();
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Row | undefined | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  // Fenêtre d'édition : la démonstration l'ouvre au clic sur un chevron ou une carte.
  const [selected, setSelected] = useState<Row | null>(null);
  // Période du rapport de temps, gardée ici pour survivre au changement d'onglet,
  // comme la démonstration qui conserve 30 jours par défaut.
  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 86_400_000);
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
  });

  const params = {
    ...(scope === 'moi' ? { mine: 1 } : {}),
    ...(scope === 'confiees' ? { confiees: 1 } : {}),
  };
  const boardEnabled = view !== 'liste';
  const q = useQuery({
    queryKey: ['task-board', scope, view],
    // Matrice et Kanban doivent couvrir tout le périmètre, pas seulement la première page :
    // l'API plafonne per_page à 100, d'où le parcours des pages.
    queryFn: () => allRecords('tasks' + queryString(params)),
    enabled: boardEnabled,
  });

  const tasks: Row[] = q.data ?? [];
  const total = tasks.length;
  const byQuadrant = useMemo(
    () =>
      QUADRANTS.reduce<Record<string, Row[]>>(
        (acc, item) => ({ ...acc, [item.key]: tasks.filter((task) => taskQuadrant(task) === item.key) }),
        {},
      ),
    [tasks],
  );
  const byStatus = useMemo(
    () =>
      statuses.reduce<Record<string, Row[]>>(
        (acc, status) => ({ ...acc, [status]: tasks.filter((task) => task.status === status) }),
        {},
      ),
    [tasks],
  );

  const setView = (next: string) => {
    const params = new URLSearchParams(sp);
    params.set('vue', next);
    setSp(params, { replace: true });
  };
  const setScope = (next: Scope) => {
    const params = new URLSearchParams(sp);
    params.set('perimetre', next);
    setSp(params, { replace: true });
  };

  async function move(task: Row, quadrant: string) {
    setBusy(task.id);
    setError(null);
    try {
      await api.patch('/tasks/' + task.id, {
        urgent: quadrant === 'faire' || quadrant === 'deleguer',
        important: quadrant === 'faire' || quadrant === 'planifier',
      });
      await qc.invalidateQueries();
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(null);
    }
  }

  async function changeStatus(task: Row, status: string) {
    setBusy(task.id);
    setError(null);
    try {
      await api.patch('/tasks/' + task.id, { status });
      await qc.invalidateQueries();
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(null);
    }
  }

  // La démonstration fait suivre l'export de l'onglet ouvert : tâches, risques, ou rapport de temps.
  const exportExcel = async () => {
    setExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const binary = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (view === 'temps') {
        await downloadFile(
          `/time/export.xlsx?from=${range.from}&to=${range.to}`,
          `gestion-du-temps-${stamp}.xlsx`,
          binary,
        );
      } else if (view === 'risques') {
        await downloadFile('/risks/export.xlsx', `risques-${stamp}.xlsx`, binary);
      } else {
        await downloadFile('/tasks/export.xlsx' + queryString(params), `taches-${stamp}.xlsx`, binary);
      }
    } catch (caught) {
      setError(caught);
    } finally {
      setExporting(false);
    }
  };

  const open = (task: Row) => setSelected(task);

  const header = (subtitle: string) => (
    <PageHeader
      title="Tâches et matrices"
      subtitle={subtitle}
      actions={
        <>
          <div className="seg" role="group" aria-label="Périmètre">
            <button type="button" aria-pressed={scope === 'moi'} onClick={() => setScope('moi')}>
              Mes tâches
            </button>
            <button type="button" aria-pressed={scope === 'service'} onClick={() => setScope('service')}>
              Mon service
            </button>
            <button type="button" aria-pressed={scope === 'confiees'} onClick={() => setScope('confiees')}>
              Confiées
            </button>
          </div>
          <button
            type="button"
            className="btn"
            disabled={exporting}
            onClick={() => void exportExcel()}
            title="Télécharger au format Excel (.xlsx)"
          >
            Excel
          </button>
          {can(user, 'tasks.create') && (
            <button type="button" className="btn btn-primary" onClick={() => setEdit(undefined)}>
              Nouvelle tâche
            </button>
          )}
        </>
      }
    />
  );

  const tabs = (
    <div className="tabs" role="tablist">
      {[
        ['kanban', 'Kanban'],
        ['liste', 'Liste'],
        ['planification', 'Planification'],
        ['matrice', 'Matrice des priorités'],
        ['risques', 'Matrice des risques'],
        ['temps', 'Gestion du temps'],
      ].map(([id, text]) => (
        <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}>
          {text}
        </button>
      ))}
    </div>
  );

  const legend = (
    <div className="prio-legend" aria-label="Légende des niveaux de priorité">
      {PRIORITY.map((info) => (
        <PriorityBadge key={info.level} level={info.level} />
      ))}
      <Link to="/protocole-priorites" className="xsmall">
        Critères et délais
      </Link>
    </div>
  );

  return (
    <div className="task-demo">
      {view === 'liste' ? (
        <>
          {header('Organisez le travail : Kanban, priorités (Eisenhower), risques et temps passé')}
          {tabs}
          <RecordList module={module} />
        </>
      ) : view === 'risques' ? (
        <>
          {header('Organisez le travail : Kanban, priorités (Eisenhower), risques et temps passé')}
          {tabs}
          <RiskPanel />
        </>
      ) : view === 'temps' ? (
        <>
          {header('Organisez le travail : Kanban, priorités (Eisenhower), risques et temps passé')}
          {tabs}
          <TimePanel range={range} setRange={setRange} />
        </>
      ) : (
        <>
          {header('Organisez le travail : Kanban, priorités (Eisenhower), risques et temps passé')}
          {tabs}
          {legend}
          <ErrorBox error={q.error || error} retry={() => void q.refetch()} />
          {q.isLoading && <Loading />}
          {view === 'kanban' && q.data && (
            <div className="kanban">
              {statuses
                .filter((status) => status !== 'annule')
                .map((status) => (
                  <div
                    key={status}
                    className={`kanban-col${dragOver === status ? ' drop' : ''}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOver(status);
                    }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragOver(null);
                      const id = event.dataTransfer.getData('text/task');
                      const task = tasks.find((item) => item.id === id);
                      if (task && task.status !== status) void changeStatus(task, status);
                    }}
                  >
                    <div className="kanban-head">
                      <h3>
                        {label(status)}
                        <span className="muted">{byStatus[status]?.length ?? 0}</span>
                      </h3>
                    </div>
                    <div className="stack">
                      {(byStatus[status] ?? []).map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          quadrant={taskQuadrant(task)}
                          onMove={(item, target) => void move(item, target)}
                          onOpen={open}
                        />
                      ))}
                      {!byStatus[status]?.length && <p className="kanban-empty">Glissez une tâche ici</p>}
                    </div>
                  </div>
                ))}
            </div>
          )}
          {view === 'matrice' && q.data && (
            <>
              <p className="small muted">
                Glissez une tâche d’un quadrant à l’autre pour requalifier son urgence et son importance.
                Visez une majorité de tâches « importantes, non urgentes » : c’est la zone de performance.
              </p>
              <div className="matrix-2x2">
                {QUADRANTS.map((item) => {
                  const rows = byQuadrant[item.key] ?? [];
                  const share = total ? Math.round((rows.length / total) * 100) : 0;
                  return (
                    <section
                      key={item.key}
                      className={`matrix-cell tone-${item.tone}${dragOver === item.key ? ' drop' : ''}`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOver(item.key);
                      }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragOver(null);
                        const id = event.dataTransfer.getData('text/task');
                        const task = tasks.find((row) => row.id === id);
                        if (task) void move(task, item.key);
                      }}
                    >
                      <header>
                        <h3>{item.title}</h3>
                        <span className="badge">
                          {rows.length} · {share} %
                        </span>
                      </header>
                      <p className="xsmall">{item.sub}</p>
                      <div className="stack">
                        {rows.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            quadrant={item.key}
                            onMove={move}
                            onOpen={open}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </>
          )}
          {view === 'planification' && q.data && <Planning tasks={tasks} onOpen={open} />}
        </>
      )}
      {selected && (
        <TaskModal
          task={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            void qc.invalidateQueries();
            setSelected(null);
          }}
        />
      )}
      {busy && <p className="sr-only">Mise à jour en cours…</p>}
      {edit !== null && (
        <RecordForm
          title={edit ? 'Modifier une tâche' : 'Nouvelle tâche'}
          fields={module.fields}
          path="/tasks"
          row={edit}
          close={() => setEdit(null)}
        />
      )}
    </div>
  );
}

function Planning({ tasks, onOpen }: { tasks: Row[]; onOpen: (task: Row) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const dated = [...tasks]
    // La démonstration annonce « tâches ouvertes datées » : les tâches terminées ou annulées
    // n'ont pas leur place sur la frise.
    .filter((task) => (task.starts_at || task.due_at) && !['termine', 'annule'].includes(task.status))
    .sort((a, b) => String(a.starts_at ?? a.due_at).localeCompare(String(b.starts_at ?? b.due_at)));
  if (!dated.length) {
    return (
      <Card
        title="Planification"
        sub="Tâches ouvertes datées, de la plus proche à la plus lointaine ; renseignez début et échéance pour les placer sur la frise"
      >
        <p className="muted">Aucune tâche datée dans ce périmètre.</p>
      </Card>
    );
  }

  const startOf = (task: Row) => String(task.starts_at ?? task.due_at).slice(0, 10);
  const endOf = (task: Row) => String(task.due_at ?? task.starts_at).slice(0, 10);
  const days = (task: Row) =>
    Math.max(1, Math.round((Date.parse(endOf(task)) - Date.parse(startOf(task))) / 86_400_000) + 1);
  // Largeur de chaque chevron : proportionnelle à la durée, avec un plancher lisible.
  // Sans ce plancher, 22 tâches d'un jour s'écrasent à ~57 px et aucun intitulé n'apparaît,
  // contrairement à la démonstration. Le débordement est absorbé par le défilement horizontal.
  const PX_PER_DAY = 130;
  const MIN_PX = 120;
  const widths = dated.map((task) => Math.max(MIN_PX, days(task) * PX_PER_DAY));
  const innerWidth = Math.max(
    760,
    widths.reduce((sum, width) => sum + width, 0),
  );
  // Repères d'axe placés sur la durée cumulée réelle des segments.
  const totalDays = dated.reduce((sum, task) => sum + days(task), 0);
  const tickCount = Math.min(6, dated.length);
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const target = (index / Math.max(1, tickCount - 1)) * totalDays;
    let cumulative = 0;
    for (let position = 0; position < dated.length; position++) {
      cumulative += days(dated[position]);
      if (cumulative >= target || position === dated.length - 1) {
        return {
          key: `${index}-${startOf(dated[position])}`,
          label: date(startOf(dated[position])),
          left: (widths.slice(0, position).reduce((sum, width) => sum + width, 0) / innerWidth) * 100,
          align: index === 0 ? 'start' : index === tickCount - 1 ? 'end' : 'middle',
        };
      }
    }
    return { key: 'start', label: date(startOf(dated[0])), left: 0, align: 'start' };
  }).filter((tick, index, all) => all.findIndex((other) => other.label === tick.label) === index);
  const todayIso = new Date().toISOString().slice(0, 10);
  const from = startOf(dated[0]);
  const to = endOf(dated[dated.length - 1]);
  // Repère « Aujourd'hui » : position du premier segment ouvert à cette date.
  const todayAt =
    todayIso >= from && todayIso <= to
      ? (() => {
          const index = dated.findIndex((task) => endOf(task) >= todayIso);
          const before = index <= 0 ? 0 : widths.slice(0, index).reduce((sum, width) => sum + width, 0);
          return (before / innerWidth) * 100;
        })()
      : null;
  const tone = (task: Row, index: number) => {
    if (task.status === 'termine') return '#16a34a';
    if (task.status === 'en_cours') return '#2a78d6';
    const palette = ['#d9443a', '#e09a1a', '#7a4fb8', '#0f766e', '#b45309', '#1d4ed8', '#be185d', '#475569'];
    return palette[index % palette.length];
  };

  return (
    <Card
      title="Planification"
      sub="Tâches ouvertes datées, de la plus proche à la plus lointaine ; renseignez début et échéance pour les placer sur la frise"
    >
      <div className="flow" role="list" aria-label="Frise chronologique des tâches">
        <div className="flow-scroll">
          <div className="flow-inner" style={{ width: innerWidth, minWidth: 760 }}>
            <div className="flow-axis" aria-hidden>
              {ticks.map((tick) => (
                <span
                  key={tick.key}
                  style={{
                    left: `${tick.left}%`,
                    transform:
                      tick.align === 'start'
                        ? 'translateX(0)'
                        : tick.align === 'end'
                          ? 'translateX(-100%)'
                          : 'translateX(-50%)',
                  }}
                >
                  {tick.label}
                </span>
              ))}
            </div>
            {todayAt !== null && (
              <div className="flow-today" style={{ left: `${todayAt}%` }} aria-hidden>
                <b>Aujourd’hui</b>
              </div>
            )}
            {/* Une seule ligne de chevrons contigus, comme la démonstration : la largeur
                de chaque segment suit la durée, avec un plancher pour que le titre reste lisible. */}
            <div className="flow-track">
              <div className="flow-seg-row">
                {dated.map((task, index) => {
                  const late = endOf(task) < todayIso;
                  return (
                    <button
                      key={task.id}
                      role="listitem"
                      className={`flow-step st-${task.status}${index === 0 ? ' first' : ''}${late ? ' late' : ''}${
                        hover === index ? ' hot' : ''
                      }`}
                      style={{
                        width: widths[index],
                        flex: `0 0 ${widths[index]}px`,
                        ['--c' as string]: tone(task, index),
                      }}
                      title={`${index + 1}. ${task.title} — ${date(startOf(task))} → ${date(endOf(task))}`}
                      aria-label={`Étape ${index + 1} : ${task.title}, du ${date(startOf(task))} au ${date(
                        endOf(task),
                      )}, ${label(task.status)}, ${task.owner?.name ?? '—'}`}
                      onClick={() => onOpen(task)}
                      onMouseEnter={() => setHover(index)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <span className="flow-num">{index + 1}</span>
                      <span className="flow-label">{task.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <ol className="flow-legend">
          {dated.map((task, index) => {
            const late = task.status !== 'termine' && task.status !== 'annule' && endOf(task) < todayIso;
            return (
              <li
                key={task.id}
                className={hover === index ? 'hot' : ''}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="flow-dot" style={{ background: tone(task, index) }}>
                  {index + 1}
                </span>
                <span className="flow-ic" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
                <span className="spacer">
                  <button className="link-btn strong" onClick={() => onOpen(task)}>
                    {task.title}
                  </button>
                  <span className="xsmall muted">
                    {' '}
                    {task.reference ?? '—'} · {date(startOf(task))} → {date(endOf(task))} ·{' '}
                    {task.owner?.name ?? '—'}
                  </span>
                </span>
                <span className={`xsmall muted status${late ? ' late' : ''}`}>
                  {late ? 'En retard' : label(task.status)}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
}

function RiskPanel() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Row | null | undefined>(null);
  const q = useQuery({ queryKey: ['risks'], queryFn: () => api.get('/risks') });
  const rows: Row[] = q.data?.rows ?? [];
  const open = rows.filter((risk) => risk.status !== 'clos');
  // Niveaux de criticité, seuils et couleurs repris de la démonstration.
  const level = (score: number) =>
    score >= 15 ? 'critique' : score >= 8 ? 'eleve' : score >= 4 ? 'modere' : 'faible';
  return (
    <>
      <Card
        title="Matrice des risques"
        sub="Probabilité × impact (1 à 5) — risques non clos"
        actions={
          <button className="btn btn-primary" onClick={() => setEdit(undefined)}>
            Nouveau risque
          </button>
        }
      >
        <ErrorBox error={q.error} />
        {q.isLoading && <Loading />}
        <div className="risk-matrix" role="table" aria-label="Matrice des risques">
          <div className="risk-axis-y" aria-hidden>
            Probabilité
          </div>
          <div className="risk-grid">
            {[5, 4, 3, 2, 1].map((probability) =>
              [1, 2, 3, 4, 5].map((impact) => {
                const score = probability * impact;
                const found = open.filter(
                  (risk) => Number(risk.probability) === probability && Number(risk.impact) === impact,
                );
                return (
                  <div
                    key={`${probability}-${impact}`}
                    role="cell"
                    className={`risk-cell lvl-${level(score)}`}
                    aria-label={`Probabilité ${probability}, impact ${impact} : ${found.length} risque(s)`}
                  >
                    {found.map((risk) => (
                      <button
                        key={risk.id}
                        type="button"
                        className="risk-pill"
                        title={`${risk.ref} — ${risk.title} (score ${risk.score})`}
                        onClick={() => setEdit(risk)}
                      >
                        {risk.ref}
                      </button>
                    ))}
                    <span className="risk-score">{score}</span>
                  </div>
                );
              }),
            )}
          </div>
          <div className="risk-axis-x" aria-hidden>
            Impact →
          </div>
        </div>
        <div className="chips small" style={{ marginTop: 12 }}>
          <span className="chip lvl-critique">Critique ≥ 15</span>
          <span className="chip lvl-eleve">Élevé 8–14</span>
          <span className="chip lvl-modere">Modéré 4–7</span>
          <span className="chip lvl-faible">Faible 1–3</span>
        </div>
      </Card>
      <Card title="Registre" flush>
        {rows.length ? (
          <div className="table-scroll">
            <table className="table responsive">
              <thead>
                <tr>
                  <th>Risque</th>
                  <th className="num">Score</th>
                  <th>Revue</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((risk) => (
                  <tr key={risk.id}>
                    <td>
                      <button className="p06-project-button" onClick={() => setEdit(risk)}>
                        <div className="cell-title">{risk.title}</div>
                        <div className="cell-sub">
                          {risk.ref} · {label(risk.category)} · {risk.department_label}
                        </div>
                      </button>
                    </td>
                    <td className="num">{risk.score}</td>
                    <td>{risk.review_date ? date(risk.review_date) : 'Non planifiée'}</td>
                    <td>{label(risk.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h3>Aucun risque enregistré</h3>
          </div>
        )}
      </Card>
      {edit !== null && (
        <ActionForm
          title={edit?.id ? 'Modifier le risque' : 'Nouveau risque'}
          close={() => setEdit(null)}
          submit={async (form) => {
            const body = {
              title: form.get('title'),
              description: form.get('description') || null,
              category: form.get('category'),
              probability: Number(form.get('probability')),
              impact: Number(form.get('impact')),
              mitigation: form.get('mitigation') || null,
              status: form.get('status'),
              review_date: form.get('review_date') || null,
            };
            if (edit?.id) await api.put('/risks/' + edit.id, body);
            else await api.post('/risks', body);
            await qc.invalidateQueries({ queryKey: ['risks'] });
          }}
        >
          <label className="field">
            Risque
            <input name="title" defaultValue={edit?.title} required maxLength={300} />
          </label>
          <label className="field">
            Catégorie
            <select name="category" defaultValue={edit?.category || 'operationnel'}>
              {/* Catégories de la démonstration. « commercial » et « qualite » restent
                  acceptées pour les fiches déjà enregistrées sous ces codes. */}
              {[
                ...new Set([
                  'strategique',
                  'operationnel',
                  'financier',
                  'juridique',
                  'humain',
                  'technique',
                  'reputation',
                  'securite',
                  ...(edit?.category ? [String(edit.category)] : []),
                ]),
              ].map((value) => (
                <option key={value} value={value}>
                  {label(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Probabilité
            <select name="probability" defaultValue={edit?.probability || 3}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Impact
            <select name="impact" defaultValue={edit?.impact || 3}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Statut
            <select name="status" defaultValue={edit?.status || 'identifie'}>
              {['identifie', 'en_traitement', 'maitrise', 'clos'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Prochaine revue
            <input name="review_date" type="date" defaultValue={edit?.review_date} />
          </label>
          <label className="field">
            Plan de traitement
            <textarea name="mitigation" defaultValue={edit?.mitigation} />
          </label>
          <label className="field">
            Description
            <textarea name="description" defaultValue={edit?.description} />
          </label>
        </ActionForm>
      )}
    </>
  );
}

/** Durée au format de la démonstration : « 3 h 09 », « 45 min », « 0 h ». */
const minutes = (value: number | null | undefined) => {
  if (!value) return '0 h';
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return hours ? `${hours} h${rest ? ` ${String(rest).padStart(2, '0')}` : ''}` : `${rest} min`;
};

/** Les cinq parts de la barre de répartition, dans l'ordre de la légende de la démonstration. */
const TIME_PARTS = [
  { key: 'faire', field: 'q_faire', label: 'Urgent et important' },
  { key: 'planifier', field: 'q_planifier', label: 'Important' },
  { key: 'deleguer', field: 'q_deleguer', label: 'Urgent' },
  { key: 'eliminer', field: 'q_eliminer', label: 'Ni l’un ni l’autre' },
  { key: 'ot', field: 'ordres_travail', label: 'Ordres de travail' },
] as const;

const timeParts = (row: Row) =>
  TIME_PARTS.map((part) => ({ ...part, minutes: Number(row[part.field] ?? 0) }));

/** Part d'une durée dans un total, en pourcentage ; un total nul ne produit aucun segment. */
const share = (minutes: number, total: number) => (total > 0 ? (minutes / total) * 100 : 0);

function TimePanel({
  range,
  setRange,
}: {
  range: { from: string; to: string };
  setRange: (next: { from: string; to: string }) => void;
}) {
  const qc = useQueryClient();
  const { from, to } = range;
  const day = today();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const q = useQuery({
    queryKey: ['time-report', from, to],
    queryFn: () => api.get(`/time/report?from=${from}&to=${to}`),
  });
  const tasks = useQuery({ queryKey: ['time-tasks'], queryFn: () => api.get('/tasks?mine=1&per_page=100') });
  const rows: Row[] = q.data?.rows ?? [];
  // Barre de charge : la démonstration affiche une décimale (1,9 %), avec virgule décimale.
  const percent = (value: number) => `${String(value).replace('.', ',')} %`;

  return (
    <>
      <Card
        title="Gestion du temps"
        sub={
          q.data
            ? `${q.data.working_days} ${q.data.working_days > 1 ? 'jours ouvrés' : 'jour ouvré'} · ${minutes(q.data.available_minutes)} disponibles par personne`
            : undefined
        }
        actions={
          <div className="row">
            <input
              className="input"
              type="date"
              aria-label="Du"
              value={from}
              max={to}
              onChange={(event) => setRange({ ...range, from: event.target.value })}
            />
            <input
              className="input"
              type="date"
              aria-label="Au"
              min={from}
              value={to}
              onChange={(event) => setRange({ ...range, to: event.target.value })}
            />
          </div>
        }
      >
        <p className="small muted">
          Temps saisi sur les tâches et ordres de travail, réparti selon la matrice d’Eisenhower. Une part
          élevée de « non important » signale du temps à réaffecter.
        </p>
        <ErrorBox error={q.error} retry={() => void q.refetch()} />
        {q.isLoading ? (
          <Loading />
        ) : rows.length ? (
          <div className="table-scroll">
            <table className="table responsive">
              <thead>
                <tr>
                  <th>Personne</th>
                  <th className="num">Temps saisi</th>
                  <th>Charge</th>
                  <th>Répartition</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const parts = timeParts(row);
                  const total = parts.reduce((sum, part) => sum + part.minutes, 0);
                  return (
                    <tr key={row.user_id}>
                      <td data-label="Personne">
                        <span className="strong">{row.full_name}</span>
                      </td>
                      <td className="num" data-label="Temps saisi">
                        {minutes(row.minutes)}
                      </td>
                      <td data-label="Charge">
                        <div
                          className="hbar-track"
                          title={percent(Number(row.load_pct ?? 0))}
                          role="img"
                          aria-label={`Charge ${percent(Number(row.load_pct ?? 0))}`}
                        >
                          <span
                            className="hbar-fill"
                            style={{ width: `${Math.min(100, Number(row.load_pct ?? 0))}%` }}
                          />
                        </div>
                      </td>
                      <td data-label="Répartition">
                        {/* La démonstration affiche la répartition en barre empilée ; la nôtre
                            ouvre au clic le détail chiffré, pour ne pas dépendre d'une infobulle. */}
                        <button
                          type="button"
                          className="time-bar-button"
                          onClick={() => setDetail(row)}
                          aria-label={`Détail du temps de ${row.full_name} : ${parts
                            .map((part) => `${part.label} ${percent(share(part.minutes, total))}`)
                            .join(', ')}`}
                        >
                          <span
                            className="stacked-bar"
                            role="img"
                            aria-label={parts
                              .map((part) => `${part.label} ${Math.round(share(part.minutes, total))} %`)
                              .join(', ')}
                          >
                            {parts
                              .filter((part) => part.minutes > 0)
                              .map((part) => (
                                <span
                                  key={part.key}
                                  className={`seg-${part.key}`}
                                  style={{ width: `${share(part.minutes, total)}%` }}
                                  title={`${part.label} : ${minutes(part.minutes)}`}
                                />
                              ))}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="10" x2="14" y1="2" y2="2" />
                <line x1="12" x2="15" y1="14" y2="11" />
                <circle cx="12" cy="14" r="8" />
              </svg>
            </div>
            <h3>Aucun temps saisi sur la période</h3>
          </div>
        )}
        <div className="row-wrap time-actions">
          <button type="button" className="btn btn-sm" onClick={() => setOpen(true)}>
            Saisir du temps
          </button>
          <span className="small muted">
            Le temps se saisit sur une tâche, à une date qui ne peut être future.
          </span>
        </div>
        <div className="chips small legend-row time-legend">
          {TIME_PARTS.map((part) => (
            <span key={part.key} className="chip">
              <i className={`sw seg-${part.key}`} />
              {part.label}
            </span>
          ))}
        </div>
      </Card>
      {detail && (
        <Modal title={`Temps de ${detail.full_name}`} close={() => setDetail(null)}>
          <p className="small muted">
            Du {date(from)} au {date(to)} · {q.data?.working_days ?? 0}{' '}
            {(q.data?.working_days ?? 0) > 1 ? 'jours ouvrés' : 'jour ouvré'}, soit{' '}
            {minutes(q.data?.available_minutes)} disponibles.
          </p>
          <dl className="time-detail">
            {timeParts(detail).map((part) => {
              const total = timeParts(detail).reduce((sum, item) => sum + item.minutes, 0);
              return (
                <div key={part.key}>
                  <dt>
                    <i className={`sw seg-${part.key}`} />
                    {part.label}
                  </dt>
                  <dd>
                    <strong>{minutes(part.minutes)}</strong>
                    <span className="small muted">{percent(share(part.minutes, total))}</span>
                  </dd>
                </div>
              );
            })}
            <div className="time-detail-total">
              <dt>Total saisi</dt>
              <dd>
                <strong>{minutes(detail.minutes)}</strong>
                <span className="small muted">
                  {percent(Number(detail.load_pct ?? 0))} de la charge disponible
                </span>
              </dd>
            </div>
          </dl>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn" onClick={() => setDetail(null)}>
              Fermer le détail
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setDetail(null);
                setOpen(true);
              }}
            >
              Saisir du temps
            </button>
          </div>
        </Modal>
      )}
      {open && (
        <ActionForm
          title="Saisir du temps sur une tâche"
          close={() => setOpen(false)}
          submit={async (form) => {
            await api.post('/time-entries', {
              task_id: form.get('task_id'),
              work_date: form.get('work_date'),
              minutes: Number(form.get('minutes')),
              note: form.get('note') || null,
            });
            await qc.invalidateQueries({ queryKey: ['time-report'] });
            await qc.invalidateQueries({ queryKey: ['time-tasks'] });
          }}
        >
          <label className="field">
            Tâche
            <select name="task_id" required defaultValue="">
              <option value="">Choisir…</option>
              {(tasks.data?.data ?? []).map((task: Row) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Date
            <input name="work_date" type="date" max={day} defaultValue={day} required />
          </label>
          <label className="field">
            Durée (minutes)
            <input name="minutes" type="number" min="1" max="1440" required />
          </label>
          <label className="field">
            Note
            <textarea name="note" maxLength={500} />
          </label>
        </ActionForm>
      )}
    </>
  );
}
