// Gouvernance : protocole de priorité (légende officielle) et audits de gouvernance de l'assistant IA.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ClipboardCheck, Play, Printer, ShieldCheck } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { date, dateTime } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, ErrorState, Field, Kpi, LoadingBlock, Modal, PageHeader, Textarea } from '../components/ui';
import { PriorityBadge, usePriorityLevels } from '../components/Priority';

/** Légende officielle : niveaux, couleurs, délais de prise en charge et critères. */
export function PriorityProtocol() {
  const levels = usePriorityLevels();
  return (
    <>
      <PageHeader title="Protocole des priorités" subtitle="Obligatoire pour toute tâche ou tout projet délégué ou distribué, tout ordre de travail et tout circuit de production" />
      <div className="stack-lg">
      <Card>
        <p className="small">Le niveau est choisi explicitement avant toute transmission : la plateforme refuse une délégation sans niveau. Le délai de prise en charge court dès la transmission ; au-delà, la personne puis son responsable (au double du délai) sont alertés pour les niveaux P1 et P2, et l’audit de gouvernance relève les dépassements.</p>
      </Card>
      <div className="grid-3">
        {levels.map((p) => (
          <Card key={p.level}>
            <div style={{ ['--prio' as any]: p.color }} className="prio-card">
              <h3 className="row" style={{ margin: 0 }}><PriorityBadge level={p.level} /></h3>
              <p className="small strong" style={{ margin: '8px 0 4px' }}>{p.response}</p>
              <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{p.criteria.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          </Card>
        ))}
      </div>
      </div>
    </>
  );
}

const SEV: Record<string, { label: string; tone: 'danger' | 'warning' | 'info'; color: string }> = {
  critique: { label: 'Critique', tone: 'danger', color: 'var(--danger)' },
  majeure: { label: 'Majeur', tone: 'warning', color: 'var(--warning)' },
  mineure: { label: 'Mineur', tone: 'info', color: 'var(--info, var(--primary))' },
};

function canRun(role?: string) { return ['superadmin', 'admin_tech', 'direction_generale'].includes(role ?? ''); }

export function GovernanceAudits() {
  const { me } = useAuth();
  const nav = useNavigate();
  const r = useApi<any>(['gov-audits'], '/api/governance/audits');
  const run = useAction(() => api.post('/api/governance/audits'), { success: (x: any) => `Audit ${x.ref} réalisé`, invalidate: [['gov-audits']], onSuccess: (x: any) => nav(`/gouvernance/audits/${x.id}`) });
  return (
    <>
      <PageHeader title="Audits de gouvernance" subtitle="Contrôle par l’assistant IA de tous les départements : faiblesses du dispositif, erreurs d’enregistrement, incohérences, retards et sécurité"
        actions={canRun(me?.role_code) && <Button variant="primary" icon={<Play />} loading={run.isPending} onClick={() => run.run(undefined)}>Lancer un audit</Button>} />
      {r.error ? <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card> : (
        <div className="stack-lg">
          <Card flush title="Rapports">
            <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(a: any) => nav(`/gouvernance/audits/${a.id}`)}
              empty={<Empty icon={<ShieldCheck />} title="Aucun audit">Le premier audit planifié est réalisé dans la semaine ; vous pouvez aussi le lancer maintenant.</Empty>}
              columns={[
                { key: 'r', label: 'Rapport', render: (a: any) => <><div className="cell-title">{a.ref}</div><div className="cell-sub">{dateTime(a.generated_at)} · {a.generated_by_name ?? 'audit planifié'}</div></> },
                { key: 's', label: 'Score', render: (a: any) => <strong className="num">{a.score}/100</strong> },
                { key: 'c', label: 'Constats', render: (a: any) => <span className="row-wrap"><Badge tone="danger">{a.critique} critique(s)</Badge><Badge tone="warning">{a.majeure} majeur(s)</Badge><Badge tone="info">{a.mineure} mineur(s)</Badge></span> },
                { key: 'v', label: 'Revue', mobile: 'hide', render: (a: any) => a.reviewed_at ? <span className="small">{a.reviewed_by_name} · {date(a.reviewed_at)}</span> : <Badge tone="warning">À revoir</Badge> },
              ]} />
          </Card>
          {r.data?.controls && (
            <Card title={`Contrôles exécutés à chaque audit (${r.data.controls.length})`}>
              <ul className="small cols-2">{r.data.controls.map((c: any) => <li key={c.code}>{c.label}</li>)}</ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

export function GovernanceAuditDetail() {
  const { id } = useParams();
  const { me } = useAuth();
  const r = useApi<any>(['gov-audit', id], `/api/governance/audits/${id}`);
  const [reviewing, setReviewing] = useState(false);
  const [note, setNote] = useState('');
  const review = useAction((b: any) => api.post(`/api/governance/audits/${id}/review`, b), { success: 'Revue consignée', invalidate: [['gov-audit', id], ['gov-audits']], onSuccess: () => setReviewing(false) });
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading || !r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const a = r.data; const s = a.summary;
  const deps = Object.entries(s.by_department ?? {}) as [string, any][];
  const isAdmin = ['superadmin', 'admin_tech'].includes(me?.role_code ?? '');
  return (
    <>
      <PageHeader crumbs={[{ label: 'Audits de gouvernance', to: '/gouvernance/audits' }, { label: a.ref }]} title={`Audit de gouvernance ${a.ref}`}
        subtitle={`${dateTime(a.generated_at)} · ${a.generated_by_name ? `lancé par ${a.generated_by_name}` : 'audit planifié'} · ${a.scope}`}
        actions={<>
          <Button icon={<Printer />} onClick={() => window.print()}>Imprimer</Button>
          {isAdmin && !a.reviewed_at && <Button variant="primary" icon={<ClipboardCheck />} onClick={() => setReviewing(true)}>Consigner la revue</Button>}
        </>} />
      <div className="stack-lg">
      <div className="grid-4">
        <Kpi label="Score de gouvernance" value={`${a.score}/100`} foot={a.previous ? `Précédent : ${a.previous.score}/100 (${a.previous.ref})` : 'Premier audit'} />
        <Kpi label="Constats critiques" value={String(s.critique)} foot="Action immédiate" />
        <Kpi label="Constats majeurs et mineurs" value={`${s.majeure} · ${s.mineure}`} foot="Majeurs · mineurs" />
        <Kpi label="Contrôles exécutés" value={`${s.controls - s.failed.length}/${s.controls}`} foot={`${s.passed?.length ?? 0} conforme(s)`} />
      </div>
      <Card title="Synthèse et recommandations">
        <p>{s.synthesis}</p>
        {s.failed.length > 0 && <Alert tone="warning">Contrôles non exécutés : {s.failed.map((f: any) => `${f.label} (${f.error})`).join(' ; ')}. Le périmètre audité est incomplet.</Alert>}
        <p className="xsmall muted">{s.method}</p>
        {a.reviewed_at
          ? <Alert tone="success" title={`Revu par ${a.reviewed_by_name} le ${dateTime(a.reviewed_at)}`}>{a.review_note}</Alert>
          : <Alert tone="info">Rapport adressé aux administrateurs, aux super-administrateurs et à la direction générale ; en attente de revue par un administrateur.</Alert>}
      </Card>
      {deps.length > 0 && (
        <Card flush title="Constats par département">
          <DataTable rows={deps.map(([code, d]) => ({ code, ...d }))} columns={[
            { key: 'd', label: 'Département', render: (d: any) => <strong>{d.label}</strong> },
            { key: 'c', label: 'Critiques', render: (d: any) => <span className={d.critique ? 'text-danger strong' : 'muted'}>{d.critique}</span> },
            { key: 'm', label: 'Majeurs', render: (d: any) => d.majeure },
            { key: 'n', label: 'Mineurs', render: (d: any) => d.mineure },
          ]} />
        </Card>
      )}
      <Card title={`Constats (${a.findings.length})`}>
        {!a.findings.length ? <Empty icon={<ShieldCheck />} title="Aucun écart détecté">Tous les contrôles exécutés sont conformes.</Empty> : a.findings.map((f: any, i: number) => (
          <section key={i} className="gov-finding" style={{ ['--sev' as any]: SEV[f.severity].color }} aria-label={`${SEV[f.severity].label} : ${f.title}`}>
            <div className="row-wrap"><Badge tone={SEV[f.severity].tone}>{SEV[f.severity].label}</Badge><Badge tone="neutral" dot={false}>{a.categories?.[f.category] ?? f.category}</Badge><span className="small strong">{f.department_label}</span></div>
            <h4>{f.title} <span className="muted">({f.count})</span></h4>
            <p className="small" style={{ margin: 0 }}>{f.detail}</p>
            {f.evidence?.length > 0 && (
              <ul className="gov-evidence small">
                {f.evidence.map((e: any, k: number) => <li key={k}>{e.link ? <Link to={e.link}>{e.ref}</Link> : e.ref} — {e.label}</li>)}
                {f.count > f.evidence.length && <li className="muted">… et {f.count - f.evidence.length} autre(s)</li>}
              </ul>
            )}
            <div className="gov-reco small"><strong>Recommandation :</strong> {f.recommendation}</div>
          </section>
        ))}
      </Card>
      {s.passed?.length > 0 && <Card title="Contrôles conformes"><ul className="small cols-2">{s.passed.map((p: string) => <li key={p}>{p}</li>)}</ul></Card>}
      </div>
      <Modal open={reviewing} onClose={() => setReviewing(false)} title="Revue de l’audit" description="Consignez la prise de connaissance et le plan d’action décidé (responsables, échéances)."
        footer={<><Button onClick={() => setReviewing(false)}>Annuler</Button><Button variant="primary" loading={review.isPending} disabled={!note.trim()} onClick={() => review.run({ note })}>Consigner</Button></>}>
        <Field label="Plan d’action" required error={review.fieldErrors.note}><Textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        {review.error && !Object.keys(review.fieldErrors).length && <Alert tone="danger">{review.error.message}</Alert>}
      </Modal>
    </>
  );
}
