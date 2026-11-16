import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, PageHeader } from '../components/ui';
import { api, queryString } from './api';
import { money, today, type Row } from './types';
import { ActionForm, ErrorBox, Loading } from './ui';

export default function Performance({ pipeline = false }: { pipeline?: boolean }) {
  const [period, setPeriod] = useState(today().slice(0, 7));
  const [form, setForm] = useState<'target' | 'plan' | 'assign' | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['performance', period],
    queryFn: () => api.get('/performance' + queryString({ period })),
    enabled: /^\d{4}-\d{2}$/.test(period),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ['performance'] });
  const data = q.data;
  return (
    <>
      <PageHeader
        title={pipeline ? 'Pipeline des commerciaux' : 'Objectifs et commissions'}
        subtitle="Pilotage mensuel limité à votre périmètre de données."
      />
      <label className="field">
        Mois
        <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </label>
      <ErrorBox error={q.error || actionError} />
      {q.isLoading && <Loading />}
      {data && (
        <>
          <p className="notice">
            Les devis acceptés HT, les paiements validés et le pipeline pondéré sont des mesures distinctes.
            Une estimation n’est ni une commission validée ni un paiement.
          </p>
          {data.can_manage && (
            <div className="row-wrap">
              <button className="btn" onClick={() => setForm('target')}>
                Définir un objectif
              </button>
              <button className="btn" onClick={() => setForm('assign')}>
                Affecter un plan
              </button>
              {data.can_manage_plans && (
                <button className="btn" onClick={() => setForm('plan')}>
                  Créer un plan de commission
                </button>
              )}
            </div>
          )}
          <Card
            title={pipeline ? 'Prévisions par commercial' : 'Résultats et classement'}
            sub="Classement et paliers sur l’atteinte exacte ; le pourcentage affiché est arrondi. Le classement clients reste basé sur les factures émises."
          >
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Rang</th>
                    <th>Commercial</th>
                    <th>Objectif</th>
                    <th>Devis acceptés HT</th>
                    <th>Encaissé</th>
                    <th>Pipeline pondéré</th>
                    <th>Atteinte</th>
                    <th>Commission estimée</th>
                    {data.can_manage && <th>Relevé</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((x: Row) => (
                    <tr key={x.user_id}>
                      <td>{x.rank}</td>
                      <td>
                        {x.name}
                        <br />
                        <span className="small muted">
                          {x.plan ? `${x.plan} (plan n° ${x.plan_id})` : 'Aucun plan'} ·{' '}
                          {x.base === 'marge'
                            ? 'marge'
                            : x.base === 'encaisse'
                              ? 'encaissement'
                              : 'devis acceptés HT'}
                        </span>
                      </td>
                      <td>{x.target == null ? 'Non défini' : money(x.target)}</td>
                      <td>{money(x.revenue)}</td>
                      <td>{money(x.collected)}</td>
                      <td>{money(x.pipeline_weighted)}</td>
                      <td>{x.achievement_pct == null ? '—' : `${x.achievement_pct} %`}</td>
                      <td>
                        {x.commission_estimate == null
                          ? 'Non configurée'
                          : `${money(x.commission_estimate)} (${x.commission_rate} %)`}
                      </td>
                      {data.can_manage && <td>{x.commission_estimate == null ? 'Objectif ou plan manquant' : <button className="btn" disabled={data.statements.some((s: Row) => s.user_id === x.user_id && ['valide','paye'].includes(s.status))} onClick={async () => { try { setActionError(null); await api.post('/performance/statements', { user_id:x.user_id, period }); await refresh(); } catch (e) { setActionError(e); } }}>Calculer</button>}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {!data.rows.length && <p>Aucun commercial accessible sur ce périmètre.</p>}
          <Card
            title="Relevés de commission"
            sub="Le calcul fige les données. La validation exige un autre responsable ; aucun paiement n’est déclenché."
          >
            {data.statements.map((s: Row) => (
              <div className="row-wrap" key={s.id}>
                <span>
                  {s.user_name} · {money(s.amount)} ·{' '}
                  {s.status === 'paye'
                    ? 'Paiement enregistré'
                    : s.status === 'valide'
                      ? 'Validé'
                      : s.status === 'obsolete'
                        ? 'À recalculer'
                        : 'À valider'}
                </span>
                {data.can_manage && s.status === 'calcule' && (
                  <button
                    className="btn"
                    onClick={async () => {
                      try {
                        setActionError(null);
                        await api.post(`/performance/statements/${s.id}/validate`, {});
                        await refresh();
                      } catch (e) {
                        setActionError(e);
                      }
                    }}
                  >
                    Valider
                  </button>
                )}
              </div>
            ))}
            {!data.statements.length && <p>Aucun relevé calculé pour ce mois.</p>}
          </Card>
          {form === 'target' && (
            <ActionForm
              title="Objectif mensuel"
              close={() => setForm(null)}
              submit={async (f) => {
                await api.post('/performance/targets', {
                  user_id: Number(f.get('user_id')),
                  period,
                  amount: Number(f.get('amount')),
                });
                await refresh();
              }}
            >
              <label className="field">
                Commercial
                <select name="user_id" required>
                  {data.rows.map((x: Row) => (
                    <option value={x.user_id} key={x.user_id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Objectif en FCFA
                <input name="amount" type="number" min="0" required />
              </label>
            </ActionForm>
          )}
          {form === 'assign' && (
            <ActionForm
              title="Affecter un plan"
              close={() => setForm(null)}
              submit={async (f) => {
                await api.post('/performance/assign', {
                  user_id: Number(f.get('user_id')),
                  plan_id: Number(f.get('plan_id')),
                  effective_period: f.get('effective_period'),
                });
                await refresh();
              }}
            >
              <label className="field">
                Commercial
                <select name="user_id" required>
                  {data.rows.map((x: Row) => (
                    <option value={x.user_id} key={x.user_id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Plan
                <select name="plan_id" required>
                  <option value="">Sélectionner</option>
                  {data.plans.map((x: Row) => (
                    <option value={x.id} key={x.id}>
                      {x.name} · plan n° {x.id} · {x.base === 'encaisse' ? 'encaissements' : x.base === 'marge' ? 'marge' : 'devis acceptés'}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                À partir du mois
                <input type="month" name="effective_period" defaultValue={period} required />
              </label>
              <p>Applicable jusqu’à la prochaine affectation. Les relevés validés restent protégés.</p>
              {!data.plans.length && <p>Aucun plan configuré par la direction.</p>}
            </ActionForm>
          )}
          {form === 'plan' && (
            <ActionForm
              title="Créer un plan de commission"
              close={() => setForm(null)}
              submit={async (f) => {
                for (const i of [1, 2]) {
                  if ((f.get(`threshold${i}`) === '') !== (f.get(`rate${i}`) === '')) throw new Error('Renseignez à la fois le seuil et le taux de chaque palier, ou laissez les deux champs vides.');
                }
                const tiers = [{ from_pct: 0, rate: Number(f.get('rate0')) }];
                if (f.get('threshold1') !== '' && f.get('rate1') !== '')
                  tiers.push({ from_pct: Number(f.get('threshold1')), rate: Number(f.get('rate1')) });
                if (f.get('threshold2') !== '' && f.get('rate2') !== '')
                  tiers.push({ from_pct: Number(f.get('threshold2')), rate: Number(f.get('rate2')) });
                await api.post('/performance/plans', { name: f.get('name'), base: f.get('base'), tiers });
                await refresh();
              }}
            >
              <p>
                Renseignez les taux réellement validés. Le taux applicable est celui du dernier seuil atteint.
              </p>
              <label className="field">
                Nom
                <input name="name" required maxLength={150} />
              </label>
              <label className="field">
                Base
                <select name="base" defaultValue="encaisse">
                  <option value="ca_valide">Devis acceptés HT</option>
                  <option value="marge">Marge des devis acceptés</option>
                  <option value="encaisse">Encaissements validés</option>
                </select>
              </label>
              <label className="field">
                Taux à partir de 0 % d’atteinte
                <input name="rate0" type="number" min="0" max="50" step="0.01" required />
              </label>
              {[1, 2].map((i) => (
                <div className="row-wrap" key={i}>
                  <label className="field">
                    Seuil d’atteinte %
                    <input name={`threshold${i}`} type="number" min="0.01" max="1000" step="0.01" />
                  </label>
                  <label className="field">
                    Taux de commission %<input name={`rate${i}`} type="number" min="0" max="50" step="0.01" />
                  </label>
                </div>
              ))}
            </ActionForm>
          )}
        </>
      )}
    </>
  );
}
