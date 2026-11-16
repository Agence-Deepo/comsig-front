import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Grid2x2 } from 'lucide-react';

import { Badge, Card, DataTable, type Column } from '../components/ui';
import { api, downloadFile, queryString } from './api';
import { useAuth } from './auth';
import { can, date, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, PageTitle, Status } from './ui';

const QUADRANTS: [string, string, string][] = [
  ['forces', 'Forces', 'Interne · positif'],
  ['faiblesses', 'Faiblesses', 'Interne · négatif'],
  ['opportunites', 'Opportunités', 'Externe · positif'],
  ['menaces', 'Menaces', 'Externe · négatif'],
];

function periodChoices(kind: string): { value: string; label: string }[] {
  const year = new Date().getFullYear();
  if (kind === 'trimestriel')
    return Array.from({ length: 4 }, (_, index) => ({
      value: `${year}-T${4 - index}`,
      label: `T${4 - index} ${year}`,
    }));
  if (kind === 'semestriel')
    return Array.from({ length: 2 }, (_, index) => ({
      value: `${year}-S${2 - index}`,
      label: `S${2 - index} ${year}`,
    }));
  if (kind === 'annuel') return [{ value: `${year}`, label: `Année ${year}` }];
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, new Date().getMonth() - index, 1));
    return {
      value: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    };
  });
}

export function SwotList() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState('mensuel');
  const [period, setPeriod] = useState(periodChoices('mensuel')[0].value);
  const allowed =
    can(user, 'reporting.view') || user?.role.data_scope === 'all' || can(user, 'reporting.export');
  const analyses = useQuery({
    queryKey: ['swot'],
    queryFn: ({ signal }) => api.get<Page>(`/swot${queryString({ per_page: 50 })}`, signal),
    enabled: allowed,
  });
  if (!allowed)
    return (
      <Card>
        <Empty>Votre profil ne permet pas de consulter les analyses SWOT.</Empty>
      </Card>
    );
  const columns: Column<Row>[] = [
    {
      key: 'label',
      label: 'Période',
      render: (row) => <Link to={`/swot/${row.id}`}>{row.label}</Link>,
    },
    { key: 'period_kind', label: 'Périodicité' },
    {
      key: 'department_code',
      label: 'Périmètre',
      render: (row) => row.department_code || 'Direction générale',
    },
    {
      key: 'counts',
      label: 'F / Fa / O / M',
      render: (row) =>
        row.counts
          ? `${row.counts.forces} / ${row.counts.faiblesses} / ${row.counts.opportunites} / ${row.counts.menaces}`
          : '—',
    },
    { key: 'status', label: 'Statut', render: (row) => <Status value={row.status} /> },
    { key: 'generated_at', label: 'Préparée le', render: (row) => date(row.generated_at) },
  ];
  return (
    <>
      <PageTitle
        eyebrow="PILOTAGE"
        title="Analyse SWOT"
        description="Constats calculés depuis les indicateurs mesurés, puis revus et validés. Aucun constat sans chiffre à l’appui."
        actions={
          can(user, 'reporting.export') || user?.role.data_scope === 'all' ? (
            <button className="button primary" onClick={() => setCreating(true)}>
              <Grid2x2 size={16} />
              Préparer une analyse
            </button>
          ) : undefined
        }
      />
      <Card title="Analyses" flush>
        <ErrorBox error={analyses.error} retry={() => void analyses.refetch()} />
        <DataTable
          columns={columns}
          rows={analyses.data?.data}
          loading={analyses.isLoading}
          caption="Analyses SWOT"
          empty={<Empty>Aucune analyse préparée.</Empty>}
        />
      </Card>
      {creating && (
        <ActionForm
          title="Préparer une analyse SWOT"
          submitLabel="Préparer"
          close={() => setCreating(false)}
          submit={async (form) => {
            const values: Row = Object.fromEntries(form);
            const response = await api.post<{ data: Row }>('/swot', values);
            await qc.invalidateQueries({ queryKey: ['swot'] });
            window.location.assign(`${import.meta.env.BASE_URL}swot/${response.data.id}`.replace('//', '/'));
          }}
        >
          <label className="field">
            Périodicité *
            <select
              name="kind"
              required
              value={kind}
              onChange={(event) => {
                setKind(event.target.value);
                setPeriod(periodChoices(event.target.value)[0].value);
              }}
            >
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="semestriel">Semestriel</option>
              <option value="annuel">Annuel</option>
            </select>
          </label>
          <label className="field">
            Période *
            <select name="key" required value={period} onChange={(event) => setPeriod(event.target.value)}>
              {periodChoices(kind).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {user?.role.data_scope === 'all' && (
            <label className="field">
              Périmètre
              <input name="department" maxLength={30} placeholder="Vide = direction générale" />
            </label>
          )}
          <p className="muted">
            Les constats sont dérivés de seuils mesurés sur les dossiers réels. Une analyse déjà préparée pour
            cette période ne peut pas être dupliquée.
          </p>
        </ActionForm>
      )}
    </>
  );
}

