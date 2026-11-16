import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarCheck, CheckCircle2, Clock, FileSignature, Megaphone, ShieldCheck, Sparkles, Wrench, Percent } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useAuth, useCan, useLookups, useUsers } from '../lib/auth';
import { qs } from '../lib/api';
import { money, moneyShort, pct, date, relative, today, addDays } from '../lib/format';
import { Badge, Card, Kpi, PageHeader, Select, Segmented, LoadingBlock, ErrorState, Empty, Button, DataTable } from '../components/ui';
import { DonutChart, LineChart } from '../components/charts';
import { useAiPanel } from '../components/Layout';
import { ACTIVITY_KIND } from '../lib/labels';

type Period = 'mois' | 'trimestre' | 'annee' | '12mois';
function range(p: Period) {
  const t = today();
  const d = new Date(t + 'T00:00:00Z');
  if (p === 'mois') return { from: t.slice(0, 8) + '01', to: t, label: 'mois en cours' };
  if (p === 'trimestre') { const m = Math.floor(d.getUTCMonth() / 3) * 3; return { from: `${d.getUTCFullYear()}-${String(m + 1).padStart(2, '0')}-01`, to: t, label: 'trimestre en cours' }; }
  if (p === 'annee') return { from: `${d.getUTCFullYear()}-01-01`, to: t, label: 'année en cours' };
  return { from: addDays(t, -365), to: t, label: '12 derniers mois' };
}
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export default function Dashboard() {
  const { me } = useAuth();
  const can = useCan();
  const nav = useNavigate();
  const ai = useAiPanel();
  const users = useUsers();
  const { lookups } = useLookups();
  const [period, setPeriod] = useState<Period>('mois');
  const [owner, setOwner] = useState('');
  const [offer, setOffer] = useState('');
  const r = range(period);
  const q = useApi<any>(['dashboard', period, owner, offer], `/api/dashboard${qs({ from: r.from, to: r.to, owner_id: owner, offer_type: offer })}`);
  const d = q.data;
  const def = d?.definitions ?? {};
  const s = d?.sales;
  const periodLabel = `du ${date(r.from)} au ${date(r.to)}`;
  const trend = useMemo(() => (s?.trend ?? []).map((t: any) => ({ label: MONTHS[Number(t.month.slice(5)) - 1], full: `${MONTHS[Number(t.month.slice(5)) - 1]} ${t.month.slice(0, 4)}`, value: t.won, target: t.target })), [s]);
  const commercials = users.filter((u) => u.role_code === 'commercial' || u.role_code === 'direction_commerciale');
  const firstName = me?.full_name.split(' ')[0];

  const actions = [
    d?.approvals_pending ? { icon: <ShieldCheck />, label: `${d.approvals_pending} validation(s) en attente`, to: '/validations', tone: 'warning' } : null,
    d?.tasks?.filter((t: any) => t.is_overdue).length ? { icon: <Clock />, label: `${d.tasks.filter((t: any) => t.is_overdue).length} tâche(s) en retard`, to: '/activites?period=retard', tone: 'danger' } : null,
    s?.inactive_count ? { icon: <AlertTriangle />, label: `${s.inactive_count} opportunité(s) sans activité`, to: '/opportunites?inactive=1', tone: 'warning' } : null,
    d?.quotes?.low_margin ? { icon: <Percent />, label: `${d.quotes.low_margin} devis sous la marge minimale`, to: '/devis', tone: 'warning' } : null,
    d?.contracts_expiring?.filter((c: any) => c.days <= 60 && !c.renewal_decision).length ? { icon: <FileSignature />, label: `${d.contracts_expiring.filter((c: any) => c.days <= 60 && !c.renewal_decision).length} contrat(s) à décider sous 60 jours`, to: '/contrats?expiring=120', tone: 'warning' } : null,
    d?.interventions?.late ? { icon: <Wrench />, label: `${d.interventions.late} intervention(s) en retard`, to: '/maintenance?late=1', tone: 'danger' } : null,
    d?.campaigns?.length ? { icon: <Megaphone />, label: `${d.campaigns.length} campagne(s) nécessitant une action`, to: '/campagnes', tone: 'info' } : null,
  ].filter(Boolean) as { icon: JSX.Element; label: string; to: string; tone: string }[];

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        title={`Bonjour ${firstName}`}
        subtitle={me?.data_scope === 'own' ? 'Votre portefeuille et vos priorités' : 'Vue consolidée de l’activité'}
        actions={<>
          <Segmented label="Période" value={period} onChange={setPeriod} options={[{ id: 'mois', label: 'Mois' }, { id: 'trimestre', label: 'Trimestre' }, { id: 'annee', label: 'Année' }, { id: '12mois', label: '12 mois' }]} />
          {me?.data_scope !== 'own' && can('opportunities') && <Select aria-label="Commercial" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Tous les commerciaux" options={commercials.map((u) => ({ value: u.id, label: u.full_name }))} style={{ width: 200 }} />}
          {can('opportunities') && <Select aria-label="Prestation" value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Toutes prestations" options={(lookups.offer_type ?? []).map((o) => ({ value: o.code, label: o.label }))} style={{ width: 180 }} />}
        </>}
      />
      {q.isLoading ? <Card><LoadingBlock rows={6} /></Card> : q.error ? <Card><ErrorState error={q.error} onRetry={() => q.refetch()} /></Card> : (
        <>
          {actions.length > 0 && (
            <section aria-label="À traiter" className="card" style={{ padding: '12px 16px' }}>
              <div className="row-wrap" style={{ gap: 8 }}>
                <span className="section-title" style={{ marginRight: 4 }}>À traiter</span>
                {actions.map((a) => (
                  <Link key={a.label} to={a.to} className={`badge badge-${a.tone} no-dot`} style={{ height: 30, padding: '0 12px', gap: 6, fontSize: 13 }}>
                    <span style={{ display: 'inline-flex', width: 15 }}>{a.icon}</span>{a.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {s && (
            <div className="grid-4">
              <Kpi label="Chiffre d’affaires gagné" value={moneyShort(s.won_revenue)} unit="FCFA" progress={s.target ? (s.won_revenue / s.target) * 100 : null}
                foot={<>{s.target ? <span>{pct((s.won_revenue / s.target) * 100, 0)} de l’objectif ({moneyShort(s.target)})</span> : <span>Aucun objectif défini</span>}<span>· {s.won_count} affaire(s)</span></>}
                help={{ title: def.won_revenue?.label, formula: def.won_revenue?.formula, source: def.won_revenue?.source, period: periodLabel }} />
              <Kpi label="Pipeline pondéré" value={moneyShort(s.pipeline_weighted)} unit="FCFA" foot={<span>Brut : {moneyShort(s.pipeline_gross)} · {s.pipeline_count} opportunités ouvertes</span>}
                help={{ title: def.pipeline_weighted?.label, formula: def.pipeline_weighted?.formula, source: def.pipeline_weighted?.source, period: 'opportunités ouvertes à date' }} onClick={() => nav('/opportunites')} />
              <Kpi label="Taux de gain" value={s.win_rate === null ? '—' : pct(s.win_rate, 0)} foot={<span>{s.closed_won} gagnée(s) · {s.closed_lost} perdue(s) · cycle moyen {s.cycle_days ?? '—'} j</span>}
                help={{ title: def.win_rate?.label, formula: def.win_rate?.formula, period: periodLabel }} />
              {d.quotes ? (
                <Kpi label="Offres en attente de réponse" value={d.quotes.pending_count} foot={<span>{moneyShort(d.quotes.pending_amount)} FCFA HT{d.quotes.expired ? ` · ${d.quotes.expired} expirée(s)` : ''} · suivi {d.quotes.followup_rate === null ? '—' : pct(d.quotes.followup_rate, 0)}</span>}
                  help={{ title: def.quotes_pending?.label, formula: `${def.quotes_pending?.formula} Taux de suivi : ${def.followup_rate?.formula}` }} action={d.quotes.expired > 0} onClick={() => nav('/devis?status=envoye')} />
              ) : <Kpi label="Opportunités ouvertes" value={s.pipeline_count} />}
            </div>
          )}

          <div className="split">
            <div className="stack-lg" style={{ minWidth: 0 }}>
              {s && (
                <Card title="Évolution du chiffre d’affaires gagné et de l’objectif" sub="12 derniers mois · FCFA HT · source : opportunités gagnées et objectifs saisis par la direction">
                  <LineChart labels={trend.map((t: any) => t.label)} fullLabels={trend.map((t: any) => t.full ?? t.label)} caption="Évolution du chiffre d’affaires gagné par mois comparé à l’objectif"
                    series={[{ key: 'won', label: 'CA gagné', values: trend.map((t: any) => t.value) }, ...(trend.some((t: any) => t.target) ? [{ key: 'target', label: 'Objectif', values: trend.map((t: any) => t.target ?? 0) }] : [])]} />
                </Card>
              )}
              {d?.priorities && (
                <Card title="Opportunités prioritaires" sub="Retards, inactivité et montants pondérés les plus élevés" flush actions={<Link to="/opportunites" className="btn btn-ghost btn-sm">Tout le pipeline <ArrowRight size={14} /></Link>}>
                  <DataTable rows={d.priorities} onRowClick={(o: any) => nav(`/opportunites/${o.id}`)} empty={<Empty icon={<CheckCircle2 />} title="Aucune opportunité ouverte">Créez une opportunité depuis une fiche client.</Empty>}
                    columns={[
                      { key: 'title', label: 'Opportunité', render: (o: any) => <><div className="cell-title">{o.title}</div><div className="cell-sub">{o.ref} · {o.organization_name}</div></> },
                      { key: 'stage', label: 'Étape', render: (o: any) => <span className="small">{o.stage_label}</span>, mobile: 'hide' },
                      { key: 'reason', label: 'Motif', render: (o: any) => <Badge tone={o.is_overdue || o.is_inactive ? 'warning' : 'info'}>{o.reason}</Badge> },
                      { key: 'weighted', label: 'Pondéré', num: true, render: (o: any) => <span title={`Brut ${money(o.amount)} × ${o.probability} %`}>{moneyShort(o.weighted)}</span> },
                      { key: 'close', label: 'Clôture', render: (o: any) => <span className="small nowrap">{date(o.expected_close_date)}</span>, mobile: 'hide' },
                    ]} />
                </Card>
              )}
              <div className="grid-2">
                {s && (
                  <Card title="Pipeline par étape" sub="Montant brut des opportunités ouvertes, FCFA HT">
                    <DonutChart caption="Répartition du pipeline ouvert par étape" format={moneyShort} centerLabel="FCFA HT" data={s.by_stage.filter((x: any) => x.n > 0).map((x: any) => ({ key: x.code, label: `${x.label} (${x.n})`, value: x.gross }))} />
                  </Card>
                )}
                {s && (
                  <Card title="Motifs de perte" sub={`Opportunités perdues · ${r.label}`}>
                    <DonutChart caption="Répartition des opportunités perdues par motif" centerLabel="perdues" data={s.loss_reasons.map((l: any) => ({ key: l.reason, label: l.reason, value: l.n }))} />
                  </Card>
                )}
              </div>
              {(d?.finance || d?.inventory || d?.royalties) && (
                <div className="grid-3">
                  {d.finance && <Kpi label="Créances échues" value={moneyShort(d.finance.overdue)} unit="FCFA" action={d.finance.overdue > 0} foot={<span>{d.finance.overdue_count} facture(s) · encours total {moneyShort(d.finance.outstanding)}</span>}
                    help={{ title: def.receivables_overdue?.label, formula: def.receivables_overdue?.formula, source: def.receivables_overdue?.source }} onClick={() => nav('/finance')} />}
                  {d.inventory && <Kpi label="Taux d’occupation des faces" value={pct(d.inventory.occupancy, 0)} progress={d.inventory.occupancy} foot={<span>{d.inventory.booked} / {d.inventory.faces} faces réservées aujourd’hui</span>}
                    help={{ title: def.occupancy?.label, formula: def.occupancy?.formula }} onClick={() => nav('/supports')} />}
                  {d.royalties && <Kpi label="Redevances restant à régler" value={moneyShort(d.royalties.remaining)} unit="FCFA" action={d.royalties.late > 0} foot={<span>{d.royalties.late} en retard · {d.royalties.due_soon} à échéance sous 30 j</span>} onClick={() => nav('/redevances')} />}
                </div>
              )}
            </div>

            <div className="stack-lg">
              {d?.tasks && (
                <Card title="Mes tâches du jour" sub="Échues et à faire aujourd’hui" flush actions={<Link to="/taches" className="btn btn-ghost btn-sm">Tâches</Link>}>
                  {!d.tasks.length ? <Empty icon={<CalendarCheck />} title="Rien d’urgent">Aucune tâche due aujourd’hui.</Empty> : (
                    <div className="list">{d.tasks.map((t: any) => (
                      <div key={t.id} className="list-item clickable" role="button" tabIndex={0} onClick={() => nav(t.source === 'tache' ? '/taches' : t.opportunity_id ? `/opportunites/${t.opportunity_id}` : t.organization_id ? `/organisations/${t.organization_id}` : '/activites')}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="small strong truncate">{t.subject}</div>
                          <div className="xsmall muted">{t.source === 'tache' ? `Tâche ${t.ref}` : ACTIVITY_KIND[t.kind]}{t.organization_name ? ` · ${t.organization_name}` : ''}</div>
                        </div>
                        <Badge tone={t.is_overdue ? 'danger' : 'info'}>{t.is_overdue ? `En retard · ${relative(t.due_at)}` : 'Aujourd’hui'}</Badge>
                      </div>
                    ))}</div>
                  )}
                </Card>
              )}
              {d?.contracts_expiring && (
                <Card title="Contrats à échéance" sub="Sous 120 jours" flush actions={<Link to="/contrats" className="btn btn-ghost btn-sm">Contrats</Link>}>
                  {!d.contracts_expiring.length ? <Empty icon={<FileSignature />} title="Aucune échéance proche" /> : (
                    <div className="list">{d.contracts_expiring.map((c: any) => (
                      <div key={c.id} className="list-item clickable" role="button" tabIndex={0} onClick={() => nav(`/contrats/${c.id}`)}>
                        <div style={{ flex: 1, minWidth: 0 }}><div className="small strong truncate">{c.title}</div><div className="xsmall muted">{c.ref} · {c.organization_name} · {moneyShort(c.value_ht)}</div></div>
                        <Badge tone={c.renewal_decision ? 'success' : c.days <= 30 ? 'danger' : c.days <= 60 ? 'warning' : 'info'}>{c.renewal_decision ? 'Décidé' : `J-${c.days}`}</Badge>
                      </div>
                    ))}</div>
                  )}
                </Card>
              )}
              {d?.campaigns?.length > 0 && (
                <Card title="Campagnes à suivre" flush>
                  <div className="list">{d.campaigns.map((c: any) => (
                    <div key={c.id} className="list-item clickable" role="button" tabIndex={0} onClick={() => nav(`/campagnes/${c.id}`)}>
                      <div style={{ flex: 1, minWidth: 0 }}><div className="small strong truncate">{c.name}</div><div className="xsmall muted">{c.ref} · {c.organization_name}</div></div>
                      <Badge tone="warning">{c.action}</Badge>
                    </div>
                  ))}</div>
                </Card>
              )}
              {can('ai') && (
                <Card title={<span className="row"><Sparkles size={16} style={{ color: 'var(--brand-copper)' }} />Assistant</span>} sub="Suggestions préparées à partir de vos données">
                  <div className="stack">
                    {d?.ai_suggestions?.length ? d.ai_suggestions.map((a: any) => (
                      <Link key={a.id} to="/assistant?tab=actions" className="row small" style={{ color: 'var(--text)' }}><Badge tone="warning">À valider</Badge><span className="truncate">{a.label}</span></Link>
                    )) : <p className="small muted">Aucune proposition en attente.</p>}
                    <div className="chips">
                      <button className="chip" onClick={() => ai.open({ prompt: 'Quelles sont mes priorités aujourd’hui ?' })}>Mes priorités du jour</button>
                      <button className="chip" onClick={() => ai.open({ prompt: 'Fais la synthèse du pipeline du mois' })}>Synthèse du pipeline</button>
                    </div>
                    <Button variant="soft" icon={<Sparkles />} onClick={() => ai.open()}>Ouvrir l’assistant</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
          <p className="xsmall muted">Indicateurs calculés par le CRM le {new Date(d.generated_at).toLocaleString('fr-FR')} · période : {periodLabel}. Survolez <span aria-hidden>ⓘ</span> pour la définition et la formule de chaque indicateur.</p>
        </>
      )}
    </>
  );
}
