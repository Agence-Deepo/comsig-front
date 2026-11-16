import { ExcelButton } from '../components/ExportButton';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Landmark, MapPinned, Plus } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan, useLookups } from '../lib/auth';
import { addDays, date, money, today } from '../lib/format';
import { COLLECTIVITY_KIND, DEPLOYMENT_KIND, INTERACTION_KIND, statusOf } from '../lib/labels';
import { Badge, Button, Card, DataTable, Dl, Empty, ErrorState, Field, Input, Kpi, LoadingBlock, Modal, PageHeader, Segmented, Select, Status, Textarea } from '../components/ui';
import { useAssignable } from '../components/work';

function CollectivityForm({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: any }) {
  const { lookups } = useLookups();
  const [f, setF] = useState<any>(null);
  useEffect(() => { setF(open ? (initial ? { ...initial } : { name: '', kind: 'commune', commune: '', contact_name: '', contact_role: '', phone: '', email: '', address: '', relationship: 'bonne', notes: '' }) : null); }, [open]);
  const save = useAction((b: any) => (initial?.id ? api.put(`/api/collectivities/${initial.id}`, b) : api.post('/api/collectivities', b)), { success: 'Collectivité enregistrée', invalidate: [['collectivities'], ['collectivity']], onSuccess: onClose });
  return (
    <Modal open={open && !!f} onClose={onClose} size="lg" title={initial?.id ? initial.name : 'Nouvelle collectivité'}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f?.name?.trim()} onClick={() => { const { id: _i, interactions: _a, royalties: _b, supports: _c, deployments: _d, projects: _e, owner_name: _o, created_at: _x, updated_at: _y, deleted_at: _z, ...b } = f; save.run({ ...b, owner_id: b.owner_id || null }); }}>Enregistrer</Button></>}>
      {f && <div className="form-grid">
        <Field label="Nom" required className="span-2" error={save.fieldErrors.name}><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Nature"><Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} options={Object.entries(COLLECTIVITY_KIND).map(([value, label]) => ({ value, label }))} /></Field>
        <Field label="Commune" hint="Relie les supports et redevances de la commune"><Select value={f.commune} onChange={(e) => setF({ ...f, commune: e.target.value })} placeholder="—" options={(lookups.commune ?? []).map((c) => ({ value: c.code, label: c.label }))} /></Field>
        <Field label="Interlocuteur"><Input value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} /></Field>
        <Field label="Fonction"><Input value={f.contact_role} onChange={(e) => setF({ ...f, contact_role: e.target.value })} /></Field>
        <Field label="Téléphone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="E-mail"><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Qualité de la relation"><Select value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value })} options={['excellente', 'bonne', 'a_ameliorer', 'tendue'].map((c) => ({ value: c, label: statusOf('relationship', c)[0] }))} /></Field>
        <Field label="Adresse"><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
        <Field label="Notes" className="span-2"><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      </div>}
    </Modal>
  );
}

