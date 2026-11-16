import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { GraduationCap, Plus } from 'lucide-react';

import { Card, DataTable, type Column } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { can } from './types';
import { Empty, ErrorBox, PageTitle } from './ui';
import { date, today, type Row } from './types';

const CRITERIA: [string, string][] = [
  ['qualite', 'Qualité du travail'],
  ['productivite', 'Productivité'],
  ['ponctualite', 'Ponctualité'],
  ['esprit_equipe', 'Esprit d’équipe'],
  ['initiative', 'Initiative'],
];

/** Évaluations et formations d'un collaborateur, réservées aux droits RH. */
export default function HrDevelopment() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState<'evaluation' | 'training' | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const development = useQuery({
    queryKey: ['hr-development', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/erp/employees/${id}/development`, signal),
    enabled: Boolean(id) && can(user, 'hr.view'),
  });
  const data = development.data?.data;
  const editable = can(user, 'hr.update');
  const evaluationColumns: Column<Row>[] = [
    { key: 'period', label: 'Période' },
    { key: 'overall', label: 'Note globale', num: true, render: (row) => `${row.overall} / 5` },
    {
      key: 'strengths',
      label: 'Points forts',
      render: (row) => <span className="small">{row.strengths || '—'}</span>,
    },
    { key: 'evaluator_name', label: 'Évaluateur' },
  ];
  const trainingColumns: Column<Row>[] = [
    {
      key: 'title',
      label: 'Formation',
      render: (row) => (
        <>
          <div className="cell-title">{row.title}</div>
          <div className="cell-sub">{row.provider || '—'}</div>
        </>
      ),
    },
    { key: 'starts_on', label: 'Début', render: (row) => date(row.starts_on) },
    { key: 'status', label: 'Statut', render: (row) => row.status },
  ];
  async function submitEvaluation(form: FormData) {
    setBusy(true);
    setError(null);
    try {
      const scores: Record<string, number> = {};
      for (const [key] of CRITERIA) scores[key] = Number(form.get(`score_${key}`) ?? 3);
      await api.post(`/erp/employees/${id}/evaluations`, {
        period: String(form.get('period')),
        scores,
        strengths: String(form.get('strengths') ?? '') || undefined,
        improvements: String(form.get('improvements') ?? '') || undefined,
        objectives: String(form.get('objectives') ?? '') || undefined,
      });
      setOpen(null);
      await qc.invalidateQueries({ queryKey: ['hr-development', id] });
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  async function submitTraining(form: FormData) {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/erp/employees/${id}/trainings`, {
        title: String(form.get('title')),
        provider: String(form.get('provider') ?? '') || undefined,
        starts_on: String(form.get('starts_on') ?? '') || undefined,
        status: String(form.get('status')),
      });
      setOpen(null);
      await qc.invalidateQueries({ queryKey: ['hr-development', id] });
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  if (!can(user, 'hr.view'))
    return (
      <Card>
        <Empty>Votre profil ne permet pas de consulter les évaluations et formations.</Empty>
      </Card>
    );
  return (
    <>
      <PageTitle
        eyebrow="RESSOURCES HUMAINES"
        title="Évaluations et formations"
        description="Notes et formations saisies par un responsable. La note globale est la moyenne arithmétique des critères déclarés."
      />
      <ErrorBox error={development.error || error} retry={() => void development.refetch()} />
      <Card
        title="Évaluations"
        sub={
          data?.meta?.evaluation_avg != null
            ? `Moyenne : ${data.meta.evaluation_avg} / 5`
            : 'Aucune évaluation'
        }
        actions={
          editable ? (
            <button className="button" onClick={() => setOpen('evaluation')}>
              <Plus size={16} />
              Évaluer
            </button>
          ) : undefined
        }
        flush
      >
        <DataTable
          columns={evaluationColumns}
          rows={data?.evaluations}
          loading={development.isLoading}
          caption="Évaluations du collaborateur"
          empty={<Empty>Aucune évaluation enregistrée.</Empty>}
        />
      </Card>
      <Card
        className="hr-trainings"
        title={
          <span className="card-title-icon">
            <GraduationCap size={18} />
            Formations
          </span>
        }
        actions={
          editable ? (
            <button className="button" onClick={() => setOpen('training')}>
              <Plus size={16} />
              Formation
            </button>
          ) : undefined
        }
        flush
      >
        <DataTable
          columns={trainingColumns}
          rows={data?.trainings}
          loading={development.isLoading}
          caption="Formations du collaborateur"
          empty={<Empty>Aucune formation enregistrée.</Empty>}
        />
      </Card>
      {open === 'evaluation' && (
        <form
          className="notice info"
          onSubmit={(event) => {
            event.preventDefault();
            void submitEvaluation(new FormData(event.currentTarget));
          }}
        >
          <div className="form-grid">
            <label className="field">
              Période *
              <input name="period" required maxLength={20} defaultValue={String(new Date().getFullYear())} />
            </label>
            {CRITERIA.map(([key, text]) => (
              <label className="field" key={key}>
                {text} (1 à 5)
                <select name={`score_${key}`} defaultValue="3">
                  {[1, 2, 3, 4, 5].map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="field wide">
              Points forts
              <textarea name="strengths" maxLength={5000} />
            </label>
            <label className="field wide">
              Axes de progrès
              <textarea name="improvements" maxLength={5000} />
            </label>
            <label className="field wide">
              Objectifs
              <textarea name="objectives" maxLength={5000} />
            </label>
          </div>
          <div className="row-wrap">
            <button className="button" type="button" onClick={() => setOpen(null)}>
              Annuler
            </button>
            <button className="button primary" disabled={busy}>
              Enregistrer l’évaluation
            </button>
          </div>
        </form>
      )}
      {open === 'training' && (
        <form
          className="notice info"
          onSubmit={(event) => {
            event.preventDefault();
            void submitTraining(new FormData(event.currentTarget));
          }}
        >
          <div className="form-grid">
            <label className="field">
              Intitulé *
              <input name="title" required maxLength={200} />
            </label>
            <label className="field">
              Organisme
              <input name="provider" maxLength={200} />
            </label>
            <label className="field">
              Début
              <input name="starts_on" type="date" defaultValue={today()} />
            </label>
            <label className="field">
              Statut *
              <select name="status" defaultValue="prevue">
                <option value="prevue">Prévue</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </label>
          </div>
          <div className="row-wrap">
            <button className="button" type="button" onClick={() => setOpen(null)}>
              Annuler
            </button>
            <button className="button primary" disabled={busy}>
              Enregistrer la formation
            </button>
          </div>
        </form>
      )}
    </>
  );
}
