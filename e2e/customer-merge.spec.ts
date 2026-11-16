import { test, expect, type Page } from '@playwright/test';
import { login } from './helpers';

async function headers(page: Page) {
  const csrf = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN');
  return {
    Accept: 'application/json',
    Origin: new URL(page.url()).origin,
    'X-XSRF-TOKEN': decodeURIComponent(csrf?.value ?? ''),
  };
}
async function create(page: Page, name: string, email?: string) {
  const response = await page.request.post('/api/v1/organizations', {
    headers: await headers(page),
    data: {
      legal_name: name,
      email,
      kind: 'client',
      ignore_duplicates: true,
      duplicate_justification: 'Fixture de recette volontairement distincte, sans valeur commerciale.',
    },
  });
  expect(response.status(), await response.text()).toBe(201);
  return (await response.json()).data;
}

test('P03-B doublons : avertissement, refus serveur, justification et conservation du formulaire', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Recette réservée à une base isolée.');
  await login(page);
  const suffix = Date.now();
  const original = await create(page, 'TEST P03B Éléphant ' + suffix, `p03b-${suffix}@example.test`);
  await page.goto('/clients');
  await page.getByRole('button', { name: 'Nouvelle organisation', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Raison sociale').fill('TEST P03B Éléphant ' + suffix);
  await dialog.getByLabel('E-mail', { exact: true }).fill(original.email);
  await expect(dialog.getByRole('region', { name: 'Doublons possibles' })).toContainText(original.ref);
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Des fiches similaires existent');
  await expect(dialog.getByLabel('Raison sociale')).toHaveValue(original.legal_name);
  await dialog.getByLabel('Il s’agit bien d’une fiche distincte', { exact: true }).check();
  await dialog
    .getByLabel('Justification de la fiche distincte', { exact: true })
    .fill('Deux filiales de recette utilisant un même interlocuteur.');
  await dialog.screenshot({ path: info.outputPath('doublons-desktop.png') });
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('heading', { name: original.legal_name, exact: true })).toBeVisible();
  expect(new URL(page.url()).pathname).not.toContain(original.id);
  await expect(page.getByRole('button', { name: 'Fusionner une fiche', exact: true })).toHaveCount(0);
});

test('P03-B fusion : aperçu, confirmation, contacts, archive et lien vers la cible', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Ne jamais fusionner dans la base utilisateur pendant les tests.');
  await login(page, 'dircom');
  const suffix = Date.now();
  const target = await create(page, 'TEST P03B Cible ' + suffix);
  const source = await create(page, 'TEST P03B Source ' + suffix);
  const response = await page.request.post(`/api/v1/organizations/${source.id}/contacts`, {
    headers: await headers(page),
    data: { last_name: 'Contact source ' + suffix, is_primary: true, opt_out: true },
  });
  expect(response.status()).toBe(201);
  await page.goto('/clients/' + target.id);
  await page.getByRole('button', { name: 'Fusionner une fiche', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Fusion contrôlée', exact: true });
  await dialog.getByLabel('Rechercher une fiche source', { exact: true }).fill(source.legal_name);
  await expect(dialog.getByLabel('Fiche source à archiver')).toContainText(source.ref);
  await dialog.getByLabel('Fiche source à archiver', { exact: true }).selectOption(source.id);
  await dialog.getByRole('button', { name: 'Calculer l’aperçu', exact: true }).click();
  await expect(dialog.getByRole('region', { name: 'Aperçu de la fusion' })).toContainText('Contacts : 1');
  await dialog.getByLabel('Référence de la source à confirmer', { exact: true }).fill(source.ref);
  await dialog
    .getByLabel('Justification de la fusion', { exact: true })
    .fill('Deux fiches de recette pour une même organisation, vérifiées.');
  await dialog
    .getByLabel('Je confirme que ces deux fiches représentent la même organisation', { exact: true })
    .check();
  await dialog.screenshot({ path: info.outputPath('fusion-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await dialog.screenshot({ path: info.outputPath('fusion-mobile.png') });
  await dialog.getByRole('button', { name: 'Confirmer la fusion', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('region', { name: 'Fiches regroupées', exact: true })).toContainText(
    source.ref,
  );
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.getByRole('tab', { name: /^Contacts/ }).click();
  await expect(page.getByRole('cell', { name: 'Opposition', exact: true })).toBeVisible();
  await page.goto('/clients/' + source.id);
  await expect(page.getByRole('region', { name: 'Fiche fusionnée', exact: true })).toBeVisible();
  await page.getByRole('link', { name: new RegExp('Ouvrir ' + target.ref) }).click();
  await expect(page.getByRole('heading', { name: target.legal_name, exact: true })).toBeVisible();
});