export function SwotView() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [review, setReview] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const analysis = useQuery({
    queryKey: ['swot', id],
    queryFn: ({ signal }) => api.get<{ data: Row }>(`/swot/${id}`, signal),
    enabled: Boolean(id),
  });
  const row = analysis.data?.data;
  const payload = row?.payload;
  const frozen = row?.status === 'validee';
  const download = async () => {
    setExporting('csv');
    try {
      await downloadFile(`/reports/swot/${id}.csv`, `swot-${id}.csv`, ['text/csv']);
    } finally {
      setExporting(null);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="ANALYSE SWOT"
        title={payload ? `SWOT — ${payload.period.label}` : 'Analyse SWOT'}
        description={
          payload
            ? `Du ${date(payload.period.from)} au ${date(payload.period.to)} · périmètre ${payload.scope.department}`
            : undefined
        }
        actions={
          <>
            {row && <Status value={row.status} />}
            <button className="button" disabled={exporting === 'csv'} onClick={download}>
              Exporter CSV
            </button>
            {row && !frozen && can(user, 'reporting.export') && (
              <button className="button primary" onClick={() => setReview(true)}>
                Revue et validation
              </button>
            )}
          </>
        }
      />
      <ErrorBox error={analysis.error} retry={() => void analysis.refetch()} />
      {payload && (
        <>
          <div className="swot-grid">
            {QUADRANTS.map(([key, title, sub]) => (
              <Card
                key={key}
                className={`swot-quadrant swot-${key}`}
                title={title}
                sub={`${sub} · ${payload.items[key]?.length ?? 0} élément(s)`}
              >
                {payload.items[key]?.length ? (
                  <ul className="swot-items">
                    {payload.items[key].map((item: Row, index: number) => (
                      <li key={index}>
                        <strong>{item.text}</strong>
                        <div className="small">{item.evidence}</div>
                        <div className="xsmall muted">Source : {item.source}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Aucun élément mesuré sur la période.</p>
                )}
              </Card>
            ))}
          </div>
          <Card
            className="swot-recommendations"
            title="Recommandations"
            sub="Pistes déterministes, à arbitrer par la direction"
            flush
          >
            {payload.recommendations?.length ? (
              <ul className="swot-items panel-body">
                {payload.recommendations.map((recommendation: Row, index: number) => (
                  <li key={index}>
                    <Badge
                      tone={
                        recommendation.priority === 'haute'
                          ? 'danger'
                          : recommendation.priority === 'moyenne'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {recommendation.priority}
                    </Badge>{' '}
                    <strong>{recommendation.finding}</strong>
                    <div className="small">{recommendation.action}</div>
                    <div className="xsmall muted">
                      {recommendation.owner} · {recommendation.horizon}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted panel-body">Aucune recommandation : les seuils ne sont pas atteints.</p>
            )}
          </Card>
          {row?.review_comment && (
            <div className="notice info">
              Revue : {row.review_comment}
              {row.reviewed_at ? ` — ${date(row.reviewed_at)}` : ''}
            </div>
          )}
          <p className="xsmall muted">{payload.notice}</p>
        </>
      )}
      {review && row && (
        <ActionForm
          title="Revue et validation"
          submitLabel="Enregistrer"
          close={() => setReview(false)}
          submit={async (form) => {
            await api.post(`/swot/${row.id}/review`, Object.fromEntries(form));
            await qc.invalidateQueries({ queryKey: ['swot'] });
          }}
        >
          <label className="field">
            Nouveau statut *
            <select name="status" required defaultValue="revue">
              <option value="preparee">Préparée</option>
              <option value="revue">Revue</option>
              <option value="validee">Validée</option>
            </select>
          </label>
          <label className="field">
            Commentaire de revue
            <textarea name="comment" maxLength={2000} />
          </label>
          <p className="muted">
            Une analyse validée est figée : ses constats ne pourront plus être modifiés. Préparez une nouvelle
            analyse pour la période suivante.
          </p>
        </ActionForm>
      )}
      <p className="xsmall muted">
        <Link to="/swot">Retour aux analyses</Link>
      </p>
    </>
  );
}
