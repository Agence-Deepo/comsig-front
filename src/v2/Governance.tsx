import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, PageHeader } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { date, type Row } from './types';
import { ActionForm, ErrorBox, Loading } from './ui';

export default function Governance() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [review, setReview] = useState<Row | null>(null);
  const [failure, setFailure] = useState<unknown>(null);
  const q = useQuery({ queryKey: ['governance'], queryFn: () => api.get('/governance/reports') });
  const refresh = () => qc.invalidateQueries({ queryKey: ['governance'] });
  return (
    <>
      <PageHeader
        title="Audits de gouvernance"
        subtitle="Contrôles enregistrés et examinés manuellement dans le périmètre autorisé."
      />
      <ErrorBox error={q.error || failure} />
      {q.isLoading && <Loading />}
      {user?.role.code === 'direction_generale' && (
        <button
          className="btn"
          onClick={async () => {
            try {
              setFailure(null);
              await api.post('/governance/reports', {});
              await refresh();
            } catch (e) {
              setFailure(e);
            }
          }}
        >
          Générer un contrôle
        </button>
      )}
      <p className="small muted">
        Les nombres sont figés lors du contrôle. Ils signalent des points à examiner et ne constituent pas une
        décision automatique.
      </p>
      {q.data?.data.map((report: Row) => {
        let findings: Row[] = [];
        try {
          findings = typeof report.findings === 'string' ? JSON.parse(report.findings) : report.findings;
        } catch {
          findings = [];
        }
        const scored = findings.length > 0 && findings.every((item) => item.severity);
        const flagged = findings.filter((item) => Number(item.count) > 0);
        const score = Math.max(0, 100 - flagged.reduce((sum, item) => sum + (item.severity === 'critique' ? 15 : item.severity === 'majeure' ? 6 : 2), 0));
        return (
          <Card
            key={report.id}
            title={`Contrôle n° ${report.id} · ${report.status === 'ouvert' ? 'À examiner' : 'Examiné'}`}
            sub={`${date(report.created_at)} · ${report.creator}`}
          >
            {scored && <p><strong>Score indicatif des contrôles visibles : {score}/100</strong> · {flagged.length} constat(s) sur {findings.length} contrôle(s). Barème : −15 critique, −6 majeur, −2 mineur. Ce score ne couvre pas les contrôles non disponibles ou masqués par vos droits.</p>}
            <ul>
              {findings.map((item, i) => (
                <li key={i}>
                  <strong>
                    {item.label} : {item.count}
                  </strong>{' '}
                  {Number(item.count) > 0 && item.severity && <span> · {item.severity}</span>} — {item.definition}
                  {item.recommendation && (
                    <div className="small muted">Suite suggérée : {item.recommendation}</div>
                  )}
                  {item.evidence?.length > 0 && (
                    <ul>
                      {item.evidence.map((e: Row, j: number) => (
                        <li key={j}>
                          <Link to={e.link}>{e.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            {report.review_note && <p>Examen : {report.review_note}</p>}
            {report.status === 'ouvert' && (
              <button className="btn" onClick={() => setReview(report)}>
                Enregistrer l’examen
              </button>
            )}
          </Card>
        );
      })}
      {review && (
        <ActionForm
          title={`Examen du contrôle n° ${review.id}`}
          close={() => setReview(null)}
          submit={async (f) => {
            await api.post(`/governance/reports/${review.id}/review`, { review_note: f.get('review_note') });
            await refresh();
          }}
        >
          <label className="field">
            Constat et suite donnée
            <textarea name="review_note" required maxLength={3000} />
          </label>
        </ActionForm>
      )}
    </>
  );
}
