import { ExcelButton } from '../components/ExportButton';
import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Gauge, Minus, Pencil } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { money, num, pct } from '../lib/format';
import { Badge, Button, Card, Empty, ErrorState, Field, Input, LoadingBlock, Modal, PageHeader, Select } from '../components/ui';
import { DeptChip, useDepartments } from '../components/work';

const ST: Record<string, [string, 'success' | 'warning' | 'danger' | 'neutral']> = { atteint: ['Cible atteinte', 'success'], a_surveiller: ['À surveiller', 'warning'], alerte: ['Alerte', 'danger'], sans_cible: ['Sans cible', 'neutral'], sans_donnee: ['Pas de donnée', 'neutral'] };
export const fmtKpi = (unit: string, v: number | null) => (v === null || v === undefined ? '—' : unit === 'fcfa' ? money(v) : unit === 'pct' ? pct(v) : unit === 'jours' ? `${num(v)} j` : unit === 'note' ? `${num(v)} / 5` : num(v));

const STEPS = [
  ['Définir', 'Chaque indicateur a une définition, une formule et une source de données uniques.'],
  ['Mesurer', 'Calcul automatique sur la période à partir des données du CRM (aucune saisie manuelle).'],
  ['Comparer', 'À la période précédente (tendance) et à la cible fixée par la direction.'],
  ['Alerter', 'Statut atteint / à surveiller (à 15 % de la cible) / alerte, repris dans les rapports et le SWOT.'],
  ['Décider', 'Les responsables analysent et décident des actions ; le système ne décide jamais.'],
];

/** Processus général de mesure : indicateurs de chaque service, tendance, cible et statut. */
export default function Indicators() {
  const { me } = useAuth();
  const deps = useDepartments();
  const now = new Date();
  const opts = useMemo(() => Array.from({ length: 12 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }; })
    .concat([1, 2, 3, 4].map((t) => ({ value: `${now.getFullYear()}-T${t}`, label: `T${t} ${now.getFullYear()}` })), [{ value: `${now.getFullYear()}`, label: `Année ${now.getFullYear()}` }]), []);
  const [period, setPeriod] = useState(opts[0].value);
  const [edit, setEdit] = useState<any>(null);
  const r = useApi<any>(['kpis', period], `/api/kpis?period=${period}`);
  const save = useAction((b: any) => api.put('/api/kpis/targets', b), { success: 'Cible enregistrée', invalidate: [['kpis']], onSuccess: () => setEdit(null) });
  const groups = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const k of r.data?.rows ?? []) (g[k.department] ??= []).push(k);
    return g;
  }, [r.data]);
  return (
    <>
      <PageHeader title="Indicateurs" subtitle="Processus général de mesure : chaque service suit ses indicateurs, comparés à la période précédente et à la cible"
        actions={<><Select aria-label="Période" value={period} onChange={(e) => setPeriod(e.target.value)} options={opts} /><ExcelButton url={`/api/xlsx/kpis?period=${period}`} /></>} />
      <ol className="measure-steps">{STEPS.map(([t, d], i) => <li key={t}><span>{i + 1}</span><div><strong>{t}</strong><div className="xsmall muted">{d}</div></div></li>)}</ol>
      {r.error ? <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card> : r.isLoading ? <Card><LoadingBlock rows={8} /></Card> : !r.data.rows.length ? <Card><Empty icon={<Gauge />} title="Aucun indicateur pour votre service" /></Card> : (
        Object.entries(groups).map(([dep, list]) => {
          const d = deps.find((x) => x.code === dep);
          return (
            <section key={dep} className="kpi-section">
              <h2 className="section-title"><DeptChip label={d?.label ?? dep} color={d?.color} /></h2>
              <div className="kpi-cards">
                {list.map((k) => {
                  const up = k.trend !== null && k.trend > 0, down = k.trend !== null && k.trend < 0;
                  const good = (up && k.direction === 'hausse') || (down && k.direction === 'baisse');
                  return (
                    <article key={k.code} className={`card kpi-card st-${k.status}`}>
                      <header><span className="kpi-label">{k.label}</span><Badge tone={ST[k.status][1]}>{ST[k.status][0]}</Badge></header>
                      <div className="kpi-value">{fmtKpi(k.unit, k.value)}</div>
                      <div className="row xsmall">
                        {k.trend !== null ? <span className={k.trend === 0 ? 'muted' : good ? 'text-success' : 'text-danger'}>{up ? <ArrowUpRight className="ic-xs" aria-hidden /> : down ? <ArrowDownRight className="ic-xs" aria-hidden /> : <Minus className="ic-xs" aria-hidden />} {k.trend > 0 ? '+' : ''}{num(k.trend)} % vs période précédente</span>
                          : <span className="muted">{k.snapshot ? 'État à date' : 'Pas de comparaison'}</span>}
                        <span className="spacer" />
                        <span className="muted">Cible : {k.target !== null ? fmtKpi(k.unit, k.target) : '—'}</span>
                        {me?.cross_department && <Button size="sm" variant="ghost" iconOnly icon={<Pencil />} aria-label={`Fixer la cible de ${k.label}`} onClick={() => setEdit({ ...k, t: k.target ?? '' })} />}
                      </div>
                      <details className="xsmall"><summary>Définition</summary><p>{k.definition}</p><p className="muted">Source : {k.source} · Fréquence de revue : {k.frequency} · Sens souhaité : {k.direction === 'hausse' ? 'à la hausse' : 'à la baisse'}</p></details>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Cible — ${edit?.label ?? ''}`} footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ code: edit.code, target: edit.t === '' ? null : Number(edit.t) })}>Enregistrer</Button></>}>
        {edit && <Field label={`Cible (${edit.unit === 'fcfa' ? 'FCFA' : edit.unit === 'pct' ? '%' : edit.unit})`} hint={edit.direction === 'hausse' ? 'Atteinte si la valeur est supérieure ou égale' : 'Atteinte si la valeur est inférieure ou égale'}><Input type="number" value={edit.t} onChange={(e) => setEdit({ ...edit, t: e.target.value })} /></Field>}
      </Modal>
    </>
  );
}
