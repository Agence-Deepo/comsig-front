import { expect, type Page } from '@playwright/test';

// Repeated TEST fixtures may intentionally resemble an earlier run. Exercise the
// real duplicate justification flow, never disable the product's duplicate guard.
export async function saveDistinctCustomerFixture(page: Page) {
  const dialog = page.getByRole('dialog');
  const submit = async () => {
    const response = page.waitForResponse(
      (r) => r.url().endsWith('/api/v1/organizations') && r.request().method() === 'POST',
    );
    await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    return response;
  };
  const response = await submit();
  if (response.status() === 409) {
    const payload = await response.json();
    expect(payload.duplicates?.length, await response.text()).toBeGreaterThan(0);
    await dialog.getByLabel('Il s’agit bien d’une fiche distincte', { exact: true }).check();
    await dialog
      .getByLabel('Justification de la fiche distincte', { exact: true })
      .fill('Fixture TEST indépendante pour une nouvelle exécution de recette, sans valeur commerciale.');
    const confirmed = await submit();
    expect(confirmed.status(), await confirmed.text()).toBe(201);
  } else {
    expect(response.status(), await response.text()).toBe(201);
  }
}

export async function navigate(page: Page, path: string) {
  const menu = page.getByRole('button', { name: 'Ouvrir le menu', exact: true });
  if (
    (await menu.isVisible()) &&
    !(await page.locator('.sidebar').evaluate((el) => el.classList.contains('open')))
  )
    await menu.click();
  const link = page.locator('aside nav a[href="' + path + '"]');
  const group = link.locator('xpath=ancestor::div[contains(@class,"nav-group")][1]');
  const toggle = group.locator('.nav-signet-head');
  if ((await toggle.count()) && (await toggle.getAttribute('aria-expanded')) === 'false')
    await toggle.click();
  await link.click();
}
export async function login(page: Page, user = 'awa') {
  await page.goto('/connexion');
  await page.locator('#email').fill(user);
  await page.locator('#password').fill('Demo-Comsig-2026!');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Menu utilisateur', exact: true })).toBeVisible();
  await navigate(page, '/');
  // L’accueil dépend du profil (tableau de bord, espace d’administration ou espace de service).
  await expect(page.locator('.crm-content h1').first()).toBeVisible();
  const mobileMenu = page.getByRole('button', { name: 'Ouvrir le menu', exact: true });
  if (await mobileMenu.isVisible()) {
    await expect
      .poll(async () => {
        const box = await page.locator('.sidebar').boundingBox();
        return box ? box.x + box.width : 0;
      })
      .toBeLessThanOrEqual(1);
  }
}
export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Menu utilisateur', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Portail des départements' })).toBeVisible();
}
