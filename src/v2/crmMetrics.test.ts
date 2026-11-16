import { afterEach, describe, expect, it, vi } from 'vitest';
import { crmMetrics } from './crmMetrics';
afterEach(() => vi.useRealTimers());
describe('adaptation du tableau de bord CRM', () => {
  it('calcule les vrais montants et filtre les affaires par période, responsable et prestation', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T12:00:00Z'));
    const raw = {
      generated_at: '2026-11-03',
      stages: [{ code: 'nouveau', label: 'Nouveau', is_closed: false }],
      opportunities: [
        {
          id: 'open',
          stage_code: 'nouveau',
          owner_id: 1,
          offer_type: 'enseigne',
          amount: 100000,
          probability: 40,
          expected_close_date: '2026-12-01',
        },
        {
          id: 'won',
          stage_code: 'gagne',
          owner_id: 1,
          offer_type: 'enseigne',
          amount: 200000,
          probability: 100,
          won_at: '2026-11-02',
          closed_at: '2026-11-02',
        },
        {
          id: 'old',
          stage_code: 'gagne',
          owner_id: 1,
          offer_type: 'enseigne',
          amount: 900000,
          won_at: '2026-10-20',
        },
        {
          id: 'other',
          stage_code: 'perdu',
          owner_id: 2,
          offer_type: 'affichage',
          amount: 500000,
          closed_at: '2026-11-02',
        },
      ],
    };
    const d = crmMetrics(raw, '2026-11-01', '2026-11-03', '1', 'enseigne');
    expect(d.sales.won_revenue).toBe(200000);
    expect(d.sales.pipeline_weighted).toBe(40000);
    expect(d.sales.win_rate).toBe(100);
    expect(d.sales.trend.at(-1).won).toBe(200000);
    expect(d.sales.target).toBeNull();
    expect(d.definitions.won_revenue.formula).toContain('date de gain');
  });
  it('ne présente pas de données commerciales à un profil qui ne les a pas reçues', () => {
    const d = crmMetrics({ generated_at: '2026-11-03' }, '2026-11-01', '2026-11-03');
    expect(d.sales).toBeUndefined();
    expect(d.quotes).toBeUndefined();
    expect(d.finance).toBeUndefined();
  });
  it('calcule les créances depuis les paiements validés et écarte les tâches terminées', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T12:00:00Z'));
    const d = crmMetrics(
      {
        tasks: [
          { id: 'a', status: 'a_faire', due_at: '2026-11-02' },
          { id: 'b', status: 'termine', due_at: '2026-11-01' },
        ],
        invoices: [
          { total_ttc: 118000, paid_amount: 18000, due_date: '2026-11-01' },
          { total_ttc: 50000, paid_amount: 0, due_date: '2026-12-01' },
        ],
      },
      '2026-11-01',
      '2026-11-03',
    );
    expect(d.tasks.map((t: any) => t.id)).toEqual(['a']);
    expect(d.finance.overdue).toBe(100000);
    expect(d.finance.outstanding).toBe(150000);
  });
});
