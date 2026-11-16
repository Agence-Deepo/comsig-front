import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Users, Plus, Search, Pencil, Target, CalendarPlus } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  Dl,
  Empty,
  Input,
  Kpi,
  PageHeader,
  Select,
  Tabs,
  type Column,
} from '../components/ui';
import { api, HttpError, queryString } from './api';
import { useAuth } from './auth';
import { can, date, label, money, type Page, type Row } from './types';
import { ActionForm, ErrorBox, Loading, Pager, Status } from './ui';
import { RecordForm } from './forms';
import { OpportunityForm } from './Opportunities';
import { modules } from './modules';
import { contactFields, customerFields, customerKinds, qualificationKeys } from './customerFields';
import ExportButton from './ExportButton';
import { Attachments } from './Attachments';
import { CustomerForm, MergeCustomerForm } from './CustomerActions';
import { ActivityHistory, CustomerDecisions } from './CustomerHistory';
import { ClientPricing } from './QuotePricing';
import CustomerOverview from './CustomerOverview';
import { useCustomerReferences, referenceLabel } from './CustomerReferences';

export function CustomerList({ prospection = false }: { prospection?: boolean }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const contacts = !prospection && sp.get('tab') === 'contacts';
  const [search, setSearch] = useState(sp.get('q') ?? '');
  const [create, setCreate] = useState(false);
  const references = useCustomerReferences();
  useEffect(() => setSearch(sp.get('q') ?? ''), [sp]);
  // Fusion des filtres : deux changements rapprochés ne doivent pas s'écraser.
  // React Router résout la mise à jour sur la dernière URL *commise*, d'où la référence.
  const pendingParams = useRef(new URLSearchParams(sp.toString()));
  useEffect(() => {
    pendingParams.current = new URLSearchParams(sp.toString());
  }, [sp]);
  const setMany = (changes: Record<string, string>) => {
    const next = new URLSearchParams(pendingParams.current.toString());
    for (const [key, value] of Object.entries(changes)) value ? next.set(key, value) : next.delete(key);
    if (!('page' in changes)) next.delete('page');
    pendingParams.current = next;
    setSp(next);
  };
  const parameters = Object.fromEntries(sp);
  delete parameters.tab;
  if (prospection) parameters.kind = 'prospect';
  const params = { ...parameters, per_page: 25 };
  const path = contacts ? 'contacts' : 'organizations';
  const result = useQuery({
    queryKey: ['customer-list', path, params],
    queryFn: ({ signal }) => api.get<Page>('/' + path + queryString(params), signal),
  });
  const options = useQuery({
    queryKey: ['customer-options'],
    queryFn: () =>
      api.get<{ data: { sector: string[]; commune: string[]; owners: Row[] } }>('/organizations/options'),
  });
  const summary = useQuery({
    queryKey: ['prospects-summary'],
    queryFn: () =>
      api.get<{ data: { counts: Record<string, number>; inactive_14_days: number; total: number } }>(
        '/organizations/prospects-summary',
      ),
    enabled: prospection,
  });
  const columns: Column<Row>[] = contacts
    ? [
        {
          key: 'name',
          label: 'Contact',
          render: (r) => (
            <>
              <div className="cell-title">
                {[r.civility, r.first_name, r.last_name].filter(Boolean).join(' ')}
              </div>
              <div className="cell-sub">{r.job_title ?? '—'}</div>
            </>
          ),
        },
        { key: 'organization', label: 'Organisation', render: (r) => r.organization?.legal_name ?? '—' },
        {
          key: 'role',
          label: 'Rôle',
          render: (r) => (r.decision_role ? label(r.decision_role) : '—'),
          mobile: 'hide',
        },
        { key: 'email', label: 'E-mail', render: (r) => r.email ?? '—', mobile: 'hide' },
        { key: 'phone', label: 'Téléphone', render: (r) => r.mobile || r.phone || '—' },
        {
          key: 'optout',
          label: 'Sollicitations',
          render: (r) => (r.opt_out ? <Badge tone="danger">Opposition</Badge> : 'Autorisées'),
          mobile: 'hide',
        },
      ]
    : [
        {
          key: 'name',
          label: prospection ? 'Prospect' : 'Organisation',
          sortable: true,
          render: (r) => (
            <>
              <div className="cell-title">{r.legal_name}</div>
              <div className="cell-sub">{r.ref}</div>
            </>
          ),
        },
        {
          key: 'kind',
          label: prospection ? 'Qualification' : 'Type',
          render: (r) => <Status value={prospection ? r.qualification_status : r.kind} />,
        },
        {
          key: 'sector',
          label: 'Secteur',
          render: (r) => referenceLabel(references.data?.data, 'sector', r.sector),
          mobile: 'hide',
        },
        {
          key: 'commune',
          label: 'Commune',
          render: (r) => referenceLabel(references.data?.data, 'commune', r.commune),
          mobile: 'hide',
        },
        { key: 'owner', label: 'Responsable', render: (r) => r.owner?.name ?? '—', mobile: 'hide' },
        {
          key: 'score',
          label: 'Score de qualification',
          sortable: true,
          num: true,
          render: (r) => `${r.qualification_score ?? 0} %`,
        },
        {
          key: 'contacts',
          label: 'Contact principal',
          render: (r) =>
            r.contacts?.[0]
              ? [r.contacts[0].first_name, r.contacts[0].last_name].filter(Boolean).join(' ')
              : '—',
          mobile: 'hide',
        },
      ];
  if (!contacts && can(user, 'activities.view'))
    columns.push({
      key: 'activity',
      label: 'Dernière interaction',
      sortable: true,
      mobile: 'hide',
      render: (r) => date(r.last_contact),
    });
  if (!contacts && can(user, 'finance.view'))
    columns.push({
      key: 'revenue',
      label: 'Facturé HT cumulé',
      sortable: true,
      num: true,
      mobile: 'hide',
      render: (r) => money(r.invoiced_ht),
    });
  return (
    <>
      <PageHeader
        title={prospection ? 'Prospection' : 'Clients et contacts'}
        subtitle={
          prospection
            ? 'Qualification, premiers contacts et prochaines actions de votre portefeuille.'
            : 'Référentiel unique des organisations, de leurs interlocuteurs et de leur historique'
        }
        actions={
          can(user, 'organizations.create') && (
            <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>
              {prospection ? 'Nouveau prospect' : 'Nouvelle organisation'}
            </Button>
          )
        }
      />
      {prospection && (
        <>
          <ErrorBox
            error={summary.error}
            retry={() => {
              void summary.refetch();
            }}
          />
          <div className="grid-4 customer-kpis">
            {[
              ['a_qualifier', 'À qualifier'],
              ['en_cours', 'Qualification en cours'],
              ['qualifie', 'Qualifiés'],
            ].map(([key, title]) => (
              <button
                key={key}
                className="kpi-filter"
                onClick={() =>
                  setMany({ qualification_status: sp.get('qualification_status') === key ? '' : key })
                }
              >
                <Kpi label={title} value={summary.data ? (summary.data.data.counts[key] ?? 0) : '—'} />
              </button>
            ))}
            <button
              className="kpi-filter"
              onClick={() => setMany({ inactive_days: sp.get('inactive_days') ? '' : '14' })}
            >
              <Kpi
                label="Sans interaction datée depuis 14 j"
                value={summary.data?.data.inactive_14_days ?? '—'}
                foot="Interactions terminées uniquement"
              />
            </button>
          </div>
        </>
      )}
      {!prospection && (
        <Tabs
          value={contacts ? 'contacts' : 'orgs'}
          onChange={(tab) => setSp(tab === 'contacts' ? { tab: 'contacts' } : {})}
          tabs={[
            {
              id: 'orgs',
              label: (
                <>
                  <Building2 size={15} />
                  Organisations
                </>
              ),
            },
            {
              id: 'contacts',
              label: (
                <>
                  <Users size={15} />
                  Contacts
                </>
              ),
            },
          ]}
        />
      )}
      <Card
        flush
        title={
          result.data
            ? `${result.data.total} ${contacts ? 'contact(s)' : 'organisation(s)'}`
            : contacts
              ? 'Contacts'
              : 'Organisations'
        }
        actions={
          <ExportButton path={'/exports/' + path + '.csv' + queryString(params)} filename={path + '.csv'} />
        }
      >
        <div className="filter-bar" style={{ padding: '0 20px 12px' }}>
          <form
            className="input-group search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setMany({ q: search.trim() });
            }}
          >
            <Search />
            <Input
              aria-label={contacts ? 'Rechercher un contact' : 'Rechercher'}
              placeholder={contacts ? 'Nom, e-mail, organisation…' : 'Nom, référence, téléphone, e-mail…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => {
                if (search !== (sp.get('q') ?? '')) setMany({ q: search.trim() });
              }}
            />
          </form>
          {!contacts && !prospection && (
            <Select
              aria-label="Type"
              placeholder="Tous types"
              value={sp.get('kind') ?? ''}
              onChange={(e) => setMany({ kind: e.target.value })}
              options={customerKinds.map((value) => ({ value, label: label(value) }))}
            />
          )}
          {!contacts && (
            <>
              <Select
                aria-label="Taille"
                placeholder="Toutes tailles"
                value={sp.get('size') ?? ''}
                onChange={(e) => setMany({ size: e.target.value })}
                options={['tpe', 'pme', 'eti', 'grande', 'institution'].map((value) => ({
                  value,
                  label: label(value),
                }))}
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  setMany({ tag: String(form.get('tag') ?? '').trim() });
                }}
              >
                <Input
                  aria-label="Filtrer par étiquette"
                  name="tag"
                  placeholder="Étiquette…"
                  maxLength={40}
                  defaultValue={sp.get('tag') ?? ''}
                  key={sp.get('tag') ?? ''}
                  onBlur={(e) => {
                    if (e.target.value !== (sp.get('tag') ?? '')) setMany({ tag: e.target.value.trim() });
                  }}
                />
              </form>
              <Select
                aria-label="Secteur"
                placeholder="Tous secteurs"
                value={sp.get('sector') ?? ''}
                onChange={(e) => setMany({ sector: e.target.value })}
                options={(() => {
                  const current = sp.get('sector') ?? '';
                  const list = (options.data?.data.sector ?? []).map((value) => ({
                    value,
                    label: referenceLabel(references.data?.data, 'sector', value),
                  }));
                  // La valeur vient de l’URL : elle doit rester sélectionnable même
                  // avant le chargement des référentiels ou si elle n’y figure plus.
                  if (current && !list.some((item) => item.value === current))
                    list.unshift({
                      value: current,
                      label: referenceLabel(references.data?.data, 'sector', current),
                    });
                  return list;
                })()}
              />
              <Select
                aria-label="Commune"
                placeholder="Toutes communes"
                value={sp.get('commune') ?? ''}
                onChange={(e) => setMany({ commune: e.target.value })}
                options={(options.data?.data.commune ?? []).map((value) => ({
                  value,
                  label: referenceLabel(references.data?.data, 'commune', value),
                }))}
              />
              <Select
                aria-label="Potentiel"
                placeholder="Tout potentiel"
                value={sp.get('potential') ?? ''}
                onChange={(e) => setMany({ potential: e.target.value })}
                options={['faible', 'moyen', 'fort', 'strategique'].map((value) => ({
                  value,
                  label: label(value),
                }))}
              />
              <Select
                aria-label="Qualification"
                placeholder="Toutes qualifications"
                value={sp.get('qualification_status') ?? ''}
                onChange={(e) => setMany({ qualification_status: e.target.value })}
                options={['a_qualifier', 'en_cours', 'qualifie', 'en_veille', 'disqualifie'].map((value) => ({
                  value,
                  label: label(value),
                }))}
              />
              {user?.role.data_scope !== 'own' && (
                <Select
                  aria-label="Responsable"
                  placeholder="Tous responsables"
                  value={sp.get('owner_id') ?? ''}
                  onChange={(e) => setMany({ owner_id: e.target.value })}
                  options={(options.data?.data.owners ?? []).map((r) => ({
                    value: String(r.id),
                    label: r.name,
                  }))}
                />
              )}
            </>
          )}
          {contacts && (
            <Select
              aria-label="Rôle dans la décision"
              placeholder="Tous rôles"
              value={sp.get('decision_role') ?? ''}
              onChange={(e) => setMany({ decision_role: e.target.value })}
              options={['decideur', 'influenceur', 'prescripteur', 'utilisateur', 'acheteur', 'autre'].map(
                (value) => ({ value, label: label(value) }),
              )}
            />
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearch('');
              setSp(contacts ? { tab: 'contacts' } : {});
            }}
          >
            Effacer les filtres
          </Button>
        </div>
        <ErrorBox error={options.error} />
        <ErrorBox
          error={result.error}
          retry={() => {
            void result.refetch();
          }}
        />
        {!result.error && (
          <DataTable
            rows={result.data?.data}
            loading={result.isLoading}
            columns={columns}
            caption={contacts ? 'Liste des contacts' : 'Liste des organisations'}
            sort={{ key: sp.get('sort') ?? 'name', dir: (sp.get('dir') ?? 'asc') as 'asc' | 'desc' }}
            onSort={(key) =>
              setMany({ sort: key, dir: sp.get('sort') === key && sp.get('dir') !== 'desc' ? 'desc' : 'asc' })
            }
            onRowClick={(row) =>
              nav('/clients/' + (contacts ? row.organization_id : row.id) + (contacts ? '?tab=contacts' : ''))
            }
            empty={
              <Empty icon={prospection ? <Target /> : <Building2 />} title="Aucun résultat">
                Modifiez les filtres ou créez une fiche.
              </Empty>
            }
          />
        )}
        <Pager page={result.data} change={(page) => setMany({ page: String(page) })} />
      </Card>
      {create && (
        <CustomerForm
          prospection={prospection}
          close={() => setCreate(false)}
          saved={(row) => nav('/clients/' + row.id)}
        />
      )}
    </>
  );
}

