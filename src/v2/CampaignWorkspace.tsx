import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CalendarRange, Calculator, Camera, CheckCircle2, Plus } from 'lucide-react';

import { Card, DataTable, Badge, type Column } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { referenceLabel, useOptions } from './forms';
import { byPath } from './modules';
import { RecordDetail } from './Records';
import { can, date, label, money, today, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, Status } from './ui';

const campaignModule = byPath('campagnes')!;

function ReservationForm({ campaign, close }: { campaign: Row; close: () => void }) {
  const qc = useQueryClient();
  const supports = useOptions('erp/supports');

  return (
    <ActionForm
      title="Réserver une face"
      submitLabel="Réserver"
      close={close}
      submit={async (form) => {
        await api.post('/erp/reservations', {
          ...Object.fromEntries(form),
          campaign_id: campaign.id,
        });
        await qc.invalidateQueries({ queryKey: ['campaign-reservations', campaign.id] });
      }}
    >
      <ErrorBox error={supports.error} retry={() => void supports.refetch()} />
      <p className="muted">
        La période doit rester comprise entre le {date(campaign.starts_on)} et le {date(campaign.ends_on)}. Le
        serveur refusera tout chevauchement sur la même face.
      </p>
      <div className="form-grid">
        <label className="field wide">
          Face publicitaire *
          <select name="support_id" required defaultValue="" disabled={supports.isLoading}>
            <option value="">{supports.isLoading ? 'Chargement…' : 'Sélectionner une face'}</option>
            {supports.data
              ?.filter((support) => support.is_active !== false)
              .map((support) => (
                <option key={support.id} value={support.id}>
                  {referenceLabel(support)}
                  {support.municipality ? ` — ${support.municipality}` : ''}
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          Début réservé *
          <input name="starts_on" type="date" required defaultValue={campaign.starts_on} />
        </label>
        <label className="field">
          Fin réservée *
          <input name="ends_on" type="date" required defaultValue={campaign.ends_on} />
        </label>
        <label className="field">
          Montant convenu (FCFA) *
          <input name="amount" type="number" min="0" step="1" required />
        </label>
        <label className="field wide">
          Observation
          <textarea name="notes" maxLength={2000} />
        </label>
      </div>
    </ActionForm>
  );
}

function CampaignProofs({ campaign, reservations }: { campaign: Row; reservations: Row[] }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [closing, setClosing] = useState(false);
  const proofs = useQuery({
    queryKey: ['campaign-proofs', campaign.id],
    queryFn: ({ signal }) =>
      api.get<{ data: Row[]; meta: { closable: boolean; campaign_status: string } }>(
        `/erp/campaigns/${campaign.id}/proofs`,
        signal,
      ),
  });
  const editable = ['planifie', 'en_cours'].includes(campaign.status) && can(user, 'campaigns.update');
  const reserved = reservations.filter((item) => item.status === 'reserve');
  const proofFor = (supportId: string) =>
    proofs.data?.data.find(
      (proof) => proof.support_id === supportId && proof.kind === 'pose' && proof.status === 'conforme',
    );
  const columns: Column<Row>[] = [
    { key: 'taken_on', label: 'Date', render: (proof) => date(proof.taken_on) },
    {
      key: 'kind',
      label: 'Type',
      render: (proof) =>
        ({ pose: 'Pose', depose: 'Dépose', controle: 'Contrôle', incident: 'Incident' })[
          proof.kind as string
        ] ?? proof.kind,
    },
    { key: 'support_label', label: 'Face' },
    { key: 'status', label: 'Constat', render: (proof) => <Status value={proof.status} /> },
    { key: 'comment', label: 'Commentaire' },
  ];
  return (
    <>
      <Card
        className="campaign-proofs"
        title={
          <span className="card-title-icon">
            <Camera size={18} />
            Preuves d’exécution
          </span>
        }
        sub="Une preuve de pose conforme par face réservée est exigée avant la clôture."
        actions={
          editable ? (
            <button className="button" onClick={() => setAdding(true)}>
              <Plus size={16} />
              Ajouter une preuve
            </button>
          ) : undefined
        }
        flush
      >
        <ErrorBox error={proofs.error} retry={() => void proofs.refetch()} />
        <div className="panel-body">
          <ul className="proof-coverage">
            {reserved.length ? (
              reserved.map((reservation) => {
                const proof = proofFor(reservation.support_id);
                return (
                  <li key={reservation.id} className={proof ? 'ok' : 'missing'}>
                    {proof ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                    <span>
                      {reservation.support_label || 'Face'} —{' '}
                      {proof ? `preuve conforme du ${date(proof.taken_on)}` : 'preuve de pose manquante'}
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="missing">Aucune face réservée : la clôture restera impossible.</li>
            )}
          </ul>
        </div>
        <DataTable
          columns={columns}
          rows={proofs.data?.data}
          loading={proofs.isLoading}
          caption="Preuves de la campagne"
          empty={<Empty>Aucune preuve enregistrée pour cette campagne.</Empty>}
        />
        {campaign.status === 'en_cours' && can(user, 'campaigns.update') && (
          <div className="panel-body">
            <button
              className="button primary"
              disabled={!proofs.data?.meta.closable}
              onClick={() => setClosing(true)}
            >
              Clôturer avec bilan
            </button>
            {!proofs.data?.meta.closable && (
              <p className="muted">
                Ajoutez une preuve de pose conforme pour chaque face réservée avant de clôturer.
              </p>
            )}
          </div>
        )}
        {campaign.status === 'termine' && campaign.closing_report && (
          <div className="panel-body">
            <h3>Bilan de clôture</h3>
            <p className="preserve">{campaign.closing_report}</p>
            {campaign.lessons && <p className="preserve">Enseignements : {campaign.lessons}</p>}
            {campaign.satisfaction && <p>Satisfaction client : {campaign.satisfaction}/5</p>}
            <p className="xsmall muted">Clôturée le {date(campaign.closed_on)}.</p>
          </div>
        )}
      </Card>
      {adding && (
        <ActionForm
          title="Ajouter une preuve d’exécution"
          submitLabel="Enregistrer la preuve"
          close={() => setAdding(false)}
          submit={async (form) => {
            await api.post(`/erp/campaigns/${campaign.id}/proofs`, Object.fromEntries(form));
            await qc.invalidateQueries({ queryKey: ['campaign-proofs', campaign.id] });
          }}
        >
          <div className="form-grid">
            <label className="field">
              Type *
              <select name="kind" required defaultValue="pose">
                <option value="pose">Pose</option>
                <option value="controle">Contrôle</option>
                <option value="depose">Dépose</option>
                <option value="incident">Incident</option>
              </select>
            </label>
            <label className="field">
              Constat *
              <select name="status" required defaultValue="conforme">
                <option value="conforme">Conforme</option>
                <option value="non_conforme">Non conforme</option>
                <option value="a_reprendre">À reprendre</option>
              </select>
            </label>
            <label className="field wide">
              Face concernée
              <select name="support_id" defaultValue="">
                <option value="">Toute la campagne</option>
                {reserved.map((reservation) => (
                  <option key={reservation.id} value={reservation.support_id}>
                    {reservation.support_label || 'Face'}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Date du constat *
              <input name="taken_on" type="date" required defaultValue={today()} max={today()} />
            </label>
            <label className="field wide">
              Commentaire
              <textarea
                name="comment"
                maxLength={2000}
                placeholder="Obligatoire si le constat n’est pas conforme."
              />
            </label>
          </div>
        </ActionForm>
      )}
      {closing && (
        <ActionForm
          title="Bilan et clôture de la campagne"
          submitLabel="Clôturer"
          close={() => setClosing(false)}
          submit={async (form) => {
            const values: Row = Object.fromEntries(form);
            if (values.satisfaction === '') delete values.satisfaction;
            else values.satisfaction = Number(values.satisfaction);
            await api.post(`/erp/campaigns/${campaign.id}/close`, values);
            await qc.invalidateQueries();
          }}
        >
          <label className="field">
            Bilan de campagne *
            <textarea name="closing_report" required maxLength={10000} />
          </label>
          <label className="field">
            Enseignements pour les prochaines campagnes
            <textarea name="lessons" maxLength={5000} />
          </label>
          <label className="field">
            Satisfaction client (1 à 5)
            <select name="satisfaction" defaultValue="">
              <option value="">Non renseignée</option>
              {[1, 2, 3, 4, 5].map((note) => (
                <option key={note} value={note}>
                  {note}/5
                </option>
              ))}
            </select>
          </label>
        </ActionForm>
      )}
    </>
  );
}

function CampaignCosts({ campaign }: { campaign: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const costs = useQuery({
    queryKey: ['campaign-costs', campaign.id],
    queryFn: ({ signal }) =>
      api.get<{ data: Row[]; meta: Row }>(`/erp/campaigns/${campaign.id}/costs`, signal),
  });
  const frozen = ['termine', 'annule'].includes(campaign.status);
  const editable = !frozen && can(user, 'campaigns.update');
  const meta = costs.data?.meta ?? {};
  const columns: Column<Row>[] = [
    { key: 'category', label: 'Catégorie', render: (row) => label(row.category) },
    { key: 'label', label: 'Libellé' },
    { key: 'supplier', label: 'Fournisseur' },
    { key: 'planned', label: 'Prévu', num: true, render: (row) => money(row.planned) },
    {
      key: 'actual',
      label: 'Réel',
      num: true,
      render: (row) => (row.actual === null ? <Badge tone="warning">À saisir</Badge> : money(row.actual)),
    },
    {
      key: 'gap',
      label: 'Écart',
      num: true,
      render: (row) => (row.actual === null ? '—' : money(Number(row.actual) - Number(row.planned))),
    },
    ...(editable
      ? [
          {
            key: '_edit',
            label: 'Actions',
            render: (row: Row) => (
              <button className="button" onClick={() => setEditing(row)}>
                Modifier
              </button>
            ),
          } as Column<Row>,
        ]
      : []),
  ];
  return (
    <>
      <Card
        className="campaign-costs"
        title={
          <span className="card-title-icon">
            <Calculator size={18} />
            Coûts prévus et réels
          </span>
        }
        sub="Montants saisis par l’équipe. Aucun coût n’est déduit d’un devis, d’un tarif ou d’un mouvement de stock."
        actions={
          editable ? (
            <button className="button" onClick={() => setEditing('new')}>
              <Plus size={16} />
              Ajouter un coût
            </button>
          ) : undefined
        }
        flush
      >
        <ErrorBox error={costs.error} retry={() => void costs.refetch()} />
        <div className="panel-body">
          <div className="quote-totals">
            <div>
              <span>Total prévu</span>
              <strong>{money(meta.planned_total ?? 0)}</strong>
            </div>
            <div>
              <span>Total réel saisi</span>
              <strong>{money(meta.actual_total ?? 0)}</strong>
            </div>
            <div className="grand-total">
              <span>Montant réservé</span>
              <strong>{money(meta.reserved_amount ?? 0)}</strong>
            </div>
            <div>
              <span>Lignes sans réel</span>
              <strong>{meta.missing_actual ?? 0}</strong>
            </div>
          </div>
          {frozen && <div className="notice info">Campagne clôturée : les coûts sont figés.</div>}
        </div>
        <DataTable
          columns={columns}
          rows={costs.data?.data}
          loading={costs.isLoading}
          caption="Coûts de la campagne"
          empty={<Empty>Aucun coût enregistré pour cette campagne.</Empty>}
        />
      </Card>
      {editing && (
        <ActionForm
          title={editing === 'new' ? 'Ajouter un coût' : 'Modifier le coût'}
          submitLabel="Enregistrer"
          close={() => setEditing(null)}
          submit={async (form) => {
            const values: Row = Object.fromEntries(form);
            values.planned = Number(values.planned || 0);
            values.actual = values.actual === '' ? null : Number(values.actual);
            if (editing === 'new') await api.post(`/erp/campaigns/${campaign.id}/costs`, values);
            else await api.patch(`/erp/campaigns/${campaign.id}/costs/${editing.id}`, values);
            await qc.invalidateQueries({ queryKey: ['campaign-costs', campaign.id] });
          }}
        >
          <div className="form-grid">
            <label className="field">
              Catégorie *
              <select
                name="category"
                required
                defaultValue={editing === 'new' ? 'impression' : editing.category}
              >
                {COST_CATEGORIES.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Libellé *
              <input
                name="label"
                required
                maxLength={200}
                defaultValue={editing === 'new' ? '' : editing.label}
              />
            </label>
            <label className="field">
              Montant prévu (FCFA) *
              <input
                name="planned"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={editing === 'new' ? '' : editing.planned}
              />
            </label>
            <label className="field">
              Montant réel (FCFA)
              <input
                name="actual"
                type="number"
                min="0"
                step="1"
                defaultValue={editing === 'new' ? '' : (editing.actual ?? '')}
              />
            </label>
            <label className="field wide">
              Fournisseur
              <input
                name="supplier"
                maxLength={200}
                defaultValue={editing === 'new' ? '' : (editing.supplier ?? '')}
              />
            </label>
          </div>
          <p className="muted">
            Laisser le réel vide tant que la dépense n’est pas connue : le total réel ne compte que les
            montants saisis.
          </p>
        </ActionForm>
      )}
    </>
  );
}

const COST_CATEGORIES: [string, string][] = [
  ['impression', 'Impression'],
  ['production', 'Production'],
  ['pose', 'Pose'],
  ['transport', 'Transport'],
  ['maintenance', 'Maintenance'],
  ['sous_traitance', 'Sous-traitance'],
  ['redevance', 'Redevance'],
  ['autre', 'Autre'],
];

function CampaignReservations() {
  const { id } = useParams();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const campaign = useQuery({
    queryKey: ['detail', 'erp/campaigns', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/erp/campaigns/${id}`, signal),
    enabled: Boolean(id),
  });
  const reservations = useQuery({
    queryKey: ['campaign-reservations', id],
    queryFn: ({ signal }) =>
      api.get<Page>(`/erp/reservations?campaign_id=${encodeURIComponent(id!)}&per_page=100`, signal),
    enabled: Boolean(id),
  });
  const row = campaign.data?.data;
  const canReserve = row && ['brouillon', 'planifie'].includes(row.status) && can(user, 'campaigns.create');
  const columns: Column<Row>[] = [
    {
      key: 'support',
      label: 'Face',
      render: (reservation) => (
        <Link to={`/reservations/${reservation.id}`}>{reservation.support_label || 'Face publicitaire'}</Link>
      ),
    },
    { key: 'starts_on', label: 'Début', render: (reservation) => date(reservation.starts_on) },
    { key: 'ends_on', label: 'Fin', render: (reservation) => date(reservation.ends_on) },
    {
      key: 'amount',
      label: 'Montant',
      num: true,
      render: (reservation) => money(reservation.amount),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (reservation) => <Status value={reservation.status} />,
    },
  ];

  return (
    <>
      <Card
        className="campaign-reservations"
        title={
          <span className="card-title-icon">
            <CalendarRange size={18} />
            Faces réservées
          </span>
        }
        sub="Réservations rattachées à cette campagne, contrôlées contre les chevauchements."
        actions={
          canReserve ? (
            <button className="button primary" onClick={() => setCreating(true)}>
              <Plus size={16} />
              Réserver une face
            </button>
          ) : undefined
        }
        flush
      >
        <ErrorBox error={campaign.error || reservations.error} retry={() => void reservations.refetch()} />
        <DataTable
          columns={columns}
          rows={reservations.data?.data}
          loading={reservations.isLoading}
          caption="Réservations de la campagne"
          empty={<Empty>Aucune face n’est encore réservée pour cette campagne.</Empty>}
        />
      </Card>
      {creating && row && <ReservationForm campaign={row} close={() => setCreating(false)} />}
    </>
  );
}

export default function CampaignWorkspace() {
  return (
    <>
      <RecordDetail module={campaignModule} />
      <CampaignWorkspaceExtras />
    </>
  );
}

/** Réservations puis preuves et bilan : les mêmes données sont partagées, sans double requête. */
function CampaignWorkspaceExtras() {
  const { id } = useParams();
  const campaign = useQuery({
    queryKey: ['detail', 'erp/campaigns', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/erp/campaigns/${id}`, signal),
    enabled: Boolean(id),
  });
  const reservations = useQuery({
    queryKey: ['campaign-reservations', id],
    queryFn: ({ signal }) =>
      api.get<Page>(`/erp/reservations?campaign_id=${encodeURIComponent(id!)}&per_page=100`, signal),
    enabled: Boolean(id),
  });
  const row = campaign.data?.data;
  return (
    <>
      <CampaignReservations />
      {row && <CampaignProofs campaign={row} reservations={reservations.data?.data ?? []} />}
      {row && <CampaignCosts campaign={row} />}
    </>
  );
}
