import { DocButton, ExcelButton } from '../components/ExportButton';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, FileBarChart2, Grid2x2, Minus, Plus, Printer, ShieldAlert, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth, useCan } from '../lib/auth';
import { dateTime, money, num } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, ErrorState, Field, Kpi, LoadingBlock, Modal, PageHeader, Segmented, Select, Textarea } from '../components/ui';
import { DeptChip, useDepartments } from '../components/work';
import { fmtKpi } from './Indicators';

const KIND_LABEL: Record<string, string> = { hebdomadaire: 'Hebdomadaire', mensuel: 'Mensuel', trimestriel: 'Trimestriel', semestriel: 'Semestriel', annuel: 'Annuel' };
const KPI_ST: Record<string, [string, 'success' | 'warning' | 'danger' | 'neutral']> = { atteint: ['Atteint', 'success'], a_surveiller: ['À surveiller', 'warning'], alerte: ['Alerte', 'danger'], sans_cible: ['Sans cible', 'neutral'], sans_donnee: ['—', 'neutral'] };
const SWOT_ST: Record<string, [string, 'info' | 'warning' | 'success']> = { generee: ['À revoir', 'warning'], revue: ['Revue par le service', 'info'], validee: ['Validée par la direction', 'success'] };
const pad = (n: number) => String(n).padStart(2, '0');

