import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, Download, FileText, RefreshCw } from 'lucide-react';
import { api, downloadFile, queryString } from './api';
import { useAuth } from './auth';
import { allRecords, RecordForm, referenceLabel, useOptions } from './forms';
import type { Module } from './modules';
import { can, date, money, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, Loading, PageTitle, Pager, Status } from './ui';

export function DownloadButton({
  path,
  filename,
  caption = 'Télécharger le PDF',
  binaryTypes,
}: {
  path: string;
  filename: string;
  caption?: string;
  binaryTypes?: string[];
}) {
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <button
        className="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await downloadFile(path, filename, binaryTypes);
          } catch (e) {
            setError(e);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Download size={15} />
        {busy ? 'Préparation…' : caption}
      </button>
      <ErrorBox error={error} />
    </div>
  );
}
export function ErpDetail({ module, row }: { module: Module; row: Row }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [action, setAction] = useState<NonNullable<Module['actions']>[number] | null>(null);
  const tables = module.fields.filter((field) => field.type === 'rows');
  const sources = [
    ...new Set(
      tables.flatMap((table) =>
        (table.fields || []).flatMap((field) => (field.lookup ? [field.lookup] : [])),
      ),
    ),
  ];
  const lookups = useQuery({
    queryKey: ['detail-references', sources],
    queryFn: async () =>
      Object.fromEntries(
        await Promise.all(sources.map(async (source) => [source, await allRecords(source)])),
      ),
    enabled: sources.length > 0,
  });
  const actions = (module.actions || []).filter(
    (item) =>
      item.statuses.includes(row.status) &&
      can(user, item.permission) &&
      (!item.differentMaker || Number(row.owner_id) !== user?.id) &&
      !(item.key === 'approve-dg' && Number(row.rh_approved_by) === user?.id) &&
      !(item.key === 'cancel' && row.status === 'valide_dg' && !can(user, 'hr.approve')),
  );
  return (
    <>
      <div className="panel-heading">
        <h2>Circuit & opérations</h2>
        <Status value={row.status} />
      </div>
      <div className="panel-body">
        {module.warning && <div className="notice warning">{module.warning}</div>}
        {actions.length ? (
          <div className="action-stack">
            {actions.map((item) => (
              <button key={item.key} className="button primary" onClick={() => setAction(item)}>
                {item.label}
                <CheckCheck size={15} />
              </button>
            ))}
          </div>
        ) : (
          <p className="muted">
            Aucune action disponible à cette étape avec votre profil. Les validations exigent les droits
            adaptés et, pour les opérations financières, une autre personne.
          </p>
        )}
        {row.decision_comment && <div className="notice info">{row.decision_comment}</div>}
        {module.key === 'erp/payroll' && (
          <>
            <div className="quote-totals">
              <div>
                <span>Brut</span>
                <strong>{money(row.gross)}</strong>
              </div>
              <div>
                <span>Déduction absences</span>
                <strong>{money(row.absence_deduction)}</strong>
              </div>
              <div className="grand-total">
                <span>Net à payer</span>
                <strong>{money(row.net)}</strong>
              </div>
            </div>
            <p className="muted">{row.snapshot?.calculation}</p>
          </>
        )}
        {module.key === 'erp/vehicle-usages' && (
          <dl className="facts">
            <div>
              <dt>Compteur au départ</dt>
              <dd>{row.start_mileage ?? 'Pas encore parti'}</dd>
            </div>
            <div>
              <dt>Compteur au retour</dt>
              <dd>{row.end_mileage ?? 'Pas encore revenu'}</dd>
            </div>
          </dl>
        )}
        {module.key === 'erp/royalties' && (
          <div className="notice info">
            Tarif figé : {row.snapshot?.label}, {row.snapshot?.rate}{' '}
            {row.snapshot?.kind === 'pourcentage' ? '%' : 'FCFA'} · {row.snapshot?.municipality}
          </div>
        )}
        <ErrorBox error={lookups.error} />
        {tables.map((table) => (
          <div key={table.key}>
            <h3>{table.label}</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {table.fields?.map((field) => (
                      <th key={field.key}>{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {row[table.key]?.map((line: Row, index: number) => (
                    <tr key={index}>
                      {table.fields?.map((field) => (
                        <td key={field.key}>
                          {field.lookup
                            ? referenceLabel(
                                lookups.data?.[field.lookup]?.find(
                                  (value: Row) => value.id === line[field.key],
                                ) || { id: line[field.key] },
                              )
                            : field.label.includes('FCFA')
                              ? money(line[field.key])
                              : String(line[field.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {module.key === 'erp/projects' && (
          <Link className="button" to="/ordres-production">
            Consulter les ordres de production
          </Link>
        )}
      </div>
      {action && (
        <RecordForm
          title={action.label}
          fields={action.fields?.length ? action.fields : []}
          path={`/${module.key}/${row.id}/actions/${action.key}`}
          submitLabel="Confirmer"
          close={() => setAction(null)}
          saved={(updated) => {
            if (updated.id !== row.id) navigate(`/${module.path}/${updated.id}`);
          }}
        />
      )}
    </>
  );
}
export function PaymentControls({ row }: { row: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [review, setReview] = useState<{ id: string; approve: boolean } | null>(null);
  const pending = row.payments?.filter((payment: Row) => payment.status === 'en_attente') || [];
  return (
    <>
      <div className="notice info">
        Un règlement enregistré reste en attente jusqu’à validation par une autre personne. Seuls les
        règlements validés diminuent le solde.
      </div>
      {pending.map((payment: Row) => (
        <div className="contact-row" key={payment.id}>
          <div>
            <strong>{payment.reference}</strong>
            <p>{money(payment.amount)} · En attente</p>
          </div>
          {can(user, 'finance.validate') && user?.id !== Number(payment.recorded_by) && (
            <div className="actions">
              <button className="button primary" onClick={() => setReview({ id: payment.id, approve: true })}>
                Valider
              </button>
              <button className="button" onClick={() => setReview({ id: payment.id, approve: false })}>
                Refuser
              </button>
            </div>
          )}
        </div>
      ))}
      {review && (
        <ActionForm
          title={review.approve ? 'Valider le règlement' : 'Refuser le règlement'}
          close={() => setReview(null)}
          submit={async (form) => {
            await api.post(
              `/payments/${review.id}/${review.approve ? 'approve' : 'reject'}`,
              Object.fromEntries(form),
            );
            await qc.invalidateQueries();
          }}
        >
          {review.approve ? (
            <p>
              Confirmez la réception effective de ce règlement. Il sera comptabilisé dans le solde de la
              facture et, si renseigné, dans le compte de trésorerie.
            </p>
          ) : (
            <label className="field">
              Motif du refus
              <textarea name="comment" required maxLength={2000} />
            </label>
          )}
        </ActionForm>
      )}
    </>
  );
}
export function PaymentReviews() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const result = useQuery({
    queryKey: ['pending-payments', page],
    queryFn: () => api.get<Page>(`/payments/pending?page=${page}&per_page=20`),
  });
  return (
    <>
      <PageTitle
        title="Validations financières"
        description="Les demandes de règlement qui n’ont pas encore été validées."
        actions={
          <button className="button" onClick={() => void result.refetch()}>
            <RefreshCw size={15} />
            Actualiser
          </button>
        }
      />
      {!can(user, 'finance.validate') && (
        <div className="notice info">
          Vous pouvez suivre les demandes. Leur validation nécessite un profil autorisé et une autre personne
          que l’auteur.
        </div>
      )}
      <ErrorBox error={result.error} />
      {result.isLoading ? (
        <Loading />
      ) : (
        <section className="panel">
          {result.data?.data.length ? (
            result.data.data.map((payment) => (
              <div className="panel-body" key={payment.id}>
                <Link className="record-link" to={`/factures/${payment.invoice_id}`}>
                  {payment.invoice?.number} · Ouvrir la facture
                </Link>
                <PaymentControls row={{ payments: [payment] }} />
              </div>
            ))
          ) : (
            <Empty>Aucun règlement en attente.</Empty>
          )}
          <Pager page={result.data} change={setPage} />
        </section>
      )}
    </>
  );
}
export function AccountingBalance() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [account, setAccount] = useState('');
  const accounts = useOptions('erp/ledger-accounts');
  const result = useQuery({
    queryKey: ['accounting-balance', from, to, account],
    queryFn: () => api.get(`/accounting/balance${queryString({ from, to, account_id: account })}`),
  });
  const data = result.data?.data;
  return (
    <>
      <PageTitle
        title="Balance & grand livre"
        description="Calculés uniquement à partir des écritures comptabilisées. La trésorerie n’alimente pas automatiquement ces écritures."
      />
      <section className="panel">
        <div className="toolbar">
          <div className="actions">
            <label>
              Du
              <input aria-label="Du" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              Au
              <input aria-label="Au" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <select
              aria-label="Compte du grand livre"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            >
              <option value="">Tous les comptes</option>
              {accounts.data?.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.code} · {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ErrorBox error={result.error || accounts.error} />
        {result.isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Compte</th>
                    <th>Intitulé</th>
                    <th>Débit</th>
                    <th>Crédit</th>
                    <th>Solde débiteur / créditeur</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.accounts.map((item: Row) => (
                    <tr key={item.account_id}>
                      <td>{item.code}</td>
                      <td>{item.label}</td>
                      <td>{money(item.debit)}</td>
                      <td>{money(item.credit)}</td>
                      <td>{money(item.balance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>Totaux</td>
                    <td>{money(data?.debit)}</td>
                    <td>{money(data?.credit)}</td>
                    <td>{Number(data?.debit) === Number(data?.credit) ? 'Équilibré' : 'À vérifier'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {account && (
              <div className="panel-body">
                <h2>Grand livre du compte</h2>
                {data?.ledger.map((line: Row, index: number) => (
                  <div className="contact-row" key={index}>
                    <div>
                      <strong>{line.reference}</strong>
                      <p>
                        {date(line.date)} · {line.label}
                      </p>
                    </div>
                    <div>
                      Débit {money(line.debit)}
                      <br />
                      Crédit {money(line.credit)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
export function FneStatus() {
  const result = useQuery({ queryKey: ['fne-status'], queryFn: () => api.get('/fne/status') });
  const data = result.data?.data;
  return (
    <>
      <PageTitle
        title="Connecteur FNE"
        description="Préparation de l’intégration DGI. Aucune clé privée n’est accessible depuis React."
      />
      <ErrorBox error={result.error} />
      {result.isLoading ? (
        <Loading />
      ) : (
        <section className="panel panel-body">
          <h2>{data?.enabled ? 'Connecteur activé' : 'Connecteur désactivé'}</h2>
          <div className="notice warning">
            Les essais locaux ne certifient aucune facture réelle. Les coordonnées FNE, le point de vente,
            l’établissement et la recette DGI restent à configurer.
          </div>
          <dl className="facts">
            <div>
              <dt>Environnement</dt>
              <dd>{data?.mode}</dd>
            </div>
            <div>
              <dt>Configuration complète</dt>
              <dd>{data?.configured ? 'Oui' : 'Non'}</dd>
            </div>
            <div>
              <dt>Production approuvée</dt>
              <dd>{data?.production_approved ? 'Oui' : 'Non'}</dd>
            </div>
          </dl>
          <h3>Contrôles de préparation</h3>
          {data?.ready ? <p>Configuration renseignée et contrôles locaux satisfaits. La connexion et la recette externe restent à vérifier.</p> : <ul>{data?.issues?.map((issue: string) => <li key={issue}>{issue}</li>)}</ul>}
          <p>{data?.supported}</p>
          <p className="muted">
            Les résultats incertains après un problème réseau sont bloqués pour rapprochement manuel, afin de
            ne pas créer de doublon fiscal.
          </p>
        </section>
      )}
    </>
  );
}
export function InvoiceFne({ row }: { row: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [payload, setPayload] = useState<Row | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const result = useQuery({
    queryKey: ['fne-status'],
    queryFn: () => api.get('/fne/status'),
    enabled: can(user, 'fne.view'),
  });
  if (!can(user, 'fne.view')) return null;
  return (
    <div className="fne-invoice">
      <h3>Facturation électronique</h3>
      <p>
        État : <Status value={row.fne_status} /> · {row.fne_environment || 'Non transmise'}
      </p>
      {row.fne_reference && (
        <p>
          Référence FNE : <strong>{row.fne_reference}</strong>
        </p>
      )}
      {row.fne_error && <div className="notice warning">{row.fne_error}</div>}
      <ErrorBox error={error || result.error} />
      <div className="actions">
        <button
          className="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              setPayload((await api.post(`/invoices/${row.id}/fne/prepare`)).data);
            } catch (e) {
              setError(e);
            } finally {
              setBusy(false);
            }
          }}
        >
          <FileText size={15} />
          Vérifier le dossier FNE
        </button>
        {result.data?.data.enabled &&
          result.data.data.configured &&
          can(user, 'fne.certify') &&
          ['non_integree', 'refuse_api'].includes(row.fne_status) && (
            <button className="button primary" onClick={() => setShow(true)}>
              Transmettre en {result.data.data.mode}
            </button>
          )}
      </div>
      {payload && (
        <details open>
          <summary>Dossier préparé, non transmis</summary>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </details>
      )}
      {show && (
        <ActionForm
          title="Confirmer la transmission FNE"
          close={() => setShow(false)}
          submit={async () => {
            await api.post(`/invoices/${row.id}/fne/certify`, { confirm: true });
            await qc.invalidateQueries();
          }}
        >
          <div className="notice warning">
            Cette action contactera la plateforme FNE en mode {result.data?.data.mode}. Vérifiez les données
            et l’environnement avant confirmation.
          </div>
        </ActionForm>
      )}
    </div>
  );
}