function RelatedRecords({ id, resource }: { id: string; resource: string }) {
  const [page, setPage] = useState(1);
  const nav = useNavigate();
  const q = useQuery({
    queryKey: ['customer-related', id, resource, page],
    queryFn: () => api.get<Page>(`/organizations/${id}/related/${resource}?page=${page}&per_page=25`),
  });
  const module = modules.find(
    (m) => m.key === resource || m.key === 'erp/' + resource || m.key === 'customer-cases/' + resource,
  )!;
  return (
    <Card flush>
      <ErrorBox
        error={q.error}
        retry={() => {
          void q.refetch();
        }}
      />
      <DataTable
        rows={q.data?.data}
        loading={q.isLoading}
        columns={[
          { key: 'title', label: 'Dossier', render: (r) => r.title || r.number || r.ref },
          { key: 'status', label: 'Statut', render: (r) => <Status value={r.status || r.stage_code} /> },
          {
            key: 'date',
            label: 'Date / échéance',
            render: (r) => date(r.end_date || r.due_date || r.due_at || r.created_at),
          },
          {
            key: 'amount',
            label: resource === 'contracts' ? 'Valeur HT' : 'Montant TTC',
            render: (r) =>
              resource === 'contracts'
                ? money(r.value_ht)
                : r.total_ttc !== undefined
                  ? money(r.total_ttc)
                  : '—',
            mobile: 'hide',
          },
        ]}
        onRowClick={(r) => nav('/' + module.path + '/' + r.id)}
        empty={<Empty title="Aucun dossier lié dans votre périmètre" />}
      />
      <Pager page={q.data} change={setPage} />
    </Card>
  );
}

