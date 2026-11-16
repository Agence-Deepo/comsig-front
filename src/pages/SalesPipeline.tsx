import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Filter, TrendingUp } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useAuth } from '../lib/auth';
import { money, moneyShort, pct } from '../lib/format';
import { Badge, Card, Empty, ErrorState, Kpi, LoadingBlock, PageHeader, Segmented, Select } from '../components/ui';
import { ExcelButton } from '../components/ExportButton';
import { periodsOf, type Kind } from './Performance';

const covTone = (v: number | null) => (v === null ? 'neutral' : v >= 100 ? 'success' : v >= 70 ? 'warning' : 'danger') as 'neutral' | 'success' | 'warning' | 'danger';
const FORECAST = [['engage', 'Engagé (≥ 75 %)'], ['probable', 'Probable (50–74 %)'], ['possible', 'Possible (< 50 %)']] as const;

/** Pipeline des commerciaux : par vendeur et par étape, couverture de l'objectif, entonnoir, prévision, affaires à risque. */
export default function SalesPipeline() {
  const { me } = useAuth();
  const nav = useNavigate();
  const own = me?.data_scope === 'own';
  const [kind, setKind] = useState<Kind>('trimestre');
  const periods = useMemo(() => periodsOf(kind), [kind]);
  const [period, setPeriod] = useState(periods[0].value);
  const [dept, setDept] = useState('');
  const qs = `period=${period}${dept ? `&department=${dept}` : ''}`;
  const r = useApi<any>(['sales-pipeline', qs], `/api/performance/pipeline?${qs}`);
  const d = r.data;
  const maxCell = useMemo(() => Math.max(1, ...(d?.rows ?? []).flatMap((x: any) => Object.values(x.stages).map((c: any) => c.amount))), [d]);
  const maxForecast = useMemo(() => Math.max(1, ...(d?.forecast ?? []).map((f: any) => f.engage + f.probable + f.possible)), [d]);
  return (
    <>
      <PageHeader title={own ? 'Mon pipeline' : 'Pipeline des commerciaux'}
        subtitle={own ? 'Vos opportunités par étape, la couverture de votre objectif, vos prévisions et les affaires à relancer' : 'Opportunités de chaque commercial par étape, couverture des objectifs, prévisions et affaires à risque'}
        actions={<>
          <Segmented label="Périodicité" value={kind} onChange={(k) => { setKind(k); setPeriod(periodsOf(k)[0].value); }} options={[{ id: 'mois', label: 'Mois' }, { id: 'trimestre', label: 'Trimestre' }, { id: 'semestre', label: 'Semestre' }, { id: 'annee', label: 'Année' }]} />
          <Select aria-label="Période" style={{ width: 'auto' }} value={period} onChange={(e) => setPeriod(e.target.value)} options={periods} />
          {me?.cross_department && <Select aria-label="Service vendeur" style={{ width: 'auto' }} value={dept} onChange={(e) => setDept(e.target.value)} options={[{ value: '', label: 'Tous les services vendeurs' }, { value: 'commercial', label: 'Commercial et marketing' }, { value: 'regie', label: 'Régie publicitaire et médias' }]} />}
          <ExcelButton url={`/api/xlsx/sales-pipeline?${qs}`} />
        </>} />
      {r.error ? <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card> : !d ? <Card><LoadingBlock rows={8} /></Card> : !d.rows.length ? <Card><Empty icon={<Filter />} title="Aucun commercial dans votre périmètre" /></Card> : <>
        <div className="grid-4">
          <Kpi label="Pipeline ouvert" value={moneyShort(d.totals.open_amount)} foot={`${d.totals.open_n} affaire(s) en cours`} />
          <Kpi label="Pipeline pondéré" value={moneyShort(d.totals.weighted)} foot="Montant × probabilité de chaque affaire" />
          <Kpi label="Couverture du reste à faire" value={d.totals.coverage_pct !== null ? pct(d.totals.coverage_pct, 0) : '—'} progress={d.totals.coverage_pct !== null ? Math.min(100, d.totals.coverage_pct) : null}
            foot={d.totals.target ? `Reste ${moneyShort(d.totals.remaining)} sur un objectif de ${moneyShort(d.totals.target)}` : 'Aucun objectif sur la période'}
            help={{ title: 'Couverture', formula: 'Pondéré des affaires dont la clôture prévue tombe dans la période (ou est dépassée) ÷ (objectif − gagné). Au-dessus de 100 %, le pipeline suffit à atteindre l’objectif si les probabilités se confirment.' }} />
          <Kpi label="Taux de gain" value={d.totals.win_rate !== null ? `${d.totals.win_rate} %` : '—'} foot={`${d.totals.won_n} gagnée(s) · ${d.totals.lost_n} perdue(s)${d.totals.avg_cycle_days !== null ? ` · cycle ${d.totals.avg_cycle_days} j` : ''}`} />
        </div>

        <Card title={own ? 'Mes affaires par étape' : 'Pipeline par commercial et par étape'} sub="Montant HT des opportunités ouvertes (nombre d’affaires) — cliquez une ligne pour ouvrir le Kanban du commercial" flush>
          <div className="pipe-matrix-wrap">
            <table className="pipe-matrix">
              <thead>
                <tr>
                  <th className="pm-name">Commercial</th>
                  {d.stages.map((s: any) => <th key={s.code} className="pm-stage"><span>{s.label}</span><small>{s.probability} %</small></th>)}
                  <th className="num">Pondéré</th>
                  <th className="pm-goal">Objectif · gagné</th>
                  <th className="num">Couverture</th>
                  <th className="num">Alertes</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((x: any) => (
                  <tr key={x.user_id} onClick={() => nav(`/opportunites?owner=${x.user_id}`)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') nav(`/opportunites?owner=${x.user_id}`); }}>
                    <td className="pm-name"><strong>{x.full_name}</strong>{!own && <div className="pm-dept" style={{ ['--dept' as any]: x.department_color ?? 'var(--primary)' }}>{x.department_label}</div>}</td>
                    {d.stages.map((s: any) => {
                      const c = x.stages[s.code];
                      return <td key={s.code} className="pm-cell" style={{ ['--i' as any]: c.amount ? 0.08 + 0.37 * (c.amount / maxCell) : 0 }} title={c.n ? `${x.full_name} — ${s.label} : ${c.n} affaire(s), ${money(c.amount)} (pondéré ${money(c.weighted)})` : undefined}>
                        {c.n ? <><span>{moneyShort(c.amount)}</span><small>{c.n}</small></> : <span className="muted">—</span>}
                      </td>;
                    })}
                    <td className="num strong">{moneyShort(x.weighted)}</td>
                    <td className="pm-goal">
                      {x.target ? <><div className="pm-bar"><span style={{ width: `${Math.min(100, x.achieved_pct ?? 0)}%` }} /></div><div className="xsmall">{moneyShort(x.won_amount)} / {moneyShort(x.target)} · {pct(x.achieved_pct, 0)}</div></>
                        : <span className="xsmall muted">{x.won_amount ? `${moneyShort(x.won_amount)} gagnés · sans objectif` : 'Sans objectif'}</span>}
                    </td>
                    <td className="num">{x.coverage_pct !== null ? <Badge tone={covTone(x.coverage_pct)}>{pct(x.coverage_pct, 0)}</Badge> : <span className="muted">—</span>}</td>
                    <td className="num">{x.stale_n + x.overdue_n ? <span className="text-danger" title={`${x.stale_n} sans activité récente · ${x.overdue_n} à clôture dépassée`}><AlertTriangle className="ic-xs" aria-hidden /> {x.stale_n + x.overdue_n}</span> : <span className="muted">0</span>}</td>
                  </tr>
                ))}
              </tbody>
              {!own && d.rows.length > 1 && (
                <tfoot>
                  <tr>
                    <td className="pm-name">Total</td>
                    {d.stages.map((s: any) => { const c = d.totals.stages[s.code]; return <td key={s.code} className="pm-cell">{c.n ? <><span>{moneyShort(c.amount)}</span><small>{c.n}</small></> : '—'}</td>; })}
                    <td className="num">{moneyShort(d.totals.weighted)}</td>
                    <td className="pm-goal xsmall">{d.totals.target ? `${moneyShort(d.totals.won_amount)} / ${moneyShort(d.totals.target)}` : '—'}</td>
                    <td className="num">{d.totals.coverage_pct !== null ? <Badge tone={covTone(d.totals.coverage_pct)}>{pct(d.totals.coverage_pct, 0)}</Badge> : '—'}</td>
                    <td className="num">{d.totals.stale_n + d.totals.overdue_n}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>

        <div className="grid-2">
          <Card title="Entonnoir de conversion" sub="Opportunités créées sur 12 mois ayant atteint chaque étape">
            <ol className="funnel">
              {d.funnel.map((f: any, i: number) => {
                const prev = i ? d.funnel[i - 1].n : null;
                return (
                  <li key={f.code} title={`${f.label} : ${f.n} opportunité(s), ${f.pct} % des opportunités créées`}>
                    <span className="fn-label">{f.label}</span>
                    <span className="fn-track"><span className={`fn-bar${f.code === 'gagne' ? ' won' : ''}`} style={{ width: `${Math.max(2, f.pct)}%` }} /></span>
                    <span className="fn-val"><strong>{f.n}</strong> <span className="xsmall muted">{f.pct} %{prev ? ` · ${Math.round((100 * f.n) / prev)} % de l’étape précédente` : ''}</span></span>
                  </li>
                );
              })}
            </ol>
          </Card>
          <Card title="Prévision pondérée" sub="6 prochains mois, selon la date de clôture prévue et la probabilité de chaque affaire">
            <div className="fc-legend">{FORECAST.map(([k, l]) => <span key={k}><i className={`fc-${k}`} />{l}</span>)}</div>
            <div className="fc-chart" role="img" aria-label="Prévision pondérée par mois">
              {d.forecast.map((f: any) => {
                const total = f.engage + f.probable + f.possible;
                return (
                  <div key={f.month} className="fc-col" title={`${f.label} : engagé ${money(f.engage)}, probable ${money(f.probable)}, possible ${money(f.possible)}${f.includes_overdue ? ' (y compris les clôtures dépassées)' : ''}`}>
                    <span className="fc-total">{total ? moneyShort(total) : '—'}</span>
                    <div className="fc-stack" style={{ height: `${(100 * total) / maxForecast}%` }}>
                      {FORECAST.map(([k]) => f[k] ? <span key={k} className={`fc-${k}`} style={{ flexGrow: f[k] }} /> : null)}
                    </div>
                    <span className="fc-month">{f.label.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
            <p className="xsmall muted fc-note">Le mois en cours inclut les affaires dont la clôture prévue est dépassée.</p>
          </Card>
        </div>

        <Card title={<><AlertTriangle className="ic-sm text-danger" aria-hidden /> Affaires à risque</>} sub="Inactives au-delà du délai de l’étape, clôture dépassée ou sans prochaine étape datée — à relancer en priorité" flush>
          {d.risks.length ? (
            <table className="table">
              <thead><tr><th>Opportunité</th>{!own && <th>Commercial</th>}<th>Étape</th><th className="num">Montant</th><th>Motifs</th></tr></thead>
              <tbody>{d.risks.map((x: any) => (
                <tr key={x.id}>
                  <td><Link to={`/opportunites/${x.id}`} className="strong">{x.title}</Link><div className="xsmall muted">{x.ref} · {x.organization_name}</div></td>
                  {!own && <td className="small">{x.owner_name}</td>}
                  <td className="small">{x.stage_label}</td>
                  <td className="num small">{money(x.amount)}</td>
                  <td><div className="row-wrap">{x.reasons.map((m: string) => <Badge key={m} tone={m.startsWith('clôture') ? 'danger' : 'warning'}>{m}</Badge>)}</div></td>
                </tr>
              ))}</tbody>
            </table>
          ) : <Empty icon={<TrendingUp />} title="Aucune affaire à risque">Toutes les affaires ont une activité récente et une prochaine étape datée.</Empty>}
        </Card>
        <p className="xsmall muted">{d.method}</p>
      </>}
    </>
  );
}
