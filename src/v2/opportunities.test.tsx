import { describe, it, expect } from 'vitest';
import { serializeFields, initial } from './forms';
import { modules } from './modules';
import { crmMetrics } from './crmMetrics';
describe('P04 socle commercial', () => {
  it('conserve le lien de l’activité vers son opportunité dans le vrai formulaire partagé', () => {
    const fields = modules.find((m) => m.key === 'activities')!.fields;
    const result = serializeFields(fields, {
      ...Object.fromEntries(fields.map((f) => [f.key, initial(f)])),
      opportunity_id: 'opportunite-test',
      organization_id: 'client-test',
    });
    expect(result.opportunity_id).toBe('opportunite-test');
    expect(result.organization_id).toBe('client-test');
  });
  it('ne transforme pas une correction de fiche en date de gain et exclut les suspensions du pipeline ouvert', () => {
    const metrics = crmMetrics(
      {
        opportunities: [
          { stage_code: 'gagne', amount: 500000, updated_at: '2026-11-03' },
          { stage_code: 'suspendu', amount: 100000, probability: 10 },
        ],
      },
      '2026-11-01',
      '2026-11-30',
    );
    expect(metrics.sales.won_revenue).toBe(0);
    expect(metrics.sales.pipeline_weighted).toBe(0);
  });
  it('ne publie pas une probabilité ou une étape technique depuis les formulaires génériques', () => {
    const f = modules.find((m) => m.key === 'opportunities')!.fields;
    const p = serializeFields(f, {
      ...Object.fromEntries(f.map((k) => [k.key, initial(k)])),
      probability: '100',
      stage_code: 'gagne',
    });
    expect(p).not.toHaveProperty('probability');
    expect(p).not.toHaveProperty('stage_code');
  });
});
