import { test, expect, type Page } from '@playwright/test';
import { login, logout } from './helpers';
async function headers(page: Page) {
  const cookie = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN');
  return {
    Accept: 'application/json',
    Origin: new URL(page.url()).origin,
    'X-XSRF-TOKEN': decodeURIComponent(cookie?.value || ''),
  };
}
async function fixture(page: Page, price = 100000) {
  const h = await headers(page);
  const org = await page.request.post('/api/v1/organizations', {
    headers: h,
    data: {
      legal_name: 'TEST P05 ' + Date.now(),
      ignore_duplicates: true,
      duplicate_justification: 'Fixture de recette distincte P05.',
    },
  });
  expect(org.status(), await org.text()).toBe(201);
  const organization = (await org.json()).data;
  const c = await page.request.post('/api/v1/organizations/' + organization.id + '/contacts', {
    headers: h,
    data: { first_name: 'Marie', last_name: 'P05', email: 'test@example.test' },
  });
  expect(c.status()).toBe(201);
  const q = await page.request.post('/api/v1/quotes', {
    headers: h,
    data: {
      organization_id: organization.id,
      contact_id: (await c.json()).data.id,
      title: 'TEST P05 Proposition ' + Date.now(),
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      lines: [
        {
          label: 'Prestation',
          unit: 'forfait',
          quantity: 1,
          unit_price: price,
          unit_cost: price / 2,
          tax_rate: 18,
        },
      ],
    },
  });
  expect(q.status(), await q.text()).toBe(201);
  return (await q.json()).data;
}

test('P05 : nouveau client, interlocuteur, proforma au coût et opportunité sans qualification fictive', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page);
  await page.goto('/devis/nouveau');
  await page.getByRole('button', { name: 'Nouveau client', exact: true }).click();
  const name = 'TEST P05 ZEBRE ' + Date.now();
  await page.getByLabel('Raison sociale').fill(name);
  await page.getByLabel('Nom de l’interlocuteur', { exact: true }).fill('Koné');
  await page.getByLabel('Prénom de l’interlocuteur', { exact: true }).fill('Marie');
  await page.getByRole('button', { name: 'Prestation au coût', exact: true }).click();
  await page.getByLabel('Désignation *', { exact: true }).fill('Pose et installation');
  await page.getByLabel('Coût unitaire (FCFA) — ligne 1', { exact: true }).fill('50000');
  await page.getByLabel('Quantité — ligne 1', { exact: true }).fill('2');
  await page.getByLabel('Objet de la proposition', { exact: true }).fill(name + ' Proposition');
  await page.getByRole('combobox', { name: 'Type de document', exact: true }).selectOption('proforma');
  await expect(page.locator('.grand-total')).toContainText('188');
  await expect(page.locator('input:invalid')).toHaveCount(0);
  await page.getByRole('button', { name: 'Enregistrer en brouillon', exact: true }).click();
  const duplicateReview = page.getByRole('checkbox', { name: 'Il s’agit bien d’une fiche distincte' });
  // Repeated isolated QA fixtures may have similar names: review, never auto-merge.
  await expect(
    page.getByRole('heading', { name: name + ' Proposition', exact: true }).or(duplicateReview),
  ).toBeVisible();
  if (await duplicateReview.isVisible()) {
    await duplicateReview.check();
    await page
      .getByLabel('Justification', { exact: true })
      .fill('Prospect de test distinct généré pour la recette P05.');
    await page.getByRole('button', { name: 'Enregistrer en brouillon', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: name + ' Proposition', exact: true })).toBeVisible();
  await expect(page.locator('.panel-heading')).toContainText('Brouillon');
  const opportunityLink = page.locator('a[href^="/opportunites/"]').first();
  const href = await opportunityLink.getAttribute('href');
  await page.getByRole('tab', { name: 'Historique', exact: true }).click();
  await expect(page.locator('.timeline')).toContainText('Création du brouillon');
  await page.screenshot({ path: info.outputPath('proforma-desktop.png'), fullPage: true });
  await page.goto(href!);
  await expect(page.locator('.stepper .step.current')).toContainText('Nouveau');
  await logout(page);
});

test('P05 : envoi externe, nouvelle version, modification et versions conservées sur mobile', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page);
  const q = await fixture(page);
  await page.goto('/devis/' + q.id);
  for (const name of ['Soumettre à validation', 'Marquer comme envoyé']) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
  await page.getByRole('button', { name: 'Nouvelle version', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Modifier ' + q.number + '-V2', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Objet de la proposition').fill(q.title + ' révisée');
  await page.getByRole('button', { name: 'Enregistrer le brouillon', exact: true }).click();
  await expect(page.getByRole('heading', { name: q.title + ' révisée', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => {
      const box = await page.locator('.sidebar').boundingBox();
      return box ? box.x + box.width : 0;
    })
    .toBeLessThanOrEqual(1);
  await page.getByRole('tab', { name: /Versions/ }).click();
  await expect(page.getByRole('region', { name: 'Versions de cette proposition' })).toContainText('Annulé');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('versions-mobile.png'), fullPage: true });
  await page.goto('/devis?status=brouillon&doc_type=devis&q=' + encodeURIComponent(q.title));
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Document', exact: true })).toHaveValue('devis');
  await expect(page.getByRole('link', { name: q.number + '-V2', exact: true })).toBeVisible();
});

test('P05 : verrou DG, validation indépendante et téléchargement PDF réel', async ({ page }, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page);
  const q = await fixture(page, 3000000);
  await page.goto('/devis/' + q.id);
  await expect(page.getByText('Document verrouillé — approbation DG requise', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Télécharger le PDF', exact: true })).toHaveCount(0);
  const blocked = await page.request.get('/api/v1/documents/quotes/' + q.id + '.pdf', {
    headers: await headers(page),
  });
  expect(blocked.status()).toBe(409);
  await page.getByRole('button', { name: 'Soumettre à validation', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await logout(page);
  await login(page, 'dg');
  await page.goto('/devis/' + q.id);
  await page.getByRole('button', { name: 'Approuver', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByLabel('Commentaire', { exact: true })
    .fill('Approbation de recette isolée uniquement.');
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Télécharger le PDF', exact: true })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger le PDF', exact: true }).click();
  await (await download).saveAs(info.outputPath('devis-valide.pdf'));
  await page.getByRole('tab', { name: /Validations/ }).click();
  await expect(page.getByRole('region', { name: 'Décisions internes' })).toContainText(
    'Approbation de recette isolée',
  );
  await page.screenshot({ path: info.outputPath('validation-dg-desktop.png'), fullPage: true });
});