export function CustomerDetail() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') ?? 'overview';
  const [modal, setModal] = useState<string | null>(null);
  const [contact, setContact] = useState<Row | undefined>();
  const references = useCustomerReferences();
  const q = useQuery({
    queryKey: ['detail', 'organizations', id],
    queryFn: () => api.get<{ data: Row }>('/organizations/' + id),
  });
  if (q.isLoading) return <Loading />;
  if (q.error instanceof HttpError && q.error.status === 410 && q.error.details.merged_into)
    return (
      <Card title="Fiche fusionnée">
        <p>Cette ancienne fiche est archivée. Ses dossiers ont été regroupés dans la fiche conservée.</p>
        <Link to={'/clients/' + q.error.details.merged_into.id}>
          Ouvrir {q.error.details.merged_into.ref} — {q.error.details.merged_into.legal_name}
        </Link>
      </Card>
    );
  if (q.error)
    return (
      <ErrorBox
        error={q.error}
        retry={() => {
          void q.refetch();
        }}
      />
    );
  const row = q.data!.data;
  const setTab = (value: string) => setSp(value === 'overview' ? {} : { tab: value });
  const contactTab = (
    <Card
      title={`${row.contacts.length} contact(s)`}
      actions={
        can(user, 'organizations.create') && (
          <Button
            icon={<Plus />}
            onClick={() => {
              setContact(undefined);
              setModal('contact');
            }}
          >
            Ajouter un contact
          </Button>
        )
      }
    >
      <DataTable<Row>
        rows={row.contacts}
        columns={[
          {
            key: 'name',
            label: 'Contact',
            render: (c) => (
              <>
                <strong>{[c.first_name, c.last_name].filter(Boolean).join(' ')}</strong>
                {c.is_primary && <Badge>Principal</Badge>}
                <div className="cell-sub">{c.job_title}</div>
              </>
            ),
          },
          { key: 'role', label: 'Rôle', render: (c) => label(c.decision_role), mobile: 'hide' },
          { key: 'email', label: 'E-mail', render: (c) => c.email ?? '—', mobile: 'hide' },
          { key: 'phone', label: 'Téléphone', render: (c) => c.mobile || c.phone || '—' },
          {
            key: 'optout',
            label: 'Sollicitations',
            render: (c) => (c.opt_out ? <Badge tone="danger">Opposition</Badge> : 'Autorisées'),
            mobile: 'hide',
          },
          {
            key: 'actions',
            label: '',
            render: (c) =>
              can(user, 'organizations.update') && (
                <Button
                  size="sm"
                  aria-label={`Modifier le contact ${c.last_name}`}
                  onClick={() => {
                    setContact(c);
                    setModal('contact');
                  }}
                >
                  Modifier
                </Button>
              ),
          },
        ]}
        empty={<Empty title="Aucun contact" />}
      />
    </Card>
  );
  const related = [
    ['activities', 'Historique', 'activities.view'],
    ['tasks', 'Tâches', 'tasks.view'],
    ['opportunities', 'Opportunités', 'opportunities.view'],
    ['quotes', 'Propositions', 'quotes.view'],
    ['invoices', 'Factures', 'finance.view'],
    ['projects', 'Projets', 'production.view'],
    ['campaigns', 'Campagnes', 'campaigns.view'],
    ['contracts', 'Contrats', 'contracts.view'],
    ['complaints', 'Réclamations', 'complaints.view'],
  ].filter(([, , p]) => can(user, p));
  return (
    <>
      <Link to={row.kind === 'prospect' ? '/prospection' : '/clients'} className="back-link">
        ← {row.kind === 'prospect' ? 'Prospection' : 'Clients et contacts'}
      </Link>
      <PageHeader
        title={row.legal_name}
        subtitle={
          <span className="row-wrap">
            <Status value={row.kind} />
            {row.trade_name && <span>{row.trade_name} · </span>}
            <span>
              {row.sector
                ? referenceLabel(references.data?.data, 'sector', row.sector)
                : 'Secteur non renseigné'}{' '}
              ·{' '}
              {row.commune
                ? referenceLabel(references.data?.data, 'commune', row.commune)
                : 'Commune non renseignée'}
              {row.city ? ', ' + row.city : ''}
            </span>
            <span>
              Responsable : <strong>{row.owner?.name ?? '—'}</strong>
            </span>
            {row.client_since && <span>Client depuis {date(row.client_since)}</span>}
          </span>
        }
        actions={
          <>
            {can(user, 'organizations.update') && (
              <Button icon={<Pencil />} onClick={() => setModal('edit')}>
                Modifier
              </Button>
            )}
            {can(user, 'opportunities.create') && (
              <Button variant="primary" icon={<Plus />} onClick={() => setModal('opportunities')}>
                Nouvelle opportunité
              </Button>
            )}
          </>
        }
      />
      <div className="row-wrap" role="toolbar" aria-label="Actions rapides">
        {can(user, 'activities.create') && (
          <Button size="sm" onClick={() => setModal('activities')}>
            Consigner une interaction
          </Button>
        )}
        {can(user, 'tasks.create') && (
          <Button size="sm" icon={<CalendarPlus />} onClick={() => setModal('tasks')}>
            Créer une tâche
          </Button>
        )}
        {can(user, 'contracts.create') && (
          <Button size="sm" onClick={() => setModal('contracts')}>
            Ajouter un contrat
          </Button>
        )}
        {can(user, 'complaints.create') && (
          <Button size="sm" onClick={() => setModal('complaints')}>
            Ajouter une réclamation
          </Button>
        )}
        {can(user, 'organizations.create') && (
          <Button
            size="sm"
            onClick={() => {
              setContact(undefined);
              setModal('contact');
              setTab('contacts');
            }}
          >
            Ajouter un contact
          </Button>
        )}
        {can(user, 'organizations.update') && (
          <Button size="sm" icon={<Target />} onClick={() => setModal('qualify')}>
            Qualifier
          </Button>
        )}
        {can(user, 'organizations.update') && can(user, 'organizations.delete') && (
          <Button size="sm" onClick={() => setModal('merge')}>
            Fusionner une fiche
          </Button>
        )}
      </div>
      <div className="split customer-detail">
        <div className="stack-lg" style={{ minWidth: 0 }}>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'overview', label: 'Vue d’ensemble' },
              ...(related.some(([id]) => id === 'activities')
                ? [{ id: 'activities', label: 'Historique' }]
                : []),
              { id: 'contacts', label: 'Contacts', count: row.contacts.length },
              ...related.filter(([id]) => id !== 'activities').map(([id, label]) => ({ id, label })),
              { id: 'docs', label: 'Documents' },
              { id: 'pricing', label: 'Tarification' },
              { id: 'decisions', label: 'Décisions' },
            ]}
          />
          {tab === 'overview' && (
            <>
              <CustomerOverview id={id} />
              <Card title="Informations du compte">
                <Dl
                  items={customerFields
                    .filter((f) => f.key !== 'notes')
                    .map((f) => [
                      f.label,
                      row[f.key] === null || row[f.key] === undefined || row[f.key] === ''
                        ? '—'
                        : ['sector', 'commune', 'source', 'structure_type'].includes(f.key)
                          ? referenceLabel(references.data?.data, f.key, row[f.key])
                          : f.key === 'annual_revenue_estimate'
                            ? money(row[f.key])
                            : f.type === 'tags'
                              ? (row.tags ?? []).join(', ')
                              : f.type === 'select'
                                ? label(row[f.key])
                                : String(row[f.key]),
                    ])}
                />
              </Card>
              {row.notes && (
                <Card title="Notes">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{row.notes}</p>
                </Card>
              )}
              <Card title="Qualification">
                <p>
                  {label(row.qualification_status)} · {row.qualification_score} % —{' '}
                  {
                    Object.values(row.qualification ?? {}).filter((v) => typeof v === 'string' && v.trim())
                      .length
                  }
                  /7 critères renseignés
                </p>
                {row.disqualification_reason && <p>Motif : {row.disqualification_reason}</p>}
                <Dl items={qualificationKeys.map(([key, text]) => [text, row.qualification?.[key] || '—'])} />
              </Card>
            </>
          )}
          {tab === 'contacts' && contactTab}
          {tab === 'pricing' && <ClientPricing id={id!} />}
          {tab === 'activities' && can(user, 'activities.view') && (
            <ActivityHistory key={id} id={id} contacts={row.contacts} />
          )}
          {tab === 'decisions' && <CustomerDecisions key={id} id={id} />}
          {tab !== 'activities' && related.some(([resource]) => resource === tab) && (
            <RelatedRecords key={tab} id={id} resource={tab} />
          )}
          {tab === 'docs' && <Attachments key={id} entityType="organizations" entityId={id} />}
        </div>
        <aside className="stack-lg">
          <Card title="Repères du compte">
            <Dl
              items={[
                ['Référence', row.ref],
                ['Qualification', label(row.qualification_status)],
                ['Score', `${row.qualification_score} %`],
                ['Potentiel', label(row.potential)],
                ['Personne ressource', row.resource_person || '—'],
                ['Fonction', row.resource_title || '—'],
              ]}
            />
          </Card>
          {row.merged_sources?.length > 0 && (
            <Card title="Fiches regroupées">
              <ul>
                {row.merged_sources.map((source: Row) => (
                  <li key={source.id}>
                    {source.ref} — {source.legal_name}
                    <div className="small muted">Fusionnée le {date(source.deleted_at)}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card title="Coordonnées">
            <Dl
              items={[
                ['E-mail', row.email ? <a href={'mailto:' + row.email}>{row.email}</a> : '—'],
                ['Téléphone', row.phone || '—'],
                ['Adresse', row.address || '—'],
                ['Secteur', referenceLabel(references.data?.data, 'sector', row.sector)],
                ['Commune', referenceLabel(references.data?.data, 'commune', row.commune)],
                ['Étiquettes', (row.tags ?? []).join(', ') || '—'],
              ]}
            />
            <Link to="/clients/classement">Consulter le classement</Link>
          </Card>
        </aside>
      </div>
      {modal === 'edit' && <CustomerForm row={row} close={() => setModal(null)} />}
      {modal === 'merge' && (
        <MergeCustomerForm
          target={row}
          close={() => setModal(null)}
          saved={() => {
            void qc.invalidateQueries();
          }}
        />
      )}
      {['contracts', 'complaints'].includes(modal ?? '') && (
        <RecordForm
          title={modal === 'contracts' ? 'Ajouter un contrat' : 'Ajouter une réclamation'}
          fields={modules
            .find((m) => m.key === 'customer-cases/' + modal)!
            .fields.map((f) => (f.key === 'organization_id' ? { ...f, default: id } : f))}
          path={'/customer-cases/' + modal}
          close={() => setModal(null)}
          saved={() => setTab(modal!)}
        />
      )}
      {modal === 'contact' && (
        <RecordForm
          title={contact ? 'Modifier le contact' : 'Ajouter un contact'}
          fields={contactFields}
          path={contact ? '/contacts' : `/organizations/${id}/contacts`}
          row={contact}
          close={() => setModal(null)}
          saved={() => setTab('contacts')}
        />
      )}
      {modal === 'opportunities' && (
        <OpportunityForm
          organizationId={id}
          close={() => setModal(null)}
          saved={(o) => nav('/opportunites/' + o.id)}
        />
      )}
      {['activities', 'tasks'].includes(modal ?? '') && (
        <RecordForm
          title={
            modal === 'opportunities'
              ? 'Nouvelle opportunité'
              : modal === 'activities'
                ? 'Consigner une interaction'
                : 'Créer une tâche'
          }
          fields={modules
            .find((m) => m.key === modal)!
            .fields.map((f) => (f.key === 'organization_id' ? { ...f, default: id } : f))}
          path={'/' + modal}
          close={() => setModal(null)}
          saved={(r) => nav('/' + modules.find((m) => m.key === modal)!.path + '/' + r.id)}
        />
      )}
      {modal === 'qualify' && (
        <ActionForm
          title="Qualification du compte"
          close={() => setModal(null)}
          submit={async (values) => {
            await api.post(`/organizations/${id}/qualify`, {
              qualification: Object.fromEntries(
                qualificationKeys.map(([key]) => [key, String(values.get(key) ?? '')]),
              ),
              status: values.get('status'),
              disqualification_reason: values.get('reason') || null,
            });
            await qc.invalidateQueries();
          }}
        >
          <p>Au moins 5 critères sur 7 sont nécessaires pour qualifier ce compte.</p>
          <div className="form-grid">
            {qualificationKeys.map(([key, text]) => (
              <label className="field" key={key}>
                {text}
                <input name={key} maxLength={1000} defaultValue={row.qualification?.[key] ?? ''} />
              </label>
            ))}
            <div className="field">
              <label htmlFor="customer-qualification-status">Statut de qualification</label>
              <select
                id="customer-qualification-status"
                name="status"
                defaultValue={
                  row.qualification_status === 'a_qualifier' ? 'en_cours' : row.qualification_status
                }
              >
                {['en_cours', 'qualifie', 'en_veille', 'disqualifie'].map((value) => (
                  <option key={value} value={value}>
                    {label(value)}
                  </option>
                ))}
              </select>
            </div>
            <label className="field">
              Motif de disqualification
              <input name="reason" maxLength={1000} defaultValue={row.disqualification_reason ?? ''} />
            </label>
          </div>
        </ActionForm>
      )}
    </>
  );
}
