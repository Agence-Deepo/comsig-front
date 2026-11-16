import { login, logout, navigate, saveDistinctCustomerFixture } from './helpers';
import { test, expect } from '@playwright/test';

const futureDate = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

test('tâches, modification de statut et calendrier', async ({ page }) => {
  await login(page);
  const title = `TEST FRONT tâche ${Date.now()}`;
  await page.goto('/taches?vue=liste');
  await page.getByRole('button', { name: 'Créer une tâche', exact: true }).click();
  await page.getByLabel('Intitulé').fill(title);
  await page.getByLabel('Échéance').fill(`${new Date().toISOString().slice(0, 10)}T15:00`);
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await page.getByRole('button', { name: 'Modifier', exact: true }).click();
  await page.getByLabel('Statut').selectOption('termine');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.panel-heading .status')).toHaveText('Terminé');
  await navigate(page, '/calendrier');
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await logout(page);
});
test('parcours commercial, devis, facture et règlement sur l’API réelle', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const suffix = Date.now();
  const client = `TEST FRONT ${suffix}`;
  await login(page);
  await page.screenshot({ path: info.outputPath('dashboard-desktop.png'), fullPage: true });
  await navigate(page, '/clients');
  await page.getByRole('button', { name: 'Nouvelle organisation' }).click();
  await page.getByLabel('Raison sociale').fill(client);
  await page.getByLabel('E-mail', { exact: true }).fill(`front-${suffix}@example.test`);
  await saveDistinctCustomerFixture(page);
  await expect(page.getByRole('heading', { name: client, exact: true })).toBeVisible();
  await page
    .getByRole('toolbar', { name: 'Actions rapides' })
    .getByRole('button', { name: 'Ajouter un contact', exact: true })
    .click();
  await page.getByLabel('Prénom', { exact: true }).fill('Marie');
  await page.getByLabel('Nom *', { exact: true }).fill('Contact');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByText('Marie Contact', { exact: true })).toBeVisible();
  await navigate(page, '/opportunites');
  await page.getByRole('button', { name: 'Nouvelle opportunité' }).click();
  await page.getByLabel('Intitulé').fill(`Affaire ${suffix}`);
  await page.getByLabel('Client / prospect').selectOption({ label: client });
  await page.getByLabel('Interlocuteur principal').selectOption({ label: 'Marie Contact' });
  await page.getByLabel('Type de prestation').selectOption('signaletique');
  await page.getByLabel('Date de conclusion prévue').fill(futureDate);
  await page.getByLabel('Besoin identifié').fill('Signalétique extérieure');
  await page.getByLabel('Prochaine action', { exact: true }).fill('Envoyer le devis');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('heading', { name: `Affaire ${suffix}`, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Consigner une interaction', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Intitulé', { exact: false }).fill('Appel de découverte');
  await page.getByRole('dialog').getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Passer à « Qualifié »', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('link', { name: 'Préparer une proposition', exact: true }).click();
  await page.getByLabel('Objet de la proposition').fill(`Devis frontend ${suffix}`);
  await page.getByLabel('Contact destinataire').selectOption({ label: 'Marie Contact' });
  await page.getByLabel('Valable jusqu’au').fill(futureDate);
  await page.getByLabel('Désignation *', { exact: true }).fill('Enseigne lumineuse');
  await page
    .getByRole('spinbutton', { name: 'Prix unitaire HT (FCFA) — ligne 1', exact: true })
    .fill('100000');
  await page.getByRole('spinbutton', { name: 'Coût unitaire (FCFA) — ligne 1', exact: true }).fill('50000');
  await page.getByRole('button', { name: 'Ajouter une ligne' }).click();
  await page.getByLabel('Désignation *', { exact: true }).nth(1).fill('Pose et installation');
  await page
    .getByRole('spinbutton', { name: 'Prix unitaire HT (FCFA) — ligne 2', exact: true })
    .fill('50000');
  await page.getByRole('spinbutton', { name: 'Coût unitaire (FCFA) — ligne 2', exact: true }).fill('20000');
  await page.getByRole('button', { name: 'Calculer les totaux' }).click();
  await expect(page.locator('.grand-total')).toContainText('177');
  await page.getByRole('button', { name: 'Enregistrer le brouillon' }).click();
  await expect(page.getByRole('heading', { name: `Devis frontend ${suffix}`, exact: true })).toBeVisible();
  const quoteId = page.url().split('/').pop()!;
  for (const action of [
    'Soumettre à validation',
    'Marquer comme envoyé',
    'Enregistrer la décision du client',
  ]) {
    await page.getByRole('button', { name: action, exact: true }).click();
    await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
  await expect(page.locator('.panel-heading .status', { hasText: 'Accepté' }).first()).toBeVisible();
  await page.screenshot({ path: info.outputPath('devis-desktop.png'), fullPage: true });
  await logout(page);
  await login(page, 'finance');
  await navigate(page, '/factures');
  await page.getByRole('button', { name: 'Créer une facture interne' }).click();
  await page.getByLabel('Identifiant du devis accepté').fill(quoteId);
  await page.getByLabel('Échéance de paiement').fill(futureDate);
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('heading', { name: /FAC-/ })).toBeVisible();
  const invoiceId = page.url().split('/').pop()!;
  await page.getByRole('button', { name: 'Enregistrer un règlement' }).click();
  await page.getByLabel('Montant (FCFA)').fill('177000');
  await page.getByLabel('Référence unique').fill(`FRONT-${suffix}`);
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.locator('.panel-heading .status', { hasText: 'Émise' })).toBeVisible();
  await expect(page.getByText(`FRONT-${suffix}`, { exact: true })).toBeVisible();
  await logout(page);
  await login(page, 'dg');
  await navigate(page, '/validations-financieres');
  await page.locator(`a[href="/factures/${invoiceId}"]`).click();
  await page.getByRole('button', { name: 'Valider', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.locator('.panel-heading .status', { hasText: 'Payée' })).toBeVisible();
  await logout(page);
  expect(errors).toEqual([]);
});
test('stocks : entrée et sortie, CUMP et solde serveur', async ({ page }) => {
  await login(page, 'prod');
  await navigate(page, '/stocks');
  await page.getByRole('button', { name: 'Créer un article' }).click();
  await page.getByLabel('Code *', { exact: true }).fill(`FR-${Date.now()}`);
  await page.getByLabel('Désignation').fill('Matière test frontend');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Matière test frontend' })).toBeVisible();
  await page.getByRole('button', { name: 'Mouvement', exact: true }).click();
  await page.getByLabel('Quantité', { exact: true }).fill('10');
  await page.getByLabel('Coût unitaire (FCFA)').fill('2500');
  await page.getByLabel('Motif').fill('Réception de test');
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByText('Réception de test', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mouvement', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Type').selectOption('sortie');
  await page.getByLabel('Quantité', { exact: true }).fill('3');
  await page.getByLabel('Motif').fill('Sortie de test');
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByText('Sortie de test', { exact: true })).toBeVisible();
  await expect(page.locator('.facts > div').filter({ hasText: 'Disponible' })).toContainText('7');
  await page.getByRole('button', { name: 'Mouvement', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Type').selectOption('sortie');
  await page.getByLabel('Quantité', { exact: true }).fill('8');
  await page.getByLabel('Motif').fill('Sortie impossible de test');
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Stock insuffisant');
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(page.locator('.facts > div').filter({ hasText: 'Disponible' })).toContainText('7');
  await logout(page);
});
test('mobile, navigation et session persistante', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('dashboard-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await navigate(page, '/clients');
  await expect(page.getByRole('heading', { name: 'Clients et contacts' })).toBeVisible();
  await page.getByRole('button', { name: 'Nouvelle organisation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Nouvelle organisation' })).toBeVisible();
});
test('administration, droits de navigation et modules non portés', async ({ page }) => {
  await login(page, 'admin');
  await expect(page.locator('nav a[href="/devis"]')).toHaveCount(0);
  await navigate(page, '/utilisateurs');
  await page.getByRole('button', { name: 'Créer un utilisateur' }).click();
  await expect(page.getByLabel('Profil *')).toBeVisible();
  await expect(page.getByLabel('Service *')).toBeVisible();
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await navigate(page, '/audit');
  await expect(page.getByRole('heading', { name: 'Journal d’audit' })).toBeVisible();
  await navigate(page, '/modules');
  await expect(page.getByRole('heading', { name: /Connecteur FNE/ })).toBeVisible();
  await expect(page.getByText('À porter', { exact: true }).first()).toBeVisible();
  await logout(page);
});
