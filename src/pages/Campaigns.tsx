import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Megaphone, Plus, Search } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useCan } from '../lib/auth';
import { addDays, date, money, today } from '../lib/format';
import { Badge, Button, Card, DataTable, Empty, Field, Input, Modal, MoneyInput, PageHeader, Segmented, Select, Status, Textarea } from '../components/ui';

function CampaignForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  const [orgQ, setOrgQ] = useState('');
  const orgs = useApi<any>(['org-pick', orgQ], open ? `/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}` : null);
  const [f, setF] = useState<any>({ name: '', organization_id: '', start_date: addDays(today(), 14), end_date: addDays(today(), 44), objectives: '', budget_ht: null });
  const save = useAction(() => api.post('/api/campaigns', { ...f, budget_ht: f.budget_ht ?? 0 }), { success: 'Campagne créée', onSuccess: (r: any) => { onClose(); nav(`/campagnes/${r.id}`); } });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e?.target ? e.target.value : e });
  return (
    <Modal open={open} onClose={onClose} title="Nouvelle campagne" description="Les campagnes vendues sont créées automatiquement à la signature (passation). Utilisez ce formulaire pour une campagne hors processus commercial (ex. campagne interne ou reprise)."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.name || !f.organization_id} onClick={() => save.run(undefined)}>Créer</Button></>}>
      <div className="form-grid">
        <Field label="Nom" required className="span-2" error={save.fieldErrors.name}><Input value={f.name} onChange={set('name')} /></Field>
        <Field label="Annonceur" required className="span-2" error={save.fieldErrors.organization_id}><div className="row"><Input placeholder="Rechercher…" value={orgQ} onChange={(e) => setOrgQ(e.target.value)} style={{ maxWidth: 200 }} aria-label="Rechercher" /><Select value={f.organization_id} onChange={set('organization_id')} placeholder="Choisir…" options={(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name }))} /></div></Field>
        <Field label="Début" required error={save.fieldErrors.start_date}><Input type="date" value={f.start_date} onChange={set('start_date')} /></Field>
        <Field label="Fin" required error={save.fieldErrors.end_date}><Input type="date" value={f.end_date} onChange={set('end_date')} /></Field>
        <Field label="Budget vendu HT"><MoneyInput value={f.budget_ht} onChange={set('budget_ht')} /></Field>
        <Field label="Objectifs" className="span-2"><Textarea value={f.objectives} onChange={set('objectives')} /></Field>
      </div>
    </Modal>
  );
}

export default function Campaigns() {
  const nav = useNavigate();
  const can = useCan();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [create, setCreate] = useState(false);
  const status = sp.get('status') ?? 'actives';
  const params = { q: sp.get('q'), status: ['actives', ''].includes(status) ? null : status, active: status === 'actives' ? 1 : null };
  const r = useApi<any>(['campaigns', params], `/api/campaigns${qs(params)}`);
  const set = (o: Record<string, string>) => { const n = new URLSearchParams(sp); for (const [k, v] of Object.entries(o)) { if (v) n.set(k, v); else n.delete(k); } setSp(n, { replace: true }); };
  return (
    <>
      <PageHeader title="Campagnes" subtitle="Dossiers d’exécution : passation, production, pose, preuves, coûts et bilan"
        actions={<>{can('campaigns', 'export') && <ExcelButton url={`/api/campaigns${qs({ ...params, format: 'xlsx' })}`} />}
          {can('campaigns', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Nouvelle campagne</Button>}</>} />
      <div className="filter-bar">
        <Segmented label="Statut" value={status} onChange={(v) => set({ status: v })} options={[{ id: 'actives', label: 'En cours' }, { id: 'a_accepter', label: 'Passation à accepter' }, { id: 'terminee', label: 'Bilan à faire' }, { id: 'cloturee', label: 'Clôturées' }, { id: '', label: 'Toutes' }]} />
        <form className="input-group search" role="search" onSubmit={(e) => { e.preventDefault(); set({ q }); }}><Search /><Input aria-label="Rechercher" placeholder="Campagne, annonceur, référence…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set({ q })} /></form>
      </div>
      <Card flush>
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(c: any) => nav(`/campagnes/${c.id}`)} empty={<Empty icon={<Megaphone />} title="Aucune campagne">Les campagnes sont créées automatiquement lorsqu’une opportunité est gagnée.</Empty>}
          columns={[
            { key: 'n', label: 'Campagne', render: (c: any) => <><div className="cell-title">{c.name}</div><div className="cell-sub">{c.ref} · {c.organization_name}</div></> },
            { key: 's', label: 'Statut', render: (c: any) => <div className="row-wrap"><Status kind="campaign" code={c.status} />{c.late_tasks > 0 && <Badge tone="danger">{c.late_tasks} tâche(s) en retard</Badge>}</div> },
            { key: 'p', label: 'Période', render: (c: any) => <span className="small nowrap">{date(c.start_date)} → {date(c.end_date)}</span> },
            { key: 'e', label: 'Exécution', render: (c: any) => <span className="small num">{c.faces_done}/{c.faces_planned} faces posées</span>, mobile: 'hide' },
            { key: 'b', label: 'Budget HT', num: true, render: (c: any) => money(c.budget_ht), mobile: 'hide' },
            { key: 'o', label: 'Responsable ops', render: (c: any) => <span className="small">{c.ops_owner_name ?? '—'}</span>, mobile: 'hide' },
          ]} />
      </Card>
      {create && <CampaignForm open onClose={() => setCreate(false)} />}
    </>
  );
}
