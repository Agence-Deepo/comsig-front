import { test, expect, type Page } from '@playwright/test';
import { login, logout } from './helpers';

async function me(page: Page) {
  const response = await page.request.get('/api/v1/auth/me', {
    headers: { Accept: 'application/json', Origin: new URL(page.url()).origin },
  });
  return { status: response.status(), body: await response.json() };
}
async function mutation(page: Page, path: string, data: unknown, method = 'POST') {
  const cookies = await page.context().cookies();
  const xsrf = cookies.find((c) => c.name === 'XSRF-TOKEN');
  return page.request.fetch(path, {
    method,
    data,
    headers: {
      Accept: 'application/json',
      Origin: new URL(page.url()).origin,
      'X-XSRF-TOKEN': decodeURIComponent(xsrf?.value ?? ''),
    },
  });
}

test('session persistante, cookies HttpOnly, profil et permissions réelles', async ({ page }, info) => {
  const bearerRequests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/') && r.headers().authorization) bearerRequests.push(r.url());
  });
  await login(page);
  await page.goto('/clients?kind=prospect');
  await expect(page.getByRole('heading', { name: 'Clients et contacts', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Clients et contacts', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/clients\?kind=prospect$/);
  const identity = await me(page);
  expect(identity.status).toBe(200);
  expect(identity.body.data.username).toBe('awa');
  expect(identity.body.meta.authentication).toBe('session');
  const cookie = (await page.context().cookies()).find((c) => c.name === 'comsig_v2_session');
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe('Lax');
  expect(await page.evaluate(() => document.cookie.includes('comsig_v2_session='))).toBe(false);
  expect(
    await page.evaluate(() =>
      [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter((key) =>
        /auth|token|session/i.test(key),
      ),
    ),
  ).toEqual([]);
  await page.goto('/profil');
  await expect(page.getByRole('heading', { name: 'Mon profil', exact: true })).toBeVisible();
  await expect(page.getByText('Session serveur sécurisée', { exact: true })).toBeVisible();
  await expect(page.locator('select[name="role_id"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Actualiser mes accès', exact: true }).click();
  await expect(page.getByText('organizations.view', { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('profil-session-desktop.png'), fullPage: true });
  expect(bearerRequests).toEqual([]);
  await logout(page);
});

test('déconnexion dans deux onglets, puis connexion avec un autre compte sans cache précédent', async ({
  page,
  context,
}) => {
  await login(page);
  const second = await context.newPage();
  await second.goto('/profil');
  await expect(second.getByRole('heading', { name: 'Mon profil', exact: true })).toBeVisible();
  await logout(page);
  await expect(second.locator('#email')).toBeVisible();
  expect((await me(second)).status).toBe(401);
  await login(page, 'finance');
  await expect(second.getByRole('button', { name: 'Menu utilisateur', exact: true })).toBeVisible();
  await second.goto('/profil');
  await expect(second.getByText('Finance (démo)', { exact: true }).first()).toBeVisible();
  expect((await me(second)).body.data.username).toBe('finance');
  await logout(page);
  await second.close();
});

test('déconnexion en panne réseau : erreur visible et session conservée jusqu’à réussite', async ({
  page,
}) => {
  await login(page);
  await page.route('**/api/v1/auth/logout', (route) => route.abort('failed'));
  await page.getByRole('button', { name: 'Menu utilisateur', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Se déconnecter', exact: true }).click();
  await expect(
    page.getByText('API inaccessible. Vérifiez le serveur Laravel et la configuration réseau.', {
      exact: true,
    }),
  ).toBeVisible();
  expect((await me(page)).status).toBe(200);
  await page.unroute('**/api/v1/auth/logout');
  await page.getByRole('menuitem', { name: 'Se déconnecter', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Portail des départements', exact: true })).toBeVisible();
});

test('session expirée : retour à la connexion, puis reprise de l’URL protégée', async ({ page, context }) => {
  await login(page);
  await page.goto('/profil');
  await context.clearCookies();
  await page.reload();
  await expect(page.locator('#email')).toBeVisible();
  await page.locator('#email').fill('awa');
  await page.locator('#password').fill('Demo-Comsig-2026!');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mon profil', exact: true })).toBeVisible();
  await logout(page);
});

test('échec réseau au démarrage : écran explicite et nouvelle tentative sans fausse déconnexion', async ({
  page,
}) => {
  await login(page);
  await page.route('**/api/v1/auth/me', (r) => r.abort('failed'));
  await page.goto('/profil');
  await expect(page.getByText('Vérification de session impossible', { exact: true })).toBeVisible();
  await expect(page.locator('#email')).toHaveCount(0);
  await page.unroute('**/api/v1/auth/me');
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mon profil', exact: true })).toBeVisible();
  await logout(page);
});

test('refus métier sans déconnexion et refus CSRF réel sans écriture', async ({ page }) => {
  await login(page);
  await page.goto('/admin/utilisateurs');
  await expect(page.getByRole('heading', { name: 'Accès non autorisé', exact: true })).toBeVisible();
  expect((await me(page)).status).toBe(200);
  const response = await page.request.post('/api/v1/tasks', {
    headers: { Origin: new URL(page.url()).origin, Accept: 'application/json' },
    data: { title: 'Ne doit pas être créée sans CSRF' },
  });
  expect(response.status()).toBe(419);
  await page.goto('/profil');
  await expect(page.getByRole('heading', { name: 'Mon profil', exact: true })).toBeVisible();
  await logout(page);
});

test('liens admin : sections réellement disponibles et attente explicite pour les autres', async ({
  page,
}) => {
  await login(page, 'admin');
  await page.goto('/admin/departements');
  await expect(page).toHaveURL(/\/gestion-services$/);
  await expect(page.getByRole('heading', { name: 'Services & départements', exact: true })).toBeVisible();
  await page.goto('/admin/audit');
  await expect(page.getByRole('heading', { name: 'Journal d’audit', exact: true })).toBeVisible();
  await page.goto('/admin/parametres');
  await expect(page.getByText('Raccordement à finaliser', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/parametres$/);
  await logout(page);
});

test('lien RH historique conservé vers une vraie fiche salarié', async ({ page }) => {
  await login(page, 'rh');
  const identity = await me(page);
  const created = await mutation(page, '/api/v1/erp/employees', {
    code: 'P02-' + Date.now(),
    name: 'TEST P02 salarié alias',
    job_title: 'Recette',
    service_id: identity.body.data.department.id,
    hire_date: '2026-01-01',
    contract_type: 'CDI',
    leave_balance: 0,
    is_active: true,
  });
  expect(created.status()).toBe(201);
  const id = (await created.json()).data.id;
  await page.goto('/rh/agents/' + id);
  await expect(page).toHaveURL(new RegExp('/effectif/' + id + '$'));
  await expect(page.getByRole('heading', { name: 'TEST P02 salarié alias', exact: true })).toBeVisible();
  await logout(page);
});

test('mot de passe temporaire, erreurs et révocation des deux sessions après changement', async ({
  page,
  browser,
}) => {
  await login(page, 'admin');
  const identity = await me(page);
  const username = 'p02-' + Date.now();
  const roleResponse = await page.request.get('/api/v1/admin/roles', {
    headers: { Origin: new URL(page.url()).origin },
  });
  const role = (await roleResponse.json()).data.find((r: any) => r.code === 'agent_service');
  const response = await mutation(page, '/api/v1/admin/users', {
    name: 'TEST P02 mot de passe',
    email: username + '@example.test',
    username,
    password: 'Demo-Comsig-2026!',
    role_id: role.id,
    department_id: identity.body.data.department.id,
  });
  expect(response.status()).toBe(201);
  await logout(page);
  async function signIn(p: Page) {
    await p.goto(new URL('/connexion', page.url()).href);
    await p.locator('#email').fill(username);
    await p.locator('#password').fill('Demo-Comsig-2026!');
    await p.getByRole('button', { name: 'Se connecter', exact: true }).click();
    await expect(p.getByRole('heading', { name: 'Mon profil', exact: true })).toBeVisible();
  }
  await signIn(page);
  const otherContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  const other = await otherContext.newPage();
  await signIn(other);
  await page.goto('/taches');
  await expect(page.getByRole('heading', { name: 'Mon profil', exact: true })).toBeVisible();
  await page.getByLabel('Mot de passe actuel', { exact: false }).fill('incorrect');
  await page.getByLabel('Nouveau mot de passe', { exact: false }).fill('Nouvelle-Comsig-2026!');
  await page.getByLabel('Confirmation', { exact: false }).fill('Autre-Comsig-2026!');
  await expect(page.getByRole('button', { name: 'Modifier', exact: true })).toBeDisabled();
  await page.getByLabel('Confirmation', { exact: false }).fill('Nouvelle-Comsig-2026!');
  await page.getByRole('button', { name: 'Modifier', exact: true }).click();
  await expect(page.getByText('Mot de passe incorrect.', { exact: true }).first()).toBeVisible();
  await page.getByLabel('Mot de passe actuel', { exact: false }).fill('Demo-Comsig-2026!');
  await page.getByRole('button', { name: 'Modifier', exact: true }).click();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.getByText(/Mot de passe modifié\. Toutes vos connexions/)).toBeVisible();
  expect((await me(other)).status).toBe(401);
  await otherContext.close();
});

test('profil mobile : rechargement connecté et absence de débordement global', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto('/profil');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Mon profil', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('profil-session-mobile.png'), fullPage: true });
  await logout(page);
});
