import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Play, CalendarClock, Lock } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth, useCan, useUsers } from '../lib/auth';
import { dateTime, money, relative } from '../lib/format';
import { Alert, Badge, Button, Card, Dl, ErrorState, Field, Input, LoadingBlock, PageHeader, Select, Status, Textarea } from '../components/ui';
import { Documents } from '../components/Documents';

/** Ordre de travail : utilisable sur mobile par l'équipe terrain (photos avant/après, compte rendu, pièces, coûts). */
export default function InterventionDetail() {
  const { id } = useParams();
  const can = useCan();
  const { me } = useAuth();
  const users = useUsers();
  const r = useApi<any>(['intervention', id], `/api/interventions/${id}`);
  const [f, setF] = useState<any>({ report: '', parts_used: '', cost_labor: 0, cost_parts: 0 });
  useEffect(() => { if (r.data) { const i = r.data.intervention; setF({ report: i.report ?? '', parts_used: i.parts_used ?? '', cost_labor: i.cost_labor, cost_parts: i.cost_parts }); } }, [r.data]);
  const upd = useAction((b: any) => api.patch(`/api/interventions/${id}`, b), { success: 'Intervention mise à jour', invalidate: [['intervention', id], ['interventions'], ['int-kpis']] });
  if (r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  if (r.error) return <Card><ErrorState error={r.error} /></Card>;
  const i = r.data.intervention;
  const tech = me?.role_code === 'technicien';
  const open = ['ouvert', 'planifie', 'en_cours'].includes(i.status);
  const late = open && new Date(i.target_date) < new Date();
  const report = () => ({ report: f.report, parts_used: f.parts_used || undefined, cost_labor: Number(f.cost_labor) || 0, cost_parts: Number(f.cost_parts) || 0 });
  return (
    <>
      <PageHeader crumbs={[{ label: tech ? 'Mes ordres de travail' : 'Maintenance', to: '/maintenance' }, { label: i.ref }]}
        title={<span className="row-wrap" style={{ gap: 10 }}>{i.title}<Status kind="intervention" code={i.status} /></span>}
        subtitle={<>{i.support_code && <Link to={`/supports/${i.support_id}`}>{i.support_code} — {i.support_name}</Link>}{i.campaign_ref && <> · <Link to={`/campagnes/${i.campaign_id}`}>{i.campaign_ref}</Link></>}{i.organization_name && ` · ${i.organization_name}`}</>}
        actions={<>
          {['ouvert', 'planifie'].includes(i.status) && can('interventions', 'update') && <Button variant="primary" icon={<Play />} loading={upd.isPending} onClick={() => upd.run({ status: 'en_cours' })}>Démarrer l’intervention</Button>}
          {i.status === 'en_cours' && <Button variant="primary" icon={<CheckCircle2 />} loading={upd.isPending} onClick={() => upd.run({ ...report(), status: 'resolu' })}>Marquer comme résolue</Button>}
          {i.status === 'resolu' && can('interventions', 'validate') && <Button variant="primary" icon={<Lock />} loading={upd.isPending} onClick={() => upd.run({ status: 'clos' })}>Valider et clore</Button>}
        </>} />
      {upd.error && <Alert tone="danger" title="Action impossible">{upd.error.message}</Alert>}
      {late && <Alert tone="danger" title={`En retard (${relative(i.target_date)})`}>{i.escalation_level > 1 ? 'Escaladé à la direction.' : 'Le responsable des opérations a été alerté.'}</Alert>}
      <div className="split">
        <div className="stack-lg" style={{ minWidth: 0 }}>
          <Card title="Compte rendu d’intervention" sub="Obligatoire pour résoudre. Une photo avant/après est requise pour une intervention corrective."
            footer={can('interventions', 'update') && open && <Button loading={upd.isPending} onClick={() => upd.run(report())}>Enregistrer</Button>}>
            <div className="form-grid">
              <Field label="Travaux réalisés, constats" required className="span-2" error={upd.fieldErrors.report}><Textarea rows={5} value={f.report} disabled={!open} onChange={(e) => setF({ ...f, report: e.target.value })} /></Field>
              <Field label="Pièces consommées" className="span-2"><Input value={f.parts_used} disabled={!open} onChange={(e) => setF({ ...f, parts_used: e.target.value })} /></Field>
              <Field label="Main-d’œuvre (FCFA)"><Input type="number" min={0} inputMode="numeric" value={f.cost_labor} disabled={!open} onChange={(e) => setF({ ...f, cost_labor: e.target.value })} /></Field>
              <Field label="Pièces (FCFA)"><Input type="number" min={0} inputMode="numeric" value={f.cost_parts} disabled={!open} onChange={(e) => setF({ ...f, cost_parts: e.target.value })} /></Field>
            </div>
          </Card>
          <Card title="Photos avant / après et pièces"><Documents entityType="intervention" entityId={i.id} canEdit={can('interventions', 'update') && i.status !== 'clos'} kinds={['photo', 'pv', 'autre']} /></Card>
          <Card title="Historique"><div className="timeline">{r.data.history.map((h: any, k: number) => <div key={k} className="tl-item"><span className="tl-icon"><CalendarClock /></span><div><div className="tl-title">{h.summary}</div><div className="tl-meta">{dateTime(h.at)} · {h.user_label}</div></div></div>)}</div></Card>
        </div>
        <div className="stack-lg">
          <Card title="Ordre de travail"><Dl items={[
            ['Type', i.kind === 'preventive' ? 'Préventive' : 'Corrective'], ['Priorité', <Status kind="priority" code={i.priority} />], ['Criticité', <Status kind="criticality" code={i.criticality} />],
            ['Délai cible', <span style={late ? { color: 'var(--danger)' } : undefined}>{dateTime(i.target_date)}</span>], ['Ouvert le', dateTime(i.opened_at)], ['Pris en charge', dateTime(i.taken_at)], ['Résolu', dateTime(i.resolved_at)],
            ['Équipe', i.team], ['Matériel', i.equipment], ['Coût total', money((i.cost_labor ?? 0) + (i.cost_parts ?? 0))],
          ]} />
            {i.description && <p className="small secondary" style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{i.description}</p>}</Card>
          {!tech && can('interventions', 'update') && open && (
            <Card title="Affectation"><div className="stack">
              <Field label="Technicien"><Select value={i.assigned_to ?? ''} onChange={(e) => upd.run({ assigned_to: e.target.value || null, status: i.status === 'ouvert' && e.target.value ? 'planifie' : undefined })} placeholder="À planifier" options={users.filter((u) => ['technicien', 'operations'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
              <Field label="Priorité"><Select value={i.priority} onChange={(e) => upd.run({ priority: e.target.value })} options={['basse', 'normale', 'haute', 'urgente'].map((x) => ({ value: x, label: x }))} /></Field>
            </div></Card>
          )}
          {i.latitude && <a className="btn" href={`https://www.openstreetmap.org/?mlat=${i.latitude}&mlon=${i.longitude}#map=17/${i.latitude}/${i.longitude}`} target="_blank" rel="noopener">Itinéraire vers le support</a>}
          {i.escalation_level > 0 && <Badge tone="danger">Niveau d’escalade {i.escalation_level}</Badge>}
        </div>
      </div>
    </>
  );
}
