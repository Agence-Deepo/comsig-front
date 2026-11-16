import { ExcelButton } from '../components/ExportButton';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useCan, useLookups } from '../lib/auth';
import { addDays, date, money, moneyShort, pct, today } from '../lib/format';
import { Badge, Card, DataTable, Empty, ErrorState, Input, LoadingBlock, PageHeader, Segmented, Select } from '../components/ui';

export const CLIENT_CATEGORY: Record<string, { label: string; hint: string; tone: 'success' | 'primary' | 'info' | 'danger' | 'neutral'; color: string }> = {
  strategique: { label: 'Stratégique', hint: 'Classe A, bon payeur, relation active : à fidéliser en priorité', tone: 'success', color: '#1baf7a' },
  fidele: { label: 'Fidèle', hint: 'Client actif avec une relation suivie : développer la part de portefeuille', tone: 'primary', color: '#2a78d6' },
  a_developper: { label: 'À développer', hint: 'Potentiel encore peu exploité : relancer, proposer', tone: 'info', color: '#7a4fb8' },
  a_risque: { label: 'À risque', hint: 'Retards ou impayés significatifs : sécuriser (acomptes, relances)', tone: 'danger', color: '#d9443a' },
  dormant: { label: 'Dormant', hint: 'Ni chiffre d’affaires ni relation récente : réactiver ou archiver', tone: 'neutral', color: '#8a909c' },
};

function Score({ v }: { v: number }) {
  const tone = v >= 70 ? 'good' : v >= 45 ? 'mid' : 'bad';
  return <span className={`score score-${tone}`} title={`${v} / 100`}><span style={{ width: `${v}%` }} /><b>{v}</b></span>;
}

