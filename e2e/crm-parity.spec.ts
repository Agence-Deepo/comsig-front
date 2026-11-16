import { test, expect, type Page } from '@playwright/test';
import { navigate } from './helpers';

const referenceUrl = process.env.CRM_REFERENCE_URL;
const tiles = [
  ['direction', 'Direction générale', 'organigramme'],
  ['commercial', 'Commerciale', 'poignee'],
  ['production', 'Production', 'usine'],
  ['comptabilite', 'Comptabilité', 'pieces'],
  ['regie', 'Régie publicitaire et médias', 'ecran'],
  ['assistanat_dg', 'Assistante de direction', 'agenda'],
  ['imprimerie', 'Imprimerie', 'imprimante'],
  ['terrain', 'Technicien terrain', 'outils'],
  ['rh', 'Ressources humaines', 'equipe'],
].map(([code, label, icon]) => ({
  code,
  label,
  icon,
  department_code: code,
  ...(code === 'imprimerie'
    ? { caption: 'Service du département Production', parent_code: 'production' }
    : {}),
  ...(code === 'terrain' ? { kind: 'fonction', department_code: undefined } : {}),
}));
async function settled(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  await page.waitForTimeout(200);
}

for (const [name, path, selector] of [
  ['portail', '/portail', '.portal-inner'],
  ['connexion-service', '/connexion/commercial', '.dept-auth'],
  ['connexion-directe', '/connexion', '.auth-wrap'],
]) {
  test('parité visuelle avec la source : ' + name, async ({ page, browser }, info) => {
    test.skip(!referenceUrl, 'Définir CRM_REFERENCE_URL pour comparer au serveur du CRM source.');
    const ref = await browser.newPage({
      viewport: { width: 1440, height: 960 },
      locale: 'fr-FR',
      colorScheme: 'light',
    });
    // Read-only reference fixtures: metadata known from the source. No mock runs in the application under test.
    await ref.route('**/api/auth/me', (route) => route.fulfill({ json: { me: null } }));
    await ref.route('**/api/public/portal', (route) => route.fulfill({ json: { rows: tiles } }));
    await ref.goto(referenceUrl + path);
    await page.goto(path);
    await expect(ref.locator(selector)).toBeVisible();
    await expect(page.locator(selector)).toBeVisible();
    await settled(ref);
    await settled(page);
    const before = await ref.screenshot({
      path: info.outputPath(name + '-source.png'),
      fullPage: true,
      animations: 'disabled',
    });
    const after = await page.screenshot({
      path: info.outputPath(name + '-laravel.png'),
      fullPage: true,
      animations: 'disabled',
    });
    expect(await page.locator(selector).boundingBox()).toEqual(await ref.locator(selector).boundingBox());
    expect(
      after.equals(before),
      'La capture doit être identique au rendu de la source CRM, sans données métier simulées.',
    ).toBe(true);
    await ref.close();
  });
}

test('navigation CRM, thème, recherche réelle et fonctions à porter', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/portail');
  await expect(page.locator('.ptile-grid a')).toHaveCount(9);
  await page.getByRole('link', { name: 'Commerciale : accéder', exact: true }).click();
  await page.getByLabel('Identifiant ou adresse e-mail').fill('awa');
  await page.locator('#password').fill('Demo-Comsig-2026!');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  // L’accueil du profil commercial est le tableau de bord ; d’autres profils voient leur espace.
  await expect(page.locator('.crm-content h1').first()).toBeVisible();
  await expect(page.locator('.search-trigger')).toBeVisible();
  await page.getByRole('button', { name: 'Menu utilisateur', exact: true }).click();
  await page.getByRole('button', { name: 'Sombre', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Clair', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Menu utilisateur', exact: true }).click();
  await navigate(page, '/clients');
  await expect(page.getByRole('heading', { name: 'Clients et contacts', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Contacts', exact: true }).click();
  await expect(page.locator('.card')).toBeVisible();
  await page.screenshot({ path: info.outputPath('crm-contacts.png'), fullPage: true });
  await page.keyboard.press('Control+k');
  await page.getByRole('dialog', { name: 'Recherche globale' }).getByRole('combobox').fill('TEST');
  await expect(page.locator('.palette-results')).toContainText(/Organisation|Aucun résultat/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Recherche globale' })).not.toBeVisible();
  const group = page.locator('.nav-signet').filter({ has: page.locator('a[href="/messagerie"]') });
  if ((await group.locator('.nav-signet-head').getAttribute('aria-expanded')) === 'false')
    await group.locator('.nav-signet-head').click();
  await page.locator('a[href="/messagerie"]').click();
  // P10-B : la messagerie est désormais raccordée (aucun écran d'attente).
  await expect(page.getByRole('heading', { name: 'Messagerie', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Menu utilisateur', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Portail des départements' })).toBeVisible();
  expect(errors).toEqual([]);
});
