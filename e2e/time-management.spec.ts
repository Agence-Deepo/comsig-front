import { test, expect } from '@playwright/test';
import { login } from './helpers';

/**
 * Onglet « Gestion du temps » : tableau à quatre colonnes, barre de répartition empilée,
 * légende des cinq parts, détail chiffré au clic et export Excel de la période.
 */
test('P06 : gestion du temps — tableau, barre de répartition, détail et export', async ({ page }, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base de recette isolée obligatoire.');
  await login(page);
  // Préparer explicitement une ligne : une base isolée neuve ne contient aucun temps saisi.
  const csrf = (await page.context().cookies()).find(cookie => cookie.name === 'XSRF-TOKEN');
  const headers = { 'X-XSRF-TOKEN': decodeURIComponent(csrf?.value ?? ''), Origin: new URL(page.url()).origin };
  const created = await page.request.post('/api/v1/tasks', { headers, data: { title: 'TEST temps ' + Date.now(), urgent: true, important: true } });
  expect(created.status(), await created.text()).toBe(201);
  const task = (await created.json()).data;
  const entry = await page.request.post('/api/v1/time-entries', { headers, data: { task_id: task.id, work_date: new Date().toISOString().slice(0, 10), minutes: 60 } });
  expect(entry.status(), await entry.text()).toBe(201);
  await page.goto('/taches?vue=temps&perimetre=service');

  // En-tête de la démonstration : titre, sous-titre et deux sélecteurs de dates, rien de plus.
  const card = page.locator('section.card').filter({ has: page.getByRole('heading', { name: 'Gestion du temps' }) });
  await expect(card.getByRole('heading', { name: 'Gestion du temps' })).toBeVisible();
  await expect(card.locator('.card-sub')).toContainText(/jours? ouvrés? · \d+ h disponibles par personne/);
  await expect(card.getByLabel('Du', { exact: true })).toBeVisible();
  await expect(card.getByLabel('Au', { exact: true })).toBeVisible();

  await expect(card.getByRole('columnheader')).toHaveText(['Personne', 'Temps saisi', 'Charge', 'Répartition']);
  await expect(card.getByText('Urgent et important', { exact: true })).toBeVisible();
  await expect(card.getByText('Ordres de travail', { exact: true })).toBeVisible();

  // Une ligne réelle : la barre empilée n'apparaît qu'avec du temps saisi.
  const line = card.locator('tbody tr').first();
  if (await line.count()) {
    const bar = line.locator('.stacked-bar');
    await expect(bar).toBeVisible();
    // Chaque segment porte la couleur de sa part, jamais une couleur seule sans légende.
    const colors = await line
      .locator('.stacked-bar > span')
      .evaluateAll((spans) => spans.map((span) => getComputedStyle(span).backgroundColor));
    for (const color of colors) {
      expect(['rgb(217, 68, 58)', 'rgb(42, 120, 214)', 'rgb(224, 154, 26)', 'rgb(138, 144, 156)', 'rgb(122, 79, 184)']).toContain(color);
    }
    // Le clic ouvre le détail chiffré, qui rappelle la période et le total.
    await line.locator('.time-bar-button').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: /^Temps de / })).toBeVisible();
    await expect(dialog.getByText('Total saisi', { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Fermer le détail', exact: true }).click();
    await expect(dialog).not.toBeVisible();
  }

  // L'export suit l'onglet : ici le rapport de temps, pas les tâches.
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Excel', exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^gestion-du-temps-\d{4}-\d{2}-\d{2}\.xlsx$/);
  await page.screenshot({ path: info.outputPath('gestion-du-temps.png'), fullPage: true });
});
