import { ExcelButton } from '../components/ExportButton';
import { useMemo, useState } from 'react';
import { Award, CheckCircle2, Lock, Medal, Target, TrendingDown, Trophy, Wallet } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth, useCan } from '../lib/auth';
import { money, moneyShort, pct } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, ErrorState, Kpi, LoadingBlock, PageHeader, Segmented, Select, Tabs } from '../components/ui';
import { BarTargetChart } from '../components/charts';

export type Kind = 'mois' | 'trimestre' | 'semestre' | 'annee';
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function periodsOf(kind: Kind) {
  const now = new Date(); const y = now.getFullYear(); const m = now.getMonth() + 1;
  const out: { value: string; label: string }[] = [];
  if (kind === 'mois') for (let i = 0; i < 12; i++) { const d = new Date(y, m - 1 - i, 1); out.push({ value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` }); }
  if (kind === 'trimestre') for (let i = 0; i < 6; i++) { const t0 = Math.ceil(m / 3) - i; const yy = y + Math.floor((t0 - 1) / 4); const t = ((t0 - 1) % 4 + 4) % 4 + 1; out.push({ value: `${yy}-T${t}`, label: `${t}${t === 1 ? 'er' : 'e'} trimestre ${yy}` }); }
  if (kind === 'semestre') for (let i = 0; i < 4; i++) { const s0 = (m <= 6 ? 1 : 2) - i; const yy = y + Math.floor((s0 - 1) / 2); const s = ((s0 - 1) % 2 + 2) % 2 + 1; out.push({ value: `${yy}-S${s}`, label: `${s}${s === 1 ? 'er' : 'e'} semestre ${yy}` }); }
  if (kind === 'annee') for (let i = 0; i < 3; i++) out.push({ value: `${y - i}`, label: `Année ${y - i}` });
  return out;
}

const TIER_TONE: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = { 'Objectif atteint': 'success', 'Proche de l’objectif': 'info', 'En retrait': 'warning', 'En difficulté': 'danger', 'Sans objectif': 'neutral' };

/** Objectifs périodiques, commissions prévisionnelles et réelles, classement des commerciaux, relevés de commissions. */
export default function Performance() {
  const { me } = useAuth();
  const can = useCan();
  const [kind, setKind] = useState<Kind>('mois');
  const periods = useMemo(() => periodsOf(kind), [kind]);
  const [period, setPeriod] = useState(periods[0].value);
  const [tab, setTab] = useState<'classement' | 'releves'>('classement');
  const r = useApi<any>(['perf', period], `/api/performance/sales?period=${period}`);
  const mine = r.data?.rows.find((x: any) => x.user_id === me?.id && x.target !== undefined);
  const full = (r.data?.rows ?? []).filter((x: any) => x.target !== undefined);
  return (
    <>
      <PageHeader title="Objectifs et commissions" subtitle="Atteinte des objectifs, commissions prévisionnelles et réelles, classement des commerciaux — calculés sur les affaires signées"
        actions={<>
          <Segmented label="Périodicité" value={kind} onChange={(k) => { setKind(k); setPeriod(periodsOf(k)[0].value); }} options={[{ id: 'mois', label: 'Mois' }, { id: 'trimestre', label: 'Trimestre' }, { id: 'semestre', label: 'Semestre' }, { id: 'annee', label: 'Année' }]} />
          <Select aria-label="Période" value={period} onChange={(e) => setPeriod(e.target.value)} options={periods} />
          <ExcelButton url={`/api/xlsx/performance?period=${period}`} />
        </>} />
      {r.error ? <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card> : r.isLoading || !r.data ? <Card><LoadingBlock rows={8} /></Card> : <>
        {mine && <MyCard row={mine} />}
        {r.data.team && <div className="grid-4">
          <Kpi label="Objectif de l’équipe" value={moneyShort(r.data.team.target)} />
          <Kpi label="Réalisé" value={moneyShort(r.data.team.achieved)} progress={r.data.team.achievement_pct} foot={r.data.team.achievement_pct !== null ? `${pct(r.data.team.achievement_pct)} de l’objectif` : 'Aucun objectif'} />
          <Kpi label="Prévision (pipeline pondéré)" value={moneyShort(r.data.team.forecast)} />
          <Kpi label="Commissions réelles / prévues" value={moneyShort(r.data.team.commissions)} foot={`Prévisionnelles : ${money(r.data.team.commissions_forecast)}`} />
        </div>}
        <Tabs value={tab} onChange={setTab} tabs={[{ id: 'classement', label: <><Trophy aria-hidden /> Classement</> }, { id: 'releves', label: <><Wallet aria-hidden /> Relevés de commissions</> }]} />
        {tab === 'classement' && <Ranking rows={r.data.rows} metric={r.data.metric} full={full} />}
        {tab === 'releves' && <Statements period={period} canClose={can('performance', 'validate')} />}
        {r.data.plan && <p className="xsmall muted">Plan « {r.data.plan.name} » — base : {r.data.plan.base === 'marge' ? 'marge' : r.data.plan.base === 'encaisse' ? 'encaissements' : 'chiffre d’affaires signé HT'} ; paliers : {r.data.plan.tiers.map((t: any) => `${t.rate} % dès ${t.from_pct} %`).join(' · ')}. Taux à valider par la direction.</p>}
      </>}
    </>
  );
}

function MyCard({ row }: { row: any }) {
  return (
    <Card className="my-perf" title={`Ma performance — rang ${row.rank}`} sub={row.tier_label}>
      <div className="grid-4">
        <Kpi label="Mon objectif" value={money(row.target)} />
        <Kpi label="Réalisé" value={money(row.achieved)} progress={row.achievement_pct} foot={row.achievement_pct !== null ? `${pct(row.achievement_pct)} de l’objectif · ${row.deals_won} affaire(s)` : 'Pas d’objectif fixé'} />
        <Kpi label="Commission réelle" value={money(row.commission_real)} foot={`Taux appliqué : ${pct(row.commission_rate)}`} />
        <Kpi label="Commission prévisionnelle" value={money(row.commission_forecast)} foot={`Si le pipeline pondéré se réalise (${pct(row.forecast_pct)})`} />
      </div>
      {row.next_tier && <Alert tone="info">Prochain palier : <strong>{row.next_tier.rate} %</strong> à partir de {row.next_tier.from_pct} % de l’objectif — il manque <strong>{money(Math.max(0, Math.round((row.next_tier.from_pct / 100) * row.target - row.achieved)))}</strong>.</Alert>}
      <div className="small muted">En cours : {row.open_opportunities} opportunité(s) à échéance dans la période ({money(row.pipeline_weighted)} pondérés), {row.quotes_pending} proposition(s) validée(s) ou envoyée(s) ({money(row.quotes_pending_amount)}).</div>
    </Card>
  );
}

function Ranking({ rows, metric, full }: { rows: any[]; metric: string; full: any[] }) {
  if (!rows.length) return <Card><Empty icon={<Target />} title="Aucun commercial évalué sur la période" /></Card>;
  const top = rows.slice(0, 3);
  const bottom = rows.length > 3 ? rows.slice(-Math.min(3, rows.length - 3)).reverse() : [];
  return (
    <>
      <div className="podium" aria-label="Meilleurs commerciaux">
        {top.map((x, i) => (
          <div key={x.user_id} className={`podium-step p${i + 1}`}>
            <div className="podium-icon">{i === 0 ? <Trophy aria-hidden /> : <Medal aria-hidden />}</div>
            <div className="podium-name">{x.full_name}</div>
            <div className="podium-val">{x.achievement_pct !== null && x.achievement_pct !== undefined ? pct(x.achievement_pct) : '—'}</div>
            <div className="podium-rank">{i + 1}<sup>{i === 0 ? 'er' : 'e'}</sup></div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <Card title="Classement complet" sub={`Critère : ${metric === 'revenue' ? 'chiffre d’affaires signé' : 'taux d’atteinte de l’objectif'}`} flush>
          <DataTable rows={rows.map((x) => ({ ...x, id: x.user_id }))} columns={[
            { key: 'r', label: 'Rang', render: (x: any) => <span className={`rank-badge r${Math.min(x.rank, 4)}`}>{x.rank}</span> },
            { key: 'n', label: 'Commercial', render: (x: any) => <><div className="cell-title">{x.full_name}</div><div className="cell-sub">{x.department_label}</div></> },
            { key: 'a', label: 'Atteinte', render: (x: any) => x.achievement_pct === null || x.achievement_pct === undefined ? '—' : <div className="ach"><div className="hbar-track"><span className="hbar-fill" style={{ width: `${Math.min(100, x.achievement_pct)}%` }} /></div><span className="small strong">{pct(x.achievement_pct)}</span></div> },
            { key: 'c', label: 'Réalisé', num: true, render: (x: any) => (x.achieved !== undefined ? money(x.achieved) : <Lock className="ic-xs muted" aria-label="Confidentiel" />), mobile: 'hide' },
            { key: 'm', label: 'Commission', num: true, render: (x: any) => (x.commission_real !== undefined ? money(x.commission_real) : ''), mobile: 'hide' },
            { key: 't', label: 'Situation', render: (x: any) => <Badge tone={TIER_TONE[x.tier_label] ?? 'neutral'}>{x.tier_label}</Badge> },
          ]} />
        </Card>
        <div className="stack-lg">
          {full.length > 0 && <Card title="Objectif et réalisé par commercial"><BarTargetChart caption="Objectif et réalisé par commercial" data={full.map((x) => ({ label: x.full_name.split(' ')[0], full: x.full_name, value: x.achieved, target: x.target }))} /></Card>}
          {bottom.length > 0 && <Card title="À accompagner" sub="Les moins performants de la période"><ul className="list">{bottom.map((x) => (
            <li key={x.user_id} className="list-item"><TrendingDown className="text-danger" aria-hidden /><span className="spacer strong">{x.full_name}</span><Badge tone={TIER_TONE[x.tier_label] ?? 'neutral'}>{x.achievement_pct !== null && x.achievement_pct !== undefined ? pct(x.achievement_pct) : 'Sans objectif'}</Badge></li>))}</ul>
            <p className="xsmall muted">Information de pilotage : à analyser avec la personne (portefeuille, zone, appui) — aucune décision automatique.</p></Card>}
        </div>
      </div>
    </>
  );
}

function Statements({ period, canClose }: { period: string; canClose: boolean }) {
  const can = useCan();
  const { me } = useAuth();
  const r = useApi<any>(['perf-st', period], `/api/performance/statements?period=${period}`);
  const close = useAction(() => api.post('/api/performance/close', { period }), { success: (x: any) => `${x.count} relevé(s) calculé(s)`, invalidate: [['perf-st', period]] });
  const st = useAction((b: { id: string; status: string }) => api.post(`/api/performance/statements/${b.id}/status`, { status: b.status }), { success: 'Relevé mis à jour', invalidate: [['perf-st', period]] });
  return (
    <Card title="Relevés de commissions" sub="Montants figés à l’arrêté, validés par la direction (jamais par l’intéressé) puis payés par la finance"
      actions={canClose && <Button variant="primary" icon={<Award />} loading={close.isPending} onClick={() => close.run(undefined)}>Arrêter les commissions de la période</Button>} flush>
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty icon={<Wallet />} title="Aucun relevé pour cette période" />} columns={[
        { key: 'n', label: 'Commercial', render: (x: any) => <span className="strong">{x.full_name}</span> },
        { key: 't', label: 'Objectif', num: true, render: (x: any) => money(x.target), mobile: 'hide' },
        { key: 'a', label: 'Réalisé', num: true, render: (x: any) => money(x.achieved) },
        { key: 'p', label: 'Atteinte', num: true, render: (x: any) => pct(x.achievement_pct) },
        { key: 'r', label: 'Taux', num: true, render: (x: any) => pct(x.rate) },
        { key: 'm', label: 'Commission', num: true, render: (x: any) => <strong>{money(x.amount)}</strong> },
        { key: 's', label: 'Statut', render: (x: any) => <Badge tone={x.status === 'paye' ? 'success' : x.status === 'valide' ? 'info' : 'warning'}>{x.status === 'paye' ? 'Payé' : x.status === 'valide' ? 'Validé' : 'Calculé'}</Badge> },
        { key: 'x', label: '', render: (x: any) => x.status === 'calcule' && canClose && x.user_id !== me?.id ? <Button size="sm" icon={<CheckCircle2 />} onClick={() => st.run({ id: x.id, status: 'valide' })}>Valider</Button>
          : x.status === 'valide' && (can('finance', 'update') || canClose) ? <Button size="sm" onClick={() => st.run({ id: x.id, status: 'paye' })}>Marquer payé</Button> : null },
      ]} />
    </Card>
  );
}
