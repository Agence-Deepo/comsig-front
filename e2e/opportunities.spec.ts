import { test, expect, type Page } from '@playwright/test';
import { login, logout } from './helpers';
const day = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
async function headers(page: Page) {
  const c = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN');
  return {
    Accept: 'application/json',
    Origin: new URL(page.url()).origin,
    'X-XSRF-TOKEN': decodeURIComponent(c?.value ?? ''),
  };
}
async function fixture(page: Page, ready = true) {
  const name = 'TEST P04 ' + Date.now();
  const response = await page.request.post('/api/v1/organizations', {
    headers: await headers(page),
    data: {
      legal_name: name,
      ignore_duplicates: true,
      duplicate_justification: 'Fixture indépendante pour recette P04.',
    },
  });
  expect(response.status(), await response.text()).toBe(201);
  const org = (await response.json()).data;
  const c = await page.request.post(`/api/v1/organizations/${org.id}/contacts`, {
    headers: await headers(page),
    data: { first_name: 'Marie', last_name: 'P04' },
  });
  expect(c.status()).toBe(201);
  const contact = (await c.json()).data;
  const o = await page.request.post('/api/v1/opportunities', {
    headers: await headers(page),
    data: {
      title: name + ' Affaire',
      organization_id: org.id,
      expected_close_date: day(30),
      amount: 1800000,
      offer_type: 'conseil',
      ...(ready
        ? {
            primary_contact_id: contact.id,
            need: 'Besoin confirmé',
            next_step: 'Rendez-vous P04',
            next_step_date: day(2),
          }
        : {}),
    },
  });
  expect(o.status(), await o.text()).toBe(201);
  const opp = (await o.json()).data;
  return { org, contact, opp };
}
test('P04 : filtres persistants, interaction qualifiante, brief/faisabilité, devis lié sans ressaisie', async ({
  page,
}, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page);
  const { org, opp } = await fixture(page);
  await page.goto('/opportunites?view=list&q=' + encodeURIComponent(opp.title));
  await expect(page.getByRole('row').filter({ hasText: opp.title })).toBeVisible();
  await page.getByLabel('Montant minimum', { exact: true }).selectOption('1000000');
  await page.reload();
  await expect(page.getByLabel('Montant minimum', { exact: true })).toHaveValue('1000000');
  await page.getByRole('cell').filter({ hasText: opp.title }).first().click();
  await expect(page.getByRole('heading', { name: opp.title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Consigner une interaction', exact: true }).click();
  let modal = page.getByRole('dialog');
  await modal.getByLabel('Intitulé', { exact: false }).fill('Appel de découverte P04');
  await modal.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(modal).not.toBeVisible();
  await page.getByRole('button', { name: 'Passer à « Qualifié »', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('tab', { name: 'Brief et faisabilité', exact: true }).click();
  await page.getByRole('button', { name: 'Modifier le brief', exact: true }).click();
  modal = page.getByRole('dialog');
  for (const t of await modal.locator('textarea').all()) await t.fill('Confirmé avec le client fictif');
  await modal.getByRole('checkbox').check();
  await modal.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(modal).not.toBeVisible();
  await page.getByRole('button', { name: 'Modifier la faisabilité', exact: true }).click();
  modal = page.getByRole('dialog');
  await modal.getByLabel('Statut', { exact: true }).selectOption('confirmee');
  await modal
    .getByLabel('Hypothèses, réserves, coûts', { exact: true })
    .fill('Disponibilités, délais et coûts vérifiés.');
  await modal.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(modal).not.toBeVisible();
  await page.getByRole('button', { name: 'Passer à « Proposition »', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('tab', { name: 'Historique', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Historique des changements', exact: true })).toContainText(
    'Proposition',
  );
  expect(
    await page
      .getByRole('region', { name: 'Historique des changements', exact: true })
      .locator('.tl-item > div')
      .first()
      .evaluate((e) => e.getBoundingClientRect().width),
  ).toBeGreaterThan(200);
  await page.screenshot({ path: info.outputPath('opportunite-desktop.png'), fullPage: true });
  await page.getByRole('link', { name: 'Facture proforma', exact: true }).click();
  await expect(page.getByLabel('Client / prospect', { exact: false })).toHaveValue(org.id);
  await expect(page.getByLabel('Contact destinataire', { exact: false })).toHaveValue(opp.primary_contact_id);
  await expect(page.getByRole('combobox', { name: 'Type de document', exact: true })).toHaveValue('proforma');
});
test('P04 : demande de dérogation par commercial puis décision séparée par DC', async ({ page }, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page);
  const { opp } = await fixture(page, false);
  await page.goto('/opportunites/' + opp.id);
  await page.getByRole('button', { name: 'Passer à « Qualifié »', exact: true }).click();
  let d = page.getByRole('dialog');
  await d
    .getByLabel('Justification de la dérogation / réouverture', { exact: true })
    .fill('Éléments attendus mais passage demandé pour étude.');
  await d.getByRole('button', { name: 'Demander une dérogation', exact: true }).click();
  await expect(d).not.toBeVisible();
  await logout(page);
  await login(page, 'dircom');
  await page.goto('/opportunites/' + opp.id + '?tab=approvals');
  await page.getByRole('button', { name: 'Examiner', exact: true }).click();
  d = page.getByRole('dialog');
  await d.getByLabel('Décision', { exact: true }).selectOption('approve');
  await d
    .getByLabel('Motif de décision', { exact: true })
    .fill('Dérogation validée, éléments à compléter au prochain jalon.');
  await d.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(d).not.toBeVisible();
  await expect(page.getByRole('region', { name: 'Demandes de dérogation', exact: true })).toContainText(
    'approuvee',
  );
  await page.screenshot({ path: info.outputPath('derogation-dc.png'), fullPage: true });
});
test('P04 : suspension, rappel dans agenda et réouverture par DG sur mobile', async ({ page }, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base isolée obligatoire.');
  await login(page);
  const { opp } = await fixture(page);
  await page.goto('/opportunites/' + opp.id);
  await page.getByRole('button', { name: 'Suspendue', exact: true }).click();
  let d = page.getByRole('dialog');
  await d.getByLabel('Motif normalisé', { exact: true }).selectOption('budget');
  await d.getByLabel('Date de réactivation prévue', { exact: true }).fill(day(3));
  await d.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(d).not.toBeVisible();
  await page.getByRole('link', { name: 'Agenda de l’affaire', exact: true }).click();
  await expect(page.getByText('Agenda de l’affaire : seules les activités associées', { exact: false })).toBeVisible();
  await expect(page.getByTitle('Activité : Réactiver — ' + opp.ref, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Afficher tout le calendrier', exact: true }).click();
  await expect(page).not.toHaveURL(/opportunity_id=/);
  await logout(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, 'dg');
  await page.goto('/opportunites/' + opp.id);
  await page.getByRole('button', { name: 'Rouvrir', exact: true }).click();
  d = page.getByRole('dialog');
  await d
    .getByLabel('Justification de la dérogation / réouverture', { exact: true })
    .fill('Le budget a été rétabli, reprise autorisée.');
  await d.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(d).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Passer à « Proposition »', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('opportunite-mobile.png'), fullPage: true });
  await page.goto('/opportunites?view=list&q=' + encodeURIComponent(opp.title));
  await expect(page.getByRole('row').filter({ hasText: opp.title })).toBeVisible();
  expect(
    await page
      .locator('.table-wrap')
      .evaluateAll((nodes) => nodes.every((n) => n.scrollWidth <= n.clientWidth + 1)),
  ).toBe(true);
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  await expect(page.getByRole('article', { name: new RegExp(opp.title) })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('kanban-mobile.png'), fullPage: true });
});
