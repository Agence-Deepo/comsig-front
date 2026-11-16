import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layers } from 'lucide-react';
import { Badge, Card, DataTable, Empty, Input, PageHeader, Segmented, Select } from '../components/ui';
import { api, queryString } from './api';
import { date, money, today, type Page, type Row } from './types';
import { ErrorBox, Loading, Pager } from './ui';
import ExportButton from './ExportButton';

export const categories: Record<
  string,
  { label: string; hint: string; tone: 'success' | 'primary' | 'info' | 'danger' | 'neutral'; color: string }
> = {
  strategique: {
    label: 'Stratégique',
    hint: 'Classe A et score global élevé : fidéliser',
    tone: 'success',
    color: '#1baf7a',
  },
  fidele: { label: 'Fidèle', hint: 'Client facturé et relation suivie', tone: 'primary', color: '#2a78d6' },
  a_developper: { label: 'À développer', hint: 'Potentiel à exploiter', tone: 'info', color: '#7a4fb8' },
  a_risque: {
    label: 'À risque',
    hint: 'Historique de paiement ou exposition défavorable',
    tone: 'danger',
    color: '#d9443a',
  },
  dormant: {
    label: 'Dormant',
    hint: 'Ni facturation ni relation récente connue',
    tone: 'neutral',
    color: '#8a909c',
  },
};
export function CustomerScore({ value }: { value: number | null }) {
  if (value == null) return <span title="Non calculé : données ou périmètre insuffisants">—</span>;
  return (
    <span
      className={`score score-${value >= 70 ? 'good' : value >= 45 ? 'mid' : 'bad'}`}
      title={value + ' / 100'}
    >
      <span style={{ width: `${value}%` }} />
      <b>{value}</b>
    </span>
  );
}
export default function CustomerRanking() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [search, setSearch] = useState(sp.get('q') ?? '');
  const range = sp.get('range') ?? '12m';
  const end = today();
  const start = new Date(end + 'T12:00:00Z');
  start.setUTCDate(start.getUTCDate() - (range === '3m' ? 91 : range === '24m' ? 730 : 365));
  const from = range === 'ytd' ? end.slice(0, 4) + '-01-01' : start.toISOString().slice(0, 10);
  const params = {
    from,
    to: end,
    q: sp.get('q'),
    abc: sp.get('abc'),
    category: sp.get('category'),
    page: sp.get('page') ?? '1',
    per_page: 25,
  };
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(sp);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.delete('page');
    setSp(next);
  };
  const q = useQuery({
    queryKey: ['customer-ranking', params],
    queryFn: ({ signal }) =>
      api.get<Page & { meta: Row; abc: Row[]; summary: Row[] | null }>(
        '/organizations/ranking' + queryString(params),
        signal,
      ),
  });
  return (
    <>
      <PageHeader
        title="Classement des clients"
        subtitle="Catégories, chiffre d’affaires facturé, relation, paiements et solvabilité — méthode expliquée, sans addition des devis ou affaires gagnées"
        actions={
          <>
            <Segmented
              label="Période"
              value={range}
              onChange={(v) => set('range', v)}
              options={[
                { id: '3m', label: '3 mois' },
                { id: 'ytd', label: 'Année en cours' },
                { id: '12m', label: '12 mois' },
                { id: '24m', label: '24 mois' },
              ]}
            />
            <ExportButton
              path={'/organizations/ranking.csv' + queryString(params)}
              filename="classement-clients.csv"
            />
          </>
        }
      />
      <ErrorBox error={q.error} retry={() => void q.refetch()} />
      {q.isLoading && <Loading />}
      {q.data && (
        <>
          {!q.data.meta.complete_score && (
            <div className="notice warning" role="status">
              Vue partielle selon vos droits. Les indicateurs non accessibles restent « — » ; aucun score
              global ou catégorie financière n’est inventé. Le score complet nécessite un profil métier à
              périmètre global.
            </div>
          )}
          {q.data.summary && (
            <div className="cat-grid">
              {q.data.summary.map((s) => (
                <button
                  key={s.category}
                  className={`card cat-card${sp.get('category') === s.category ? ' on' : ''}`}
                  style={{ ['--c' as string]: categories[s.category].color }}
                  aria-pressed={sp.get('category') === s.category}
                  onClick={() => set('category', sp.get('category') === s.category ? '' : s.category)}
                >
                  <span className="cat-count">{s.count}</span>
                  <span className="cat-label">{categories[s.category].label}</span>
                  <span className="xsmall muted">{money(s.revenue)}</span>
                  <span className="xsmall">{categories[s.category].hint}</span>
                </button>
              ))}
            </div>
          )}
          {q.data.meta.financial_visible && (
            <Card
              title="Répartition ABC (loi de Pareto)"
              sub={`A : 80 premiers % du CA cumulé · B : jusqu’à 95 % · C : reste — CA facturé HT : ${money(q.data.meta.total_revenue)}`}
            >
              <div className="abc-bar" role="group" aria-label="Classes ABC">
                {q.data.abc.map((a) => (
                  <button
                    key={a.abc}
                    className={'abc-' + a.abc}
                    style={{ flexGrow: Math.max(1, a.revenue) }}
                    onClick={() => set('abc', sp.get('abc') === a.abc ? '' : a.abc)}
                  >
                    {a.abc} · {a.count} client(s) · {money(a.revenue)}
                  </button>
                ))}
              </div>
            </Card>
          )}
          <Card flush>
            <div className="filter-bar">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  set('q', search);
                }}
              >
                <Input
                  aria-label="Rechercher un client"
                  placeholder="Rechercher un client…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => set('q', search)}
                />
              </form>
              {q.data.meta.complete_score && (
                <Select
                  aria-label="Catégorie"
                  value={sp.get('category') ?? ''}
                  onChange={(e) => set('category', e.target.value)}
                  placeholder="Toutes catégories"
                  options={Object.entries(categories).map(([value, c]) => ({ value, label: c.label }))}
                />
              )}
              {q.data.meta.financial_visible && (
                <Select
                  aria-label="Classe"
                  value={sp.get('abc') ?? ''}
                  onChange={(e) => set('abc', e.target.value)}
                  placeholder="Classes A, B, C"
                  options={['A', 'B', 'C'].map((value) => ({ value, label: 'Classe ' + value }))}
                />
              )}
            </div>
            <DataTable
              rows={q.data.data}
              rowClass={() => 'customer-ranking-row'}
              onRowClick={(r) => nav('/clients/' + r.id)}
              empty={<Empty icon={<Layers />} title="Aucun client" />}
              columns={[
                {
                  key: 'name',
                  label: 'Client',
                  render: (r) => (
                    <>
                      <div className="cell-title">{r.legal_name}</div>
                      <div className="cell-sub">
                        {r.ref} · {r.owner_name}
                      </div>
                    </>
                  ),
                },
                {
                  key: 'category',
                  label: 'Catégorie',
                  mobile: 'label',
                  render: (r) =>
                    r.category ? (
                      <Badge tone={categories[r.category].tone}>{categories[r.category].label}</Badge>
                    ) : (
                      'Non évalué'
                    ),
                },
                {
                  key: 'abc',
                  label: 'ABC',
                  mobile: 'label',
                  render: (r) => (r.abc ? <span className={'abc-chip abc-' + r.abc}>{r.abc}</span> : '—'),
                },
                {
                  key: 'revenue',
                  label: 'CA facturé HT',
                  mobile: 'label',
                  num: true,
                  render: (r) => (r.revenue == null ? '—' : money(r.revenue)),
                },
                {
                  key: 'score',
                  label: 'Score global',
                  mobile: 'label',
                  render: (r) => <CustomerScore value={r.score} />,
                },
                {
                  key: 'relation',
                  label: 'Relation',
                  render: (r) => (
                    <span
                      title={`${r.activities_90d ?? '—'} interactions datées sur 90 j · dernier échange ${date(r.last_contact)}`}
                    >
                      <CustomerScore value={r.relation_score} />
                    </span>
                  ),
                  mobile: 'hide',
                },
                {
                  key: 'payment',
                  label: 'Paiements',
                  render: (r) => <CustomerScore value={r.payment_score} />,
                  mobile: 'hide',
                },
                {
                  key: 'solvency',
                  label: 'Solvabilité',
                  render: (r) => <CustomerScore value={r.solvency_score} />,
                  mobile: 'hide',
                },
              ]}
            />
            <Pager page={q.data} change={(p) => set('page', String(p))} />
          </Card>
          <Card title="Méthode et périmètre">
            <p className="small">
              Score global = CA 40 % + paiements 30 % + relation 20 % + solvabilité 10 %. Base choisie :
              factures émises HT uniquement.
            </p>
            <p className="small muted">{q.data.meta.note}</p>
            <p className="small muted">
              Sans historique de paiement exploitable : note neutre 60 (40 en présence d’échu), pas une preuve
              de solvabilité. Ce score de pilotage n’est pas une évaluation de crédit certifiée.
            </p>
          </Card>
        </>
      )}
    </>
  );
}
