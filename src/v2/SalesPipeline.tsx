import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Download, Filter } from 'lucide-react';
import { Card, Empty as CrmEmpty, PageHeader } from '../components/ui';
import './sales-pipeline.css';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { money } from './types';
import { ErrorBox, Loading } from './ui';

type PeriodMode = 'mois' | 'trimestre' | 'semestre' | 'annee';
type PipelineData = {
  period: { from: string; to: string };
  stages: { code: string; label: string; probability: number }[];
  rows: any[]; totals: any; funnel: any[]; forecast: any[]; risks: any[]; method: string;
};
const short = (value: number) => {
  const n = Number(value || 0);
  return n >= 1_000_000 ? `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n / 1_000_000)} M` : n >= 1000 ? `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n / 1000)} k` : money(n);
};
const periodsFor = (mode: PeriodMode) => {
  const today = new Date();
  return Array.from({ length: mode === 'mois' ? 12 : mode === 'annee' ? 5 : 8 }, (_, offset) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (mode === 'mois' ? offset : mode === 'trimestre' ? offset * 3 : mode === 'semestre' ? offset * 6 : offset * 12), 1);
    let from: Date; let to: Date; let label: string;
    if (mode === 'mois') { from = date; to = new Date(date.getFullYear(), date.getMonth() + 1, 0); label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date); }
    else if (mode === 'trimestre') { const q = Math.floor(date.getMonth() / 3); from = new Date(date.getFullYear(), q * 3, 1); to = new Date(date.getFullYear(), q * 3 + 3, 0); label = `${q === 0 ? '1er' : `${q + 1}e`} trimestre ${date.getFullYear()}`; }
    else if (mode === 'semestre') { const s = Math.floor(date.getMonth() / 6); from = new Date(date.getFullYear(), s * 6, 1); to = new Date(date.getFullYear(), s * 6 + 6, 0); label = `${s === 0 ? '1er' : '2e'} semestre ${date.getFullYear()}`; }
    else { from = new Date(date.getFullYear(), 0, 1); to = new Date(date.getFullYear(), 11, 31); label = `Année ${date.getFullYear()}`; }
    const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { from: iso(from), to: iso(to), label };
  }).filter((item, i, all) => all.findIndex((p) => p.from === item.from) === i);
};
function exportCsv(data: PipelineData) {
  const rows = [['Commercial', ...data.stages.map((s) => `${s.label} FCFA`), 'Pondéré FCFA', 'Objectif FCFA', 'Gagné FCFA', 'Couverture %']];
  for (const row of data.rows) rows.push([row.full_name, ...data.stages.map((s) => String(row.stages[s.code]?.amount ?? 0)), String(row.weighted), String(row.target), String(row.won_amount), String(row.coverage_pct ?? '')]);
  const csv = '\ufeff' + rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'pipeline-commerciaux.csv'; link.click(); URL.revokeObjectURL(url);
}

