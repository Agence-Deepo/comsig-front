import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Download, Plus, Search, Upload, Users } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useAuth, useCan, useLookups, useUsers } from '../lib/auth';
import { qs, download } from '../lib/api';
import { moneyShort, relative } from '../lib/format';
import { DECISION_ROLE } from '../lib/labels';
import { Badge, Button, ButtonLink, Card, DataTable, Empty, ErrorState, Input, PageHeader, Select, Status, Tabs } from '../components/ui';
import { OrganizationForm } from '../components/forms';

export default function Organizations() {
  const [sp, setSp] = useSearchParams();
  const tab = (sp.get('tab') as 'orgs' | 'contacts') ?? 'orgs';
  const setMany = (o: Record<string, string>) => { const n = new URLSearchParams(sp); for (const [k, v] of Object.entries(o)) { if (v) n.set(k, v); else n.delete(k); } if (!('page' in o)) n.delete('page'); setSp(n, { replace: true }); };
  const set = (k: string, v: string) => setMany({ [k]: v });
  const can = useCan();
  const { me } = useAuth();
  const [create, setCreate] = useState(false);
  return (
    <>
      <PageHeader title="Clients et contacts" subtitle="Référentiel unique des organisations, de leurs interlocuteurs et de leur historique"
        actions={<>
          {can('organizations', 'create') && can('admin', 'create') && <ButtonLink to="/admin/imports" icon={<Upload size={16} />}>Importer</ButtonLink>}
          {can('organizations', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Nouvelle organisation</Button>}
        </>} />
      <Tabs value={tab} onChange={(t) => set('tab', t === 'orgs' ? '' : t)} tabs={[{ id: 'orgs', label: <><Building2 size={15} />Organisations</> }, { id: 'contacts', label: <><Users size={15} />Contacts</> }]} />
      {tab === 'orgs' ? <OrgList sp={sp} set={set} setMany={setMany} scopeOwn={me?.data_scope === 'own'} /> : <ContactList sp={sp} set={set} />}
      <OrganizationForm open={create} onClose={() => setCreate(false)} defaultKind="client" />
    </>
  );
}

function OrgList({ sp, set, setMany, scopeOwn, kindFixed }: { sp: URLSearchParams; set: (k: string, v: string) => void; setMany: (o: Record<string, string>) => void; scopeOwn?: boolean; kindFixed?: string }) {
  const nav = useNavigate();
  const can = useCan();
  const { lookups, label } = useLookups();
  const users = useUsers();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const params = { q: sp.get('q'), kind: kindFixed ?? sp.get('kind'), sector: sp.get('sector'), commune: sp.get('commune'), owner_id: sp.get('owner'), potential: sp.get('potential'), qualification_status: sp.get('qualif'),
    sort: sp.get('sort') ?? 'name', dir: sp.get('dir') ?? 'asc', page: sp.get('page') ?? 1, pageSize: 50 };
  const r = useApi<any>(['organizations', params], `/api/organizations${qs(params)}`);
  const sort = (k: string) => { const same = (sp.get('sort') ?? 'name') === k; setMany({ sort: k, dir: same && (sp.get('dir') ?? 'asc') === 'asc' ? 'desc' : 'asc' }); };
  const page = Number(params.page);
  return (
    <Card flush title={r.data ? `${r.data.total} organisation(s)` : 'Organisations'} actions={can('organizations', 'export') && <>
      <ExcelButton size="sm" url={`/api/organizations${qs({ ...params, format: 'xlsx' })}`} />
      <Button size="sm" icon={<Download />} onClick={() => download(`/api/organizations${qs({ ...params, format: 'csv' })}`)}>CSV</Button></>}>
      <div className="filter-bar" style={{ padding: '0 20px 12px' }}>
        <form className="input-group search" onSubmit={(e) => { e.preventDefault(); set('q', q); }} role="search">
          <Search /><Input aria-label="Rechercher" placeholder="Nom, référence, téléphone, e-mail…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set('q', q)} />
        </form>
        {!kindFixed && <Select aria-label="Type" value={sp.get('kind') ?? ''} onChange={(e) => set('kind', e.target.value)} placeholder="Tous types" options={[{ value: 'client', label: 'Clients' }, { value: 'prospect', label: 'Prospects' }, { value: 'ancien_client', label: 'Anciens clients' }, { value: 'institution', label: 'Institutions' }, { value: 'partenaire', label: 'Partenaires' }, { value: 'fournisseur', label: 'Fournisseurs' }]} />}
        <Select aria-label="Secteur" value={sp.get('sector') ?? ''} onChange={(e) => set('sector', e.target.value)} placeholder="Tous secteurs" options={(lookups.sector ?? []).map((x) => ({ value: x.code, label: x.label }))} />
        <Select aria-label="Commune" value={sp.get('commune') ?? ''} onChange={(e) => set('commune', e.target.value)} placeholder="Toutes communes" options={(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label }))} />
        <Select aria-label="Potentiel" value={sp.get('potential') ?? ''} onChange={(e) => set('potential', e.target.value)} placeholder="Tout potentiel" options={[{ value: 'strategique', label: 'Stratégique' }, { value: 'fort', label: 'Fort' }, { value: 'moyen', label: 'Moyen' }, { value: 'faible', label: 'Faible' }]} />
        {!scopeOwn && <Select aria-label="Responsable" value={sp.get('owner') ?? ''} onChange={(e) => set('owner', e.target.value)} placeholder="Tous responsables" options={users.filter((u) => ['commercial', 'direction_commerciale'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name }))} />}
      </div>
      {r.error ? <ErrorState error={r.error} onRetry={() => r.refetch()} /> : (
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(o: any) => nav(`/organisations/${o.id}`)} sort={{ key: params.sort as string, dir: params.dir as any }} onSort={sort} caption="Liste des organisations"
          empty={<Empty icon={<Building2 />} title="Aucune organisation ne correspond">Modifiez les filtres ou créez une nouvelle fiche.</Empty>}
          columns={[
            { key: 'name', label: 'Organisation', sortable: true, render: (o: any) => <><div className="cell-title">{o.legal_name}</div><div className="cell-sub">{o.ref}{o.main_contact ? ` · ${o.main_contact}` : ''}</div></> },
            { key: 'kind', label: 'Type', render: (o: any) => <Status kind="org_kind" code={o.kind} /> },
            { key: 'sector', label: 'Secteur', render: (o: any) => <span className="small">{label('sector', o.sector)}</span>, mobile: 'hide' },
            { key: 'commune', label: 'Commune', render: (o: any) => <span className="small">{label('commune', o.commune)}</span>, mobile: 'hide' },
            { key: 'owner', label: 'Responsable', render: (o: any) => <span className="small">{o.owner_name ?? '—'}</span>, mobile: 'hide' },
            { key: 'open', label: 'Opp. ouvertes', num: true, render: (o: any) => o.open_opportunities || '—', mobile: 'hide' },
            { key: 'revenue', label: 'CA gagné', num: true, sortable: true, render: (o: any) => (o.won_amount ? moneyShort(o.won_amount) : '—') },
            { key: 'activity', label: 'Dernière activité', sortable: true, render: (o: any) => <span className="small muted">{relative(o.last_activity_at)}</span>, mobile: 'hide' },
          ]} />
      )}
      {r.data && r.data.total > 50 && (
        <div className="table-foot"><span>Page {page} sur {Math.ceil(r.data.total / 50)}</span>
          <div className="row"><Button size="sm" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>Précédent</Button><Button size="sm" disabled={page * 50 >= r.data.total} onClick={() => set('page', String(page + 1))}>Suivant</Button></div></div>
      )}
    </Card>
  );
}
export { OrgList };

