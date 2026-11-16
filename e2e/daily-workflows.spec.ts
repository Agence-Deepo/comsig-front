import { test, expect } from '@playwright/test';
import { login, logout } from './helpers';

test('P06B : demande commerciale reçue, affectée et livrée par production', async ({ page }, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base de recette isolée obligatoire.');
  await login(page);
  await page.goto('/ordres-travail?vue=sent');
  await page.getByRole('button', { name: 'Nouvelle demande', exact: true }).click();
  const dialog = page.getByRole('dialog'),
    title = 'TEST P06B Supports ' + Date.now();
  await dialog.getByLabel('Intitulé', { exact: true }).fill(title);
  await dialog.getByLabel('Service destinataire', { exact: true }).selectOption({ label: 'Production' });
  await dialog.getByLabel('Priorité', { exact: true }).selectOption('2');
  await dialog
    .getByLabel('Description et livrable attendu', { exact: true })
    .fill('Imprimer et livrer dix supports, dimensions validées.');
  await dialog.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  const href = page.url();
  await logout(page);
  await login(page, 'prod');
  await page.goto(href);
  await page.getByRole('button', { name: 'Affecter / planifier', exact: true }).click();
  const form = page.getByRole('dialog');
  const option = form.getByRole('option', { name: /Prod/ });
  await expect(option).toHaveCount(1);
  await form
    .getByLabel('Responsable du service', { exact: true })
    .selectOption((await option.getAttribute('value'))!);
  await form.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(form).not.toBeVisible();
  for (const status of ['En cours', 'En contrôle', 'Terminé', 'Livré']) {
    await page.getByRole('button', { name: status, exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
  await logout(page);
  await login(page);
  await page.goto(href);
  await expect(page.getByText(/^Livré le/)).toBeVisible();
  await page.screenshot({ path: info.outputPath('demande-livree.png'), fullPage: true });
});

test('P06B : to-do et points obligatoires de checklist persistés', async ({ page }, info) => {
  test.skip(!process.env.P02_QA_DATABASE, 'Base de recette isolée obligatoire.');
  await login(page);
  await page.goto('/todo');
  await page.getByRole('button', { name: 'Ajouter une chose à faire', exact: true }).click();
  const title = 'TEST P06B Préparer ' + Date.now();
  const form = page.getByRole('dialog');
  await form.getByLabel('Intitulé', { exact: true }).fill(title);
  await form.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(form).not.toBeVisible();
  const todo = page.getByRole('checkbox', { name: 'Terminer ' + title, exact: true });
  await todo.click();
  await expect(todo).toHaveCount(0);
  await page.getByLabel('Éléments affichés', { exact: true }).selectOption('done');
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Mes checklists', exact: true }).click();
  await page.getByRole('button', { name: 'Nouvelle checklist', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByLabel('Intitulé', { exact: true })
    .fill(title + ' Contrôles');
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const card = page
    .locator('.card')
    .filter({ has: page.getByRole('heading', { name: title + ' Contrôles', exact: true }) });
  await card.getByRole('button', { name: 'Ajouter un point', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Intitulé', { exact: true }).fill('BAT confirmé');
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await card.getByRole('checkbox', { name: 'BAT confirmé · Obligatoire', exact: true }).click();
  await expect(card.getByRole('checkbox', { name: 'BAT confirmé · Obligatoire', exact: true })).toBeChecked();
  await page.reload();
  await expect(card.getByRole('checkbox', { name: 'BAT confirmé · Obligatoire', exact: true })).toBeChecked();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => {
      const box = await page.locator('.sidebar').boundingBox();
      return box ? box.x + box.width : 0;
    })
    .toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('checklist-mobile.png'), fullPage: true });
});
