import { expect, test } from '@playwright/test';
import { login } from './helpers';

for (const profile of ['awa', 'prod', 'finance', 'rh', 'dg', 'regie', 'admin']) {
  test(`P07 indicateurs : ${profile}`, async ({ page }) => {
    await login(page, profile);
    await page.goto('/indicateurs');
    await expect(page.getByRole('heading', { name: 'Indicateurs', exact: true })).toBeVisible();
    await expect(page.getByText('Définitions des indicateurs')).toBeVisible();
    await expect(page.getByText('L’écran n’a pas pu être affiché.')).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });
}
