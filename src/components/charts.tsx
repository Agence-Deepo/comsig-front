// Graphiques : marques fines, un seul axe, info-bulle au survol, vue tableau accessible
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Table2 } from 'lucide-react';
import { moneyShort, money } from '../lib/format';

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

/** Barres verticales (réalisé) avec repère d'objectif — une seule échelle (FCFA). */
export function BarTargetChart({ data, height = 220, valueLabel = 'Réalisé', targetLabel = 'Objectif', format = moneyShort, caption }: {
  data: { label: string; value: number; target?: number | null; full?: string }[]; height?: number; valueLabel?: string; targetLabel?: string; format?: (n: number) => string; caption: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [tableView, setTableView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const W = 640, H = height, padL = 46, padB = 26, padT = 8;
  const max = useMemo(() => niceMax(Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0)), 1)), [data]);
  const hasTarget = data.some((d) => d.target);
  const bw = (W - padL) / data.length;
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  return (
    <div className="chart" ref={ref} style={{ position: 'relative' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="chart-legend" aria-hidden>
          <span><i className="swatch" />{valueLabel}</span>
          {hasTarget && <span><i className="swatch line" />{targetLabel}</span>}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setTableView((x) => !x)} aria-pressed={tableView}><Table2 size={14} />{tableView ? 'Graphique' : 'Données'}</button>
      </div>
      {tableView ? (
        <table className="table table-compact"><caption className="sr-only">{caption}</caption>
          <thead><tr><th>Période</th><th className="num">{valueLabel}</th>{hasTarget && <th className="num">{targetLabel}</th>}</tr></thead>
          <tbody>{data.map((d) => <tr key={d.label}><td>{d.full ?? d.label}</td><td className="num">{money(d.value)}</td>{hasTarget && <td className="num">{d.target ? money(d.target) : '—'}</td>}</tr>)}</tbody>
        </table>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption} onMouseLeave={() => setHover(null)}>
          <g className="grid">{ticks.map((t) => <line key={t} x1={padL} x2={W} y1={y(t)} y2={y(t)} />)}</g>
          {ticks.map((t) => <text key={t} x={padL - 8} y={y(t) + 4} textAnchor="end">{format(t)}</text>)}
          {data.map((d, i) => {
            const x = padL + i * bw;
            const bwInner = Math.min(28, bw * 0.56);
            const bx = x + (bw - bwInner) / 2;
            const h = Math.max(0, H - padB - y(d.value));
            return (
              <g key={d.label} onMouseEnter={() => setHover(i)}>
                <rect x={x} y={padT} width={bw} height={H - padT - padB} fill="transparent" />
                {h > 0 && <path className={`bar${hover === i ? ' hover' : ''}`} d={`M${bx},${H - padB} V${y(d.value) + Math.min(4, h)} q0,-4 4,-4 h${bwInner - 8} q4,0 4,4 V${H - padB} Z`} />}
                {d.target ? <line className="target" x1={bx - 4} x2={bx + bwInner + 4} y1={y(d.target)} y2={y(d.target)} /> : null}
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" style={{ fontWeight: hover === i ? 600 : 400 }}>{d.label}</text>
              </g>
            );
          })}
          <line x1={padL} x2={W} y1={H - padB} y2={H - padB} stroke="var(--chart-axis)" />
        </svg>
      )}
      {hover !== null && !tableView && (
        <div className="chart-tip" style={{ left: `${((padL + hover * bw + bw / 2) / W) * 100}%`, top: 24, transform: 'translateX(-50%)' }}>
          <div className="strong">{data[hover].full ?? data[hover].label}</div>
          <div>{valueLabel} : {money(data[hover].value)}</div>
          {data[hover].target ? <div>{targetLabel} : {money(data[hover].target!)} ({Math.round((data[hover].value / data[hover].target!) * 100)} %)</div> : null}
        </div>
      )}
    </div>
  );
}

