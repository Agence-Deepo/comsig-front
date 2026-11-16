import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { FileSignature, RefreshCw } from 'lucide-react';

import { Card, DataTable, type Column } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { byPath } from './modules';
import { RecordDetail } from './Records';
import { can, date, money, today, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, PageTitle, Status } from './ui';

const contractModule = byPath('contrats')!;

const DECISIONS: [string, string][] = [
  ['renouveler', 'Renouveler'],
  ['ne_pas_renouveler', 'Ne pas renouveler'],
  ['a_negocier', 'À négocier'],
];

function ContractLifecycle({ contract }: { contract: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const lifecycle = useQuery({
    queryKey: ['contract-lifecycle', contract.id],
    queryFn: ({ signal }) =>
      api.get<{ data: Row[]; meta: Row }>(`/contracts/${contract.id}/lifecycle`, signal),
  });
  const meta = lifecycle.data?.meta ?? {};
  const editable = can(user, 'contracts.update') && contract.status !== 'annule';
  const columns: Column<Row>[] = [
    { key: 'reference', label: 'Avenant' },
    { key: 'object', label: 'Objet' },
    { key: 'signed_on', label: 'Signé le', render: (row) => date(row.signed_on) },
    {
      key: 'value_delta',
      label: 'Variation',
      num: true,
      render: (row) =>
        Number(row.value_delta) === 0 ? <span className="muted">—</span> : money(row.value_delta),
    },
    {
      key: 'new_end_date',
      label: 'Nouvelle fin',
      render: (row) => (row.extends_term ? date(row.new_end_date) : <span className="muted">—</span>),
    },
  ];
  const days = Number(meta.days_to_end ?? 0);
  return (
    <>
      <Card
        className="contract-lifecycle"
        title={
          <span className="card-title-icon">
            <FileSignature size={18} />
            Valeur et échéance
          </span>
        }
        sub="Le total avenanté est la somme des variations saisies, jamais un recalcul automatique."
        actions={
          editable ? (
            <button className="button" onClick={() => setAdding(true)}>
              Ajouter un avenant
            </button>
          ) : undefined
        }
      >
        <div className="quote-totals">
          <div>
            <span>Valeur d’origine</span>
            <strong>{money(meta.original_value ?? 0)}</strong>
          </div>
          <div>
            <span>Variations d’avenants</span>
            <strong>{money(meta.delta_total ?? 0)}</strong>
          </div>
          <div className="grand-total">
            <span>Total avenanté</span>
            <strong>{money(meta.amended_total ?? 0)}</strong>
          </div>
          <div>
            <span>Fin effective</span>
            <strong>{date(meta.effective_end_date)}</strong>
          </div>
        </div>
        {days >= 0 && days <= 120 && (
          <div className="notice warning" role="status">
            Échéance dans {days} jour(s). Une décision de renouvellement datée est attendue.
          </div>
        )}
        {meta.renewal_decision && (
          <p>
            Décision de renouvellement : <strong>{meta.renewal_decision.replace(/_/g, ' ')}</strong> le{' '}
            {date(meta.renewal_decided_on)}
            {meta.renewal_note ? ` — ${meta.renewal_note}` : ''}
          </p>
        )}
        {can(user, 'contracts.update') && ['signe', 'actif'].includes(contract.status) && (
          <button className="button" onClick={() => setRenewing(true)}>
            <RefreshCw size={15} />
            Consigner la décision de renouvellement
          </button>
        )}
        {can(user, 'contracts.update') && !['signe', 'actif'].includes(contract.status) && (
          <p className="muted">
            La décision de renouvellement est disponible une fois le contrat signé ou actif.
          </p>
        )}
      </Card>
      <Card className="contract-amendments" title="Avenants" flush>
        <ErrorBox error={lifecycle.error} retry={() => void lifecycle.refetch()} />
        <DataTable
          columns={columns}
          rows={lifecycle.data?.data}
          loading={lifecycle.isLoading}
          caption="Avenants du contrat"
          empty={<Empty>Aucun avenant enregistré.</Empty>}
        />
      </Card>
      {adding && (
        <ActionForm
          title="Ajouter un avenant"
          submitLabel="Enregistrer l’avenant"
          close={() => setAdding(false)}
          submit={async (form) => {
            const values: Row = Object.fromEntries(form);
            values.value_delta = Number(values.value_delta || 0);
            values.extends_term = values.extends_term === 'on';
            if (!values.extends_term) delete values.new_end_date;
            await api.post(`/contracts/${contract.id}/amendments`, values);
            await qc.invalidateQueries({ queryKey: ['contract-lifecycle', contract.id] });
          }}
        >
          <div className="form-grid">
            <label className="field">
              Référence *
              <input name="reference" required maxLength={60} />
            </label>
            <label className="field">
              Signé le *
              <input name="signed_on" type="date" required defaultValue={today()} max={today()} />
            </label>
            <label className="field wide">
              Objet de l’avenant *
              <input name="object" required maxLength={200} />
            </label>
            <label className="field">
              Variation de valeur (FCFA)
              <input name="value_delta" type="number" step="1" defaultValue="0" />
            </label>
            <label className="field">
              Date d’effet
              <input name="effective_on" type="date" defaultValue={today()} />
            </label>
            <label className="field">
              <span>Prolongation</span>
              <label className="checkbox">
                <input name="extends_term" type="checkbox" /> Prolonge la date de fin
              </label>
            </label>
            <label className="field">
              Nouvelle date de fin
              <input name="new_end_date" type="date" />
            </label>
            <label className="field wide">
              Description
              <textarea name="description" maxLength={5000} />
            </label>
          </div>
          <p className="muted">
            Une date de fin ne peut changer que si la prolongation est cochée ; une variation négative est une
            réduction explicite.
          </p>
        </ActionForm>
      )}
      {renewing && (
        <ActionForm
          title="Décision de renouvellement"
          submitLabel="Enregistrer la décision"
          close={() => setRenewing(false)}
          submit={async (form) => {
            const values: Row = Object.fromEntries(form);
            if (values.decision !== 'renouveler') delete values.new_end_date;
            await api.post(`/contracts/${contract.id}/renewal`, values);
            await qc.invalidateQueries();
          }}
        >
          <label className="field">
            Décision *
            <select name="decision" required defaultValue="renouveler">
              {DECISIONS.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Nouvelle date de fin (si renouvellement)
            <input name="new_end_date" type="date" />
          </label>
          <label className="field">
            Motif / note
            <textarea name="note" maxLength={2000} />
          </label>
          <p className="muted">
            La décision est datée et tracée. Un refus ne modifie pas la date de fin ; un renouvellement exige
            la nouvelle date.
          </p>
        </ActionForm>
      )}
    </>
  );
}

function ContractExtras() {
  const { id } = useParams();
  const contract = useQuery({
    queryKey: ['detail', 'customer-cases/contracts', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/customer-cases/contracts/${id}`, signal),
    enabled: Boolean(id),
  });
  return (
    <>
      <ErrorBox error={contract.error} retry={() => void contract.refetch()} />
      {contract.data?.data && <ContractLifecycle contract={contract.data.data} />}
    </>
  );
}

export default function ContractWorkspace() {
  return (
    <>
      <RecordDetail module={contractModule} />
      <ContractExtras />
    </>
  );
}

/** Appels d'offres : registre, échéances et statut. */
export function Tenders() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState('');
  const tenders = useQuery({
    queryKey: ['tenders', status],
    queryFn: ({ signal }) =>
      api.get<Page>(`/tenders?per_page=50${status ? `&status=${status}` : ''}`, signal),
    enabled: can(user, 'contracts.view'),
  });
  if (!can(user, 'contracts.view'))
    return (
      <Card>
        <Empty>Votre profil ne permet pas de consulter les appels d’offres.</Empty>
      </Card>
    );
  const columns: Column<Row>[] = [
    {
      key: 'title',
      label: 'Appel d’offres',
      render: (row) => (
        <>
          <div className="cell-title">{row.title}</div>
          <div className="cell-sub">
            {row.reference}
            {row.source ? ` · ${row.source}` : ''}
          </div>
        </>
      ),
    },
    { key: 'deadline', label: 'Remise', render: (row) => date(row.deadline) },
    {
      key: 'days_left',
      label: 'Délai',
      num: true,
      render: (row) => (
        <Status value={Number(row.days_left) < 0 ? 'echeance_depassee' : `j${row.days_left}`} />
      ),
    },
    {
      key: 'estimated_value',
      label: 'Valeur estimée',
      num: true,
      render: (row) => (Number(row.estimated_value) > 0 ? money(row.estimated_value) : '—'),
    },
    { key: 'status', label: 'Statut', render: (row) => <Status value={row.status} /> },
  ];
  return (
    <>
      <PageTitle
        eyebrow="CONTRATS"
        title="Appels d’offres"
        description="Veille, préparation et décisions. Un appel non soumis exige un motif."
        actions={
          can(user, 'contracts.create') ? (
            <button className="button primary" onClick={() => setCreating(true)}>
              Nouvel appel d’offres
            </button>
          ) : undefined
        }
      />
      <Card
        title="Registre"
        actions={
          <select aria-label="Filtrer par statut" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous</option>
            <option value="veille">Veille</option>
            <option value="en_preparation">En préparation</option>
            <option value="soumis">Soumis</option>
            <option value="gagne">Gagné</option>
            <option value="perdu">Perdu</option>
            <option value="non_soumis">Non soumis</option>
          </select>
        }
        flush
      >
        <ErrorBox error={tenders.error} retry={() => void tenders.refetch()} />
        <DataTable
          columns={columns}
          rows={tenders.data?.data}
          loading={tenders.isLoading}
          caption="Appels d’offres"
          empty={<Empty>Aucun appel d’offres enregistré.</Empty>}
        />
        <p className="xsmall muted panel-body">
          Le délai est calculé depuis la date de remise. Aucune alerte automatique n’est envoyée.
        </p>
      </Card>
      {creating && (
        <ActionForm
          title="Nouvel appel d’offres"
          submitLabel="Enregistrer"
          close={() => setCreating(false)}
          submit={async (form) => {
            const values: Row = Object.fromEntries(form);
            values.estimated_value = Number(values.estimated_value || 0);
            await api.post('/tenders', values);
            await qc.invalidateQueries({ queryKey: ['tenders'] });
          }}
        >
          <div className="form-grid">
            <label className="field">
              Référence *
              <input name="reference" required maxLength={40} />
            </label>
            <label className="field">
              Intitulé *
              <input name="title" required maxLength={200} />
            </label>
            <label className="field">
              Date de remise *
              <input name="deadline" type="date" required />
            </label>
            <label className="field">
              Source / acheteur
              <input name="source" maxLength={200} />
            </label>
            <label className="field">
              Valeur estimée (FCFA)
              <input name="estimated_value" type="number" min="0" step="1" defaultValue="0" />
            </label>
            <label className="field">
              Statut
              <select name="status" defaultValue="veille">
                <option value="veille">Veille</option>
                <option value="en_preparation">En préparation</option>
                <option value="soumis">Soumis</option>
                <option value="gagne">Gagné</option>
                <option value="perdu">Perdu</option>
                <option value="non_soumis">Non soumis</option>
              </select>
            </label>
            <label className="field wide">
              Critères d’attribution
              <textarea name="criteria" maxLength={5000} />
            </label>
            <label className="field wide">
              Pièces à produire
              <textarea name="required_documents" maxLength={5000} />
            </label>
            <label className="field wide">
              Motif (obligatoire si non soumis)
              <textarea name="decision_reason" maxLength={2000} />
            </label>
          </div>
        </ActionForm>
      )}
      <p className="xsmall muted">
        <Link to="/contrats">Registre des contrats</Link>
      </p>
    </>
  );
}
