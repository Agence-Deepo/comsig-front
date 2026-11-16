import { test, expect, type Page } from '@playwright/test';
import { createHmac } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { login, logout } from './helpers';

const initial = 'Demo-Comsig-2026!';
const personal = 'Personnel-Recette-2026!';
async function get(page: Page, url: string) {
  return page.request.get('/api/v1/' + url, {
    headers: { Accept: 'application/json', Origin: new URL(page.url()).origin },
  });
}
async function mutate(page: Page, url: string, data: unknown, method = 'POST') {
  const xsrf = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN');
  return page.request.fetch('/api/v1/' + url, {
    method,
    data,
    headers: {
      Accept: 'application/json',
      Origin: new URL(page.url()).origin,
      'X-XSRF-TOKEN': decodeURIComponent(xsrf?.value ?? ''),
    },
  });
}
async function newUser(page: Page) {
  await login(page, 'admin');
  const roles = (await (await get(page, 'admin/roles')).json()).data;
  const departments = (await (await get(page, 'departments')).json()).data;
  const username = 'securite-' + Date.now();
  const res = await mutate(page, 'admin/users', {
    name: 'TEST sécurité ' + Date.now(),
    username,
    email: username + '@example.test',
    password: initial,
    role_id: roles.find((r: any) => r.code === 'commercial').id,
    department_id: departments.find((d: any) => d.code === 'commercial').id,
  });
  expect(res.status()).toBe(201);
  await logout(page);
  return username;
}
async function signIn(page: Page, username: string, password: string) {
  await page.goto('/connexion');
  await page.locator('#email').fill(username);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
}
// Independent RFC 6238 calculation used only by the test, never by the UI.
function otp(secret: string) {
  const bits = [...secret]
    .map((c) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c).toString(2).padStart(5, '0'))
    .join('');
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const mac = createHmac('sha1', key).update(counter).digest();
  const offset = mac[mac.length - 1] & 15;
  return ((mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).toString().padStart(6, '0');
}