/** Relations avec les collectivités : interlocuteurs, échanges, autorisations, redevances et supports de la commune. */
export function Collectivities() {
  const can = useCan();
  const nav = useNavigate();
  const { label } = useLookups();
  const r = useApi<{ rows: any[] }>(['collectivities'], '/api/collectivities');
  const [creating, setCreating] = useState(false);
  const rows = r.data?.rows ?? [];
  return (
    <>
      <PageHeader title="Collectivités" subtitle="Régie : relations avec les communes, le district et les administrations — autorisations, redevances, échanges"
        actions={<><ExcelButton url="/api/xlsx/collectivities" />{can('collectivities', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>Nouvelle collectivité</Button>}</>} />
      <div className="grid-4">
        <Kpi label="Collectivités suivies" value={rows.length} />
        <Kpi label="Relations à améliorer" value={rows.filter((c) => ['a_ameliorer', 'tendue'].includes(c.relationship)).length} />
        <Kpi label="Redevances restant dues" value={money(rows.reduce((s, c) => s + (c.royalties_due ?? 0), 0))} />
        <Kpi label="Actions à venir" value={rows.filter((c) => c.next_action_date).length} />
      </div>
      <Card flush>
        {r.error ? <ErrorState error={r.error} onRetry={() => r.refetch()} /> : (
          <DataTable rows={rows} loading={r.isLoading} onRowClick={(c: any) => nav(`/regie/collectivites/${c.id}`)} empty={<Empty icon={<Landmark />} title="Aucune collectivité" />}
            columns={[
              { key: 'n', label: 'Collectivité', render: (c: any) => <><div className="cell-title">{c.name}</div><div className="cell-sub">{COLLECTIVITY_KIND[c.kind]}{c.commune ? ` · ${label('commune', c.commune)}` : ''}{c.contact_name ? ` · ${c.contact_name}` : ''}</div></> },
              { key: 'r', label: 'Relation', render: (c: any) => <Status kind="relationship" code={c.relationship} /> },
              { key: 's', label: 'Supports', num: true, render: (c: any) => c.supports_count, mobile: 'hide' },
              { key: 'd', label: 'Redevances dues', num: true, render: (c: any) => money(c.royalties_due) },
              { key: 'l', label: 'Dernier échange', render: (c: any) => <span className="small">{date(c.last_interaction)}</span>, mobile: 'hide' },
              { key: 'a', label: 'Prochaine action', render: (c: any) => <span className="small">{date(c.next_action_date)}</span> },
            ]} />
        )}
      </Card>
      <CollectivityForm open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

export function CollectivityDetail() {
  const { id } = useParams();
  const can = useCan();
  const r = useApi<any>(['collectivity', id], `/api/collectivities/${id}`);
  const [editing, setEditing] = useState(false);
  const [it, setIt] = useState<any>(null);
  const add = useAction((b: any) => api.post(`/api/collectivities/${id}/interactions`, b), { success: 'Échange enregistré', invalidate: [['collectivity', id], ['collectivities'], ['tasks']], onSuccess: () => setIt(null) });
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading || !r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const c = r.data;
  return (
    <>
      <PageHeader title={c.name} subtitle={`${COLLECTIVITY_KIND[c.kind]} · suivi par ${c.owner_name ?? '—'}`} crumbs={[{ label: 'Collectivités', to: '/regie/collectivites' }, { label: c.name }]}
        actions={<><Status kind="relationship" code={c.relationship} />{can('collectivities', 'update') && <><Button onClick={() => setEditing(true)}>Modifier</Button><Button variant="primary" icon={<Plus />} onClick={() => setIt({ occurred_on: today(), kind: 'reunion', subject: '', summary: '', next_action: '', next_action_date: '' })}>Échange</Button></>}</>} />
      <div className="split">
        <div className="stack-lg">
          <Card title="Échanges" sub="La prochaine action devient une tâche datée">
            {c.interactions.length ? <ol className="timeline">{c.interactions.map((i: any) => (
              <li key={i.id} className="tl-item"><span className="tl-icon"><Landmark /></span><div className="tl-body">
                <div className="tl-title">{INTERACTION_KIND[i.kind]} — {i.subject}</div>{i.summary && <div className="small">{i.summary}</div>}
                {i.next_action && <div className="small"><strong>Suite :</strong> {i.next_action}{i.next_action_date ? ` (le ${date(i.next_action_date)})` : ''}</div>}
                <div className="tl-meta">{date(i.occurred_on)} · {i.created_by_name}</div></div></li>))}</ol> : <Empty title="Aucun échange consigné" />}
          </Card>
          <Card title="Redevances" flush>
            <DataTable compact rows={c.royalties} empty={<Empty title="Aucune redevance" />}
              columns={[{ key: 'p', label: 'Période', render: (x: any) => `${date(x.period_start)} → ${date(x.period_end)}` }, { key: 'm', label: 'Montant', num: true, render: (x: any) => money(x.expected_amount) },
                { key: 'r', label: 'Reste dû', num: true, render: (x: any) => money(x.expected_amount - x.paid_amount) }, { key: 'e', label: 'Échéance', render: (x: any) => date(x.due_date) }, { key: 's', label: 'Statut', render: (x: any) => <Status kind="royalty" code={x.status} /> }]} />
          </Card>
        </div>
        <div className="stack-lg">
          <Card title="Coordonnées"><Dl items={[['Interlocuteur', c.contact_name || '—'], ['Fonction', c.contact_role || '—'], ['Téléphone', c.phone || '—'], ['E-mail', c.email || '—'], ['Adresse', c.address || '—'], ['Notes', c.notes || '—']]} /></Card>
          <Card title={`Supports de la commune (${c.supports.length})`} flush>
            <DataTable compact rows={c.supports} empty={<Empty title="Aucun support" />} columns={[{ key: 'c', label: 'Support', render: (s: any) => <><div className="cell-title">{s.code}</div><div className="cell-sub">{s.name}</div></> }, { key: 's', label: 'État', render: (s: any) => <Status kind="support" code={s.status} /> }]} />
          </Card>
          <Card title="Déploiements" flush>
            <DataTable compact rows={c.deployments} empty={<Empty title="Aucun déploiement" />} columns={[{ key: 't', label: 'Déploiement', render: (d: any) => <><div className="cell-title">{d.title}</div><div className="cell-sub">{d.ref}</div></> }, { key: 'd', label: 'Date', render: (d: any) => date(d.planned_date) }, { key: 's', label: 'Statut', render: (d: any) => <Status kind="deployment" code={d.status} /> }]} />
          </Card>
        </div>
      </div>
      <CollectivityForm open={editing} onClose={() => setEditing(false)} initial={c} />
      <Modal open={!!it} onClose={() => setIt(null)} size="lg" title="Consigner un échange" footer={<><Button onClick={() => setIt(null)}>Annuler</Button><Button variant="primary" loading={add.isPending} disabled={!it?.subject?.trim()} onClick={() => add.run({ ...it, next_action_date: it.next_action_date || null })}>Enregistrer</Button></>}>
        {it && <div className="form-grid">
          <Field label="Date"><Input type="date" value={it.occurred_on} onChange={(e) => setIt({ ...it, occurred_on: e.target.value })} /></Field>
          <Field label="Nature"><Select value={it.kind} onChange={(e) => setIt({ ...it, kind: e.target.value })} options={Object.entries(INTERACTION_KIND).map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="Objet" required className="span-2" error={add.fieldErrors.subject}><Input value={it.subject} onChange={(e) => setIt({ ...it, subject: e.target.value })} /></Field>
          <Field label="Compte rendu" className="span-2"><Textarea value={it.summary} onChange={(e) => setIt({ ...it, summary: e.target.value })} /></Field>
          <Field label="Prochaine action" error={add.fieldErrors.next_action}><Input value={it.next_action} onChange={(e) => setIt({ ...it, next_action: e.target.value })} /></Field>
          <Field label="Pour le"><Input type="date" value={it.next_action_date} onChange={(e) => setIt({ ...it, next_action_date: e.target.value })} /></Field>
        </div>}
      </Modal>
    </>
  );
}

/** Planification des déploiements de supports (installation, remplacement, rénovation, dépose). */
export function Deployments() {
  const can = useCan();
  const { lookups } = useLookups();
  const users = useAssignable();
  const [f, setF] = useState('a_venir');
  const r = useApi<{ rows: any[] }>(['deployments', f], `/api/deployments${f === 'a_venir' ? `?from=${addDays(today(), -60)}` : ''}`);
  const colls = useApi<any>(['collectivities'], '/api/collectivities', { enabled: can('collectivities') });
  const projects = useApi<any>(['projects'], '/api/projects');
  const [edit, setEdit] = useState<any>(null);
  const save = useAction((b: any) => (edit?.id ? api.put(`/api/deployments/${edit.id}`, b) : api.post('/api/deployments', b)), { success: 'Déploiement enregistré', invalidate: [['deployments'], ['calendar']], onSuccess: () => setEdit(null) });
  const rows = (r.data?.rows ?? []).filter((d) => f !== 'a_venir' || !['realise', 'annule'].includes(d.status));
  const submit = () => save.run({ title: edit.title, kind: edit.kind, project_id: edit.project_id || null, support_id: edit.support_id || null, collectivity_id: edit.collectivity_id || null, commune: edit.commune ?? '', address: edit.address ?? '', latitude: edit.latitude ?? null, longitude: edit.longitude ?? null, planned_date: edit.planned_date, status: edit.status, permit_ref: edit.permit_ref ?? '', assignee_id: edit.assignee_id || null, cost_estimate: edit.cost_estimate === '' || edit.cost_estimate == null ? null : Number(edit.cost_estimate), notes: edit.notes ?? '' });
  return (
    <>
      <PageHeader title="Déploiements de supports" subtitle="Planning des installations, remplacements, rénovations et déposes — autorisations exigées sur le domaine public"
        actions={<><ExcelButton url="/api/xlsx/deployments" />{can('projects', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setEdit({ title: '', kind: 'installation', planned_date: addDays(today(), 14), status: 'planifie', permit_ref: '', commune: '', address: '', notes: '' })}>Planifier</Button>}</>} />
      <Segmented label="Filtre" value={f} onChange={setF} options={[{ id: 'a_venir', label: 'En cours et à venir' }, { id: 'tous', label: 'Tous' }]} />
      <Card flush>
        <DataTable rows={rows} loading={r.isLoading} onRowClick={can('projects', 'update') ? (d: any) => setEdit({ ...d }) : undefined} empty={<Empty icon={<MapPinned />} title="Aucun déploiement planifié" />}
          columns={[
            { key: 't', label: 'Déploiement', render: (d: any) => <><div className="cell-title">{d.title}</div><div className="cell-sub">{d.ref} · {DEPLOYMENT_KIND[d.kind]}{d.project_ref ? ` · ${d.project_ref}` : ''}</div></> },
            { key: 'l', label: 'Lieu', render: (d: any) => <span className="small">{d.collectivity_name ?? d.commune}{d.address ? ` · ${d.address}` : ''}</span>, mobile: 'hide' },
            { key: 'p', label: 'Autorisation', render: (d: any) => d.permit_ref ? <span className="small">{d.permit_ref}</span> : <Badge tone="warning">À obtenir</Badge>, mobile: 'hide' },
            { key: 'a', label: 'Équipe', render: (d: any) => <span className="small">{d.assignee_name ?? '—'}</span>, mobile: 'hide' },
            { key: 'd', label: 'Date', render: (d: any) => <span className={`small${d.is_late ? ' text-danger strong' : ''}`}>{date(d.planned_date)}</span> },
            { key: 's', label: 'Statut', render: (d: any) => <Status kind="deployment" code={d.status} /> },
          ]} />
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} size="lg" title={edit?.id ? `Déploiement ${edit.ref}` : 'Planifier un déploiement'}
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!edit?.title?.trim()} onClick={submit}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Intitulé" required className="span-2" error={save.fieldErrors.title}><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
          <Field label="Nature"><Select value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value })} options={Object.entries(DEPLOYMENT_KIND).map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="Date prévue" required><Input type="date" value={edit.planned_date} onChange={(e) => setEdit({ ...edit, planned_date: e.target.value })} /></Field>
          <Field label="Statut"><Select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} options={['planifie', 'autorisation', 'pret', 'en_cours', 'realise', 'annule'].map((c) => ({ value: c, label: statusOf('deployment', c)[0] }))} /></Field>
          <Field label="Réf. de l’autorisation" hint="Obligatoire pour lancer un déploiement lié à une collectivité"><Input value={edit.permit_ref} onChange={(e) => setEdit({ ...edit, permit_ref: e.target.value })} /></Field>
          {colls.data && <Field label="Collectivité"><Select value={edit.collectivity_id ?? ''} onChange={(e) => setEdit({ ...edit, collectivity_id: e.target.value })} placeholder="—" options={colls.data.rows.map((c: any) => ({ value: c.id, label: c.name }))} /></Field>}
          <Field label="Projet"><Select value={edit.project_id ?? ''} onChange={(e) => setEdit({ ...edit, project_id: e.target.value })} placeholder="—" options={(projects.data?.rows ?? []).map((p: any) => ({ value: p.id, label: `${p.ref} — ${p.name}` }))} /></Field>
          <Field label="Commune"><Select value={edit.commune ?? ''} onChange={(e) => setEdit({ ...edit, commune: e.target.value })} placeholder="—" options={(lookups.commune ?? []).map((c) => ({ value: c.code, label: c.label }))} /></Field>
          <Field label="Équipe / responsable"><Select value={edit.assignee_id ?? ''} onChange={(e) => setEdit({ ...edit, assignee_id: e.target.value })} placeholder="—" options={users.map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
          <Field label="Adresse" className="span-2"><Input value={edit.address ?? ''} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /></Field>
          <Field label="Coût estimé (FCFA)"><Input type="number" min={0} value={edit.cost_estimate ?? ''} onChange={(e) => setEdit({ ...edit, cost_estimate: e.target.value })} /></Field>
          <Field label="Notes" className="span-2"><Textarea value={edit.notes ?? ''} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></Field>
        </div>}
      </Modal>
    </>
  );
}
