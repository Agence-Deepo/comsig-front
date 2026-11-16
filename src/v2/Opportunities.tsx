import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Columns3, List } from 'lucide-react';
import {
  Button,
  Card,
  DataTable,
  Empty,
  Input,
  PageHeader,
  Select,
  Segmented,
  Tabs,
  Kpi,
  Dl,
} from '../components/ui';
import { api, queryString } from './api';
import { can, date, dateTime, money, label, type Row, type Page } from './types';
import { useAuth } from './auth';
import { ActionForm, ErrorBox, Loading, Pager, Status } from './ui';
import { allRecords, RecordForm } from './forms';
import { modules, type Field } from './modules';
import { useCustomerReferences } from './CustomerReferences';
import { CrmPipeline } from './CrmPipeline';
import { Attachments } from './Attachments';
import { ActivityHistory } from './CustomerHistory';
import ExportButton from './ExportButton';
import OpportunityReminders from './OpportunityReminders';

const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
const lossReasons = [
  'prix',
  'concurrence',
  'calendrier',
  'budget',
  'absence_reponse',
  'indisponibilite_support',
  'decision_reportee',
  'autre',
];
export function OpportunityForm({
  row,
  organizationId,
  close,
  saved,
}: {
  row?: Row;
  organizationId?: string;
  close: () => void;
  saved?: (row: Row) => void;
}) {
  const [org, setOrg] = useState(row?.organization_id || organizationId || '');
  const refs = useCustomerReferences();
  const contacts = useQuery({
    queryKey: ['opportunity-contacts', org],
    queryFn: () => allRecords(`contacts?organization_id=${org}`),
    enabled: !!org,
  });
  const fields: Field[] = [
    { key: 'title', label: 'Intitulé', required: true, maxLength: 200, wide: true },
    {
      key: 'organization_id',
      label: 'Client / prospect',
      lookup: 'organizations',
      type: 'select',
      required: true,
      default: org,
      createOnly: true,
    },
    {
      key: 'primary_contact_id',
      label: 'Interlocuteur principal',
      type: 'select',
      nullable: true,
      options: (contacts.data ?? []).map((c) => ({
        value: c.id,
        label: [c.first_name, c.last_name].filter(Boolean).join(' '),
      })),
    },
    {
      key: 'source',
      label: 'Source d’acquisition',
      type: 'select',
      nullable: true,
      options: (refs.data?.data ?? [])
        .filter((r) => r.list === 'source')
        .map((r) => ({ value: r.code, label: r.label })),
    },
    {
      key: 'offer_type',
      label: 'Type de prestation',
      type: 'select',
      options: [
        'affichage',
        'campagne',
        'signaletique',
        'maintenance',
        'geomarketing',
        'conseil',
        ...(row?.offer_type ? [row.offer_type] : []),
      ].filter((v, i, a) => a.indexOf(v) === i),
      required: true,
    },
    { key: 'amount', label: 'Montant estimé (FCFA)', type: 'number', min: 0, max: 1000000000000, step: '1' },
    {
      key: 'estimated_margin_pct',
      label: 'Marge estimée (%)',
      type: 'number',
      min: 0,
      max: 100,
      nullable: true,
    },
    {
      key: 'expected_close_date',
      label: 'Date de conclusion prévue',
      type: 'date',
      required: true,
      default: day(45),
    },
    { key: 'need', label: 'Besoin identifié', type: 'textarea', nullable: true, maxLength: 4000, wide: true },
    {
      key: 'next_step',
      label: 'Prochaine action',
      nullable: true,
      maxLength: 300,
      default: 'Premier contact',
    },
    {
      key: 'next_step_date',
      label: 'Date de prochaine action',
      type: 'date',
      nullable: true,
      default: day(3),
    },
  ];
  return (
    <RecordForm
      title={row ? 'Modifier l’opportunité' : 'Nouvelle opportunité'}
      fields={fields}
      path="/opportunities"
      row={row}
      close={close}
      saved={saved}
      onValuesChange={(values) => setOrg(String(values.organization_id ?? org))}
    />
  );
}

