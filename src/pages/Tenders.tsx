import { useState } from 'react';
import { Gavel, Plus } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan, useUsers } from '../lib/auth';
import { date, money, relative } from '../lib/format';
import { Badge, Button, Card, DataTable, Empty, Field, Input, Modal, MoneyInput, PageHeader, Select, Status, Textarea } from '../components/ui';

const EMPTY = { ref: '', title: '', organization_id: '', source: '', deadline: '', criteria: '', required_documents: '', owner_id: '', status: 'veille', decision_reason: '', estimated_value: null as number | null };

/** Registre des appels d'offres et marchés (§5.6). */
export default function Tenders() {
  const can = useCan();
  const users = useUsers();
  const r = useApi<any>(['tenders'], '/api/tenders');
  const [edit, setEdit] = useState<any>(null);
  const [orgQ, setOrgQ] = useState('');
  const orgs = useApi<any>(['org-pick', orgQ], edit ? `/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}` : null);
  const save = useAction((b: any) => (edit?.id ? api.put(`/api/tenders/${edit.id}`, b) : api.post('/api/tenders', b)), { success: 'Appel d’offres enregistré', invalidate: [['tenders']], onSuccess: () => setEdit(null) });
  const set = (k: string) => (e: any) => setEdit({ ...edit, [k]: e?.target ? e.target.value : e });
  const submit = () => {
    const { id, organization_name, owner_name, is_late, created_at, updated_at, deleted_at, ...b } = edit;
    void id; void organization_name; void owner_name; void is_late; void created_at; void updated_at; void deleted_at;
    save.run(Object.fromEntries(Object.entries({ ...b, deadline: b.deadline ? new Date(b.deadline).toISOString() : '' }).map(([k, v]) => [k, v === '' ? null : v])));
  };
  return (
    <>
      <PageHeader title="Appels d’offres et marchés" subtitle="Veille, préparation des dossiers, pièces à produire et décisions"
        actions={can('contracts', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setEdit({ ...EMPTY })}>Nouvel appel d’offres</Button>} />
      <Card flush>
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={can('contracts', 'update') ? (t: any) => setEdit({ ...t, deadline: t.deadline?.slice(0, 16) }) : undefined}
          empty={<Empty icon={<Gavel />} title="Aucun appel d’offres suivi" />}
          columns={[
            { key: 't', label: 'Appel d’offres', render: (t: any) => <><div className="cell-title">{t.title}</div><div className="cell-sub">{t.ref}{t.organization_name ? ` · ${t.organization_name}` : ''}</div></> },
            { key: 'd', label: 'Date limite', render: (t: any) => <><div className="small">{date(t.deadline)}</div>{t.is_late ? <Badge tone="danger">Dépassée</Badge> : <span className="xsmall muted">{relative(t.deadline)}</span>}</> },
            { key: 's', label: 'Statut', render: (t: any) => <Status kind="tender" code={t.status} /> },
            { key: 'v', label: 'Valeur estimée', num: true, render: (t: any) => money(t.estimated_value), mobile: 'hide' },
            { key: 'o', label: 'Responsable', render: (t: any) => <span className="small">{t.owner_name}</span>, mobile: 'hide' },
          ]} />
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} size="lg" title={edit?.id ? 'Modifier l’appel d’offres' : 'Nouvel appel d’offres'}
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={submit}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Référence" required error={save.fieldErrors.ref}><Input value={edit.ref} onChange={set('ref')} /></Field>
          <Field label="Date limite de dépôt" required error={save.fieldErrors.deadline}><Input type="datetime-local" value={edit.deadline} onChange={set('deadline')} /></Field>
          <Field label="Intitulé" required error={save.fieldErrors.title} className="span-2"><Input value={edit.title} onChange={set('title')} /></Field>
          <Field label="Acheteur" className="span-2"><div className="row"><Input placeholder="Rechercher…" value={orgQ} onChange={(e) => setOrgQ(e.target.value)} style={{ maxWidth: 200 }} aria-label="Rechercher" /><Select value={edit.organization_id ?? ''} onChange={set('organization_id')} placeholder="—" options={(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name }))} /></div></Field>
          <Field label="Source"><Input value={edit.source ?? ''} onChange={set('source')} /></Field>
          <Field label="Valeur estimée"><MoneyInput value={edit.estimated_value} onChange={set('estimated_value')} /></Field>
          <Field label="Responsable"><Select value={edit.owner_id ?? ''} onChange={set('owner_id')} placeholder="Moi" options={users.map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
          <Field label="Statut"><Select value={edit.status} onChange={set('status')} options={[{ value: 'veille', label: 'Veille' }, { value: 'en_preparation', label: 'En préparation' }, { value: 'soumis', label: 'Soumis' }, { value: 'gagne', label: 'Gagné' }, { value: 'perdu', label: 'Perdu' }, { value: 'non_soumis', label: 'Non soumis' }]} /></Field>
          <Field label="Critères d’attribution" className="span-2"><Textarea value={edit.criteria ?? ''} onChange={set('criteria')} /></Field>
          <Field label="Pièces à produire" className="span-2"><Textarea value={edit.required_documents ?? ''} onChange={set('required_documents')} /></Field>
          <Field label="Décision / motif de non-soumission" required={edit.status === 'non_soumis'} error={save.error && !save.error.fields ? save.error.message : undefined} className="span-2"><Textarea value={edit.decision_reason ?? ''} onChange={set('decision_reason')} /></Field>
        </div>}
      </Modal>
    </>
  );
}
