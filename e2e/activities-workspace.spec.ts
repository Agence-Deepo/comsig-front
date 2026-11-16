import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('activités : sept jours sans retard et agenda hebdomadaire', async ({ page }) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base de recette isolée obligatoire.');
  await login(page);
  const csrf = (await page.context().cookies()).find(cookie => cookie.name === 'XSRF-TOKEN');
  const headers = { 'X-XSRF-TOKEN': decodeURIComponent(csrf?.value ?? ''), Origin: new URL(page.url()).origin };
  const stamp = Date.now();
  const day = new Date();
  day.setUTCHours(12, 0, 0, 0);
  const past = new Date(day); past.setUTCDate(past.getUTCDate() - 1);
  for (const [title, date] of [[`TEST agenda jour ${stamp}`, day], [`TEST agenda retard ${stamp}`, past]] as const) {
    const result = await page.request.post('/api/v1/activities', { headers, data: { title, kind: 'appel', due_at: date.toISOString() } });
    expect(result.status(), await result.text()).toBe(201);
  }
  await page.goto('/activites');
  await expect(page.getByText(`TEST agenda jour ${stamp}`, { exact: true })).toBeVisible();
  await expect(page.getByText(`TEST agenda retard ${stamp}`, { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Semaine', exact: true }).click();
  await expect(page.getByText(`TEST agenda jour ${stamp}`, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Liste', exact: true }).click();
  await page.getByRole('button', { name: 'En retard', exact: true }).click();
  await expect(page.getByText(`TEST agenda retard ${stamp}`, { exact: true })).toBeVisible();
});
