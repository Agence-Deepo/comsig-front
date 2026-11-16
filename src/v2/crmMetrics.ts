import { parseDateTime, today, type Row } from './types';

export function crmMetrics(raw: Record<string, any>, from: string, to: string, owner = '', offer = '') {
  const current = today();
  const all = (raw.opportunities ?? []).filter(
    (o: Row) => (!owner || String(o.owner_id) === owner) && (!offer || o.offer_type === offer),
  );
  const dateOf = (o: Row) => String((o.stage_code === 'gagne' ? o.won_at : o.closed_at) ?? '').slice(0, 10);
  const period = all.filter((o: Row) => dateOf(o) && dateOf(o) >= from && dateOf(o) <= to);
  const open = all.filter((o: Row) => !['gagne', 'perdu', 'suspendu'].includes(o.stage_code));
  const won = period.filter((o: Row) => o.stage_code === 'gagne'),
    lost = period.filter((o: Row) => o.stage_code === 'perdu');
  const cycles = won.filter((o: Row) => (o.qualified_at || o.created_at) && o.won_at && parseDateTime(o.won_at) >= parseDateTime(o.qualified_at || o.created_at)).map((o: Row) => (parseDateTime(o.won_at).getTime() - parseDateTime(o.qualified_at || o.created_at).getTime()) / 86400000);
  const sum = (rows: Row[], key: string) => rows.reduce((s: number, r: Row) => s + Number(r[key] ?? 0), 0);
  const closedWon = all.filter((o: Row) => o.stage_code === 'gagne' && o.closed_at && String(o.closed_at).slice(0, 10) >= from && String(o.closed_at).slice(0, 10) <= to);
  const closed = closedWon.length + lost.length;
  const anchor = parseDateTime(current);
  const trend = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - 11 + i, 1));
    const month = d.toISOString().slice(0, 7);
    return {
      month,
      won: sum(
        all.filter((o: Row) => o.stage_code === 'gagne' && dateOf(o).startsWith(month)),
        'amount',
      ),
      target: null,
    };
  });
  const reasons = Object.entries(
    lost.reduce((out: Record<string, number>, o: Row) => {
      const key = o.lost_reason || 'Non renseigné';
      out[key] = (out[key] || 0) + 1;
      return out;
    }, {}),
  ).map(([reason, n]) => ({ reason, n }));
  const quotes = (raw.quotes ?? []).filter((q: Row) => !owner || String(q.owner_id) === owner);
  const wonAmount = (items: Row[]) => items.reduce((total: number, o: Row) => {
    const accepted = quotes.filter((q: Row) => q.opportunity_id === o.id && q.status === 'accepte').sort((a: Row, b: Row) => Number(b.version ?? 1) - Number(a.version ?? 1))[0];
    return total + Number(accepted?.total_ht ?? o.amount ?? 0);
  }, 0);
  const pending = quotes.filter((q: Row) => q.status === 'envoye');
  const sent = quotes.filter((q: Row) => ['envoye', 'accepte', 'refuse'].includes(q.status) && q.sent_at && String(q.sent_at).slice(0, 10) >= from && String(q.sent_at).slice(0, 10) <= to);
  const followed = sent.filter((q: Row) => {
    const decision = q.status === 'accepte' ? q.accepted_at : q.status === 'refuse' ? q.refused_at : null;
    const quick = decision && parseDateTime(decision) >= parseDateTime(q.sent_at) && parseDateTime(decision).getTime() <= parseDateTime(q.sent_at).getTime() + 7 * 86400000;
    return quick || (raw.activities ?? []).some((a: Row) => a.quote_id === q.id && a.kind === 'relance' && a.status === 'termine' && a.done_at && a.due_at && parseDateTime(a.done_at).getTime() <= parseDateTime(a.due_at).getTime() + 86400000);
  }).length;
  const tasks = (raw.tasks ?? [])
    .filter(
      (t: Row) =>
        !['termine', 'annule'].includes(t.status) && t.due_at && String(t.due_at).slice(0, 10) <= current,
    )
    .sort((a: Row, b: Row) => String(a.due_at).localeCompare(String(b.due_at)));
  const invoices = raw.invoices ?? [];
  const overdue = invoices.filter(
    (i: Row) => String(i.due_date).slice(0, 10) < current && Number(i.total_ttc) > Number(i.paid_amount),
  );
  const out: Row = {
    generated_at: raw.generated_at,
    definitions: {
      won_revenue: {
        label: 'Montant des opportunités gagnées',
        formula:
          'Somme du dernier devis accepté accessible ou, à défaut, du montant de l’opportunité, avec date de gain connue dans la période.',
        source:
          'Opportunités Laravel, dans votre périmètre. Ce montant n’est pas le chiffre d’affaires comptabilisé.',
      },
      pipeline_weighted: {
        label: 'Pipeline pondéré',
        formula: 'Somme montant × probabilité / 100 des affaires ouvertes.',
        source: 'Opportunités Laravel',
      },
      win_rate: {
        label: 'Taux de gain',
        formula:
          'Affaires gagnées / affaires gagnées ou perdues, selon leur date de clôture connue. Suspensions exclues.',
      },
      quotes_pending: {
        label: 'Offres en attente',
        formula:
          'Devis envoyés sans réponse à date. Les filtres prestation et période concernent les opportunités.',
      },
      followup_rate: { formula: 'Relance liée terminée au plus tard un jour après l’échéance ou décision client sous sept jours, divisée par les propositions envoyées sur la période.' },
      receivables_overdue: {
        label: 'Créances échues',
        formula: 'Somme TTC - paiements validés des factures dont l’échéance est dépassée.',
        source: 'Factures internes Laravel',
      },
    },
  };
  if (raw.opportunities) {
    out.sales = {
      won_revenue: wonAmount(won),
      won_count: won.length,
      target: null,
      pipeline_weighted: open.reduce(
        (s: number, o: Row) => s + (Number(o.amount) * Number(o.probability)) / 100,
        0,
      ),
      pipeline_gross: sum(open, 'amount'),
      pipeline_count: open.length,
      win_rate: closed ? (100 * closedWon.length) / closed : null,
      closed_won: closedWon.length,
      closed_lost: lost.length,
      cycle_days: cycles.length ? Math.round((cycles.reduce((a: number, b: number) => a + b, 0) / cycles.length) * 10) / 10 : null,
      trend,
      by_stage: (raw.stages ?? [])
        .filter((s: Row) => !s.is_closed)
        .map((s: Row) => {
          const rows = open.filter((o: Row) => o.stage_code === s.code);
          return { ...s, n: rows.length, gross: sum(rows, 'amount') };
        }),
      loss_reasons: reasons,
    };
    out.priorities = [...open]
      .sort((a: Row, b: Row) => String(a.expected_close_date).localeCompare(String(b.expected_close_date)))
      .slice(0, 6)
      .map((o: Row) => ({
        ...o,
        organization_name: o.organization?.legal_name,
        stage_label: o.stage?.label || o.stage_code,
        weighted: (Number(o.amount) * Number(o.probability)) / 100,
        is_overdue: String(o.expected_close_date).slice(0, 10) < current,
        reason:
          String(o.expected_close_date).slice(0, 10) < current ? 'Clôture en retard' : 'Affaire ouverte',
      }));
  }
  if (raw.quotes) {
    out.quotes = {
      pending_count: pending.length,
      pending_amount: sum(pending, 'total_ht'),
      expired: pending.filter((q: Row) => String(q.valid_until).slice(0, 10) < current).length,
      followup_rate: raw.activities && sent.length ? 100 * followed / sent.length : null,
    };
    out.approvals_pending = quotes.filter((q: Row) => q.status === 'soumis').length;
  }
  if (raw.tasks)
    out.tasks = tasks.map((t: Row) => ({
      ...t,
      source: 'tache',
      subject: t.title,
      is_overdue: String(t.due_at).slice(0, 10) < current,
    }));
  if (raw.invoices)
    out.finance = {
      outstanding: invoices.reduce((s: number, i: Row) => s + Number(i.total_ttc) - Number(i.paid_amount), 0),
      overdue: overdue.reduce((s: number, i: Row) => s + Number(i.total_ttc) - Number(i.paid_amount), 0),
      overdue_count: overdue.length,
    };
  return out;
}
