import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { login, saveDistinctCustomerFixture } from './helpers';

async function headers(page: Page) {
  const token = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN');
  return {
    Accept: 'application/json',
    Origin: new URL(page.url()).origin,
    'X-XSRF-TOKEN': decodeURIComponent(token?.value ?? ''),
  };
}

test('P03 fin : référentiel administrable, désactivation sans suppression et droits métier séparés', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page, 'admin');
  await page.goto('/referentiels-clients');
  await page.getByRole('button', { name: 'Ajouter une valeur', exact: true }).click();
  let dialog = page.getByRole('dialog');
  const code = 'qa_' + Date.now();
  await dialog.getByLabel('Code', { exact: true }).fill(code);
  await dialog.getByLabel('Libellé', { exact: true }).fill('Secteur de recette ' + code);
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const row = page.getByRole('row').filter({ hasText: code });
  await expect(row).toContainText('Actif');
  await row.getByRole('button', { name: 'Modifier', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Code', { exact: true })).toHaveAttribute('readonly', '');
  await dialog.getByRole('checkbox').uncheck();
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(row).toContainText('Désactivé');
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: code })).toContainText('Désactivé');
  await page.screenshot({ path: info.outputPath('referentiels-desktop.png'), fullPage: true });
  const denied = await page.request.get('/api/v1/customer-cases/contracts', { headers: await headers(page) });
  expect(denied.status()).toBe(403);
});

test('P03 fin : champs avancés, synthèse 360°, contrat et résolution de réclamation', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page);
  await page.goto('/clients');
  await page.getByRole('button', { name: 'Nouvelle organisation', exact: true }).click();
  let dialog = page.getByRole('dialog');
  const name = 'TEST P03 final ' + Date.now();
  await dialog.getByLabel('Raison sociale').fill(name);
  await dialog.getByLabel('Type', { exact: true }).selectOption('client');
  await dialog.getByLabel('Secteur', { exact: true }).selectOption('industrie');
  await dialog.getByLabel('CA annuel estimé', { exact: false }).fill('1800000');
  await dialog.getByLabel('Étiquettes', { exact: false }).fill('VIP, Recette');
  await saveDistinctCustomerFixture(page);
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  const id = new URL(page.url()).pathname.split('/').pop();
  await expect(page.getByRole('region', { name: 'Informations du compte', exact: true })).toContainText(
    'VIP',
  );
  await page.getByRole('button', { name: 'Ajouter un contrat', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Intitulé', { exact: false }).fill('Contrat de recette');
  await dialog.getByLabel('Début', { exact: false }).fill('2026-11-01');
  await dialog.getByLabel('Fin', { exact: false }).fill('2027-11-01');
  await dialog.getByLabel('Valeur HT', { exact: false }).fill('1800000');
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('cell', { name: 'Contrat de recette', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ajouter une réclamation', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Intitulé', { exact: false }).fill('Réclamation de recette');
  await dialog.getByLabel('Échéance', { exact: false }).fill('2026-10-01');
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('cell', { name: 'Réclamation de recette', exact: true })).toBeVisible();
  await page.goto('/clients/' + id);
  await expect(
    page.getByText('Une réclamation accessible dépasse son échéance.', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Activités et relances planifiées', exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: info.outputPath('client-360-desktop.png'), fullPage: true });
  await page.getByRole('tab', { name: /^Réclamations/ }).click();
  await page.getByRole('cell', { name: 'Réclamation de recette', exact: true }).click();
  await page.getByRole('button', { name: 'Modifier', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Statut', { exact: true }).selectOption('resolue');
  await dialog.getByLabel('Résolution', { exact: true }).fill('Correction vérifiée avec le client fictif.');
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.goto('/clients/' + id);
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(
    page.getByText('Une réclamation accessible dépasse son échéance.', { exact: true }),
  ).toHaveCount(0);
});

test('P03 fin : classement global DG, filtres persistants et CSV authentifié', async ({ page }, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page, 'dg');
  await page.goto('/clients/classement');
  await expect(page.getByRole('heading', { name: 'Classement des clients', exact: true })).toBeVisible();
  await expect(page.locator('.cat-grid .cat-card')).toHaveCount(5);
  await expect(page.getByRole('region', { name: 'Méthode et périmètre', exact: true })).toContainText(
    'factures émises HT uniquement',
  );
  await page.getByRole('button', { name: '3 mois', exact: true }).click();
  await expect(page).toHaveURL(/range=3m/);
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Répartition ABC (loi de Pareto)', exact: true }),
  ).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV', exact: true }).click();
  const download = await pending;
  expect(await readFile((await download.path())!, 'utf8')).toContain('revenue;abc;score');
  await page.screenshot({ path: info.outputPath('classement-dg-desktop.png'), fullPage: true });
});

test('P03 fin mobile : classement partiel sans fuite financière ni débordement', async ({ page }, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto('/clients/classement');
  await expect(page.getByText(/Vue partielle selon vos droits/)).toBeVisible();
  await expect(page.locator('.cat-grid')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Classes ABC', exact: true })).toHaveCount(0);
  await expect
    .poll(async () =>
      page
        .locator('.table-wrap')
        .evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1)),
    )
    .toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('classement-commercial-mobile.png'), fullPage: true });
});
