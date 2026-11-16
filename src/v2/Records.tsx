import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Columns3,
  List,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { allRecords, RecordForm } from './forms';
import { CrmPipeline } from './CrmPipeline';
import { byPath, read, type Module } from './modules';
import { can, date, money, label, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, Loading, PageTitle, Pager, Status } from './ui';
import { DetailActions } from './actions';
import { DownloadButton } from './ErpPanels';
import { Attachments } from './Attachments';
import { StockPurchasePrices } from './QuotePricing';
import { Card, DataTable, Input, Segmented, Select, Tabs, type Column } from '../components/ui';

export function Cell({ row, column }: { row: Row; column: Module['columns'][number] }) {
  const value = read(row, column.key);
  if (value === undefined || value === null || value === '') return <>—</>;
  if (column.format === 'money') return <span className="numeric">{money(value)}</span>;
  if (column.format === 'date') return <>{date(value)}</>;
  if (column.format === 'status') return <Status value={value} />;
  if (column.format === 'boolean') return <>{value ? 'Oui' : 'Non'}</>;
  if (column.format === 'quantity')
    return <span className="numeric">{Number(value).toLocaleString('fr-CI')}</span>;
  return <>{String(value)}</>;
}
export function RecordList({ module }: { module: Module }) {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [page, setPage] = useState(1),
    [filter, setFilter] = useState(params.get(module.filterKey || 'status') ?? ''),
    [search, setSearch] = useState(params.get('q') ?? ''),
    [query, setQuery] = useState(params.get('q') ?? '');
  const [tab, setTab] = useState('orgs');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  useEffect(() => {
    setFilter(params.get(module.filterKey || 'status') ?? '');
    setSearch(params.get('q') ?? '');
    setQuery(params.get('q') ?? '');
    setPage(1);
  }, [params, module.filterKey]);
  const [editor, setEditor] = useState<Row | 'new' | null>(null);
  const navigate = useNavigate();
  const contacts = module.key === 'organizations' && tab === 'contacts';
  const isOpportunity = module.key === 'opportunities';
  const stages = useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: () => api.get('/pipeline/stages'),
    enabled: isOpportunity,
  });
  const result = useQuery({
    queryKey: ['list', module.key, tab, view, page, filter, query],
    queryFn: async ({ signal }) => {
      const path =
        (contacts ? 'contacts' : module.key) +
        queryString({
          ...(!contacts ? { [module.filterKey || 'status']: filter } : {}),
          q: query || undefined,
        });
      if (isOpportunity && view === 'kanban') {
        const data = await allRecords(path, signal);
        return { data, total: data.length, current_page: 1, last_page: 1, per_page: data.length } as Page;
      }
      return api.get<Page>(
        '/' + path + (path.includes('?') ? '&' : '?') + 'page=' + page + '&per_page=20',
        signal,
      );
    },
  });
  const isQuote = module.key === 'quotes',
    isOrganization = module.key === 'organizations';
  const title = isQuote ? 'Devis et propositions' : isOrganization ? 'Clients et contacts' : module.title;
  const description = isQuote
    ? 'Propositions chiffrées à partir du catalogue et de l’inventaire, validées selon les seuils de marge et de remise'
    : isOrganization
      ? 'Référentiel unique des organisations, de leurs interlocuteurs et de leur historique'
      : module.description;
  const create = () => (module.key === 'quotes' ? navigate('/devis/nouveau') : setEditor('new'));
  const filterChanged = (value: string) => {
    setFilter(value);
    setPage(1);
  };
  const searchBox = (
    <form
      className="input-group search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        setQuery(search);
        setPage(1);
      }}
    >
      <Search />
      <Input
        aria-label="Rechercher"
        placeholder={
          isQuote ? 'Numéro, intitulé, client…' : contacts ? 'Nom, e-mail, téléphone…' : 'Nom, référence…'
        }
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => {
          setQuery(search);
          setPage(1);
        }}
      />
    </form>
  );
  let columns: Column<Row>[] = contacts
    ? [
        {
          key: 'name',
          label: 'Contact',
          render: (r: Row) => (
            <>
              <div className="cell-title">{[r.first_name, r.last_name].filter(Boolean).join(' ')}</div>
              <div className="cell-sub">{r.job_title || '—'}</div>
            </>
          ),
        },
        { key: 'org', label: 'Organisation', render: (r: Row) => r.organization?.legal_name || '—' },
        {
          key: 'email',
          label: 'E-mail',
          render: (r: Row) =>
            r.email ? (
              <a href={'mailto:' + r.email} onClick={(e) => e.stopPropagation()}>
                {r.email}
              </a>
            ) : (
              '—'
            ),
        },
        { key: 'phone', label: 'Téléphone', render: (r: Row) => r.phone || '—' },
        {
          key: 'opt_out',
          label: 'Sollicitations',
          render: (r: Row) => <Status value={r.opt_out ? 'Opposition' : 'Autorisées'} />,
        },
      ]
    : module.columns.map((column, index) => ({
        key: column.key,
        label: column.label,
        num: column.format === 'money' || column.format === 'quantity',
        render: (r: Row) =>
          index === 0 ? (
            <>
              <div className="cell-title">
                {module.detail ? (
                  <Link className="record-link" to={'/' + module.path + '/' + r.id}>
                    <Cell row={r} column={column} />
                  </Link>
                ) : (
                  <Cell row={r} column={column} />
                )}
              </div>
              {(r.ref || r.number) && column.key !== 'ref' && column.key !== 'number' && (
                <div className="cell-sub">{r.ref || r.number}</div>
              )}
            </>
          ) : (
            <Cell row={r} column={column} />
          ),
      }));
  if (isQuote)
    columns = [
      {
        key: 'number',
        label: 'Proposition',
        render: (r: Row) => (
          <>
            <Link className="cell-title record-link" to={'/devis/' + r.id}>
              {r.number}
            </Link>
            <div className="cell-sub">{r.title}</div>
          </>
        ),
      },
      {
        key: 'client',
        label: 'Client',
        render: (r: Row) => <span className="small">{r.organization?.legal_name || '—'}</span>,
      },
      { key: 'status', label: 'Statut', render: (r: Row) => <Status value={r.status} /> },
      { key: 'total_ht', label: 'Total HT', num: true, render: (r: Row) => money(r.total_ht) },
      {
        key: 'margin',
        label: 'Marge',
        num: true,
        render: (r: Row) =>
          Number(r.total_ht) > 0
            ? (((Number(r.total_ht) - Number(r.total_cost)) / Number(r.total_ht)) * 100).toLocaleString(
                'fr-FR',
                { maximumFractionDigits: 1 },
              ) + ' %'
            : '—',
      },
      {
        key: 'valid_until',
        label: 'Validité',
        render: (r: Row) => <span className="small nowrap">{date(r.valid_until)}</span>,
      },
      {
        key: 'owner',
        label: 'Responsable',
        render: (r: Row) => (
          <span className="small">{r.owner?.name || (r.owner_id === user?.id ? user?.name : '—')}</span>
        ),
      },
    ];
  if (!contacts && !module.detail && module.updatePermission && can(user, module.updatePermission))
    columns.push({
      key: '_edit',
      label: 'Actions',
      num: false,
      render: (r: Row) => (
        <button
          className="btn btn-ghost btn-icon"
          aria-label={'Modifier ' + (r.label || r.name)}
          onClick={(e) => {
            e.stopPropagation();
            setEditor(r);
          }}
        >
          <Pencil size={16} />
        </button>
      ),
    });
  return (
    <>
      <PageTitle
        title={title}
        description={description}
        actions={
          <>
            {isOpportunity && (
              <Segmented
                label="Affichage"
                value={view}
                onChange={setView}
                options={[
                  { id: 'kanban', label: 'Kanban', icon: <Columns3 /> },
                  { id: 'list', label: 'Liste', icon: <List /> },
                ]}
              />
            )}
            {(module.key.startsWith('erp/') ||
              ['organizations', 'stock-items', 'invoices'].includes(module.key)) && (
              <DownloadButton
                path={
                  '/exports/' +
                  (module.key.startsWith('erp/') ? 'erp-' + module.key.slice(4) : module.key) +
                  '.csv' +
                  queryString({ q: query, ...(filter ? { [module.filterKey || 'status']: filter } : {}) })
                }
                filename={module.path + '.csv'}
                caption="Exporter CSV"
              />
            )}
            {module.createPermission && can(user, module.createPermission) && (
              <button className="btn btn-primary" onClick={create}>
                <Plus />
                {isQuote
                  ? 'Nouveau devis'
                  : isOrganization
                    ? 'Nouvelle organisation'
                    : isOpportunity
                      ? 'Nouvelle opportunité'
                      : 'Créer ' + module.singular}
              </button>
            )}
          </>
        }
      />
      {isOrganization && (
        <Tabs
          value={tab}
          onChange={(value) => {
            setTab(value);
            setPage(1);
            setQuery('');
            setSearch('');
            setFilter('');
          }}
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
      {module.key === 'invoices' && (
        <div className="notice warning">
          Facturation interne : les règlements exigent une validation distincte. Aucune facture fiscale réelle
          n’est certifiée pendant les tests locaux.
        </div>
      )}
      {module.warning && <div className="notice warning">{module.warning}</div>}
      {isQuote && (
        <div className="filter-bar">
          <Segmented
            label="Statut"
            value={filter}
            onChange={filterChanged}
            options={[
              { id: '', label: 'Tous' },
              { id: 'brouillon', label: 'Brouillons' },
              { id: 'soumis', label: 'En validation' },
              { id: 'valide', label: 'Validés' },
              { id: 'envoye', label: 'Envoyés' },
              { id: 'accepte', label: 'Acceptés' },
              { id: 'refuse', label: 'Refusés' },
            ]}
          />
          {searchBox}
        </div>
      )}
      <Card
        flush
        title={
          isOrganization
            ? result.data
              ? result.data.total + ' ' + (contacts ? 'contact(s)' : 'organisation(s)')
              : 'Organisations'
            : undefined
        }
      >
        {!isQuote && (
          <div className="filter-bar" style={{ padding: '0 20px 12px' }}>
            {searchBox}
            {module.filters && !contacts && (
              <Select
                aria-label="Filtrer la liste"
                value={filter}
                onChange={(e) => filterChanged(e.target.value)}
                placeholder="Tous les statuts / catégories"
                options={module.filters.map((value) => ({ value, label: label(value) }))}
              />
            )}
            <button
              className="btn btn-ghost btn-icon"
              aria-label="Actualiser la liste"
              onClick={() => void result.refetch()}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}
        {result.error || stages.error ? (
          <ErrorBox error={result.error || stages.error} retry={() => void result.refetch()} />
        ) : isOpportunity && view === 'kanban' && !result.isLoading && !stages.isLoading ? (
          <CrmPipeline rows={result.data?.data ?? []} stages={stages.data?.data ?? []} />
        ) : (
          <DataTable
            rows={result.data?.data}
            loading={result.isLoading}
            columns={columns}
            caption={title}
            onRowClick={
              module.detail || contacts
                ? (r) =>
                    navigate(
                      '/' +
                        (contacts ? 'clients' : module.path) +
                        '/' +
                        (contacts ? r.organization_id : r.id),
                    )
                : undefined
            }
            empty={<Empty>Ajoutez {module.singular} ou ajustez vos filtres.</Empty>}
          />
        )}
        <Pager page={result.data} change={setPage} />
      </Card>
      {editor && (
        <RecordForm
          title={(editor === 'new' ? 'Créer' : 'Modifier') + ' ' + module.singular}
          fields={module.fields}
          path={'/' + module.key}
          row={editor === 'new' ? undefined : editor}
          close={() => setEditor(null)}
          saved={(r) => {
            if (module.detail) navigate('/' + module.path + '/' + r.id);
          }}
        />
      )}
    </>
  );
}
export function RecordDetail({ module }: { module: Module }) {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editor, setEditor] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const result = useQuery({
    queryKey: ['detail', module.key, id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/${module.key}/${id}`, signal),
  });
  const organizationId = result.data?.data.organization_id;
  const organization = useQuery({
    queryKey: ['related-organization', organizationId],
    queryFn: ({ signal }) => api.get(`/organizations/${organizationId}`, signal),
    enabled:
      Boolean(organizationId) &&
      ['quotes', 'invoices'].includes(module.key) &&
      can(user, 'organizations.view'),
  });
  if (result.isLoading) return <Loading />;
  if (result.error) return <ErrorBox error={result.error} retry={() => void result.refetch()} />;
  const row: Row = {
    ...result.data!.data,
    ...(organization.data ? { organization: organization.data.data } : {}),
  };
  const closed =
    (module.editableStatuses !== undefined && !module.editableStatuses.includes(row.status)) ||
    (module.key === 'quotes' && row.status !== 'brouillon') ||
    (module.key === 'opportunities' && ['gagne', 'perdu'].includes(row.stage_code));
  const title =
    row.legal_name ||
    row.title ||
    row.label ||
    row.number ||
    row.ref ||
    row.reference ||
    row.name ||
    row.plate ||
    row.employee_name ||
    row.code ||
    module.title;
  const fields = [
    ...module.columns,
    ...module.fields
      .filter(
        (field) =>
          !module.columns.some((column) => column.key === field.key) &&
          !field.key.endsWith('_id') &&
          field.type !== 'password' &&
          field.type !== 'rows',
      )
      .map((field) => ({
        key: field.key,
        label: field.label,
        format:
          field.type === 'checkbox'
            ? ('boolean' as const)
            : field.type === 'date'
              ? ('date' as const)
              : undefined,
      })),
  ];
  return (
    <>
      <Link className="back-link" to={`/${module.path}`}>
        <ArrowLeft size={15} />
        {module.title}
      </Link>
      <PageTitle
        title={title}
        description={row.number || row.ref || module.description}
        actions={
          <>
            {(module.pdfResource || ['quotes', 'invoices'].includes(module.key)) && (
              <DownloadButton
                path={`/documents/${module.pdfResource || module.key}/${row.id}.pdf`}
                filename={`${row.number || row.code || row.id}.pdf`}
              />
            )}
            {module.updatePermission && can(user, module.updatePermission) && !closed && (
              <button
                className="button"
                onClick={() =>
                  module.key === 'quotes' ? navigate(`/devis/${row.id}/modifier`) : setEditor(true)
                }
              >
                <Pencil size={16} />
                Modifier
              </button>
            )}
            {module.deletePermission && can(user, module.deletePermission) && (
              <button className="button danger-text" onClick={() => setDeleting(true)}>
                <Trash2 size={16} />
                Supprimer
              </button>
            )}
          </>
        }
      />
      <div className="detail-layout">
        <section className="panel">
          <div className="panel-heading">
            <h2>Informations du dossier</h2>
            {row.status && <Status value={row.status} />}
          </div>
          <dl className="facts">
            {fields.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>
                  <Cell row={row} column={field} />
                </dd>
              </div>
            ))}
          </dl>
          <div className="record-id">
            <strong>Identifiant</strong>
            <code>{row.id}</code>
          </div>
        </section>
        <section className="panel">
          <DetailActions module={module} row={row} />
        </section>
      </div>
      {editor && (
        <RecordForm
          title={`Modifier ${module.singular}`}
          fields={module.fields}
          path={`/${module.key}`}
          row={row}
          close={() => setEditor(false)}
        />
      )}
      <Attachments key={`${module.key}:${row.id}`} entityType={module.key} entityId={row.id} />
      {module.key === 'stock-items' && <StockPurchasePrices id={row.id} />}
      {deleting && (
        <ActionForm
          title={`Supprimer ${module.singular}`}
          close={() => setDeleting(false)}
          submitLabel="Supprimer"
          submit={async () => {
            await api.delete(`/${module.key}/${row.id}`);
            await qc.invalidateQueries();
            navigate(`/${module.path}`);
          }}
        >
          <p>
            Confirmez-vous la suppression de « {title} » ? Le serveur refusera l’opération si le dossier est
            utilisé.
          </p>
        </ActionForm>
      )}
    </>
  );
}
export function ModuleGate({ path, children }: { path: string; children: ReactNode }) {
  const { user } = useAuth();
  const module = byPath(path);
  if (!module || !can(user, `${module.permission}.view`))
    return (
      <>
        <PageTitle title="Accès non autorisé" />
        <div className="notice warning">Votre profil ne permet pas de consulter ce module.</div>
      </>
    );
  return <>{children}</>;
}
