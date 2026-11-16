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
async function fixture(page: Page) {
  const suffix = Date.now();
  const response = await page.request.post('/api/v1/organizations', {
    headers: await headers(page),
    data: {
      legal_name: 'TEST P03C Historique ' + suffix,
      kind: 'client',
      ignore_duplicates: true,
      duplicate_justification: 'Fixture indépendante de recette historique.',
    },
  });
  expect(response.status(), await response.text()).toBe(201);
  const org = (await response.json()).data;
  const contact = await page.request.post(`/api/v1/organizations/${org.id}/contacts`, {
    headers: await headers(page),
    data: { first_name: 'Marie', last_name: 'Historique ' + suffix },
  });
  expect(contact.status()).toBe(201);
  return { org, contact: (await contact.json()).data };
}

test('P03-C historique : compte rendu critique, date réelle, relance unique, décisions et rechargement', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Recette sur base isolée uniquement.');
  await login(page);
  const { org, contact } = await fixture(page);
  await page.goto('/clients/' + org.id);
  await page.getByRole('button', { name: 'Consigner une interaction', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Intitulé', { exact: false }).fill('Appel compte rendu P03C');
  await dialog.getByLabel('Statut', { exact: true }).selectOption('termine');
  await dialog.getByLabel('Priorité (1 = la plus haute)', { exact: true }).fill('1');
  await dialog.getByLabel('Contact lié', { exact: true }).selectOption(contact.id);
  await dialog.getByLabel('Résultat du contact', { exact: true }).selectOption('joint');
  await dialog.getByLabel('Durée (minutes)', { exact: true }).fill('20');
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('compte rendu est obligatoire');
  await dialog
    .getByLabel('Compte rendu', { exact: true })
    .fill('Budget confirmé, proposition attendue lundi.');
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.goto('/clients/' + org.id + '?tab=activities');
  let item = page.locator('.tl-item').filter({ hasText: 'Appel compte rendu P03C' });
  await expect(item).toContainText('Budget confirmé');
  await expect(item).toContainText('Réalisé le');
  await expect(item).toContainText('20 min');
  await expect(item).toContainText('Interlocuteur joint');
  await item.getByRole('button', { name: 'Planifier une relance', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Objet de la relance', { exact: true }).fill('Relance devis P03C');
  await dialog
    .getByLabel('Échéance de la relance', { exact: true })
    .fill(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16));
  await dialog.getByRole('button', { name: 'Planifier', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.tl-item').filter({ hasText: 'Relance devis P03C' })).toContainText(
    'Relance liée',
  );
  await expect(item.getByRole('button', { name: 'Planifier une relance', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(item).toContainText('Budget confirmé');
  await page.screenshot({ path: info.outputPath('historique-desktop.png'), fullPage: true });
  await page.getByRole('tab', { name: 'Décisions', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Historique des décisions', exact: true })).toContainText(
    'Interaction consignée',
  );
  await expect(page.getByRole('region', { name: 'Historique des décisions', exact: true })).toContainText(
    'Relance planifiée',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole('region', { name: 'Historique des décisions', exact: true })).toContainText(
    'Interaction consignée',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('decisions-mobile.png'), fullPage: true });
});

test('P03-C refus : opposition persistante, relance annulée et nouveau suivi interdit', async ({ page }) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Recette sur base isolée uniquement.');
  await login(page);
  const { org, contact } = await fixture(page);
  const initial = await page.request.post('/api/v1/activities', {
    headers: await headers(page),
    data: { title: 'Joint initial', contact_id: contact.id, status: 'termine', contact_result: 'joint' },
  });
  expect(initial.status()).toBe(201);
  const source = (await initial.json()).data;
  const follow = await page.request.post(`/api/v1/activities/${source.id}/follow-up`, {
    headers: await headers(page),
    data: { title: 'À annuler P03C', due_at: new Date(Date.now() + 2 * 86400000).toISOString() },
  });
  expect(follow.status()).toBe(201);
  const followId = (await follow.json()).data.id;
  await page.goto('/clients/' + org.id);
  await page.getByRole('button', { name: 'Consigner une interaction', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Intitulé', { exact: false }).fill('Refus explicite P03C');
  await dialog.getByLabel('Statut', { exact: true }).selectOption('termine');
  await dialog.getByLabel('Contact lié', { exact: true }).selectOption(contact.id);
  await dialog.getByLabel('Résultat du contact', { exact: true }).selectOption('refus');
  await dialog
    .getByLabel('Compte rendu', { exact: true })
    .fill('Le contact demande l’arrêt des sollicitations.');
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.goto('/clients/' + org.id + '?tab=contacts');
  await expect(page.getByRole('cell', { name: 'Opposition', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Historique', exact: true }).click();
  await expect(page.locator('.tl-item').filter({ hasText: 'À annuler P03C' })).toContainText('Annulé');
  await expect(page.getByRole('button', { name: 'Planifier une relance', exact: true })).toHaveCount(0);
  const direct = await page.request.post(`/api/v1/activities/${source.id}/follow-up`, {
    headers: await headers(page),
    data: { title: 'Contournement', due_at: new Date(Date.now() + 2 * 86400000).toISOString() },
  });
  expect(direct.status()).toBe(409);
  const saved = await page.request.get('/api/v1/activities/' + followId, { headers: await headers(page) });
  expect((await saved.json()).data.status).toBe('annule');
});
