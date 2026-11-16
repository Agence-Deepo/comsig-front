import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareWarning, Plus } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan, useLookups, useUsers } from '../lib/auth';
import { addDays, date, today } from '../lib/format';
import { Badge, Button, Card, DataTable, Empty, Field, Input, Modal, PageHeader, Segmented, Select, Status, Textarea } from '../components/ui';

/** Réclamations et service client (§5.12) : responsable, délai, résolution obligatoire. */
export default function Complaints() {
  const can = useCan();
  const users = useUsers();
  const { lookups, label } = useLookups();
  const [open, setOpen] = useState('1');
  const r = useApi<any>(['complaints', open], `/api/complaints${open ? '?open=1' : ''}`);
  const [edit, setEdit] = useState<any>(null);
  const [orgQ, setOrgQ] = useState('');
  const orgs = useApi<any>(['org-pick', orgQ], edit && !edit.id ? `/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}` : null);
  const save = useAction((b: any) => (edit?.id ? api.put(`/api/complaints/${edit.id}`, b) : api.post('/api/complaints', b)), { success: 'Réclamation enregistrée', invalidate: [['complaints']], onSuccess: () => setEdit(null) });
  const submit = () => save.run({ organization_id: edit.organization_id, campaign_id: edit.campaign_id || null, subject: edit.subject, description: edit.description ?? '', category: edit.category, severity: edit.severity, owner_id: edit.owner_id || null, due_date: edit.due_date, status: edit.status, resolution: edit.resolution || null });
  return (
    <>
      <PageHeader title="Réclamations" subtitle="Demandes et réclamations clients : responsable, délai et résolution"
        actions={can('complaints', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setEdit({ organization_id: '', subject: '', description: '', category: 'autre', severity: 'normale', owner_id: '', due_date: addDays(today(), 5), status: 'ouverte' })}>Nouvelle réclamation</Button>} />
      <Segmented label="Filtre" value={open} onChange={setOpen} options={[{ id: '1', label: 'Ouvertes' }, { id: '', label: 'Toutes' }]} />
      <Card flush>
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={can('complaints', 'update') ? (x: any) => setEdit({ ...x }) : undefined} empty={<Empty icon={<MessageSquareWarning />} title="Aucune réclamation" />}
          columns={[
            { key: 's', label: 'Réclamation', render: (x: any) => <><div className="cell-title">{x.subject}</div><div className="cell-sub">{x.ref} · <Link to={`/organisations/${x.organization_id}`} onClick={(e) => e.stopPropagation()}>{x.organization_name}</Link>{x.campaign_ref ? ` · ${x.campaign_ref}` : ''}</div></> },
            { key: 'c', label: 'Catégorie', render: (x: any) => <span className="small">{label('complaint_category', x.category)}</span>, mobile: 'hide' },
            { key: 'g', label: 'Gravité', render: (x: any) => <Badge tone={x.severity === 'haute' ? 'danger' : x.severity === 'normale' ? 'warning' : 'neutral'}>{x.severity}</Badge> },
            { key: 'd', label: 'Échéance', render: (x: any) => <span className="small" style={x.is_late ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{date(x.due_date)}{x.is_late ? ' · en retard' : ''}</span> },
            { key: 'st', label: 'Statut', render: (x: any) => <Status kind="complaint" code={x.status} /> },
            { key: 'o', label: 'Responsable', render: (x: any) => <span className="small">{x.owner_name}</span>, mobile: 'hide' },
          ]} />
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} size="lg" title={edit?.id ? `Réclamation ${edit.ref}` : 'Nouvelle réclamation'}
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!edit?.subject || !edit?.organization_id} onClick={submit}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          {!edit.id && <Field label="Client" required className="span-2"><div className="row"><Input placeholder="Rechercher…" value={orgQ} onChange={(e) => setOrgQ(e.target.value)} aria-label="Rechercher" style={{ maxWidth: 200 }} /><Select value={edit.organization_id} onChange={(e) => setEdit({ ...edit, organization_id: e.target.value })} placeholder="Choisir…" options={(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name }))} /></div></Field>}
          <Field label="Objet" required className="span-2" error={save.fieldErrors.subject}><Input value={edit.subject} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} /></Field>
          <Field label="Catégorie"><Select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} options={(lookups.complaint_category ?? []).map((x) => ({ value: x.code, label: x.label }))} /></Field>
          <Field label="Gravité"><Select value={edit.severity} onChange={(e) => setEdit({ ...edit, severity: e.target.value })} options={[{ value: 'basse', label: 'Basse' }, { value: 'normale', label: 'Normale' }, { value: 'haute', label: 'Haute' }]} /></Field>
          <Field label="Responsable"><Select value={edit.owner_id ?? ''} onChange={(e) => setEdit({ ...edit, owner_id: e.target.value })} placeholder="Moi" options={users.map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
          <Field label="Échéance de traitement"><Input type="date" value={edit.due_date} onChange={(e) => setEdit({ ...edit, due_date: e.target.value })} /></Field>
          <Field label="Description" className="span-2"><Textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
          {edit.id && <Field label="Statut"><Select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} options={[{ value: 'ouverte', label: 'Ouverte' }, { value: 'en_cours', label: 'En cours' }, { value: 'resolue', label: 'Résolue' }, { value: 'close', label: 'Close' }]} /></Field>}
          {edit.id && <Field label="Résolution" required={['resolue', 'close'].includes(edit.status)} className="span-2" error={save.fieldErrors.resolution}><Textarea value={edit.resolution ?? ''} onChange={(e) => setEdit({ ...edit, resolution: e.target.value })} /></Field>}
        </div>}
      </Modal>
    </>
  );
}
