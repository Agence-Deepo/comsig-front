import { ExcelButton } from '../components/ExportButton';
import { PriorityBadge } from '../components/Priority';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ClipboardList, MessageSquare, Plus, Timer } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth, useCan } from '../lib/auth';
import { date, dateTime } from '../lib/format';
import { statusOf } from '../lib/labels';
import { Button, Card, DataTable, Dl, Empty, ErrorState, Field, Input, Kpi, LoadingBlock, Modal, PageHeader, Segmented, Select, Status, Textarea } from '../components/ui';
import { DeptChip, SPEC_FIELDS, WorkOrderForm, minutes, useDepartments } from '../components/work';

/** Ordres de travail : file du service exécutant (imprimerie, décoration, atelier, CNC, informatique…) et suivi des demandes émises. */
export default function WorkOrders() {
  const { me } = useAuth();
  const can = useCan();
  const nav = useNavigate();
  const deps = useDepartments();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('vue') ?? 'file';
  const service = sp.get('service') ?? (me?.cross_department ? '' : me?.department_code ?? '');
  const [creating, setCreating] = useState(false);
  const kinds = useApi<{ kinds: Record<string, Record<string, string>> }>(['wo-kinds'], '/api/workorders/kinds');
  const executes = !!kinds.data?.kinds[me?.department_code ?? ''];
  const url = tab === 'demandes' ? '/api/workorders?requests=1' : tab === 'moi' ? '/api/workorders?mine=1&open=1' : `/api/workorders?open=${sp.get('tous') ? '' : '1'}${service ? `&department=${service}` : ''}`;
  const r = useApi<{ rows: any[] }>(['workorders', url], url);
  const stats = useApi<any>(['wo-stats', service], tab === 'file' && service && (executes || me?.cross_department) ? `/api/workorders/stats?department=${service}` : null);
  return (
    <>
      <PageHeader title="Ordres de travail" subtitle="Demandes entre services : planification, exécution, contrôle qualité et livraison"
        actions={<><ExcelButton url={url.replace('/api/workorders', '/api/xlsx/workorders')} />{can('workorders', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>Nouvelle demande</Button>}</>} />
      <div className="row-wrap filter-row">
        <Segmented label="Vue" value={tab} onChange={(v) => setSp({ vue: v, ...(service ? { service } : {}) })} options={[
          ...(executes || me?.cross_department ? [{ id: 'file', label: 'File du service' }] : []), { id: 'moi', label: 'Qui me sont affectés' }, { id: 'demandes', label: 'Mes demandes' },
        ]} />
        {tab === 'file' && me?.cross_department && <Select aria-label="Service" value={service} onChange={(e) => setSp({ vue: 'file', service: e.target.value })} placeholder="Tous les services" options={deps.filter((d) => kinds.data?.kinds[d.code]).map((d) => ({ value: d.code, label: d.label }))} />}
        {tab === 'file' && <label className="checkbox small"><input type="checkbox" checked={!!sp.get('tous')} onChange={(e) => setSp({ vue: 'file', ...(service ? { service } : {}), ...(e.target.checked ? { tous: '1' } : {}) })} /> Inclure les ordres clôturés</label>}
      </div>
      {stats.data && (
        <div className="grid-4">
          <Kpi label="En cours" value={stats.data.kpis.open} foot={`${stats.data.kpis.blocked} bloqué(s)`} />
          <Kpi label="En retard" value={<span className={stats.data.kpis.late ? 'text-danger' : ''}>{stats.data.kpis.late}</span>} />
          <Kpi label="Terminés ce mois" value={stats.data.kpis.done_month} />
          <Kpi label="Respect des délais (90 j)" value={stats.data.kpis.on_time_pct ?? '—'} unit={stats.data.kpis.on_time_pct != null ? '%' : undefined} foot={stats.data.kpis.avg_lead_days != null ? `Délai moyen ${stats.data.kpis.avg_lead_days} j` : 'Pas encore d’historique'} />
        </div>
      )}
      <Card flush>
        {r.error ? <ErrorState error={r.error} onRetry={() => r.refetch()} /> : (
          <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(w: any) => nav(`/ordres-travail/${w.id}`)} empty={<Empty icon={<ClipboardList />} title="Aucun ordre de travail" />}
            columns={[
              { key: 't', label: 'Ordre', render: (w: any) => <><div className="cell-title">{w.title}</div><div className="cell-sub">{w.ref} · {kinds.data?.kinds[w.department_code]?.[w.kind] ?? w.kind}{w.quantity ? ` · ${w.quantity} ${w.unit}` : ''}</div></> },
              { key: 'd', label: 'Service', render: (w: any) => <DeptChip label={w.department_label} color={w.department_color} />, mobile: 'hide' },
              { key: 'r', label: 'Demandeur', render: (w: any) => <span className="small">{w.requested_by_name}{w.requester_department_label && w.requester_department_label !== w.department_label ? ` · ${w.requester_department_label}` : ''}</span>, mobile: 'hide' },
              { key: 'a', label: 'Affecté à', render: (w: any) => <span className="small">{w.assignee_name ?? '—'}</span>, mobile: 'hide' },
              { key: 'p', label: 'Priorité', render: (w: any) => <PriorityBadge level={w.priority_level} legacy={w.priority} /> },
              { key: 'e', label: 'Échéance', render: (w: any) => <span className={`small${w.is_late ? ' text-danger strong' : ''}`}>{date(w.due_date)}{w.is_late ? ' · retard' : ''}</span> },
              { key: 's', label: 'Statut', render: (w: any) => <Status kind="workorder" code={w.status} /> },
            ]} />
        )}
      </Card>
      <WorkOrderForm open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

const NEXT: Record<string, string[]> = {
  demande: ['planifie', 'en_cours', 'bloque', 'annule'], planifie: ['en_cours', 'bloque', 'annule'], en_cours: ['en_controle', 'termine', 'bloque', 'annule'],
  bloque: ['planifie', 'en_cours', 'annule'], en_controle: ['termine', 'en_cours'], termine: ['livre'], livre: [], annule: [],
};

export function WorkOrderDetail() {
  const { id } = useParams();
  const { me } = useAuth();
  const r = useApi<any>(['workorder', id], `/api/workorders/${id}`);
  const kinds = useApi<{ kinds: Record<string, Record<string, string>> }>(['wo-kinds'], '/api/workorders/kinds');
  const members = useApi<{ rows: any[] }>(['assignable'], '/api/assignable-users');
  const [move, setMove] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [comment, setComment] = useState('');
  const [time, setTime] = useState<any>(null);
  const inv = [['workorder', id], ['workorders'], ['workspace']];
  const status = useAction((b: any) => api.post(`/api/workorders/${id}/status`, b), { success: 'Statut mis à jour', invalidate: inv, onSuccess: () => setMove(null) });
  const assign = useAction((b: any) => api.put(`/api/workorders/${id}`, b), { success: 'Ordre mis à jour', invalidate: inv });
  const post = useAction((b: any) => api.post(`/api/workorders/${id}/comment`, b), { invalidate: inv, onSuccess: () => setComment('') });
  const log = useAction((b: any) => api.post(`/api/workorders/${id}/time`, b), { success: 'Temps enregistré', invalidate: inv, onSuccess: () => setTime(null) });
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading || !r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const w = r.data;
  const nexts = (NEXT[w.status] ?? []).filter((s) => w.can_execute || (s === 'annule' && w.requested_by === me?.id && w.status === 'demande'));
  const specLabels = Object.fromEntries(SPEC_FIELDS[w.department_code] ?? []);
  const team = (members.data?.rows ?? []).filter((u: any) => u.department_label === w.department_label);
  return (
    <>
      <PageHeader eyebrow={<DeptChip label={w.department_label} color={w.department_color} />} title={w.title} subtitle={`${w.ref} · ${kinds.data?.kinds[w.department_code]?.[w.kind] ?? w.kind}`}
        crumbs={[{ label: 'Ordres de travail', to: '/ordres-travail' }, { label: w.ref }]}
        actions={<><Status kind="workorder" code={w.status} />{nexts.map((s) => <Button key={s} variant={s === 'annule' || s === 'bloque' ? 'default' : 'primary'} size="sm" onClick={() => { setForm({}); setMove(s); }}>{statusOf('workorder', s)[0]}</Button>)}</>} />
      <div className="split">
        <div className="stack-lg">
          <Card title="Demande">
            <Dl items={[
              ['Demandeur', `${w.requested_by_name ?? '—'}${w.requester_department_label ? ` (${w.requester_department_label})` : ''}`],
              ['Priorité', <PriorityBadge key="p" level={w.priority_level} legacy={w.priority} />],
              ['Souhaité pour le', <span key="d" className={w.is_late ? 'text-danger strong' : ''}>{date(w.due_date)}{w.is_late ? ' — en retard' : ''}</span>],
              ['Quantité', w.quantity ? `${w.quantity} ${w.unit}` : '—'],
              ...Object.entries(w.specs ?? {}).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [specLabels[k] ?? k, String(v)] as [string, string]),
              ...(w.quote_number ? [['Devis', w.quote_number] as [string, string]] : []), ...(w.campaign_ref ? [['Campagne', w.campaign_ref] as [string, string]] : []),
              ...(w.project_ref ? [['Projet', <Link key="pr" to={`/projets/${w.project_id}`}>{w.project_ref}</Link>] as [string, any]] : []),
            ]} />
            {w.description && <p className="pre-wrap small">{w.description}</p>}
            {w.blocking_reason && w.status === 'bloque' && <div className="alert alert-danger"><strong>Blocage :</strong> {w.blocking_reason}</div>}
            {w.quality_note && <div className="alert alert-success"><strong>Contrôle qualité :</strong> {w.quality_note}</div>}
          </Card>
          <Card title="Historique et échanges">
            <ol className="timeline">
              {w.events.map((e: any) => (
                <li key={e.id} className="tl-item"><span className="tl-icon">{e.kind === 'commentaire' ? <MessageSquare /> : <ClipboardList />}</span>
                  <div className="tl-body"><div className="tl-title">{e.kind === 'statut' ? `${statusOf('workorder', e.from_status)[0]} → ${statusOf('workorder', e.to_status)[0]}` : e.kind === 'creation' ? 'Création' : e.kind === 'affectation' ? 'Affectation' : 'Commentaire'}</div>
                    {e.comment && <div className="small">{e.comment}</div>}<div className="tl-meta">{e.user_name} · {dateTime(e.created_at)}</div></div></li>
              ))}
            </ol>
            <div className="row"><Input aria-label="Commentaire" placeholder="Écrire un commentaire…" value={comment} onChange={(e) => setComment(e.target.value)} /><Button disabled={!comment.trim()} loading={post.isPending} onClick={() => post.run({ comment })}>Envoyer</Button></div>
          </Card>
        </div>
        <div className="stack-lg">
          <Card title="Exécution">
            <Dl items={[['Affecté à', w.assignee_name ?? 'Non affecté'], ['Machine / poste', w.machine || '—'], ['Début prévu', date(w.planned_start)], ['Démarré', dateTime(w.started_at)], ['Terminé', dateTime(w.completed_at)],
              ['Temps passé', `${minutes(w.spent_minutes)}${w.estimated_minutes ? ` / ${minutes(w.estimated_minutes)} estimées` : ''}`]]} />
            {w.can_execute && !['termine', 'livre', 'annule'].includes(w.status) && (
              <div className="form-grid">
                <Field label="Affecter à"><Select value={w.assignee_id ?? ''} onChange={(e) => assign.run({ assignee_id: e.target.value || null })} placeholder="—" options={team.map((u: any) => ({ value: u.id, label: u.full_name }))} /></Field>
                <Field label="Début prévu"><Input type="date" defaultValue={w.planned_start ?? ''} onBlur={(e) => e.target.value !== (w.planned_start ?? '') && assign.run({ planned_start: e.target.value || null })} /></Field>
                <Field label="Machine / poste" className="span-2"><Input defaultValue={w.machine} onBlur={(e) => e.target.value !== w.machine && assign.run({ machine: e.target.value })} /></Field>
              </div>
            )}
            {w.can_execute && <Button icon={<Timer />} onClick={() => setTime({ minutes: 60, note: '' })}>Saisir du temps</Button>}
          </Card>
          {w.time.length > 0 && <Card title="Temps saisi" flush>
            <DataTable compact rows={w.time} columns={[{ key: 'd', label: 'Date', render: (t: any) => date(t.work_date) }, { key: 'u', label: 'Personne', render: (t: any) => t.user_name }, { key: 'm', label: 'Durée', num: true, render: (t: any) => minutes(t.minutes) }]} />
          </Card>}
        </div>
      </div>
      <Modal open={!!move} onClose={() => setMove(null)} title={`Passer à « ${move ? statusOf('workorder', move)[0] : ''} »`}
        footer={<><Button onClick={() => setMove(null)}>Annuler</Button><Button variant="primary" loading={status.isPending} onClick={() => status.run({ status: move, comment: form.comment ?? '', blocking_reason: form.blocking_reason || null, quality_note: form.quality_note || null })}>Confirmer</Button></>}>
        <div className="stack">
          {move === 'bloque' && <Field label="Cause du blocage" required error={status.fieldErrors.blocking_reason}><Textarea value={form.blocking_reason ?? ''} onChange={(e) => setForm({ ...form, blocking_reason: e.target.value })} /></Field>}
          {move === 'termine' && w.status === 'en_controle' && <Field label="Résultat du contrôle qualité" required hint="Réservé au responsable du service" error={status.fieldErrors.quality_note}><Textarea value={form.quality_note ?? ''} onChange={(e) => setForm({ ...form, quality_note: e.target.value })} /></Field>}
          <Field label={move === 'annule' ? 'Motif d’annulation' : 'Commentaire'} required={move === 'annule'} error={status.fieldErrors.comment}><Textarea value={form.comment ?? ''} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></Field>
        </div>
      </Modal>
      <Modal open={!!time} onClose={() => setTime(null)} title="Saisir du temps" footer={<><Button onClick={() => setTime(null)}>Annuler</Button><Button variant="primary" loading={log.isPending} onClick={() => log.run({ minutes: Number(time.minutes), note: time.note })}>Enregistrer</Button></>}>
        {time && <div className="form-grid"><Field label="Durée (minutes)" required error={log.fieldErrors.minutes}><Input type="number" min={1} max={1440} value={time.minutes} onChange={(e) => setTime({ ...time, minutes: e.target.value })} /></Field><Field label="Note"><Input value={time.note} onChange={(e) => setTime({ ...time, note: e.target.value })} /></Field></div>}
      </Modal>
    </>
  );
}

