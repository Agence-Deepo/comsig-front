import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { referenceLabel } from './CustomerReferences';
import { CustomerScore } from './CustomerRanking';
import { initial, serializeFields } from './forms';
import { customerFields } from './customerFields';
import { modules } from './modules';

describe('P03 référentiels et champs avancés', () => {
  it('résout un code ou un ancien libellé sans inventer de valeur', () => {
    const refs = [{ list: 'sector', code: 'industrie', label: 'Industrie' }];
    expect(referenceLabel(refs, 'sector', 'industrie')).toBe('Industrie');
    expect(referenceLabel(refs, 'sector', 'Industrie')).toBe('Industrie');
    expect(referenceLabel(refs, 'sector', 'Ancien')).toBe('Ancien');
    expect(referenceLabel(undefined, 'sector', null)).toBe('—');
  });
  it('sérialise les étiquettes comme liste distincte et le CA estimé séparément', () => {
    const fields = customerFields.filter((f) => ['tags', 'annual_revenue_estimate'].includes(f.key));
    const payload = serializeFields(fields, {
      tags: 'VIP, Export, VIP, ',
      annual_revenue_estimate: '1800000',
    });
    expect(payload).toEqual({ tags: ['VIP', 'Export'], annual_revenue_estimate: 1800000 });
    expect(
      initial(
        fields.find((f) => f.key === 'tags')!,
        { tags: ['VIP', 'Export'] },
      ),
    ).toBe('VIP, Export');
  });
  it('ne dessine jamais un score nul comme un vrai zéro', () => {
    expect(renderToStaticMarkup(<CustomerScore value={null} />)).not.toContain('width:0%');
    expect(renderToStaticMarkup(<CustomerScore value={0} />)).toContain('width:0%');
  });
  it('raccorde les deux registres à des ressources fermées et autorisées', () => {
    for (const key of ['contracts', 'complaints']) {
      const m = modules.find((row) => row.key === 'customer-cases/' + key)!;
      expect(m.detail).toBe(true);
      expect(m.permission).toBe(key);
      expect(m.fields.some((f) => f.key === 'organization_id')).toBe(true);
    }
  });
});
