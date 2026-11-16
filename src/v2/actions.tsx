import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Plus } from 'lucide-react';
import { api } from './api';
import { useAuth } from './auth';
import { RecordForm, useOptions } from './forms';
import { ErpDetail, InvoiceFne, PaymentControls } from './ErpPanels';
import type { Field, Module } from './modules';
import { can, date, label, money, today, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, Loading, Pager, Status } from './ui';
import { WarehouseOptions } from './StockInventory';

export function DetailActions({ module, row }: { module: Module; row: Row }) {
  if (module.key.startsWith('erp/')) return <ErpDetail module={module} row={row} />;
  if (module.key === 'organizations') return <Contacts row={row} />;
  if (module.key === 'quotes') return <QuoteActions row={row} />;
  if (module.key === 'opportunities') return <OpportunityActions row={row} />;
  if (module.key === 'stock-items') return <StockActions row={row} />;
  if (module.key === 'invoices') return <InvoiceActions row={row} />;
  if (module.key.startsWith('customer-cases/')) return <CustomerCaseActions module={module} row={row} />;
  return (
    <div className="panel-body">
      <h2>Suivi de l’action</h2>
      <p>Modifiez la fiche pour mettre à jour son statut, sa priorité et son échéance.</p>
      {row.description && <p className="preserve">{row.description}</p>}
    </div>
  );
}
function CustomerCaseActions({ module, row }: { module: Module; row: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [link, setLink] = useState(false);
  const [convert, setConvert] = useState(false);
  const interventions = useOptions(
    'erp/interventions',
    module.key.endsWith('complaints') && can(user, 'campaigns.view'),
  );
  const [interventionId, setInterventionId] = useState(row.intervention_id ?? '');
  return (
    <>
      <div className="panel-heading">
        <h2>Suivi du dossier client</h2>
        {row.escalated_at && <Status value="en_retard" />}
      </div>
      <div className="panel-body">
        <Link to={'/clients/' + row.organization_id}>Ouvrir la fiche client 360°</Link>
        <p>
          {module.key.endsWith('contracts')
            ? 'Joignez la pièce contractuelle dans Documents. La direction peut ensuite déclarer une signature externe ; ce registre ne réalise aucune signature électronique. Après signature déclarée, les éléments essentiels sont figés.'
            : 'Renseignez une résolution avant de passer à Résolue, puis clôturez le dossier. Les échéances dépassées apparaissent dans la fiche client.'}
        </p>
        {row.escalated_at && (
          <div className="notice warning">
            Échéance dépassée : ce dossier a été marqué en retard le {date(row.escalated_at)}. Traitez-le ou
            repoussez son échéance avec un motif.
          </div>
        )}
        {module.key.endsWith('complaints') && can(user, 'campaigns.view') && (
          <>
            {row.intervention_id ? (
              <p>
                Intervention liée :{' '}
                <Link to={'/maintenance/' + row.intervention_id}>ouvrir la fiche de maintenance</Link>
              </p>
            ) : (
              <p className="muted">Aucune intervention de maintenance n’est rattachée à cette réclamation.</p>
            )}
            <button className="button" onClick={() => setLink(true)}>
              {row.intervention_id ? 'Changer l’intervention liée' : 'Rattacher une intervention'}
            </button>
            {!row.intervention_id && (
              <button className="button" onClick={() => setConvert(true)}>
                Créer une intervention de maintenance
              </button>
            )}{' '}
          </>
        )}
      </div>
      {convert && (
        <ActionForm
          title="Créer une intervention de maintenance"
          submitLabel="Créer l’intervention"
          close={() => setConvert(false)}
          submit={async () => {
            await api.patch(`/customer-cases/complaints/${row.id}`, { create_intervention: true });
            await qc.invalidateQueries();
          }}
        >
          <p>
            Une intervention sera ouverte avec le statut « Signalée », reprenant l’objet, la gravité et
            l’échéance de cette réclamation. Aucun intervenant n’est affecté automatiquement.
          </p>
          <p className="muted">La réclamation reste ouverte : résolvez-la une fois l’intervention traitée.</p>
        </ActionForm>
      )}
      {link && (
        <ActionForm
          title="Rattacher une intervention"
          submitLabel="Enregistrer le lien"
          close={() => setLink(false)}
          submit={async () => {
            await api.patch(`/customer-cases/complaints/${row.id}`, {
              intervention_id: interventionId || null,
            });
            await qc.invalidateQueries();
          }}
        >
          <ErrorBox error={interventions.error} retry={() => void interventions.refetch()} />
          <label className="field">
            Intervention de maintenance
            <select value={interventionId} onChange={(event) => setInterventionId(event.target.value)}>
              <option value="">Aucune</option>
              {(interventions.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} — {item.support_label || 'sans face'}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            Le lien ne modifie ni le statut de la réclamation ni celui de l’intervention.
          </p>
        </ActionForm>
      )}
    </>
  );
}

const contactFields: Field[] = [
  { key: 'first_name', label: 'Prénom', nullable: true },
  { key: 'last_name', label: 'Nom', required: true },
  { key: 'email', label: 'E-mail', type: 'email', nullable: true },
  { key: 'phone', label: 'Téléphone', nullable: true },
  { key: 'job_title', label: 'Fonction', nullable: true },
  { key: 'opt_out', label: 'Opposition aux communications', type: 'checkbox', default: false },
];
function Contacts({ row }: { row: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Row | 'new' | null>(null);
  const [remove, setRemove] = useState<Row | null>(null);
  return (
    <>
      <div className="panel-heading">
        <h2>Contacts</h2>
        {can(user, 'organizations.create') && (
          <button className="button" onClick={() => setEdit('new')}>
            <Plus size={15} />
            Ajouter
          </button>
        )}
      </div>
      <div className="panel-body">
        {row.contacts?.length ? (
          row.contacts.map((contact: Row) => (
            <div className="contact-row" key={contact.id}>
              <div>
                <strong>
                  {contact.first_name} {contact.last_name}
                </strong>
                <p>
                  {contact.job_title || 'Contact'} ·{' '}
                  {contact.email || contact.phone || 'Coordonnées à compléter'}
                </p>
                {contact.opt_out && <small>Opposition aux communications</small>}
              </div>
              <div className="actions">
                {can(user, 'organizations.update') && (
                  <button className="text-button" onClick={() => setEdit(contact)}>
                    Modifier
                  </button>
                )}
                {can(user, 'organizations.delete') && (
                  <button className="text-button danger-text" onClick={() => setRemove(contact)}>
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <Empty>Ajoutez un contact pour pouvoir soumettre un devis.</Empty>
        )}
      </div>
      {edit && (
        <RecordForm
          title={edit === 'new' ? 'Ajouter un contact' : 'Modifier le contact'}
          fields={contactFields}
          path={edit === 'new' ? `/organizations/${row.id}/contacts` : '/contacts'}
          row={edit === 'new' ? undefined : edit}
          close={() => setEdit(null)}
        />
      )}
      {remove && (
        <ActionForm
          title="Supprimer ce contact"
          close={() => setRemove(null)}
          submit={async () => {
            await api.delete(`/contacts/${remove.id}`);
            await qc.invalidateQueries();
          }}
        >
          <p>
            Confirmez-vous la suppression de {remove.first_name} {remove.last_name} ?
          </p>
        </ActionForm>
      )}
    </>
  );
}
function OpportunityActions({ row }: { row: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [move, setMove] = useState(false);
  const [stage, setStage] = useState('');
  const stages = useQuery({ queryKey: ['stages'], queryFn: () => api.get('/pipeline/stages') });
  const closed = ['gagne', 'perdu'].includes(row.stage_code);
  return (
    <>
      <div className="panel-heading">
        <h2>Progression commerciale</h2>
      </div>
      <div className="panel-body">
        <Status value={row.stage_code} />
        <p>Probabilité : {row.probability}%</p>
        <p className="preserve">{row.need || 'Besoin à qualifier.'}</p>
        <p>
          <strong>Prochaine action :</strong> {row.next_step || 'À renseigner'}
        </p>
        {row.lost_reason && <p>Motif de perte : {row.lost_reason}</p>}
        {row.won_proof && <p>Preuve de gain : {row.won_proof}</p>}
        {!closed && can(user, 'opportunities.update') && (
          <button className="button primary" onClick={() => setMove(true)}>
            Changer d’étape
            <ArrowRight size={15} />
          </button>
        )}
        {can(user, 'quotes.create') && (
          <Link className="button" to={`/devis/nouveau?client=${row.organization_id}&opportunite=${row.id}`}>
            Créer un devis lié
          </Link>
        )}
      </div>
      {move && (
        <ActionForm
          title="Changer d’étape"
          close={() => setMove(false)}
          submit={async (form) => {
            await api.post(`/opportunities/${row.id}/stage`, Object.fromEntries(form));
            await qc.invalidateQueries();
          }}
        >
          <ErrorBox error={stages.error} />
          <label className="field">
            Nouvelle étape
            <select name="stage_code" required value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">Sélectionner…</option>
              {stages.data?.data.map((s: Row) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            Les étapes ouvertes se franchissent successivement. Renseignez le besoin et la prochaine action
            dans la fiche.
          </p>
          {stage === 'perdu' && (
            <label className="field">
              Motif de perte
              <textarea name="lost_reason" required maxLength={1000} />
            </label>
          )}
          {stage === 'gagne' && (
            <label className="field">
              Preuve du gain
              <textarea name="won_proof" required maxLength={2000} />
            </label>
          )}
        </ActionForm>
      )}
    </>
  );
}
function QuoteActions({ row }: { row: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [action, setAction] = useState('');
  const [decision, setDecision] = useState('accepte');
  const allowed: { key: string; text: string }[] = [];
  if (can(user, 'quotes.update')) {
    if (row.status === 'brouillon') allowed.push({ key: 'submit', text: 'Soumettre à validation' });
    if (row.status === 'valide') allowed.push({ key: 'send', text: 'Marquer comme envoyé' });
    if (row.status === 'envoye') allowed.push({ key: 'decision', text: 'Enregistrer la décision du client' });
    if (!['accepte', 'annule'].includes(row.status))
      allowed.push({ key: 'cancel', text: 'Annuler le devis' });
  }
  const roleAllowed =
    row.approver_role === 'direction_generale'
      ? user?.role.code === 'direction_generale'
      : ['direction_generale', 'direction_commerciale'].includes(user?.role.code || '');
  if (row.status === 'soumis' && can(user, 'quotes.validate') && user?.id !== row.owner_id && roleAllowed)
    allowed.unshift({ key: 'approve', text: 'Approuver' }, { key: 'reject', text: 'Retourner au brouillon' });
  return (
    <>
      <div className="panel-heading">
        <h2>Proposition commerciale</h2>
        <Status value={row.status} />
      </div>
      <div className="panel-body">
        <div className="quote-totals">
          <div>
            <span>Total HT</span>
            <strong>{money(row.total_ht)}</strong>
          </div>
          <div>
            <span>TVA</span>
            <strong>{money(row.total_tax)}</strong>
          </div>
          <div className="grand-total">
            <span>Total TTC</span>
            <strong>{money(row.total_ttc)}</strong>
          </div>
          <div>
            <span>Marge</span>
            <strong>{Number(row.margin_pct).toLocaleString('fr-CI')} %</strong>
          </div>
        </div>
        {row.approval_reasons?.length > 0 && (
          <div className="notice warning">
            Contrôle demandé : {row.approval_reasons.map(label).join(', ')}.
          </div>
        )}
        <div className="action-stack">
          {allowed.map((item) => (
            <button
              key={item.key}
              className={`button ${item.key === 'cancel' ? 'danger-text' : 'primary'}`}
              onClick={() => setAction(item.key)}
            >
              {item.text}
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
        <p className="muted">
          Le marquage « envoyé » n’envoie aucun e-mail. Le PDF se télécharge depuis le bouton de la fiche.
        </p>
        {row.status === 'accepte' && (
          <p>
            Pour la facturation interne, transmettre l’identifiant du devis au service finance :{' '}
            <code>{row.id}</code>.
          </p>
        )}
        <h3>Lignes du devis</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Quantité × durée</th>
                <th>PU HT</th>
                <th>Net HT</th>
              </tr>
            </thead>
            <tbody>
              {row.lines?.map((line: Row) => (
                <tr key={line.id}>
                  <td>
                    {line.label}
                    <small className="block">{line.unit}</small>
                  </td>
                  <td>
                    {Number(line.quantity)} × {Number(line.duration)}
                  </td>
                  <td>{money(line.unit_price)}</td>
                  <td>{money(line.line_ht)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {row.approvals?.length > 0 && (
          <>
            <h3>Historique de validation</h3>
            {row.approvals.map((approval: Row) => (
              <p key={approval.id}>
                {date(approval.created_at)} · {label(approval.decision)} —{' '}
                {approval.comment || 'Sans commentaire'}
              </p>
            ))}
          </>
        )}
        {row.payment_terms && (
          <p>
            <strong>Paiement :</strong> {row.payment_terms}
          </p>
        )}
        {row.conditions && (
          <p className="preserve">
            <strong>Conditions :</strong> {row.conditions}
          </p>
        )}
      </div>
      {action && (
        <ActionForm
          title={allowed.find((item) => item.key === action)?.text || 'Confirmer'}
          close={() => setAction('')}
          submit={async (form) => {
            await api.post(`/quotes/${row.id}/${action}`, Object.fromEntries(form));
            await qc.invalidateQueries();
          }}
        >
          {action === 'send' ? (
            <p>
              Confirmez que vous avez transmis le devis au client. Aucun e-mail ne sera envoyé par cette
              action.
            </p>
          ) : action === 'cancel' ? (
            <p>Confirmez l’annulation de cette proposition.</p>
          ) : action === 'submit' ? (
            <p>
              Le serveur vérifiera le contact, la validité, la marge, les remises et le niveau d’approbation
              requis.
            </p>
          ) : action === 'decision' ? (
            <>
              <label className="field">
                Décision
                <select name="decision" value={decision} onChange={(e) => setDecision(e.target.value)}>
                  <option value="accepte">Accepté</option>
                  <option value="refuse">Refusé</option>
                </select>
              </label>
              {decision === 'refuse' && (
                <label className="field">
                  Motif du refus
                  <textarea name="reason" required maxLength={1000} />
                </label>
              )}
            </>
          ) : (
            <label className="field">
              Commentaire{action === 'reject' ? ' *' : ''}
              <textarea name="comment" required={action === 'reject'} maxLength={1000} />
            </label>
          )}
        </ActionForm>
      )}
    </>
  );
}
function StockActions({ row }: { row: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [kind, setKind] = useState('entree');
  const [page, setPage] = useState(1);
  const movements = useQuery({
    queryKey: ['movements', row.id, page],
    queryFn: () => api.get<Page>(`/stock-items/${row.id}/movements?page=${page}&per_page=10`),
  });
  return (
    <>
      <div className="panel-heading">
        <h2>Mouvements de stock</h2>
        {can(user, 'stocks.update') && (
          <button className="button" onClick={() => setShow(true)}>
            <Plus size={15} />
            Mouvement
          </button>
        )}
      </div>
      <div className="panel-body">
        {Number(row.quantity_on_hand) <= Number(row.minimum_quantity) && (
          <div className="notice warning">Seuil d’alerte atteint : prévoyez un réapprovisionnement.</div>
        )}
        {movements.isLoading ? (
          <Loading />
        ) : movements.error ? (
          <ErrorBox error={movements.error} />
        ) : !movements.data?.data.length ? (
          <Empty>Aucun mouvement enregistré.</Empty>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantité</th>
                  <th>Motif</th>
                </tr>
              </thead>
              <tbody>
                {movements.data.data.map((item) => (
                  <tr key={item.id}>
                    <td>{date(item.created_at)}</td>
                    <td>{label(item.kind)}</td>
                    <td>
                      {Number(item.quantity)} {row.unit}
                    </td>
                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={movements.data} change={setPage} />
      </div>
      {show && (
        <ActionForm
          title="Enregistrer un mouvement"
          close={() => setShow(false)}
          submit={async (form) => {
            const data: Row = Object.fromEntries(form);
            data.quantity = Number(data.quantity);
            if (data.unit_cost !== undefined) data.unit_cost = Number(data.unit_cost);
            // Une chaîne vide ferait échouer la validation UUID : on laisse le serveur choisir l'entrepôt par défaut.
            if (!data.warehouse_id) delete data.warehouse_id;
            await api.post(`/stock-items/${row.id}/movements`, data);
            await qc.invalidateQueries();
          }}
        >
          <label className="field">
            Type
            <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="entree">Entrée</option>
              <option value="sortie">Sortie</option>
            </select>
          </label>
          <label className="field">
            Entrepôt
            <select name="warehouse_id" defaultValue="">
              <WarehouseOptions includeDefault />
            </select>
          </label>
          <label className="field">
            Quantité
            <input name="quantity" type="number" min="0.0001" max="1000000000" step="0.0001" required />
          </label>
          {kind === 'entree' && (
            <label className="field">
              Coût unitaire (FCFA)
              <input name="unit_cost" type="number" min="0" step="1" required />
            </label>
          )}
          <label className="field">
            Motif
            <textarea name="reason" required maxLength={1000} />
          </label>
          <p className="muted">Le coût moyen et le nouveau solde sont calculés par le serveur.</p>
        </ActionForm>
      )}
    </>
  );
}
function InvoiceActions({ row }: { row: Row }) {
  const { user } = useAuth();
  const accounts = useOptions('erp/cash-accounts', can(user, 'treasury.view'));
  const qc = useQueryClient();
  const [pay, setPay] = useState(false);
  const outstanding = Number(row.total_ttc) - Number(row.paid_amount);
  return (
    <>
      <div className="panel-heading">
        <h2>Règlements</h2>
      </div>
      <div className="panel-body">
        <div className="quote-totals">
          <div>
            <span>Total TTC</span>
            <strong>{money(row.total_ttc)}</strong>
          </div>
          <div>
            <span>Déjà réglé</span>
            <strong>{money(row.paid_amount)}</strong>
          </div>
          <div className="grand-total">
            <span>Reste à payer</span>
            <strong>{money(outstanding)}</strong>
          </div>
        </div>
        <div className="notice warning">Facture interne · État FNE : {label(row.fne_status)}.</div>
        <PaymentControls row={row} />
        {outstanding > 0 && can(user, 'finance.create') && (
          <button className="button primary" onClick={() => setPay(true)}>
            Enregistrer un règlement
          </button>
        )}
        {row.payments
          ?.filter((payment: Row) => payment.status !== 'en_attente')
          .map((payment: Row) => (
            <div className="contact-row" key={payment.id}>
              <div>
                <strong>{payment.reference}</strong>
                <p>
                  {date(payment.paid_at)} · {label(payment.method)} · {label(payment.status)}
                </p>
              </div>
              <strong>{money(payment.amount)}</strong>
            </div>
          ))}
        <InvoiceFne row={row} />
      </div>
      {pay && (
        <ActionForm
          title="Enregistrer un règlement"
          close={() => setPay(false)}
          submit={async (form) => {
            const data = Object.fromEntries(form);
            await api.post(`/invoices/${row.id}/payments`, {
              ...data,
              cash_account_id: data.cash_account_id || null,
              amount: Number(data.amount),
            });
            await qc.invalidateQueries();
          }}
        >
          <label className="field">
            Montant (FCFA)
            <input name="amount" type="number" min="1" max={outstanding} step="1" required />
          </label>
          <label className="field">
            Référence unique
            <input name="reference" required maxLength={100} />
          </label>
          <label className="field">
            Mode
            <select name="method">
              <option value="virement">Virement</option>
              <option value="especes">Espèces</option>
              <option value="cheque">Chèque</option>
              <option value="mobile_money">Mobile money</option>
            </select>
          </label>
          <label className="field">
            Compte de trésorerie (obligatoire pour les espèces)
            <select name="cash_account_id">
              <option value="">Non lié à un compte</option>
              {accounts.data?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.label}
                </option>
              ))}
            </select>
          </label>
          <ErrorBox error={accounts.error} />
          <label className="field">
            Date de paiement
            <input name="paid_at" type="date" defaultValue={today()} max={today()} required />
          </label>
        </ActionForm>
      )}
    </>
  );
}
