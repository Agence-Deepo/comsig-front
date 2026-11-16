import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Wallet } from 'lucide-react';

import { Card, DataTable, type Column } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { can, date, money, type Row } from './types';
import { Empty, ErrorBox, PageTitle, Status } from './ui';

const METHOD_LABELS: Record<string, string> = {
  especes: 'Espèces',
  virement: 'Virement',
  cheque: 'Chèque',
  mobile_money: 'Mobile money',
};

/** Compte client financier : factures, règlements validés, reste dû et retard. */
export default function CustomerAccount() {
  const { id } = useParams();
  const { user } = useAuth();
  const account = useQuery({
    queryKey: ['customer-account', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/organizations/${id}/account`, signal),
    enabled: Boolean(id) && can(user, 'finance.view'),
  });
  if (!can(user, 'finance.view'))
    return (
      <Card>
        <Empty>Votre profil ne permet pas de consulter un compte client financier.</Empty>
      </Card>
    );
  const data = account.data?.data;
  const invoiceColumns: Column<Row>[] = [
    {
      key: 'number',
      label: 'Facture',
      render: (row) => <Link to={'/factures/' + row.id}>{row.number}</Link>,
    },
    { key: 'due_date', label: 'Échéance', render: (row) => date(row.due_date) },
    { key: 'total_ttc', label: 'Total TTC', num: true, render: (row) => money(row.total_ttc) },
    { key: 'paid_amount', label: 'Réglé', num: true, render: (row) => money(row.paid_amount) },
    { key: 'outstanding', label: 'Reste dû', num: true, render: (row) => money(row.outstanding) },
    {
      key: 'status',
      label: 'État',
      render: (row) => (row.overdue ? <Status value="echeance_depassee" /> : <Status value={row.status} />),
    },
  ];
  const paymentColumns: Column<Row>[] = [
    { key: 'paid_at', label: 'Date', render: (row) => date(row.paid_at) },
    { key: 'reference', label: 'Référence' },
    {
      key: 'method',
      label: 'Moyen',
      render: (row) => METHOD_LABELS[row.method] ?? row.method,
    },
    { key: 'amount', label: 'Montant', num: true, render: (row) => money(row.amount) },
  ];
  return (
    <>
      <PageTitle
        eyebrow="FINANCE"
        title={data?.organization?.legal_name ?? 'Compte client'}
        description="Créances, règlements validés et retard de paiement calculés depuis les factures réelles."
        actions={
          data?.organization ? (
            <Link className="button" to={'/clients/' + data.organization.id}>
              Ouvrir la fiche client
            </Link>
          ) : undefined
        }
      />
      <ErrorBox error={account.error} retry={() => void account.refetch()} />
      {data && (
        <>
          <Card
            title={
              <span className="card-title-icon">
                <Wallet size={18} />
                Situation du compte
              </span>
            }
            sub={`Référence ${data.organization.ref}`}
          >
            <div className="quote-totals">
              <div>
                <span>Facturé</span>
                <strong>{money(data.totals.invoiced)}</strong>
              </div>
              <div>
                <span>Encaissé</span>
                <strong>{money(data.totals.paid)}</strong>
              </div>
              <div className="grand-total">
                <span>Reste dû</span>
                <strong>{money(data.totals.outstanding)}</strong>
              </div>
              <div>
                <span>Dont échu</span>
                <strong>{money(data.totals.overdue)}</strong>
              </div>
            </div>
            {data.totals.overdue > 0 && (
              <div className="notice warning" role="status">
                <AlertTriangle size={15} /> {money(data.totals.overdue)} échus sur {data.totals.count}{' '}
                facture(s). Relance et recouvrement restent des décisions humaines.
              </div>
            )}
            <p className="xsmall muted">
              Seuls les règlements validés sont comptés dans l’encaissé. Une demande en attente ne réduit pas
              le reste dû.
            </p>
          </Card>
          <Card className="customer-account-invoices" title="Factures" flush>
            <DataTable
              columns={invoiceColumns}
              rows={data.invoices}
              loading={account.isLoading}
              caption="Factures du client"
              empty={<Empty>Aucune facture pour ce client.</Empty>}
            />
          </Card>
          <Card className="customer-account-payments" title="Règlements validés" flush>
            <DataTable
              columns={paymentColumns}
              rows={data.payments}
              loading={account.isLoading}
              caption="Règlements validés"
              empty={<Empty>Aucun règlement validé.</Empty>}
            />
          </Card>
        </>
      )}
    </>
  );
}

/** File des créances échues de la société. */
export function OverdueInvoices() {
  const { user } = useAuth();
  const overdue = useQuery({
    queryKey: ['overdue-invoices'],
    queryFn: ({ signal }) =>
      api.get<{ data: Row[]; meta: { aged: Record<string, number> } }>('/invoices/overdue', signal),
    enabled: can(user, 'finance.view'),
  });
  const columns: Column<Row>[] = [
    {
      key: 'number',
      label: 'Facture',
      render: (row) => <Link to={`/clients/${row.organization_id}/compte`}>{row.number}</Link>,
    },
    { key: 'due_date', label: 'Échéance', render: (row) => date(row.due_date) },
    {
      key: 'days_late',
      label: 'Retard',
      num: true,
      render: (row) => `${row.days_late} j`,
    },
    { key: 'outstanding', label: 'Reste dû', num: true, render: (row) => money(row.outstanding) },
  ];
  const total = (overdue.data?.data ?? []).reduce((sum, row) => sum + Number(row.outstanding), 0);
  const aged = overdue.data?.meta?.aged;
  const buckets: [string, string][] = [
    ['a_echoir', 'À échoir'],
    ['j0_30', '1–30 j'],
    ['j31_60', '31–60 j'],
    ['j61_90', '61–90 j'],
    ['plus_90', '> 90 j'],
  ];
  return (
    <>
      <Card
        title={
          <span className="card-title-icon">
            <AlertTriangle size={18} />
            Balance âgée
          </span>
        }
        sub="Répartition du reste dû des factures émises, par ancienneté d’échéance."
      >
        <div className="quote-totals">
          {buckets.map(([key, text]) => (
            <div key={key}>
              <span>{text}</span>
              <strong>{money(aged?.[key] ?? 0)}</strong>
            </div>
          ))}
          <div className="grand-total">
            <span>Encours total</span>
            <strong>{money(aged?.total ?? 0)}</strong>
          </div>
        </div>
        <p className="xsmall muted">
          Les tranches sont calculées depuis les échéances réelles. Une tranche à zéro signifie qu’aucune
          facture n’y figure, pas qu’un montant a été effacé.
        </p>
      </Card>
      <Card
        title={
          <span className="card-title-icon">
            <AlertTriangle size={18} />
            Créances échues
          </span>
        }
        sub={`${overdue.data?.data.length ?? 0} facture(s) échue(s) · ${money(total)}`}
        flush
      >
        <ErrorBox error={overdue.error} retry={() => void overdue.refetch()} />
        <DataTable
          columns={columns}
          rows={overdue.data?.data}
          loading={overdue.isLoading}
          caption="Factures échues"
          empty={<Empty>Aucune créance échue.</Empty>}
        />
      </Card>
    </>
  );
}