function isoWeek(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() + 4 - (x.getUTCDay() || 7));
  const y = x.getUTCFullYear();
  return { y, w: Math.ceil(((x.getTime() - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7) };
}

/** Périodes proposées pour une nature de rapport (de la plus récente à la plus ancienne). */
function periodOptions(kind: string) {
  const now = new Date(); const y = now.getUTCFullYear(); const m = now.getUTCMonth() + 1;
  if (kind === 'hebdomadaire') return Array.from({ length: 12 }, (_, i) => { const d = new Date(now); d.setUTCDate(d.getUTCDate() - 7 * i); const w = isoWeek(d); return { value: `${w.y}-W${pad(w.w)}`, label: `Semaine ${w.w} ${w.y}${i === 0 ? ' (en cours)' : ''}` }; });
  if (kind === 'mensuel') return Array.from({ length: 12 }, (_, i) => { const d = new Date(Date.UTC(y, m - 1 - i, 1)); return { value: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`, label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }) + (i === 0 ? ' (en cours)' : '') }; });
  if (kind === 'trimestriel') return Array.from({ length: 6 }, (_, i) => { const t = Math.ceil(m / 3) - i; const yy = y + Math.floor((t - 1) / 4); const tt = ((t - 1) % 4 + 4) % 4 + 1; return { value: `${yy}-T${tt}`, label: `T${tt} ${yy}${i === 0 ? ' (en cours)' : ''}` }; });
  if (kind === 'semestriel') return Array.from({ length: 4 }, (_, i) => { const s = (m <= 6 ? 1 : 2) - i; const yy = y + Math.floor((s - 1) / 2); const ss = ((s - 1) % 2 + 2) % 2 + 1; return { value: `${yy}-S${ss}`, label: `S${ss} ${yy}${i === 0 ? ' (en cours)' : ''}` }; });
  return Array.from({ length: 3 }, (_, i) => ({ value: `${y - i}`, label: `Année ${y - i}${i === 0 ? ' (en cours)' : ''}` }));
}

function GenerateModal({ open, onClose, swot }: { open: boolean; onClose: () => void; swot?: boolean }) {
  const { me } = useAuth();
  const deps = useDepartments();
  const nav = useNavigate();
  const [kind, setKind] = useState(swot ? 'mensuel' : 'mensuel');
  const opts = useMemo(() => periodOptions(kind), [kind]);
  const [key, setKey] = useState('');
  const [dept, setDept] = useState(me?.cross_department ? '' : me?.department_code ?? '');
  const gen = useAction((b: any) => api.post(swot ? '/api/swot' : '/api/periodic-reports', b), {
    success: swot ? 'Analyse SWOT préparée' : 'Rapport généré', invalidate: [[swot ? 'swot' : 'reports']],
    onSuccess: (r: any) => { onClose(); nav(swot ? `/swot/${r.id}` : `/rapports/${r.id}`); },
  });
  const kinds = Object.entries(KIND_LABEL).filter(([k]) => !swot || k !== 'hebdomadaire');
  return (
    <Modal open={open} onClose={onClose} title={swot ? 'Préparer une analyse SWOT' : 'Générer un rapport'} description="Les chiffres sont calculés à partir des données du CRM au moment de la génération."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={gen.isPending} onClick={() => gen.run({ key: key || opts[0].value, department: dept || null })}>{swot ? 'Préparer' : 'Générer'}</Button></>}>
      <Field label="Périodicité"><Select value={kind} onChange={(e) => { setKind(e.target.value); setKey(''); }} options={kinds.map(([value, label]) => ({ value, label }))} /></Field>
      <Field label="Période"><Select value={key || opts[0].value} onChange={(e) => setKey(e.target.value)} options={opts} /></Field>
      <Field label="Périmètre">
        <Select value={dept} onChange={(e) => setDept(e.target.value)} disabled={!me?.cross_department}
          options={[...(me?.cross_department ? [{ value: '', label: swot ? 'Entreprise (direction générale)' : 'Direction générale — consolidé' }] : []), ...deps.filter((d) => me?.cross_department || d.code === me?.department_code).map((d) => ({ value: d.code, label: d.label }))]} />
      </Field>
      {gen.error && <Alert tone="danger">{gen.error.message}</Alert>}
    </Modal>
  );
}

function ScopeFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { me } = useAuth();
  const deps = useDepartments();
  if (!me?.cross_department) return null;
  return <Select aria-label="Périmètre" value={value} onChange={(e) => onChange(e.target.value)} options={[{ value: '', label: 'Tous les périmètres' }, { value: 'dg', label: 'Direction générale' }, ...deps.map((d) => ({ value: d.code, label: d.label }))]} />;
}

// ───────────────────────── Rapports périodiques ─────────────────────────

export function PeriodicReports() {
  const can = useCan();
  const { me } = useAuth();
  const nav = useNavigate();
  const [kind, setKind] = useState('');
  const [dept, setDept] = useState('');
  const [gen, setGen] = useState(false);
  const qs = new URLSearchParams({ ...(kind ? { kind } : {}), ...(dept ? { department: dept } : {}) }).toString();
  const r = useApi<any>(['reports', qs], `/api/periodic-reports?${qs}`);
  const canGen = me?.cross_department || can('reporting', 'export') || me?.role_code === 'responsable_service';
  return (
    <>
      <PageHeader title="Rapports périodiques" subtitle="Hebdomadaires, mensuels, trimestriels, semestriels et annuels — par service et consolidés pour la direction générale"
        actions={canGen && me?.role_code !== 'auditeur' ? <Button variant="primary" icon={<Plus />} onClick={() => setGen(true)}>Générer un rapport</Button> : undefined} />
      <div className="filter-bar toolbar-gap">
        <Segmented label="Périodicité" value={kind} onChange={setKind} options={[{ id: '', label: 'Tous' }, ...Object.entries(KIND_LABEL).map(([id, label]) => ({ id, label }))]} />
        <ScopeFilter value={dept} onChange={setDept} />
      </div>
      <Card flush>
        {r.error ? <ErrorState error={r.error} onRetry={() => r.refetch()} /> : (
          <DataTable loading={!r.data} rows={r.data?.rows} onRowClick={(x: any) => nav(`/rapports/${x.id}`)}
            empty={<Empty icon={<FileBarChart2 />} title="Aucun rapport">Les rapports sont générés automatiquement à la fin de chaque période.</Empty>}
            columns={[
              { key: 'label', label: 'Période', render: (x: any) => <strong style={{ textTransform: 'capitalize' }}>{x.label}</strong> },
              { key: 'kind', label: 'Périodicité', render: (x: any) => <Badge tone="neutral" dot={false}>{KIND_LABEL[x.period_kind]}</Badge> },
              { key: 'scope', label: 'Périmètre', render: (x: any) => x.department_code ? <DeptChip label={x.department_label} color={x.department_color} /> : <Badge tone="accent">Direction générale</Badge> },
              { key: 'hl', label: 'Faits marquants', num: true, render: (x: any) => <span className="text-success">{x.highlights}</span>, mobile: 'hide' },
              { key: 'al', label: 'Points d’attention', num: true, render: (x: any) => x.alerts ? <span className="text-danger">{x.alerts}</span> : <span className="muted">0</span> },
              { key: 'gen', label: 'Généré', render: (x: any) => <span className="small">{dateTime(x.generated_at)}<div className="xsmall muted">{x.generated_by_name ?? 'Automatisation'}</div></span>, mobile: 'hide' },
            ]} />
        )}
      </Card>
      {gen && <GenerateModal open onClose={() => setGen(false)} />}
    </>
  );
}

function Trend({ k }: { k: any }) {
  if (k.trend === null || k.trend === undefined) return <span className="muted">{k.snapshot ? 'état à date' : '—'}</span>;
  const good = (k.trend > 0 && k.direction === 'hausse') || (k.trend < 0 && k.direction === 'baisse');
  const Icon = k.trend > 0 ? ArrowUpRight : k.trend < 0 ? ArrowDownRight : Minus;
  return <span className={k.trend === 0 ? 'muted' : good ? 'text-success' : 'text-danger'}><Icon className="ic-xs" aria-hidden /> {k.trend > 0 ? '+' : ''}{num(k.trend)} %</span>;
}

export function ReportView() {
  const { id } = useParams();
  const r = useApi<any>(['reports', id], `/api/periodic-reports/${id}`);
  if (r.error) return <Card><ErrorState error={r.error} /></Card>;
  if (!r.data) return <Card><LoadingBlock rows={10} /></Card>;
  const d = r.data.data; const m = d.meta;
  return (
    <div className="report-page">
      <PageHeader crumbs={[{ label: 'Rapports périodiques', to: '/rapports' }, { label: m.label }]}
        eyebrow={m.department ? <DeptChip label={m.department.label} color={m.department.color} /> : <Badge tone="accent">Direction générale — consolidé</Badge>}
        title={<span style={{ textTransform: 'capitalize' }}>Rapport {KIND_LABEL[m.kind].toLowerCase()} — {m.label}</span>}
        subtitle={`Du ${new Date(m.start + 'T00:00:00Z').toLocaleDateString('fr-FR', { timeZone: 'UTC' })} au ${new Date(m.end + 'T00:00:00Z').toLocaleDateString('fr-FR', { timeZone: 'UTC' })} · comparé à ${m.previous.label} · généré le ${dateTime(r.data.generated_at)} par ${r.data.generated_by_name ?? 'l’automatisation'}`}
        actions={<><DocButton kind="pdf" url={`/api/periodic-reports/${r.data.id}/pdf`} /><DocButton kind="docx" url={`/api/periodic-reports/${r.data.id}/docx`} /><ExcelButton url={`/api/xlsx/report/${r.data.id}`} /><Button variant="ghost" iconOnly icon={<Printer />} aria-label="Imprimer l’écran" onClick={() => window.print()} /></>} />
      <div className="grid-2">
        <Card title={<><TrendingUp className="ic-sm text-success" aria-hidden /> Faits marquants</>}>
          {d.highlights.length ? <ul className="report-list good">{d.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul> : <p className="muted small">Aucun fait marquant mesuré sur la période.</p>}
        </Card>
        <Card title={<><ShieldAlert className="ic-sm text-danger" aria-hidden /> Points d’attention</>}>
          {d.alerts.length ? <ul className="report-list bad">{d.alerts.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul> : <p className="muted small">Aucun point d’attention.</p>}
        </Card>
      </div>
      {d.kpis.length > 0 && (
        <Card title="Indicateurs" sub="Cibles mensuelles proratisées pour les indicateurs cumulés" flush>
          <DataTable compact rows={d.kpis.map((k: any) => ({ ...k, id: k.code }))} columns={[
            { key: 'label', label: 'Indicateur', render: (k: any) => <><strong>{k.label}</strong><div className="xsmall muted">{k.source}</div></> },
            { key: 'value', label: 'Valeur', num: true, render: (k: any) => <strong>{fmtKpi(k.unit, k.value)}</strong> },
            { key: 'previous', label: 'Période précédente', num: true, render: (k: any) => fmtKpi(k.unit, k.previous), mobile: 'hide' },
            { key: 'trend', label: 'Tendance', render: (k: any) => <Trend k={k} /> },
            { key: 'target', label: 'Cible', num: true, render: (k: any) => <>{fmtKpi(k.unit, k.target)}{k.target_prorated && <span className="xsmall muted"> *</span>}</>, mobile: 'hide' },
            { key: 'status', label: 'Statut', render: (k: any) => <Badge tone={KPI_ST[k.status][1]}>{KPI_ST[k.status][0]}</Badge> },
          ]} />
        </Card>
      )}
      {d.service && <ServiceSection s={d.service} />}
      {d.direction && <DirectionSection d={d.direction} />}
      <p className="xsmall muted">{d.method}</p>
    </div>
  );
}

function ServiceSection({ s }: { s: any }) {
  return (
    <>
      <div className="grid-4">
        <Kpi label="Tâches terminées" value={s.tasks.done} foot={s.tasks.on_time_pct !== null ? `${s.tasks.on_time_pct} % dans les délais · ${s.tasks.created} créée(s)` : `${s.tasks.created} créée(s)`} progress={s.tasks.on_time_pct} />
        <Kpi label="Tâches en retard" value={s.tasks.overdue} foot={`${s.tasks.open} ouverte(s) · ${num(s.tasks.hours_logged)} h saisies`} />
        <Kpi label="Ordres de travail livrés" value={s.workorders.completed} foot={s.workorders.completed ? `${s.workorders.on_time_pct} % à l’heure · délai moyen ${num(s.workorders.lead_days)} j` : `${s.workorders.received} reçu(s)`} progress={s.workorders.on_time_pct} />
        <Kpi label="Présence" value={s.attendance.presence_pct !== null ? `${s.attendance.presence_pct} %` : '—'} foot={`${s.attendance.headcount} agent(s) · ${s.attendance.late} retard(s) · ${s.attendance.absent} absence(s)`} progress={s.attendance.presence_pct} />
      </div>
      <div className="grid-2">
        <Card title="Projets du service">
          <ul className="plain-list"><li>{s.projects.active} projet(s) actif(s)</li><li>{s.projects.milestones_done} jalon(s) atteint(s) sur la période</li><li className={s.projects.milestones_late ? 'text-danger' : ''}>{s.projects.milestones_late} jalon(s) dépassé(s)</li></ul>
        </Card>
        <Card title="Risques ouverts">
          {s.risks.length ? <ul className="plain-list">{s.risks.map((r: any) => <li key={r.id}><Badge tone={r.score >= 16 ? 'danger' : r.score >= 12 ? 'warning' : 'info'}>{r.score}</Badge> {r.ref} — {r.title}</li>)}</ul> : <p className="muted small">Aucun risque ouvert.</p>}
        </Card>
      </div>
    </>
  );
}

function DirectionSection({ d }: { d: any }) {
  return (
    <>
      <div className="grid-4">
        <Kpi label="Produits comptabilisés" value={money(d.finance.revenue_booked)} foot="Comptes 70 (provisoires et validés)" />
        <Kpi label="Facturé HT" value={money(d.finance.invoiced)} />
        <Kpi label="Encaissé" value={money(d.finance.collected)} foot="Encaissements rapprochés" />
        <Kpi label="Créances échues" value={money(d.finance.overdue)} />
      </div>
      <div className="grid-2">
        <Card title="Classement commercial de la période" sub={`${d.sales.count} vendeur(s) · devis acceptés HT`}>
          <h4 className="small muted">Meilleurs résultats</h4>
          <ol className="rank-list">{d.sales.top.map((s: any) => <li key={s.id}><strong>{s.full_name}</strong> <span className="spacer" /> {money(s.revenue)} <span className="xsmall muted">({s.deals} affaire(s))</span></li>)}</ol>
          {d.sales.bottom.length > 0 && <><h4 className="small muted">À accompagner</h4>
            <ol className="rank-list low">{d.sales.bottom.map((s: any) => <li key={s.id}><strong>{s.full_name}</strong> <span className="spacer" /> {money(s.revenue)}</li>)}</ol></>}
        </Card>
        <Card title="Ressources humaines">
          <ul className="plain-list"><li>Effectif actif : <strong>{d.hr.headcount}</strong></li><li>Arrivées sur la période : {d.hr.hires}</li><li>Départs sur la période : {d.hr.exits}</li></ul>
        </Card>
      </div>
      <Card title="Synthèse par service" flush>
        <DataTable compact rows={d.services.map((s: any) => ({ ...s, id: s.code }))} columns={[
          { key: 'label', label: 'Service', render: (s: any) => <DeptChip label={s.label} color={s.color} /> },
          { key: 'td', label: 'Tâches terminées', num: true, render: (s: any) => s.tasks_done },
          { key: 'to', label: 'En retard', num: true, render: (s: any) => s.tasks_overdue ? <span className="text-danger">{s.tasks_overdue}</span> : 0 },
          { key: 'wo', label: 'OT livrés', num: true, render: (s: any) => s.workorders_completed, mobile: 'hide' },
          { key: 'wl', label: 'OT en retard', num: true, render: (s: any) => s.workorders_late ? <span className="text-danger">{s.workorders_late}</span> : 0, mobile: 'hide' },
          { key: 'pr', label: 'Présence', num: true, render: (s: any) => s.presence_pct !== null ? `${s.presence_pct} %` : '—' },
          { key: 'rk', label: 'Risques élevés', num: true, render: (s: any) => s.high_risks ? <Badge tone="danger">{s.high_risks}</Badge> : 0, mobile: 'hide' },
        ]} />
      </Card>
    </>
  );
}

// ───────────────────────── SWOT ─────────────────────────

export function SwotList() {
  const can = useCan();
  const { me } = useAuth();
  const nav = useNavigate();
  const [dept, setDept] = useState('');
  const [gen, setGen] = useState(false);
  const r = useApi<any>(['swot', dept], `/api/swot${dept ? `?department=${dept}` : ''}`);
  const canGen = me?.cross_department || can('reporting', 'export') || me?.role_code === 'responsable_service';
  return (
    <>
      <PageHeader title="Analyse SWOT" subtitle="Forces, faiblesses, opportunités et menaces mesurées chaque mois, trimestre, semestre et année, avec recommandations — validées par la direction"
        actions={canGen && me?.role_code !== 'auditeur' ? <Button variant="primary" icon={<Sparkles />} onClick={() => setGen(true)}>Préparer une analyse</Button> : undefined} />
      <div className="filter-bar toolbar-gap"><ScopeFilter value={dept} onChange={setDept} /></div>
      <Card flush>
        {r.error ? <ErrorState error={r.error} onRetry={() => r.refetch()} /> : (
          <DataTable loading={!r.data} rows={r.data?.rows} onRowClick={(x: any) => nav(`/swot/${x.id}`)} empty={<Empty icon={<Grid2x2 />} title="Aucune analyse" />}
            columns={[
              { key: 'label', label: 'Période', render: (x: any) => <><strong style={{ textTransform: 'capitalize' }}>{x.label}</strong><div className="xsmall muted">{KIND_LABEL[x.period_kind]}</div></> },
              { key: 'scope', label: 'Périmètre', render: (x: any) => x.department_code ? <DeptChip label={x.department_label} color={x.department_color} /> : <Badge tone="accent">Entreprise</Badge> },
              { key: 'q', label: 'F / Fa / O / M', render: (x: any) => <span className="swot-mini"><b className="s">{x.forces}</b><b className="w">{x.faiblesses}</b><b className="o">{x.opportunites}</b><b className="t">{x.menaces}</b></span> },
              { key: 'reco', label: 'Recommandations', num: true, render: (x: any) => x.recommendations, mobile: 'hide' },
              { key: 'st', label: 'Statut', render: (x: any) => <Badge tone={SWOT_ST[x.status][1]}>{SWOT_ST[x.status][0]}</Badge> },
            ]} />
        )}
      </Card>
      {gen && <GenerateModal open swot onClose={() => setGen(false)} />}
    </>
  );
}

const QUAD = [
  ['forces', 'Forces', 'Interne · positif', 's'],
  ['faiblesses', 'Faiblesses', 'Interne · négatif', 'w'],
  ['opportunites', 'Opportunités', 'Externe · positif', 'o'],
  ['menaces', 'Menaces', 'Externe · négatif', 't'],
] as const;
const PRIO: Record<string, 'danger' | 'warning' | 'info'> = { haute: 'danger', moyenne: 'warning', basse: 'info' };

export function SwotView() {
  const { id } = useParams();
  const r = useApi<any>(['swot', id], `/api/swot/${id}`);
  const [comment, setComment] = useState('');
  const review = useAction((status: string) => api.post(`/api/swot/${id}/review`, { status, comment: comment || null }), { success: 'Analyse mise à jour', invalidate: [['swot']] });
  if (r.error) return <Card><ErrorState error={r.error} /></Card>;
  if (!r.data) return <Card><LoadingBlock rows={10} /></Card>;
  const s = r.data;
  return (
    <div className="report-page">
      <PageHeader crumbs={[{ label: 'Analyse SWOT', to: '/swot' }, { label: s.label }]}
        eyebrow={s.department_code ? <DeptChip label={s.department_label} color={s.department_color} /> : <Badge tone="accent">Entreprise</Badge>}
        title={<span style={{ textTransform: 'capitalize' }}>SWOT — {s.label}</span>}
        subtitle={<>Préparée le {dateTime(s.generated_at)} · <Badge tone={SWOT_ST[s.status][1]}>{SWOT_ST[s.status][0]}</Badge></>}
        actions={<><DocButton kind="pdf" url={`/api/swot/${s.id}/pdf`} /><DocButton kind="docx" url={`/api/swot/${s.id}/docx`} /><ExcelButton url={`/api/xlsx/swot/${s.id}`} /><Button variant="ghost" iconOnly icon={<Printer />} aria-label="Imprimer l’écran" onClick={() => window.print()} /></>} />
      <div className="swot-grid">
        {QUAD.map(([k, title, sub, cls]) => (
          <section key={k} className={`swot-q swot-${cls}`} aria-label={title}>
            <header><h3>{title}</h3><span>{sub}</span><b>{s.items[k].length}</b></header>
            {s.items[k].length ? (
              <ul>{s.items[k].map((it: any, i: number) => (
                <li key={i}><strong>{it.text}</strong><div className="small">{it.evidence}</div><div className="xsmall muted">Source : {it.source}</div></li>
              ))}</ul>
            ) : <p className="small muted">Aucun élément mesuré sur la période.</p>}
          </section>
        ))}
      </div>
      <Card title={<><Target className="ic-sm" aria-hidden /> Recommandations</>} sub="Pistes d’action classées par priorité — à arbitrer par la direction" flush>
        <DataTable compact rows={s.recommendations.map((x: any, i: number) => ({ ...x, id: String(i) }))} empty={<Empty title="Aucune recommandation" />} columns={[
          { key: 'priority', label: 'Priorité', render: (x: any) => <Badge tone={PRIO[x.priority]}>{x.priority}</Badge> },
          { key: 'strategy', label: 'Axe', render: (x: any) => <span className={`swot-tag swot-${QUAD.find((q) => q[0] === x.axis)?.[3]}`}>{x.strategy}</span> },
          { key: 'finding', label: 'Constat', render: (x: any) => <><strong className="small">{x.finding}</strong><div className="xsmall muted">{x.evidence}</div></> },
          { key: 'action', label: 'Action recommandée', render: (x: any) => <span className="small">{x.action}</span> },
          { key: 'owner', label: 'Porteur suggéré', render: (x: any) => <span className="small">{x.owner}</span>, mobile: 'hide' },
          { key: 'horizon', label: 'Horizon', render: (x: any) => <span className="small">{x.horizon}</span>, mobile: 'hide' },
        ]} />
      </Card>
      <Card title="Revue et validation">
        {s.review_comment && <Alert tone={s.status === 'validee' ? 'success' : 'info'} title={`${SWOT_ST[s.status][0]} — ${s.reviewed_by_name ?? ''}`}>« {s.review_comment} »</Alert>}
        {s.status !== 'validee' && (s.can_review || s.can_validate) ? (
          <>
            <Field label="Commentaire"><Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Décisions prises, actions retenues…" /></Field>
            <div className="row">
              {s.can_review && s.status === 'generee' && <Button icon={<CheckCircle2 />} loading={review.isPending} onClick={() => review.run('revue')}>Marquer comme revue</Button>}
              {s.can_validate && <Button variant="primary" icon={<CheckCircle2 />} loading={review.isPending} onClick={() => review.run('validee')}>Valider l’analyse</Button>}
            </div>
          </>
        ) : s.status !== 'validee' && <p className="small muted">La revue revient au responsable du service, la validation à la direction générale.</p>}
        <p className="xsmall muted">{s.disclaimer}</p>
      </Card>
      <p className="small"><Link to="/indicateurs">Voir les indicateurs et leurs cibles →</Link></p>
    </div>
  );
}
