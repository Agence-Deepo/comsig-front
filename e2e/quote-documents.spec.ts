import { test, expect, type Page } from '@playwright/test';
import { login, logout } from './helpers';

async function fixture(page: Page) {
  const cookie = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN');
  const headers = {
    Accept: 'application/json',
    Origin: new URL(page.url()).origin,
    'X-XSRF-TOKEN': decodeURIComponent(cookie?.value || ''),
  };
  const org = await page.request.post('/api/v1/organizations', {
    headers,
    data: {
      legal_name: 'TEST P05B ' + Date.now(),
      ignore_duplicates: true,
      duplicate_justification: 'Recette isolée P05B distincte.',
    },
  });
  expect(org.status(), await org.text()).toBe(201);
  const organization = (await org.json()).data;
  const c = await page.request.post(`/api/v1/organizations/${organization.id}/contacts`, {
    headers,
    data: { last_name: 'P05B', email: 'client@example.test' },
  });
  expect(c.status()).toBe(201);
  const response = await page.request.post('/api/v1/quotes', {
    headers,
    data: {
      organization_id: organization.id,
      contact_id: (await c.json()).data.id,
      title: 'TEST P05B Proposition',
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      global_discount_pct: 5,
      lines: [
        {
          label: 'Impression et pose <COM&SIG>',
          unit: 'forfait',
          quantity: 2,
          unit_price: 50000,
          unit_cost: 20000,
          tax_rate: 18,
          discount_pct: 5,
        },
      ],
    },
  });
  expect(response.status(), await response.text()).toBe(201);
  return { quote: (await response.json()).data, organization, headers };
}

test('P05B : trois téléchargements réels et courrier EML privé sans changement de statut', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page);
  const { quote, headers } = await fixture(page);
  await page.goto('/devis/' + quote.id);
  for (const [caption, extension] of [
    ['Télécharger le PDF', 'pdf'],
    ['Télécharger Word', 'docx'],
    ['Télécharger Excel', 'xlsx'],
  ]) {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: caption, exact: true }).click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe(quote.number + '.' + extension);
    await download.saveAs(info.outputPath('proposition.' + extension));
    expect(await download.failure()).toBeNull();
  }
  await page.getByRole('button', { name: 'Soumettre à validation', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('tab', { name: 'Courriers de test', exact: true }).click();
  await page.getByRole('button', { name: 'Préparer un e-mail de test', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText('client@example.test', { exact: false }).last()).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger le courrier de test', exact: true }).click();
  await (await pending).saveAs(info.outputPath('courrier-test.eml'));
  const q = await page.request.get('/api/v1/quotes/' + quote.id, { headers });
  expect(q.status()).toBe(200);
  expect((await q.json()).data.status).toBe('valide');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: info.outputPath('courrier-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('P05B : catégorie tarifaire explicite depuis la fiche client', async ({ page }, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page);
  const { organization } = await fixture(page);
  await page.goto('/clients/' + organization.id);
  await page.getByRole('tab', { name: 'Tarification', exact: true }).click();
  await page.getByRole('button', { name: 'Modifier la tarification', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Catégorie tarifaire').selectOption('revendeur');
  await dialog.getByLabel('Taux à utiliser').selectOption('categorie');
  await dialog.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('35 %', { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('tarification-client.png'), fullPage: true });
});

test('P05B : tarif fournisseur saisi par production puis utilisé au chiffrage commercial', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page, 'prod');
  const cookie = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN');
  const headers = {
    Accept: 'application/json',
    Origin: new URL(page.url()).origin,
    'X-XSRF-TOKEN': decodeURIComponent(cookie?.value || ''),
  };
  const r = await page.request.post('/api/v1/stock-items', {
    headers,
    data: { code: 'TEST-P05B-' + Date.now(), label: 'Bâche recette fournisseur', unit: 'm2' },
  });
  expect(r.status(), await r.text()).toBe(201);
  const stock = (await r.json()).data;
  await page.goto('/stocks/' + stock.id);
  await page.getByRole('button', { name: 'Ajouter un tarif fournisseur', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Fournisseur', { exact: true }).fill('TEST Fournisseur');
  await dialog.getByLabel('Prix d’achat unitaire (FCFA)', { exact: true }).fill('2500');
  await dialog.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await logout(page);
  await login(page);
  const { quote } = await fixture(page);
  await page.goto('/devis/' + quote.id + '/modifier');
  await page.getByRole('combobox', { name: 'Source du prix', exact: true }).selectOption('stock:' + stock.id);
  await page.getByRole('combobox', { name: 'Base du coût d’achat', exact: true }).selectOption('tarif');
  const select = page.getByRole('combobox', { name: 'Tarif fournisseur', exact: true });
  const option = select.getByRole('option', { name: /TEST Fournisseur/ });
  await expect(option).toHaveCount(1);
  await select.selectOption((await option.getAttribute('value'))!);
  await page.getByRole('button', { name: 'Enregistrer le brouillon', exact: true }).click();
  await expect(page.getByRole('heading', { name: quote.title, exact: true })).toBeVisible();
  const detail = await page.request.get('/api/v1/quotes/' + quote.id, { headers: { Accept: 'application/json', Origin: new URL(page.url()).origin } });
  expect(detail.status(), await detail.text()).toBe(200);
  const q = (await detail.json()).data;
  expect(q.lines[0].cost_basis).toBe('tarif');
  expect(q.lines[0].unit_cost).toBe(2500);
  expect(q.lines[0].unit_price).toBe(4000);
  await page.screenshot({ path: info.outputPath('chiffrage-fournisseur.png'), fullPage: true });
});