export function StageMove({ row, stage, close }: { row: Row; stage: Row; close: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [proof, setProof] = useState('');
  const gates = useQuery({
    queryKey: ['opportunity-gates', row.id, stage.code],
    queryFn: () => api.get<{ data: Row[] }>(`/opportunities/${row.id}/gates/${stage.code}`),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const docs = useQuery({
    queryKey: ['opportunity-proofs', row.id],
    queryFn: () => api.get<{ data: Row[] }>(`/attachments?entity_type=opportunities&entity_id=${row.id}`),
    enabled: stage.code === 'gagne',
  });
  const issues = gates.data?.data ?? [];
  const request = !can(user, 'opportunities.validate') && issues.some((i) => i.derogable) && !stage.is_closed;
  return (
    <ActionForm
      title={`Passer à « ${stage.label} »`}
      close={close}
      submitLabel={request ? 'Demander une dérogation' : 'Confirmer'}
      submit={async (form) => {
        if (gates.isLoading || gates.error)
          throw new Error('Vérification des critères indisponible. Réessayez.');
        const b = Object.fromEntries(form);
        await api.post(`/opportunities/${row.id}/${request ? 'derogations' : 'stage'}`, {
          ...b,
          stage_code: stage.code,
          ...(request ? { justification: b.derogation } : {}),
        });
        await qc.invalidateQueries();
      }}
    >
      <p>
        {row.ref} — {row.title}
      </p>
      <ErrorBox error={gates.error} retry={() => void gates.refetch()} />
      {gates.isLoading ? (
        <Loading />
      ) : issues.length ? (
        <div className="notice warning">
          <ul>
            {issues.map((i, n) => (
              <li key={n}>
                {i.message}
                {i.derogable ? ' (dérogation possible)' : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="small">
          Les critères contrôlés sont remplis. La vérification sera refaite à la confirmation.
        </p>
      )}
      {stage.code === 'gagne' && (
        <>
          <label className="field">
            Preuve d’engagement
            <select
              aria-label="Preuve d’engagement"
              name="won_proof_type"
              required
              value={proof}
              onChange={(e) => setProof(e.target.value)}
            >
              <option value="">Choisir…</option>
              <option value="devis_accepte">Devis accepté lié à cette affaire</option>
              <option value="contrat_signe">Contrat signé</option>
              <option value="bon_commande">Bon de commande</option>
            </select>
          </label>
          {['contrat_signe', 'bon_commande'].includes(proof) && (
            <label className="field">
              Document justificatif
              <select aria-label="Document justificatif" name="won_proof_document_id" required>
                <option value="">Choisir une pièce active…</option>
                {docs.data?.data
                  .filter((d) => d.kind === (proof === 'contrat_signe' ? 'contrat' : 'bon_commande'))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.filename}
                    </option>
                  ))}
              </select>
              <span className="field-hint">
                Déposez d’abord le document dans l’onglet Documents. Déclaration d’une preuve externe, pas une
                signature électronique.
              </span>
            </label>
          )}
          <ErrorBox error={docs.error} />
        </>
      )}
      {['perdu', 'suspendu'].includes(stage.code) && (
        <>
          <label className="field">
            Motif normalisé
            <select aria-label="Motif normalisé" name="lost_reason" required>
              <option value="">Choisir…</option>
              {lossReasons.map((r) => (
                <option key={r} value={r}>
                  {r.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Commentaire
            <textarea name="lost_comment" maxLength={2000} />
          </label>
          <label className="field">
            Concurrent
            <input name="competitor" maxLength={120} />
          </label>
          {stage.code === 'suspendu' && (
            <label className="field">
              Date de réactivation prévue
              <input
                aria-label="Date de réactivation prévue"
                type="date"
                name="reactivation_date"
                min={day(1)}
                required
              />
              <span className="field-hint">
                Rappel visible dans le dossier ; aucune sollicitation automatique.
              </span>
            </label>
          )}
        </>
      )}
      {(issues.some((i) => i.derogable) || row.stage?.is_closed) && (
        <label className="field">
          Justification de la dérogation / réouverture
          <textarea name="derogation" required minLength={10} maxLength={1000} />
        </label>
      )}
    </ActionForm>
  );
}

export default function Opportunities() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [search, setSearch] = useState(sp.get('q') ?? '');
  const [create, setCreate] = useState(false);
  const view = sp.get('view') ?? 'kanban';
  const params = Object.fromEntries(sp);
  params.view = view;
  params.status = view === 'kanban' ? 'ouvertes' : (sp.get('status') ?? 'ouvertes');
  const set = (values: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(values)) v ? next.set(k, v) : next.delete(k);
    if (!('page' in values)) next.delete('page');
    setSp(next);
  };
  const q = useQuery({
    queryKey: ['opportunities', params],
    queryFn: () =>
      api.get<Page & { stage_totals: Row[]; board_limit_per_stage?: number }>(
        '/opportunities' + queryString(params),
      ),
  });
  const stages = useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: () => api.get<{ data: Row[] }>('/pipeline/stages'),
  });
  const options = useQuery({
    queryKey: ['opportunity-options'],
    queryFn: () => api.get<{ data: Row }>('/opportunities/options'),
  });
  const refs = useCustomerReferences();
  const totals = q.data?.stage_totals ?? [];
  return (
    <>
      <PageHeader
        title="Opportunités"
        subtitle="Pipeline commercial — de la prospection à la décision"
        actions={
          <>
            <Segmented
              label="Affichage"
              value={view}
              onChange={(v) => set({ view: v })}
              options={[
                { id: 'kanban', label: 'Kanban', icon: <Columns3 /> },
                { id: 'list', label: 'Liste', icon: <List /> },
              ]}
            />
            <ExportButton
              path={'/opportunities.csv' + queryString({ ...params, view: 'list' })}
              filename="opportunites.csv"
            />
            {can(user, 'opportunities.create') && (
              <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>
                Nouvelle opportunité
              </Button>
            )}
          </>
        }
      />
      <div className="filter-bar opportunity-filters">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            set({ q: search });
          }}
        >
          <Input
            aria-label="Rechercher"
            placeholder="Opportunité, client, référence…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => set({ q: search })}
          />
        </form>
        {user?.role.data_scope !== 'own' && (
          <Select
            aria-label="Commercial"
            placeholder="Tous les commerciaux"
            value={sp.get('owner_id') ?? ''}
            onChange={(e) => set({ owner_id: e.target.value })}
            options={(options.data?.data.owners ?? []).map((o: Row) => ({ value: o.id, label: o.name }))}
          />
        )}
        <Select
          aria-label="Offre"
          placeholder="Toutes offres"
          value={sp.get('offer_type') ?? ''}
          onChange={(e) => set({ offer_type: e.target.value })}
          options={[
            ...new Set<string>([
              ...(options.data?.data.offer_types ?? []),
              ...(options.data?.data.offers ?? []),
            ]),
          ].map((value) => ({ value, label: value }))}
        />
        {['sector', 'commune'].map((field) => (
          <Select
            key={field}
            aria-label={field === 'sector' ? 'Secteur' : 'Commune'}
            placeholder={field === 'sector' ? 'Tous secteurs' : 'Toutes communes'}
            value={sp.get(field) ?? ''}
            onChange={(e) => set({ [field]: e.target.value })}
            options={(refs.data?.data ?? [])
              .filter((r) => r.list === field)
              .map((r) => ({ value: r.code, label: r.label }))}
          />
        ))}
        <Select
          aria-label="Montant minimum"
          placeholder="Tout montant"
          value={sp.get('min_amount') ?? ''}
          onChange={(e) => set({ min_amount: e.target.value })}
          options={['1000000', '5000000', '10000000', '25000000'].map((v) => ({
            value: v,
            label: '≥ ' + money(v),
          }))}
        />
        <label className="field">
          Clôture avant
          <input
            aria-label="Clôture avant"
            type="date"
            value={sp.get('close_to') ?? ''}
            onChange={(e) => set({ close_to: e.target.value })}
          />
        </label>
        {can(user, 'activities.view') && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={sp.get('inactive') === '1'}
              onChange={(e) => set({ inactive: e.target.checked ? '1' : '' })}
            />
            Sans échange depuis 14 jours
          </label>
        )}
        {view === 'list' && (
          <>
            <Select
              aria-label="Statut"
              value={params.status}
              onChange={(e) => set({ status: e.target.value })}
              options={[
                { value: 'ouvertes', label: 'Ouvertes' },
                { value: 'gagnees', label: 'Gagnées' },
                { value: 'perdues', label: 'Perdues / suspendues' },
                { value: 'toutes', label: 'Toutes' },
              ]}
            />
            <Select
              aria-label="Étape"
              placeholder="Toutes étapes"
              value={sp.get('stage') ?? ''}
              onChange={(e) => set({ stage: e.target.value })}
              options={(stages.data?.data ?? []).map((s) => ({ value: s.code, label: s.label }))}
            />
          </>
        )}
      </div>
      {q.data && <p className="small secondary" aria-live="polite">
        {q.data.total} affaire(s) filtrée(s) · brut{' '}
        {money(totals.reduce((s, r) => s + Number(r.gross), 0))} · pondéré{' '}
        {money(totals.reduce((s, r) => s + Number(r.total_weighted), 0))}. Montants d’opportunités, pas
        chiffre d’affaires facturé.
      </p>}
      <ErrorBox
        error={q.error || stages.error || options.error || refs.error}
        retry={() => void q.refetch()}
      />
      {q.isLoading || stages.isLoading ? (
        <Loading />
      ) : view === 'kanban' ? (
        <>
          <CrmPipeline rows={q.data?.data ?? []} stages={stages.data?.data ?? []} totals={totals} />
          <p className="small muted">
            Jusqu’à 20 cartes par étape. Les compteurs et montants portent sur tous les résultats filtrés ;
            ouvrez la liste d’une étape pour les autres affaires.
          </p>
        </>
      ) : (
        <Card flush>
          <DataTable<Row>
            rowClass={() => 'opportunity-list-row'}
            rows={q.data?.data}
            onRowClick={(r) => nav('/opportunites/' + r.id)}
            sort={{ key: sp.get('sort') ?? 'stage', dir: (sp.get('dir') ?? 'asc') as 'asc' | 'desc' }}
            onSort={(key) =>
              set({ sort: key, dir: sp.get('sort') === key && sp.get('dir') !== 'desc' ? 'desc' : 'asc' })
            }
            columns={[
              {
                key: 'title',
                label: 'Opportunité',
                sortable: true,
                render: (r) => (
                  <>
                    <strong>{r.title}</strong>
                    <div className="cell-sub">
                      {r.ref} · {r.organization?.legal_name}
                    </div>
                  </>
                ),
              },
              {
                key: 'stage',
                label: 'Étape',
                mobile: 'label',
                sortable: true,
                render: (r) => <Status value={r.stage_code} />,
              },
              {
                key: 'amount',
                label: 'Montant HT',
                mobile: 'label',
                sortable: true,
                render: (r) => money(r.amount),
              },
              {
                key: 'weighted',
                label: 'Pondéré',
                mobile: 'hide',
                sortable: true,
                render: (r) => money(r.weighted),
              },
              {
                key: 'close',
                label: 'Clôture',
                mobile: 'label',
                sortable: true,
                render: (r) => date(r.expected_close_date),
              },
              {
                key: 'owner',
                label: 'Responsable',
                mobile: 'hide',
                sortable: true,
                render: (r) => r.owner?.name,
              },
              {
                key: 'activity',
                label: 'Dernier échange',
                mobile: 'hide',
                sortable: can(user, 'activities.view'),
                render: (r) => dateTime(r.last_activity_at),
              },
            ]}
            empty={<Empty title="Aucune opportunité" />}
          />
          <Pager page={q.data} change={(page) => set({ page: String(page) })} />
        </Card>
      )}
      {create && (
        <OpportunityForm close={() => setCreate(false)} saved={(r) => nav('/opportunites/' + r.id)} />
      )}
    </>
  );
}

export function OpportunityDetail() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') ?? 'summary';
  const [modal, setModal] = useState<string | null>(null);
  const [move, setMove] = useState<Row | null>(null);
  const q = useQuery({
    queryKey: ['opportunity-detail', id],
    queryFn: () => api.get<Row>('/opportunities/' + id),
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} retry={() => void q.refetch()} />;
  const d = q.data!;
  const o = d.data;
  const closed = o.stage?.is_closed;
  const editable = can(user, 'opportunities.update') && !closed;
  const next = d.stages.find((s: Row) => !s.is_closed && s.sort_order > o.stage.sort_order);
  const activityFields = modules
    .find((m) => m.key === 'activities')!
    .fields.map((f) => ({
      ...f,
      ...(f.key === 'organization_id'
        ? { default: o.organization_id }
        : f.key === 'opportunity_id'
          ? { default: id }
          : f.key === 'contact_id'
            ? { default: o.primary_contact_id }
            : f.key === 'kind'
              ? { default: modal === 'relance' ? 'relance' : modal === 'task' ? 'tache' : 'appel' }
              : f.key === 'status'
                ? { default: modal === 'interaction' ? 'termine' : 'a_faire' }
                : {}),
    }));
  const tabs = [
    { id: 'summary', label: 'Vue d’ensemble' },
    { id: 'brief', label: 'Brief et faisabilité' },
    ...(can(user, 'activities.view') ? [{ id: 'activities', label: 'Activités' }] : []),
    ...(can(user, 'quotes.view') ? [{ id: 'quotes', label: 'Propositions' }] : []),
    { id: 'docs', label: 'Documents' },
    { id: 'history', label: 'Historique' },
    { id: 'approvals', label: 'Dérogations' },
  ];
  return (
    <>
      <Link className="back-link" to="/opportunites">
        ← Opportunités
      </Link>
      <PageHeader
        title={o.title}
        subtitle={
          <>
            {o.ref} · <Link to={'/clients/' + o.organization_id}>{o.organization?.legal_name}</Link> ·{' '}
            {o.owner?.name} · <Status value={o.stage_code} />
          </>
        }
        actions={
          <>
            {editable && <Button onClick={() => setModal('edit')}>Modifier</Button>}
            {editable && next && (
              <Button variant="primary" onClick={() => setMove(next)}>
                Passer à « {next.label} »
              </Button>
            )}
            {closed && can(user, 'opportunities.validate') && (
              <Button onClick={() => setMove(d.stages.find((s: Row) => s.code === 'qualifie'))}>
                Rouvrir
              </Button>
            )}
          </>
        }
      />
      <Card>
        <div className="stepper" aria-label={'Étape actuelle : ' + o.stage?.label}>
          {d.stages
            .filter((s: Row) => !s.is_closed)
            .map((s: Row) => (
              <div
                key={s.code}
                className={
                  'step ' +
                  (s.code === o.stage_code ? 'current' : s.sort_order < o.stage.sort_order ? 'done' : '')
                }
              >
                <div className="step-bar" />
                <div className="step-label">{s.label}</div>
              </div>
            ))}
        </div>
        {editable && (
          <div className="row-wrap" style={{ marginTop: 14 }}>
            <span className="small muted">Clôturer :</span>
            {d.stages
              .filter((s: Row) => s.is_closed)
              .map((s: Row) => (
                <Button size="sm" key={s.code} onClick={() => setMove(s)}>
                  {s.label}
                </Button>
              ))}
            <Select
              aria-label="Aller à une étape"
              className="opportunity-stage-select"
              value=""
              placeholder="Autre étape…"
              onChange={(e) => setMove(d.stages.find((s: Row) => s.code === e.target.value) ?? null)}
              options={d.stages
                .filter((s: Row) => !s.is_closed && s.code !== o.stage_code)
                .map((s: Row) => ({ value: s.code, label: s.label }))}
            />
          </div>
        )}
        {closed && (
          <p className="notice info">
            {o.stage.label} · {o.closed_at ? dateTime(o.closed_at) : 'Date historique non renseignée'}
            {o.lost_reason && ' · Motif : ' + o.lost_reason}
            {o.lost_comment && ' — ' + o.lost_comment}
            {o.reactivation_date && ' · Réactivation prévue : ' + date(o.reactivation_date)}
          </p>
        )}
      </Card>
      <div className="row-wrap" role="toolbar" aria-label="Actions rapides">
        {editable && can(user, 'activities.create') && (
          <>
            {[
              ['interaction', 'Consigner une interaction'],
              ['relance', 'Programmer une relance'],
              ['task', 'Créer une tâche'],
            ].map(([key, label]) => (
              <Button key={key} size="sm" onClick={() => setModal(key)}>
                {label}
              </Button>
            ))}
          </>
        )}
        {!closed && can(user, 'quotes.create') && (
          <>
            <Link
              className="button"
              to={`/devis/nouveau?client=${o.organization_id}&opportunite=${id}&contact=${o.primary_contact_id ?? ''}`}
            >
              Préparer une proposition
            </Link>
            <Link
              className="button"
              to={`/devis/nouveau?client=${o.organization_id}&opportunite=${id}&contact=${o.primary_contact_id ?? ''}&type=proforma`}
            >
              Facture proforma
            </Link>
          </>
        )}
        <Link className="button" to={'/calendrier?opportunity_id=' + id}>
          Agenda de l’affaire
        </Link>
      </div>
      <div className="split opportunity-detail">
        <div className="stack-lg" style={{ minWidth: 0 }}>
          <Tabs value={tab} onChange={(t) => setSp({ tab: t })} tabs={tabs} />
          {tab === 'summary' && (
            <>
              <Card title="Besoin et prochaine étape">
                <p style={{ whiteSpace: 'pre-wrap' }}>{o.need || 'Besoin non décrit.'}</p>
                <Dl
                  items={[
                    ['Prochaine étape', o.next_step],
                    ['Date prévue', date(o.next_step_date)],
                    ['Dernier échange', dateTime(o.last_activity_at)],
                    ['Source', o.source],
                  ]}
                />
              </Card>
              <OpportunityRelated id={id} resource="activities" enabled={can(user, 'activities.view')} />
            </>
          )}
          {tab === 'brief' && <BriefAndFeasibility data={d} editable={editable} />}
          {tab === 'activities' && can(user, 'activities.view') && (
            <><OpportunityReminders id={id} canCreate={editable && can(user, 'activities.create')} /><ActivityHistory id={id} contacts={d.contact ? [d.contact] : []} opportunity /></>
          )}
          {tab === 'quotes' && (
            <OpportunityRelated id={id} resource="quotes" enabled={can(user, 'quotes.view')} />
          )}
          {tab === 'docs' && <Attachments entityType="opportunities" entityId={id} />}
          {tab === 'history' && <OpportunityHistory id={id} />}
          {tab === 'approvals' && <Derogations id={id} />}
        </div>
        <aside className="stack-lg">
          <Card title="Valeur">
            <Kpi label="Montant estimé HT" value={money(o.amount)} />
            <Dl
              items={[
                ['Probabilité d’étape', o.probability + ' %'],
                ['Montant pondéré', money(o.weighted)],
                [
                  'Marge estimée',
                  o.estimated_margin_pct == null ? 'Non renseignée' : o.estimated_margin_pct + ' %',
                ],
                ['Clôture prévue', date(o.expected_close_date)],
                ['Entrée dans l’étape', dateTime(o.stage_entered_at)],
              ]}
            />
          </Card>
          <Card title="Client">
            <Link to={'/clients/' + o.organization_id}>{o.organization?.legal_name}</Link>
            <Dl
              items={[
                [
                  'Interlocuteur',
                  d.contact
                    ? [d.contact.first_name, d.contact.last_name].filter(Boolean).join(' ')
                    : 'Non désigné',
                ],
                ['Fonction', d.contact?.job_title],
                ['E-mail', d.contact?.email],
                ['Téléphone', d.contact?.mobile || d.contact?.phone],
              ]}
            />
            {d.contact?.opt_out && <div className="notice warning">Opposition aux sollicitations</div>}
          </Card>
        </aside>
      </div>
      {modal === 'edit' && <OpportunityForm row={o} close={() => setModal(null)} />}
      {['interaction', 'relance', 'task'].includes(modal ?? '') && (
        <RecordForm
          title={
            modal === 'interaction'
              ? 'Consigner une interaction'
              : modal === 'relance'
                ? 'Programmer une relance'
                : 'Créer une tâche'
          }
          fields={activityFields}
          path="/activities"
          close={() => setModal(null)}
        />
      )}
      {move && <StageMove row={o} stage={move} close={() => setMove(null)} />}
    </>
  );
}

function OpportunityRelated({ id, resource, enabled }: { id: string; resource: string; enabled: boolean }) {
  const [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ['opportunity-related', id, resource, page],
    queryFn: () => api.get<Page>(`/opportunities/${id}/related/${resource}?page=${page}`),
    enabled,
  });
  if (!enabled) return null;
  return (
    <Card title={resource === 'quotes' ? 'Propositions liées' : 'Prochaines actions et historique'}>
      <ErrorBox error={q.error} />
      <DataTable<Row>
        rows={q.data?.data}
        loading={q.isLoading}
        columns={[
          {
            key: 'title',
            label: 'Dossier',
            render: (r) => (
              <Link to={'/' + (resource === 'quotes' ? 'devis' : 'activites') + '/' + r.id}>{r.title}</Link>
            ),
          },
          { key: 'status', label: 'Statut', mobile: 'label', render: (r) => <Status value={r.status} /> },
          {
            key: 'date',
            label: resource === 'quotes' ? 'Total HT' : 'Échéance',
            mobile: 'label',
            render: (r) => (resource === 'quotes' ? money(r.total_ht) : dateTime(r.due_at)),
          },
        ]}
      />
      <Pager page={q.data} change={setPage} />
    </Card>
  );
}
function OpportunityHistory({ id }: { id: string }) {
  const fields: Record<string, string> = {
    stage_code: 'Étape',
    probability: 'Probabilité',
    amount: 'Montant HT',
    title: 'Intitulé',
    need: 'Besoin',
    primary_contact_id: 'Interlocuteur',
    next_step: 'Prochaine action',
    next_step_date: 'Date de prochaine action',
    expected_close_date: 'Clôture prévue',
    brief: 'Brief de découverte',
    brief_status: 'Statut du brief',
    feasibility_status: 'Faisabilité',
    feasibility_notes: 'Hypothèses et réserves',
    stage_entered_at: 'Entrée dans l’étape',
    qualified_at: 'Qualification',
    closed_at: 'Clôture',
    won_at: 'Gain',
  };
  const value = (field: string, v: unknown) =>
    v == null
      ? '—'
      : field === 'amount'
        ? money(v)
        : field === 'probability'
          ? v + ' %'
          : field.endsWith('_at')
            ? dateTime(v)
            : field.endsWith('_date')
              ? date(v)
              : ['stage_code', 'brief_status', 'feasibility_status'].includes(field)
                ? label(v)
                : String(v);
  const [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ['opportunity-history', id, page],
    queryFn: () => api.get<Page>(`/opportunities/${id}/history?page=${page}`),
  });
  return (
    <Card title="Historique des changements">
      <p className="small muted">
        Seuls les événements enregistrés depuis P04 sont datés ; aucune ancienne date de clôture n’est
        reconstituée.
      </p>
      <ErrorBox error={q.error} />
      {q.isLoading ? (
        <Loading />
      ) : (
        q.data?.data.map((h) => (
          <div className="tl-item" key={h.id}>
            <span className="tl-icon" aria-hidden>
              ↔
            </span>
            <div style={{ minWidth: 0 }}>
              <strong>
                {h.field === 'brief'
                  ? 'Brief de découverte mis à jour'
                  : `${fields[h.field] ?? h.field} : ${value(h.field, h.old_value)} → ${value(h.field, h.new_value)}`}
              </strong>
              <div className="tl-meta">
                {dateTime(h.created_at)} · {h.actor_name}
              </div>
              {h.justification && <p>{h.justification}</p>}
            </div>
          </div>
        ))
      )}
      <Pager page={q.data} change={setPage} />
    </Card>
  );
}
function BriefAndFeasibility({ data, editable }: { data: Row; editable: boolean }) {
  const o = data.data;
  const [edit, setEdit] = useState<string | null>(null);
  const qc = useQueryClient();
  return (
    <>
      <Card
        title="Brief de découverte"
        actions={
          editable && (
            <Button size="sm" onClick={() => setEdit('brief')}>
              Modifier le brief
            </Button>
          )
        }
      >
        <Status value={o.brief_status} />
        <Dl
          items={Object.entries(data.brief_fields).map(([k, v]) => [
            String(v) + (data.brief_required.includes(k) ? ' *' : ''),
            o.brief?.[k],
          ])}
        />
      </Card>
      <Card
        title="Faisabilité et chiffrage"
        actions={
          editable && (
            <Button size="sm" onClick={() => setEdit('feasibility')}>
              Modifier la faisabilité
            </Button>
          )
        }
      >
        <Status value={o.feasibility_status} />
        <p>
          {o.feasibility_notes || 'Non évaluée : disponibilité, contraintes, coûts et délais à vérifier.'}
        </p>
      </Card>
      {edit && (
        <ActionForm
          title={edit === 'brief' ? 'Brief de découverte' : 'Faisabilité et chiffrage'}
          close={() => setEdit(null)}
          submitLabel="Enregistrer"
          submit={async (form) => {
            await api.put(
              `/opportunities/${o.id}/${edit}`,
              edit === 'brief'
                ? {
                    brief: Object.fromEntries(Object.keys(data.brief_fields).map((k) => [k, form.get(k)])),
                    validate: form.get('validate') === 'on',
                  }
                : Object.fromEntries(form),
            );
            await qc.invalidateQueries();
          }}
        >
          {edit === 'brief' ? (
            <>
              {Object.entries(data.brief_fields).map(([k, v]) => (
                <label className="field" key={k}>
                  {String(v)}
                  {data.brief_required.includes(k) ? ' *' : ''}
                  <textarea name={k} defaultValue={o.brief?.[k] ?? ''} maxLength={2000} />
                </label>
              ))}
              <label className="checkbox">
                <input name="validate" type="checkbox" defaultChecked={o.brief_status === 'valide'} />
                Brief validé avec le client
              </label>
            </>
          ) : (
            <>
              <label className="field">
                Statut
                <select aria-label="Statut" name="feasibility_status" defaultValue={o.feasibility_status}>
                  {['non_evaluee', 'en_cours', 'confirmee', 'avec_reserve', 'impossible'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Hypothèses, réserves, coûts
                <textarea
                  name="feasibility_notes"
                  required
                  maxLength={3000}
                  defaultValue={o.feasibility_notes ?? ''}
                />
              </label>
            </>
          )}
        </ActionForm>
      )}
    </>
  );
}
function Derogations({ id }: { id: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [decision, setDecision] = useState<Row | null>(null);
  const q = useQuery({
    queryKey: ['opportunity-derogations', id],
    queryFn: () => api.get<{ data: Row[] }>(`/opportunities/${id}/derogations`),
  });
  return (
    <Card title="Demandes de dérogation">
      <ErrorBox error={q.error} />
      {q.isLoading ? (
        <Loading />
      ) : !q.data?.data.length ? (
        <Empty title="Aucune demande" />
      ) : (
        q.data.data.map((d) => (
          <div key={d.id} className="panel">
            <strong>
              {d.stage_code} · {d.status}
            </strong>
            <p>{d.justification}</p>
            <p>{d.decision_reason}</p>
            {d.status === 'en_attente' &&
              can(user, 'opportunities.validate') &&
              d.requested_by !== user?.id && <Button onClick={() => setDecision(d)}>Examiner</Button>}
          </div>
        ))
      )}
      {decision && (
        <ActionForm
          title="Décider la dérogation"
          close={() => setDecision(null)}
          submit={async (form) => {
            await api.post(`/opportunities/${id}/derogations/${decision.id}`, {
              approve: form.get('decision') === 'approve',
              reason: form.get('reason'),
            });
            await qc.invalidateQueries();
          }}
        >
          <label className="field">
            Décision
            <select aria-label="Décision" name="decision">
              <option value="reject">Refuser</option>
              <option value="approve">Approuver et changer d’étape</option>
            </select>
          </label>
          <label className="field">
            Motif de décision
            <textarea name="reason" required minLength={10} maxLength={1000} />
          </label>
        </ActionForm>
      )}
    </Card>
  );
}