/** Classement des clients : catégories, classes ABC, chiffre d'affaires, relation, paiements et solvabilité. */
export default function ClientRanking() {
  const nav = useNavigate();
  const { label } = useLookups();
  const [range, setRange] = useState('12m');
  const [cat, setCat] = useState('');
  const [abc, setAbc] = useState('');
  const [qy, setQy] = useState('');
  const can = useCan();
  const from = range === '12m' ? addDays(today(), -365) : range === 'ytd' ? `${new Date().getFullYear()}-01-01` : range === '3m' ? addDays(today(), -91) : addDays(today(), -730);
  const r = useApi<any>(['client-class', from], `/api/clients/classification?from=${from}&to=${today()}`);
  const rows = useMemo(() => (r.data?.rows ?? []).filter((x: any) => (!cat || x.category === cat) && (!abc || x.abc === abc) && (!qy || x.legal_name.toLowerCase().includes(qy.toLowerCase()))), [r.data, cat, abc, qy]);
  return (
    <>
      <PageHeader title="Classement des clients" subtitle="Par catégorie, chiffre d’affaires de la période, relation, paiements et solvabilité — scores expliqués, calculés sur les données du CRM"
        actions={<><Segmented label="Période" value={range} onChange={setRange} options={[{ id: '3m', label: '3 mois' }, { id: 'ytd', label: 'Année en cours' }, { id: '12m', label: '12 mois' }, { id: '24m', label: '24 mois' }]} />{can('organizations', 'export') && <ExcelButton url={`/api/xlsx/clients-classification?from=${from}&to=${today()}`} />}</>} />
      {r.error ? <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card> : r.isLoading || !r.data ? <Card><LoadingBlock rows={8} /></Card> : <>
        <div className="cat-grid">
          {(r.data.summary ?? []).map((s: any) => {
            const c = CLIENT_CATEGORY[s.category];
            return (
              <button key={s.category} className={`card cat-card${cat === s.category ? ' on' : ''}`} style={{ ['--c' as any]: c.color }} onClick={() => setCat(cat === s.category ? '' : s.category)} aria-pressed={cat === s.category}>
                <span className="cat-count">{s.count}</span><span className="cat-label">{c.label}</span><span className="xsmall muted">{moneyShort(s.revenue)}</span><span className="xsmall">{c.hint}</span>
              </button>
            );
          })}
        </div>
        <Card title="Répartition ABC (loi de Pareto)" sub={`A : clients cumulant ${r.data.thresholds?.a ?? '—'} % du CA · B : jusqu’à ${r.data.thresholds?.b ?? '—'} % · C : le reste — CA total ${money(r.data.total_revenue ?? 0)}`}>
          <div className="abc-bar" role="img" aria-label={(r.data.abc ?? []).map((a: any) => `Classe ${a.abc} : ${a.count} clients`).join(', ')}>
            {(r.data.abc ?? []).map((a: any) => <button key={a.abc} className={`abc-${a.abc}${abc === a.abc ? ' on' : ''}`} style={{ flexGrow: Math.max(1, a.revenue) }} onClick={() => setAbc(abc === a.abc ? '' : a.abc)}>
              <strong>{a.abc}</strong> {a.count} client(s) · {moneyShort(a.revenue)}</button>)}
          </div>
        </Card>
        <Card flush>
          <div className="filter-bar"><Input placeholder="Rechercher un client…" value={qy} onChange={(e) => setQy(e.target.value)} aria-label="Rechercher" /><Select aria-label="Catégorie" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Toutes catégories" options={Object.entries(CLIENT_CATEGORY).map(([value, c]) => ({ value, label: c.label }))} /><Select aria-label="Classe" value={abc} onChange={(e) => setAbc(e.target.value)} placeholder="Classes A, B, C" options={['A', 'B', 'C'].map((x) => ({ value: x, label: `Classe ${x}` }))} /></div>
          <DataTable rows={rows} onRowClick={(x: any) => nav(`/organisations/${x.id}`)} empty={<Empty icon={<Layers />} title="Aucun client" />} columns={[
            { key: 'n', label: 'Client', render: (x: any) => <><div className="cell-title">{x.legal_name}</div><div className="cell-sub">{x.sector ? label('sector', x.sector) : '—'}{x.owner_name ? ` · ${x.owner_name}` : ''}</div></> },
            { key: 'c', label: 'Catégorie', render: (x: any) => <Badge tone={CLIENT_CATEGORY[x.category].tone}>{CLIENT_CATEGORY[x.category].label}</Badge> },
            { key: 'a', label: 'ABC', render: (x: any) => <span className={`abc-chip abc-${x.abc}`}>{x.abc}</span> },
            { key: 'r', label: 'CA période', num: true, render: (x: any) => <>{money(x.revenue)}<div className="cell-sub">{pct(x.share_pct)} du total</div></> },
            { key: 's', label: 'Score global', render: (x: any) => <Score v={x.score} /> },
            { key: 'rl', label: 'Relation', render: (x: any) => <span title={`${x.activities_90d} activité(s) en 90 j · dernier contact ${x.last_contact ? date(x.last_contact) : 'jamais'} · ${x.complaints_open} réclamation(s)`}><Score v={x.relation_score} /></span>, mobile: 'hide' },
            { key: 'p', label: 'Paiements', render: (x: any) => <span title={x.invoices_count ? `${x.on_time_pct ?? '—'} % à l’échéance · retard moyen ${x.avg_days_late ?? 0} j` : 'Pas d’historique de facturation'}><Score v={x.payment_score} /></span>, mobile: 'hide' },
            { key: 'sv', label: 'Solvabilité', render: (x: any) => <span title={`Échu : ${money(x.overdue_amount)} dont > 90 j : ${money(x.overdue_90)}`}><Score v={x.solvency_score} /></span>, mobile: 'hide' },
          ]} />
        </Card>
        {r.data.method && <p className="xsmall muted">Méthode : score global = CA {r.data.method.weights.chiffre_affaires} % + paiements {r.data.method.weights.paiements} % + relation {r.data.method.weights.relation} % + solvabilité {r.data.method.weights.solvabilite} %. Sources : {r.data.method.sources} Survolez une note pour voir ses données.</p>}
      </>}
    </>
  );
}
