import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../components/ui';
import { api, queryString } from './api';
import { date, type Row } from './types';
import { ErrorBox, Loading } from './ui';

export default function SecurityArchives() {
  const [period, setPeriod] = useState('');
  const [page, setPage] = useState(1);
  const seals = useQuery({
    queryKey: ['security-monitor'],
    queryFn: () => api.get('/admin/security-monitor'),
  });
  const rows = useQuery({
    queryKey: ['security-archive', period, page],
    queryFn: () => api.get(`/admin/security-monitor/seals/${period}/archive` + queryString({ page })),
    enabled: !!period,
  });
  return (
    <>
      <PageHeader
        title="Archives des connexions"
        subtitle="Copies scellées des événements mensuels ; accès réservé à l’administration."
      />
      <p>
        <Link to="/securite">Retour à la sécurité</Link>
      </p>
      <ErrorBox error={seals.error || rows.error} />
      {seals.isLoading && <Loading />}
      <label className="field">
        Mois archivé
        <select
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Sélectionner un mois</option>
          {seals.data?.seals.map((s: Row) => (
            <option key={s.id} value={s.period}>
              {s.period} · {s.count} événement(s)
            </option>
          ))}
        </select>
      </label>
      {rows.isLoading && <Loading />}
      {rows.data && (
        <Card
          title={`Archive ${period}`}
          sub="Les comptes et adresses affichés sont sensibles. Vérifiez l’empreinte depuis la page Sécurité."
        >
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Compte</th>
                  <th>Adresse IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.data.data.map((r: Row) => (
                  <tr key={r.event_id}>
                    <td>{date(r.event_at)}</td>
                    <td>{r.action}</td>
                    <td>{r.user_id || 'Non identifié'}</td>
                    <td>{r.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row-wrap">
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Précédent
            </button>
            <span>
              Page {rows.data.current_page} / {rows.data.last_page}
            </span>
            <button className="btn" disabled={page >= rows.data.last_page} onClick={() => setPage(page + 1)}>
              Suivant
            </button>
          </div>
        </Card>
      )}
    </>
  );
}