function ContactList({ sp, set }: { sp: URLSearchParams; set: (k: string, v: string) => void }) {
  const nav = useNavigate();
  const can = useCan();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const params = { q: sp.get('q'), decision_role: sp.get('role') };
  const r = useApi<any>(['contacts', params], `/api/contacts${qs(params)}`);
  return (
    <Card flush title={r.data ? `${r.data.rows.length} contact(s)` : 'Contacts'} actions={can('organizations', 'export') && <ExcelButton size="sm" url={`/api/contacts${qs({ ...params, format: 'xlsx' })}`} />}>
      <div className="filter-bar" style={{ padding: '0 20px 12px' }}>
        <form className="input-group search" onSubmit={(e) => { e.preventDefault(); set('q', q); }} role="search"><Search /><Input aria-label="Rechercher un contact" placeholder="Nom, e-mail, organisation…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set('q', q)} /></form>
        <Select aria-label="Rôle" value={sp.get('role') ?? ''} onChange={(e) => set('role', e.target.value)} placeholder="Tous rôles" options={Object.entries(DECISION_ROLE).map(([value, label]) => ({ value, label }))} />
      </div>
      <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(c: any) => nav(`/organisations/${c.organization_id}?contact=${c.id}`)} empty={<Empty icon={<Users />} title="Aucun contact" />}
        columns={[
          { key: 'name', label: 'Contact', render: (c: any) => <><div className="cell-title">{[c.civility, c.first_name, c.last_name].filter(Boolean).join(' ')}</div><div className="cell-sub">{c.job_title ?? '—'}</div></> },
          { key: 'org', label: 'Organisation', render: (c: any) => <span className="small">{c.organization_name}</span> },
          { key: 'role', label: 'Rôle', render: (c: any) => c.decision_role ? <Badge tone="neutral" dot={false}>{DECISION_ROLE[c.decision_role]}</Badge> : '—', mobile: 'hide' },
          { key: 'email', label: 'E-mail', render: (c: any) => c.email ? <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="small">{c.email}</a> : '—', mobile: 'hide' },
          { key: 'tel', label: 'Téléphone', render: (c: any) => <span className="small nowrap">{c.mobile || c.phone || '—'}</span> },
          { key: 'optout', label: 'Sollicitations', render: (c: any) => c.opt_out ? <Badge tone="danger">Opposition</Badge> : <span className="muted small">Autorisées</span>, mobile: 'hide' },
        ]} />
    </Card>
  );
}