export default function SalesPipeline() {
  const { user } = useAuth();
  const own = user?.role?.data_scope === 'own';
  const canFilter = user?.role?.data_scope === 'all';
  const [mode, setMode] = useState<PeriodMode>('trimestre');
  const periods = useMemo(() => periodsFor(mode), [mode]);
  const [periodKey, setPeriodKey] = useState('');
  const [department, setDepartment] = useState('');
  const selected = periods.find((p) => `${p.from}_${p.to}` === periodKey) ?? periods[0];
  const query = queryString({ from: selected?.from, to: selected?.to, department });
  const q = useQuery({ queryKey: ['sales-pipeline', query], queryFn: ({ signal }) => api.get<PipelineData>(`/pipeline/commercials${query}`, signal) });
  const data = q.data; const nav = useNavigate();
  const maxCell = Math.max(1, ...(data?.rows ?? []).flatMap((row) => data!.stages.map((s) => row.stages[s.code]?.amount ?? 0)));
  const maxForecast = Math.max(1, ...(data?.forecast ?? []).map((f) => f.engage + f.probable + f.possible));
  const setModeAndReset = (next: PeriodMode) => { setMode(next); setPeriodKey(''); };

  return <>
    <PageHeader title={own ? 'Mon pipeline' : 'Pipeline des commerciaux'} subtitle={own ? 'Vos opportunités par étape, couverture de votre objectif, prévisions et affaires à relancer' : 'Opportunités de chaque commercial par étape, couverture des objectifs, prévisions et affaires à risque'} actions={<>
      <div className="row-wrap" aria-label="Périodicité">{(['mois', 'trimestre', 'semestre', 'annee'] as PeriodMode[]).map((item) => <button key={item} className={`btn${mode === item ? ' btn-primary' : ''}`} onClick={() => setModeAndReset(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
      <select className="input" aria-label="Période" value={periodKey || `${selected?.from}_${selected?.to}`} onChange={(e) => setPeriodKey(e.target.value)}>{periods.map((p) => <option key={p.from} value={`${p.from}_${p.to}`}>{p.label}</option>)}</select>
      {canFilter && <select className="input" aria-label="Service vendeur" value={department} onChange={(e) => setDepartment(e.target.value)}><option value="">Tous les services vendeurs</option><option value="commercial">Commercial et marketing</option><option value="regie">Régie publicitaire et médias</option></select>}
      <button className="btn" onClick={() => data && exportCsv(data)} disabled={!data}><Download size={16} /> Excel (CSV)</button>
    </>} />
    <ErrorBox error={q.error} retry={() => q.refetch()} />{q.isLoading && <Loading />}
    {data && !data.rows.length && <Card><CrmEmpty icon={<Filter />} title="Aucun commercial dans votre périmètre" /></Card>}
    {data && data.rows.length > 0 && <>
      <div className="grid-4">
        <Kpi label="Pipeline ouvert" value={short(data.totals.open_amount)} foot={`${data.totals.open_n} affaire(s) en cours`} color="#3979f6" />
        <Kpi label="Pipeline pondéré" value={short(data.totals.weighted)} foot="Montant × probabilité de chaque affaire" color="#12a594" />
        <Kpi label="Couverture du reste à faire" value={data.totals.coverage_pct == null ? '—' : `${Math.round(data.totals.coverage_pct)} %`} foot={`Reste ${short(data.totals.remaining)} sur un objectif de ${short(data.totals.target)}`} color="#ed8a00" />
        <Kpi label="Taux de gain" value={data.totals.win_rate == null ? '—' : `${data.totals.win_rate} %`} foot={`${data.totals.won_n} gagnée(s) · ${data.totals.lost_n} perdue(s)${data.totals.avg_cycle_days != null ? ` · cycle ${data.totals.avg_cycle_days} j` : ''}`} color="#8b4bea" />
      </div>
        <Card title={own ? 'Mes affaires par étape' : 'Pipeline par commercial et par étape'} sub="Montant des opportunités ouvertes — sélectionnez un commercial pour ouvrir son portefeuille" flush>
        <div className="salespipe-table"><table><thead><tr><th>Commercial</th>{data.stages.map((s) => <th className="salespipe-stage" key={s.code}>{s.label}<small>{s.probability} %</small></th>)}<th>Pondéré</th><th>Objectif · gagné</th><th>Couverture</th><th>Alertes</th></tr></thead><tbody>
          {data.rows.map((row) => <tr key={row.user_id} onClick={() => nav(`/opportunites?owner_id=${row.user_id}`)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && nav(`/opportunites?owner_id=${row.user_id}`)}><td><strong>{row.full_name}</strong><small className="muted">{row.department_label}</small></td>{data.stages.map((s) => { const cell = row.stages[s.code]; return <td key={s.code} className="salespipe-cell" style={{ background: cell.amount ? `color-mix(in srgb, #3979f6 ${8 + 37 * cell.amount / maxCell}%, transparent)` : undefined }} title={cell.n ? `${cell.n} affaire(s) · ${money(cell.amount)}` : undefined}>{cell.n ? <>{short(cell.amount)}<small>{cell.n}</small></> : '—'}</td>; })}<td><strong>{short(row.weighted)}</strong></td><td>{row.target ? <><div className="salespipe-goal"><i style={{ width: `${Math.min(100, 100 * row.won_amount / row.target)}%` }} /></div><small>{short(row.won_amount)} / {short(row.target)} · {Math.round(100 * row.won_amount / row.target)} %</small></> : <small className="muted">{row.won_amount ? `${short(row.won_amount)} gagnés · sans objectif` : 'Sans objectif'}</small>}</td><td>{row.coverage_pct == null ? '—' : <span className={`salespipe-badge ${row.coverage_pct >= 100 ? 'good' : 'warn'}`}>{Math.round(row.coverage_pct)} %</span>}</td><td>{row.stale_n + row.overdue_n ? <span className="danger-text"><AlertTriangle size={14} /> {row.stale_n + row.overdue_n}</span> : '0'}</td></tr>)}
        </tbody><tfoot><tr><th>Total</th>{data.stages.map((s) => <td key={s.code}>{short(data.totals.stages[s.code]?.amount ?? 0)}<small>{data.totals.stages[s.code]?.n ?? 0}</small></td>)}<td>{short(data.totals.weighted)}</td><td>{short(data.totals.won_amount)} / {short(data.totals.target)}</td><td>{data.totals.coverage_pct == null ? '—' : `${Math.round(data.totals.coverage_pct)} %`}</td><td>{data.totals.stale_n + data.totals.overdue_n}</td></tr></tfoot></table></div>
      </Card>
      <div className="grid-2">
        <Card title="Entonnoir de conversion" sub="Opportunités créées sur 12 mois ayant atteint chaque étape"><div className="salespipe-funnel">{data.funnel.map((f, index) => <div className="salespipe-funnel-row" key={f.code}><span>{f.label}</span><div><i className={f.code === 'gagne' ? 'won' : ''} style={{ width: `${Math.max(2, f.pct)}%` }} /></div><small><b>{f.n}</b> · {f.pct}%{index ? ` · ${data.funnel[index - 1].n ? Math.round(100 * f.n / data.funnel[index - 1].n) : 0}% étape précédente` : ''}</small></div>)}</div></Card>
        <Card title="Prévision pondérée" sub="6 prochains mois, selon la clôture prévue et la probabilité de chaque affaire"><div className="salespipe-legend"><span className="engage">Engagé (≥ 75 %)</span><span className="probable">Probable (50–74 %)</span><span className="possible">Possible (&lt; 50 %)</span></div><div className="salespipe-forecast">{data.forecast.map((f) => { const total = f.engage + f.probable + f.possible; return <div className="salespipe-forecast-col" key={f.month} title={`${f.label} : ${money(total)}`}><b>{total ? short(total) : '—'}</b><div style={{ height: `${Math.max(total ? 4 : 0, 100 * total / maxForecast)}%` }}><i className="engage" style={{ flexGrow: f.engage }} /><i className="probable" style={{ flexGrow: f.probable }} /><i className="possible" style={{ flexGrow: f.possible }} /></div><small>{f.label.split(' ')[0]}</small></div>; })}</div><small className="muted">Le mois en cours inclut les clôtures prévues dépassées.</small></Card>
      </div>
      <Card title={<><AlertTriangle size={17} className="danger-text" /> Affaires à risque</>} sub="Inactives depuis 14 jours, clôture dépassée ou sans prochaine étape datée — à relancer en priorité" flush>
        {data.risks.length ? <div className="salespipe-table"><table><thead><tr><th>Opportunité</th>{!own && <th>Commercial</th>}<th>Étape</th><th>Montant</th><th>Motifs</th></tr></thead><tbody>{data.risks.map((risk) => <tr key={risk.id}><td><Link className="link-strong" to={`/opportunites/${risk.id}`}>{risk.title}</Link><small className="muted">{risk.ref} · {risk.organization_name}</small></td>{!own && <td>{risk.owner_name}</td>}<td>{risk.stage_label}</td><td>{money(risk.amount)}</td><td><div className="row-wrap">{risk.reasons.map((reason: string) => <span className="salespipe-badge warn" key={reason}>{reason}</span>)}</div></td></tr>)}</tbody></table></div> : <CrmEmpty title="Aucune affaire à risque">Toutes les affaires ont une activité récente et une prochaine étape datée.</CrmEmpty>}
      </Card>
      <p className="muted small">{data.method}</p>
    </>}
  </>;
}
function Kpi({ label, value, foot, color }: { label: string; value: string; foot: string; color: string }) {
  return <div className="salespipe-kpi" style={{ borderLeftColor: color }}><span>{label}</span><strong>{value}</strong><small>{foot}</small></div>;
}
