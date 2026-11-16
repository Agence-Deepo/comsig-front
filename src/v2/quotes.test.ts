import { describe, expect, it } from 'vitest';
import { wizardLinePayload, type WizardLine } from './NewQuote';
import { quoteEventLabel } from './Quotes';

const line = (patch: Partial<WizardLine> = {}): WizardLine => ({
  source: 'cout',
  label: 'Pose',
  unit: 'u',
  quantity: '2',
  duration: '3',
  unit_price: '0',
  unit_cost: '1000',
  discount_pct: '5',
  tax_rate: '18',
  ...patch,
});
describe('P05 devis', () => {
  it('sérialise le coût majoré sans calculer le prix de vente dans le navigateur', () => {
    expect(wizardLinePayload(line(), '60')).toEqual({
      label: 'Pose',
      unit: 'u',
      quantity: 2,
      duration: 3,
      unit_price: 0,
      unit_cost: 1000,
      discount_pct: 5,
      tax_rate: 18,
      markup_pct: 60,
    });
  });
  it('ne laisse pas un catalogue transporter une source stock ou une majoration résiduelle', () => {
    const p = wizardLinePayload(
      line({ source: 'catalogue', catalog_item_id: 'cat', stock_item_id: 'ancien' }),
      '60',
    );
    expect(p.catalog_item_id).toBe('cat');
    expect(p).not.toHaveProperty('stock_item_id');
    expect(p).not.toHaveProperty('markup_pct');
  });
  it('conserve les zéros et les valeurs invalides pour que le serveur les refuse au lieu de les remplacer par 1', () => {
    const p = wizardLinePayload(line({ quantity: '0', duration: '-1', source: 'libre' }), '60');
    expect(p.quantity).toBe(0);
    expect(p.duration).toBe(-1);
    expect(p).not.toHaveProperty('markup_pct');
  });
  it('transmet la base fournisseur uniquement pour une matière', () => {
    const stock = line({
      source: 'stock',
      stock_item_id: 'stock',
      cost_basis: 'tarif',
      purchase_price_id: 42,
    });
    expect(wizardLinePayload(stock, '35')).toMatchObject({
      cost_basis: 'tarif',
      purchase_price_id: 42,
      markup_pct: 35,
    });
    const catalog = wizardLinePayload({ ...stock, source: 'catalogue', catalog_item_id: 'cat' }, '35');
    expect(catalog).not.toHaveProperty('purchase_price_id');
    expect(catalog).not.toHaveProperty('cost_basis');
  });
  it('traduit les événements de version et distingue envoi externe et envoi réel', () => {
    expect(quoteEventLabel('superseded')).toContain('nouvelle version');
    expect(quoteEventLabel('send')).toBe('Envoi externe consigné');
  });
});
