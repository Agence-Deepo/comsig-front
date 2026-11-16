import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('palettes des services : missions réelles et affichage mobile', async ({ page }) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base de recette isolée obligatoire.');
  await login(page);
  const csrf = (await page.context().cookies()).find(cookie => cookie.name === 'XSRF-TOKEN');
  const title = `TEST palette ${Date.now()}`;
  const result = await page.request.post('/api/v1/tasks', {
    headers: { 'X-XSRF-TOKEN': decodeURIComponent(csrf?.value ?? ''), Origin: new URL(page.url()).origin },
    data: { title, due_at: '2000-01-01 12:00:00', priority_level: 1 },
  });
  expect(result.status(), await result.text()).toBe(201);
  const taskId = (await result.json()).data.id;
  await page.goto('/services');
  await expect(page.getByRole('heading', { name: 'Palettes des services' })).toBeVisible();
  const service = page.getByRole('region', { name: 'Service Commercial et marketing' });
  await expect(service).toBeVisible();
  await expect(service.getByRole('link', { name: new RegExp(title) })).toHaveAttribute('href', `/taches/${taskId}`);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