test('MFA réelle : activation, révocation des autres sessions, défi, codes uniques, renouvellement et désactivation', async ({
  page,
  browser,
}, info) => {
  const username = await newUser(page);
  await signIn(page, username, initial);
  await expect(page.getByText('Mot de passe temporaire', { exact: true })).toBeVisible();
  await page.locator('#profile-current').fill(initial);
  await page.locator('#profile-new').fill(personal);
  await page.locator('#profile-confirm').fill(personal);
  await page.getByRole('button', { name: 'Modifier', exact: true }).click();
  await expect(page.locator('#email')).toBeVisible();
  await signIn(page, username, personal);
  await expect(page.getByRole('button', { name: 'Menu utilisateur', exact: true })).toBeVisible();
  const other = await browser.newPage();
  await signIn(other, username, personal);
  await expect(other.getByRole('button', { name: 'Menu utilisateur', exact: true })).toBeVisible();
  await page.goto('/profil');
  await page.getByLabel('Mot de passe actuel pour la MFA').fill(personal);
  await page.getByRole('button', { name: 'Configurer la MFA', exact: true }).click();
  const secret = await page.getByTestId('mfa-secret').innerText();
  await expect(page.getByAltText('QR code personnel de configuration MFA')).toBeVisible();
  await page.getByLabel('Code à 6 chiffres', { exact: true }).fill(otp(secret));
  await page.getByRole('button', { name: 'Confirmer l’activation', exact: true }).click();
  await expect(page.getByText('MFA active', { exact: true })).toBeVisible();
  const codes = await page.getByTestId('recovery-codes').locator('code').allTextContents();
  expect(codes).toHaveLength(10);
  await page
    .locator('.card')
    .filter({ has: page.getByRole('heading', { name: 'Double authentification', exact: true }) })
    .screenshot({
      path: info.outputPath('profil-mfa-desktop.png'),
      mask: [page.getByTestId('recovery-codes')],
      maskColor: '#cbd5e1',
    });
  await other.goto('/taches');
  await expect(other.locator('#email')).toBeVisible();
  await other.close();
  await logout(page);
  await signIn(page, username, personal);
  await expect(page.getByRole('heading', { name: 'Vérification en deux étapes' })).toBeVisible();
  expect((await get(page, 'auth/me')).status()).toBe(401);
  await page.getByRole('button', { name: 'Utiliser un code de secours', exact: true }).click();
  await page.locator('#code').fill('00000000000000000000');
  await page.getByRole('button', { name: 'Vérifier', exact: true }).click();
  await expect(page.getByText(/Code incorrect, expiré ou déjà utilisé/)).toBeVisible();
  await page.locator('#code').fill(codes[0]);
  await page.getByRole('button', { name: 'Vérifier', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Menu utilisateur', exact: true })).toBeVisible();
  await logout(page);
  await signIn(page, username, personal);
  await page.getByRole('button', { name: 'Utiliser un code de secours', exact: true }).click();
  await page.locator('#code').fill(codes[0]);
  await page.getByRole('button', { name: 'Vérifier', exact: true }).click();
  await expect(page.getByText(/Code incorrect, expiré ou déjà utilisé/)).toBeVisible();
  await page.locator('#code').fill(codes[1]);
  await page.getByRole('button', { name: 'Vérifier', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Menu utilisateur', exact: true })).toBeVisible();
  await page.goto('/profil');
  await page.getByLabel('Mot de passe actuel pour la MFA').fill(personal);
  await page.getByLabel('Utiliser un code de secours', { exact: true }).check();
  await page.getByLabel('Code de secours MFA', { exact: true }).fill(codes[2]);
  await page.getByRole('button', { name: 'Renouveler les codes de secours', exact: true }).click();
  await expect(page.getByTestId('recovery-codes').locator('code')).toHaveCount(10);
  const fresh = await page.getByTestId('recovery-codes').locator('code').allTextContents();
  expect(fresh[0]).not.toBe(codes[0]);
  await page.getByLabel('Mot de passe actuel pour la MFA').fill(personal);
  await page.getByLabel('Code de secours MFA', { exact: true }).fill(codes[3]);
  await page.getByRole('button', { name: 'Renouveler les codes de secours', exact: true }).click();
  await expect(page.getByText(/Code incorrect, expiré ou déjà utilisé/)).toBeVisible();
  await page.getByLabel('Code de secours MFA', { exact: true }).fill(fresh[0]);
  await page.getByRole('button', { name: 'Désactiver la MFA', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Confirmer la désactivation', exact: true })
    .click();
  await expect(page.getByText('MFA non activée', { exact: true })).toBeVisible();
});

test('récupération : vrai courriel privé, fragment retiré, réinitialisation et lien non réutilisable', async ({
  page,
}) => {
  test.skip(
    !process.env.P02C_QA_OUTBOX,
    'Boîte mail de recette isolée requise, aucun SMTP réel dans ce test.',
  );
  const username = await newUser(page);
  await page.goto('/connexion');
  await page.getByRole('link', { name: /^Mot de passe oublié/ }).click();
  await page.locator('#recovery-email').fill(username + '@example.test');
  await page.getByRole('button', { name: 'Recevoir le lien', exact: true }).click();
  await expect(page.getByText(/Si ce compte est actif/)).toBeVisible();
  let link = '';
  await expect
    .poll(async () => {
      const files = await readdir(process.env.P02C_QA_OUTBOX!);
      for (const file of files) {
        const raw = await readFile(path.join(process.env.P02C_QA_OUTBOX!, file), 'utf8');
        if (!raw.includes(username)) continue;
        const decoded = raw
          .replace(/=\r?\n/g, '')
          .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/&amp;/g, '&');
        link = decoded.match(/https?:\/\/[^\s<>"']+\/reinitialiser#[^\s<>"']+/)?.[0] ?? '';
      }
      return !!link;
    })
    .toBe(true);
  await page.goto(link);
  await expect(page).toHaveURL(/\/reinitialiser$/);
  await page.locator('#recovery-password').fill(personal);
  await page.locator('#recovery-confirm').fill(personal);
  await page.getByRole('button', { name: 'Réinitialiser le mot de passe', exact: true }).click();
  await expect(page.locator('#email')).toBeVisible();
  await signIn(page, username, personal);
  await expect(page.getByRole('button', { name: 'Menu utilisateur', exact: true })).toBeVisible();
  await page.goto(link);
  await page.locator('#recovery-password').fill(personal);
  await page.locator('#recovery-confirm').fill(personal);
  await page.getByRole('button', { name: 'Réinitialiser le mot de passe', exact: true }).click();
  await expect(page.getByText(/Lien invalide ou expiré/).first()).toBeVisible();
});

test('notifications : lecture persistante, navigation et fermeture clavier', async ({ page }) => {
  await login(page);
  const title = 'TEST P02 notification ' + Date.now();
  const res = await mutate(page, 'tasks', {
    title,
    due_at: new Date(Date.now() - 60000).toISOString().slice(0, 19).replace('T', ' '),
  });
  expect(res.status()).toBe(201);
  await page.reload();
  await page.getByRole('button', { name: /^Notifications/ }).click();
  const panel = page.getByRole('dialog', { name: 'Notifications', exact: true });
  await expect(panel.getByText(title)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(page.getByRole('button', { name: /^Notifications/ })).toBeFocused();
  await page.getByRole('button', { name: /^Notifications/ }).click();
  await panel.getByRole('button').filter({ hasText: title }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await page.reload();
  const feed = await (await get(page, 'notifications')).json();
  expect(feed.rows.find((r: any) => r.title === title).read).toBe(true);
});
