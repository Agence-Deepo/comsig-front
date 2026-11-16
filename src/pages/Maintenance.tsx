import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Wrench } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useAuth, useCan, useLookups, useUsers } from '../lib/auth';
import { dateTime, money, relative } from '../lib/format';
import { Badge, Button, Card, DataTable, Empty, Field, Input, Kpi, Modal, PageHeader, Segmented, Select, Status, Textarea } from '../components/ui';

export function InterventionForm({ open, onClose, preset }: { open: boolean; onClose: () => void; preset?: { support_id?: string; campaign_id?: string; organization_id?: string; source?: string } }) {
  const nav = useNavigate();
  const users = useUsers();
  const supports = useApi<any>(['supports-lite'], open && !preset?.support_id ? '/api/supports' : null);
  const [f, setF] = useState<any>({ title: '', description: '', source: preset?.source ?? 'support', kind: 'corrective', support_id: preset?.support_id ?? '', priority: 'normale', criticality: 'mineure', team: '', assigned_to: '', equipment: '' });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const save = useAction(() => api.post('/api/interventions', { ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' ? null : v])), description: f.description, campaign_id: preset?.campaign_id ?? null, organization_id: preset?.organization_id ?? null }),
    { success: (r: any) => `Ticket ${r.ref} ouvert`, invalidate: [['interventions'], ['support'], ['campaign']], onSuccess: (r: any) => { onClose(); nav(`/maintenance/${r.id}`); } });
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Nouvelle intervention" description="Le délai cible est calculé selon la priorité (paramétrable). Une intervention critique met le support en maintenance."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.title} onClick={() => save.run(undefined)}>Ouvrir le ticket</Button></>}>
      <div className="form-grid">
        <Field label="Intitulé" required error={save.fieldErrors.title} className="span-2"><Input value={f.title} onChange={set('title')} /></Field>
        {!preset?.support_id && <Field label="Support" error={save.fieldErrors.support_id} className="span-2"><Select value={f.support_id} onChange={set('support_id')} placeholder={preset?.campaign_id ? 'Aucun (incident de campagne)' : 'Choisir…'} options={(supports.data?.rows ?? []).map((s: any) => ({ value: s.id, label: `${s.code} — ${s.name}` }))} /></Field>}
        <Field label="Origine"><Select value={f.source} onChange={set('source')} options={[{ value: 'support', label: 'Constat sur support' }, { value: 'campagne', label: 'Campagne' }, { value: 'client', label: 'Signalement client' }, { value: 'preventive', label: 'Maintenance préventive' }, { value: 'controle', label: 'Contrôle terrain' }]} /></Field>
        <Field label="Type"><Select value={f.kind} onChange={set('kind')} options={[{ value: 'corrective', label: 'Corrective' }, { value: 'preventive', label: 'Préventive' }]} /></Field>
        <Field label="Priorité"><Select value={f.priority} onChange={set('priority')} options={[{ value: 'basse', label: 'Basse (10 j)' }, { value: 'normale', label: 'Normale (5 j)' }, { value: 'haute', label: 'Haute (48 h)' }, { value: 'urgente', label: 'Urgente (24 h)' }]} /></Field>
        <Field label="Criticité"><Select value={f.criticality} onChange={set('criticality')} options={[{ value: 'mineure', label: 'Mineure' }, { value: 'majeure', label: 'Majeure' }, { value: 'critique', label: 'Critique (support indisponible)' }]} /></Field>
        <Field label="Technicien assigné"><Select value={f.assigned_to} onChange={set('assigned_to')} placeholder="À planifier" options={users.filter((u) => ['technicien', 'operations'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
        <Field label="Équipe"><Input value={f.team} onChange={set('team')} /></Field>
        <Field label="Matériel requis" className="span-2"><Input value={f.equipment} onChange={set('equipment')} /></Field>
        <Field label="Description" className="span-2"><Textarea value={f.description} onChange={set('description')} /></Field>
      </div>
    </Modal>
  );
}

export default function Maintenance() {
  const nav = useNavigate();
  const can = useCan();
  const { label } = useLookups();
  const { me } = useAuth();
  const [sp, setSp] = useSearchParams();
  const view = sp.get('late') ? 'late' : sp.get('view') ?? 'open';
  const params = { open: view === 'open' ? 1 : null, late: view === 'late' ? 1 : null, status: view === 'closed' ? 'clos' : null };
  const r = useApi<any>(['interventions', params], `/api/interventions${qs(params)}`);
  const k = useApi<any>(['int-kpis'], '/api/interventions/kpis');
  const [create, setCreate] = useState(false);
  const tech = me?.role_code === 'technicien';
  return (
    <>
      <PageHeader title={tech ? 'Mes ordres de travail' : 'Maintenance et interventions'} subtitle={tech ? 'Interventions qui vous sont attribuées' : 'Tickets, ordres de travail, délais cibles et escalades'}
        actions={<>{can('interventions', 'export') && <ExcelButton url={`/api/interventions${qs({ ...params, format: 'xlsx' })}`} />}
          {can('interventions', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Nouvelle intervention</Button>}</>} />
      {k.data && !tech && (
        <div className="grid-4">
          <Kpi label="Interventions ouvertes" value={k.data.open} foot={<span>{k.data.late} en retard</span>} action={k.data.late > 0} onClick={() => setSp({ late: '1' })} />
          <Kpi label="Délai moyen de prise en charge" value={k.data.avg_take_hours ?? '—'} unit="h" foot={<span>30 derniers jours</span>} help={{ title: 'Prise en charge', formula: 'Moyenne (passage « en cours » − ouverture) des tickets ouverts sur la période.' }} />
          <Kpi label="Délai moyen de résolution" value={k.data.avg_resolution_hours ?? '—'} unit="h" foot={<span>{k.data.resolved_in_period} résolue(s) sur 30 j</span>} />
          <Kpi label="Respect des délais" value={k.data.sla_pct === null ? '—' : `${k.data.sla_pct} %`} progress={k.data.sla_pct} foot={<span>Coût moyen {money(k.data.avg_cost)}</span>} help={{ title: 'Respect des délais', formula: 'Interventions résolues avant leur délai cible / interventions résolues, sur 30 jours.' }} />
        </div>
      )}
      <Segmented label="Vue" value={view} onChange={(v) => setSp(v === 'late' ? { late: '1' } : { view: v })} options={[{ id: 'open', label: 'Ouvertes' }, { id: 'late', label: 'En retard' }, { id: 'closed', label: 'Closes' }, { id: 'all', label: 'Toutes' }]} />
      <Card flush>
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(i: any) => nav(`/maintenance/${i.id}`)} empty={<Empty icon={<Wrench />} title="Aucune intervention" />}
          columns={[
            { key: 't', label: 'Intervention', render: (i: any) => <><div className="cell-title">{i.title}</div><div className="cell-sub">{i.ref} · {i.support_code ?? i.campaign_ref ?? i.organization_name}{i.commune ? ` · ${label('commune', i.commune)}` : ''}</div></> },
            { key: 'p', label: 'Priorité', render: (i: any) => <div className="row-wrap"><Status kind="priority" code={i.priority} />{i.criticality !== 'mineure' && <Status kind="criticality" code={i.criticality} />}</div> },
            { key: 's', label: 'Statut', render: (i: any) => <div className="row-wrap"><Status kind="intervention" code={i.status} />{i.is_late && <Badge tone="danger">En retard{i.escalation_level > 1 ? ' · escaladé' : ''}</Badge>}</div> },
            { key: 'd', label: 'Délai cible', render: (i: any) => <><div className="small nowrap">{dateTime(i.target_date)}</div><div className="xsmall muted">{relative(i.target_date)}</div></> },
            { key: 'a', label: 'Assigné', render: (i: any) => <span className="small">{i.assigned_name ?? <span style={{ color: 'var(--warning)' }}>À planifier</span>}</span>, mobile: 'hide' },
          ]} />
      </Card>
      {create && <InterventionForm open onClose={() => setCreate(false)} />}
    </>
  );
}