/** Barres horizontales étiquetées (comparaison de catégories). */
export function HBars({ data, format = moneyShort, caption, emptyLabel = 'Aucune donnée sur la période.' }: { data: { label: ReactNode; value: number; sub?: string; key?: string }[]; format?: (n: number) => string; caption: string; emptyLabel?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (!data.length) return <p className="muted small">{emptyLabel}</p>;
  return (
    <div className="hbar" role="list" aria-label={caption}>
      {data.map((d, i) => (
        <div key={d.key ?? i} role="listitem" style={{ display: 'contents' }} title={d.sub}>
          <span className="hbar-label">{d.label}</span>
          <span className="hbar-track"><span className="hbar-fill" style={{ width: `${(d.value / max) * 100}%`, display: 'block' }} /></span>
          <span className="hbar-value">{format(d.value)}{d.sub && <span className="muted"> · {d.sub}</span>}</span>
        </div>
      ))}
    </div>
  );
}

/** Couleur catégorielle fixe par position (jamais recyclée) — palette validée (daltonisme, contraste), voir tokens.css. */
export const seriesColor = (i: number) => `var(--series-${(i % 8) + 1})`;

function TableToggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return <button className="btn btn-ghost btn-sm" onClick={() => set(!on)} aria-pressed={on}><Table2 size={14} />{on ? 'Graphique' : 'Données'}</button>;
}

