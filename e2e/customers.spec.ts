import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { login, navigate, saveDistinctCustomerFixture } from './helpers';

test('P03 : prospect détaillé, qualification 5/7, contact décideur, filtres persistants et CSV réel', async ({
  page,
}, info) => {
  await login(page);
  const suffix = Date.now();
  const name = 'TEST P03 prospect ' + suffix;
  const sector = 'industrie';
  await navigate(page, '/prospection');
  await expect(page.getByRole('heading', { name: 'Prospection', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Nouveau prospect', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Raison sociale').fill(name);
  await dialog.getByLabel('Personne ressource (interlocuteur)', { exact: true }).fill('Marie Koné');
  await dialog.getByLabel('Fonction occupée', { exact: true }).fill('Responsable achats');
  await dialog.getByLabel('Secteur', { exact: true }).selectOption(sector);
  await dialog.getByLabel('Commune', { exact: true }).selectOption('cocody');
  await dialog.getByLabel('Potentiel', { exact: true }).selectOption('fort');
  await dialog.getByLabel('E-mail', { exact: true }).fill('prospect-' + suffix + '@example.test');
  await saveDistinctCustomerFixture(page);
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  const id = new URL(page.url()).pathname.split('/').pop();
  await page.getByRole('tab', { name: 'Historique', exact: true }).click();
  await expect(page.getByText('Premier contact — ' + name, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Qualifier', exact: true }).click();
  dialog = page.getByRole('dialog');
  for (const label of ['Activité vérifiée', 'Besoin probable', 'Budget / capacité d’achat', 'Calendrier'])
    await dialog.getByLabel(label, { exact: true }).fill('Confirmé');
  await dialog.getByLabel('Statut de qualification', { exact: true }).selectOption('qualifie');
  await dialog.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(dialog.getByText(/Renseignez au moins 5 critères/).first()).toBeVisible();
  await dialog.getByLabel('Décideur identifié', { exact: true }).fill('Marie Koné');
  await dialog.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('tab', { name: 'Vue d’ensemble', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Qualification', exact: true })).toContainText('71 %');
  await page
    .getByRole('toolbar', { name: 'Actions rapides' })
    .getByRole('button', { name: 'Ajouter un contact', exact: true })
    .click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Prénom', { exact: true }).fill('Marie');
  await dialog.getByLabel('Nom *', { exact: true }).fill('Koné');
  await dialog.getByLabel('Rôle dans la décision', { exact: true }).selectOption('decideur');
  await dialog.getByLabel('Opposition aux sollicitations', { exact: true }).check();
  await dialog.getByLabel('Interlocuteur principal', { exact: true }).check();
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByText('Marie Koné', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Opposition', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Documents', exact: true }).click();
  await expect(page.locator('.attachments-card')).toBeVisible();
  await page.reload();
  await expect(page.locator('.attachments-card')).toBeVisible();
  await page.goto('/prospection');
  await page.getByLabel('Secteur', { exact: true }).selectOption(sector);
  await page.getByLabel('Qualification', { exact: true }).selectOption('qualifie');
  await expect(page).toHaveURL(/sector=industrie/);
  await expect(page).toHaveURL(/qualification_status=qualifie/);
  // Les filtres peuvent renvoyer plusieurs pages : on cible la fiche créée par son nom.
  await page.getByLabel('Rechercher', { exact: true }).fill(name);
  await page.getByLabel('Rechercher', { exact: true }).press('Enter');
  await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible();
  await expect(page).toHaveURL(/qualification_status=qualifie/);
  await page.reload();
  await expect(page.getByLabel('Secteur', { exact: true })).toHaveValue(sector);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV', exact: true }).click();
  const csv = await pending;
  const bytes = await readFile((await csv.path())!);
  expect(bytes.toString('utf8')).toContain(name);
  await page.screenshot({ path: info.outputPath('p03-prospection-desktop.png'), fullPage: true });
  await page.goto('/clients/' + id + '?tab=contacts');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: /Marie Koné/ })).toBeVisible();
  await page.screenshot({ path: info.outputPath('p03-contacts-desktop.png'), fullPage: true });
});

test('P03 mobile : formulaire, nom long, onglets, focus et notifications sans débordement', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto('/clients');
  await page.getByRole('button', { name: 'Nouvelle organisation', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Raison sociale')).toBeFocused();
  const name = 'TEST P03 mobile ' + Date.now() + ' ' + 'organisation'.repeat(5);
  await dialog.getByLabel('Raison sociale').fill(name);
  await dialog.getByLabel('Type', { exact: true }).selectOption('client');
  await saveDistinctCustomerFixture(page);
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('tab', { name: /^Contacts/ }).click();
  await page.getByRole('tab', { name: 'Documents', exact: true }).click();
  await expect(page.locator('.attachments-card')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Aucun document', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole('button', { name: /^Notifications/ }).click();
  await expect(page.getByRole('dialog', { name: 'Notifications', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.keyboard.press('Escape');
  await page.screenshot({ path: info.outputPath('p03-client-mobile.png'), fullPage: true });
});
