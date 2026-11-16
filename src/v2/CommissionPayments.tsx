import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, PageHeader } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { can, date, money, today, type Row } from './types';
import { ActionForm, ErrorBox, Loading } from './ui';

export default function CommissionPayments() {
  const { user } = useAuth();
  const [period, setPeriod] = useState(today().slice(0, 7));
  const [selected, setSelected] = useState<Row | null>(null);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['commission-payments', period],
    queryFn: () => api.get('/performance/payments' + queryString({ period })),
    enabled: /^\d{4}-\d{2}$/.test(period),
  });
  return (
    <>
      <PageHeader title="Paiements des commissions" subtitle="Suivi administratif des relevés validés." />
      <p className="notice">
        Cette page ne réalise aucun transfert : enregistrez uniquement un paiement déjà effectué et sa
        référence justificative.
      </p>
      <label className="field">
        Mois du relevé
        <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </label>
      <ErrorBox error={q.error} />
      {q.isLoading && <Loading />}
      {q.data && (
        <Card title="Relevés validés et paiements enregistrés">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Commercial</th>
                  <th>Montant</th>
                  <th>État</th>
                  <th>Référence</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {q.data.data.map((s: Row) => (
                  <tr key={s.id}>
                    <td>{s.user_name}</td>
                    <td>{money(s.amount)}</td>
                    <td>{s.status === 'paye' ? 'Paiement enregistré' : 'Validé'}</td>
                    <td>{s.payment_reference || '—'}</td>
                    <td>{s.paid_at ? date(s.paid_at) : '—'}</td>
                    <td>
                      {s.status === 'valide' && can(user, 'finance.update') && (
                        <button className="btn" onClick={() => setSelected(s)}>
                          Enregistrer un paiement
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!q.data.data.length && <p>Aucun relevé validé pour ce mois.</p>}
        </Card>
      )}
      {selected && (
        <ActionForm
          title={`Paiement déjà effectué : ${selected.user_name}`}
          close={() => setSelected(null)}
          submit={async (f) => {
            await api.post(`/performance/statements/${selected.id}/paid`, {
              payment_reference: f.get('payment_reference'),
              paid_at: f.get('paid_at'),
              payment_note: f.get('payment_note') || null,
            });
            await qc.invalidateQueries({ queryKey: ['commission-payments'] });
          }}
        >
          <p>Montant du relevé : {money(selected.amount)}. Cette action ne déclenche pas de paiement.</p>
          <label className="field">
            Référence du paiement
            <input name="payment_reference" required maxLength={150} />
          </label>
          <label className="field">
            Date effective
            <input name="paid_at" type="date" max={today()} defaultValue={today()} required />
          </label>
          <label className="field">
            Note facultative
            <textarea name="payment_note" maxLength={2000} />
          </label>
        </ActionForm>
      )}
    </>
  );
}