/** Courbes d'évolution : une seule échelle, réticule et info-bulle au survol, légende, étiquettes en bout de courbe, vue tableau. */
export function LineChart({ labels, series, height = 220, format = moneyShort, caption, fullLabels }: {
  labels: string[]; series: { key: string; label: string; values: number[] }[]; height?: number; format?: (n: number) => string; caption: string; fullLabels?: string[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [tableView, setTableView] = useState(false);
  const W = 640, H = height, padL = 48, padR = series.length <= 4 ? 70 : 12, padB = 26, padT = 10;
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const n = labels.length;
  const x = (i: number) => padL + (n <= 1 ? (W - padL - padR) / 2 : (i * (W - padL - padR)) / (n - 1));
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const step = Math.max(1, Math.ceil(n / 8));
  if (!n || !series.length) return <p className="small muted">Aucune donnée sur la période.</p>;
  return (
    <div className="chart" style={{ position: 'relative' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {series.length > 1 ? <div className="chart-legend">{series.map((s, i) => <span key={s.key}><i className="swatch" style={{ background: seriesColor(i) }} />{s.label}</span>)}</div> : <span />}
        <TableToggle on={tableView} set={setTableView} />
      </div>
      {tableView ? (
        <div className="table-wrap"><table className="table table-compact"><caption className="sr-only">{caption}</caption>
          <thead><tr><th>Période</th>{series.map((s) => <th key={s.key} className="num">{s.label}</th>)}</tr></thead>
          <tbody>{labels.map((l, i) => <tr key={l + i}><td>{fullLabels?.[i] ?? l}</td>{series.map((s) => <td key={s.key} className="num">{format(s.values[i] ?? 0)}</td>)}</tr>)}</tbody>
        </table></div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption} onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => { const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; const i = Math.round(((px - padL) / (W - padL - padR)) * (n - 1)); setHover(Math.max(0, Math.min(n - 1, i))); }}>
          <g className="grid">{ticks.map((t) => <line key={t} x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />)}</g>
          {ticks.map((t, i) => (i === 0 || format(t) !== format(ticks[i - 1])) && <text key={t} x={padL - 8} y={y(t) + 4} textAnchor="end">{format(t)}</text>)}
          {labels.map((l, i) => (i % step === 0 || i === n - 1) && <text key={i} x={x(i)} y={H - 8} textAnchor="middle" style={{ fontWeight: hover === i ? 600 : 400 }}>{l}</text>)}
          <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="var(--chart-axis)" />
          {hover !== null && <line className="crosshair" x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} />}
          {series.map((s, si) => (
            <g key={s.key}>
              <path className="line" style={{ stroke: seriesColor(si) }} d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v ?? 0)}`).join(' ')} />
              {hover !== null && <circle className="marker" cx={x(hover)} cy={y(s.values[hover] ?? 0)} r={4.5} style={{ fill: seriesColor(si) }} />}
              {series.length <= 4 && <text className="line-end" x={x(n - 1) + 6} y={y(s.values[n - 1] ?? 0) + 4} style={{ fill: 'var(--text)' }}>{format(s.values[n - 1] ?? 0)}</text>}
            </g>
          ))}
        </svg>
      )}
      {!tableView && hover !== null && (
        <div className="line-tip" style={{ left: `${(x(hover) / W) * 100}%` }} role="status">
          <strong>{fullLabels?.[hover] ?? labels[hover]}</strong>
          {series.map((s, si) => <span key={s.key}><i className="swatch" style={{ background: seriesColor(si) }} />{s.label} : {format(s.values[hover] ?? 0)}</span>)}
        </div>
      )}
    </div>
  );
}

/** Camembert (anneau) : parts d'un total ; au plus 7 parts + « Autres » ; espace entre les parts ; légende avec valeurs et % ; vue tableau. */
export function DonutChart({ data, format = (v: number) => String(v), caption, size = 180, centerLabel }: {
  data: { key: string; label: string; value: number }[]; format?: (n: number) => string; caption: string; size?: number; centerLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [tableView, setTableView] = useState(false);
  const sorted = [...data].filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  const parts = sorted.length > 8 ? [...sorted.slice(0, 7), { key: 'autres', label: 'Autres', value: sorted.slice(7).reduce((s, d) => s + d.value, 0) }] : sorted;
  const total = parts.reduce((s, d) => s + d.value, 0);
  if (!total) return <p className="small muted">Aucune donnée sur la période.</p>;
  const R = 80, r = 52, C = 90;
  let a0 = -Math.PI / 2;
  const arcs = parts.map((d, i) => {
    const a1 = a0 + (d.value / total) * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (rad: number, a: number) => `${C + rad * Math.cos(a)},${C + rad * Math.sin(a)}`;
    const path = parts.length === 1
      ? `M${C},${C - R} A${R},${R} 0 1 1 ${C - 0.01},${C - R} L${C - 0.01},${C - r} A${r},${r} 0 1 0 ${C},${C - r} Z`
      : `M${p(R, a0)} A${R},${R} 0 ${large} 1 ${p(R, a1)} L${p(r, a1)} A${r},${r} 0 ${large} 0 ${p(r, a0)} Z`;
    a0 = a1;
    return { ...d, path, i };
  });
  const pct = (v: number) => `${Math.round((100 * v) / total)} %`;
  const h = hover !== null ? parts[hover] : null;
  return (
    <div className="chart donut">
      <div className="row" style={{ justifyContent: 'flex-end' }}><TableToggle on={tableView} set={setTableView} /></div>
      {tableView ? (
        <table className="table table-compact"><caption className="sr-only">{caption}</caption>
          <thead><tr><th>Part</th><th className="num">Valeur</th><th className="num">%</th></tr></thead>
          <tbody>{parts.map((d) => <tr key={d.key}><td>{d.label}</td><td className="num">{format(d.value)}</td><td className="num">{pct(d.value)}</td></tr>)}<tr><td><strong>Total</strong></td><td className="num"><strong>{format(total)}</strong></td><td className="num">100 %</td></tr></tbody>
        </table>
      ) : (
        <div className="donut-body">
          <svg viewBox="0 0 180 180" width={size} height={size} role="img" aria-label={caption} onMouseLeave={() => setHover(null)}>
            {arcs.map((a) => <path key={a.key} d={a.path} className={`slice${hover === a.i ? ' hover' : ''}`} style={{ fill: seriesColor(a.i) }} onMouseEnter={() => setHover(a.i)} onFocus={() => setHover(a.i)} tabIndex={0} aria-label={`${a.label} : ${format(a.value)} (${pct(a.value)})`} />)}
            <text x={C} y={C - 2} textAnchor="middle" className="donut-total">{h ? pct(h.value) : format(total)}</text>
            <text x={C} y={C + 16} textAnchor="middle" className="donut-sub">{h ? h.label.slice(0, 18) : centerLabel ?? 'Total'}</text>
          </svg>
          <ul className="donut-legend">
            {parts.map((d, i) => (
              <li key={d.key} className={hover === i ? 'hover' : ''} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <i className="swatch" style={{ background: seriesColor(i) }} /><span className="truncate">{d.label}</span><span className="num">{format(d.value)}</span><span className="xsmall muted num">{pct(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
