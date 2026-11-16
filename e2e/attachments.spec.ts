import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { login, logout } from './helpers';

// Valid one-page PDF fixture; no commercial document or real customer data.
const pdf = (text: string) => {
  const escaped = text.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
  const stream = `BT /F1 11 Tf 50 760 Td (COMSIG - DOCUMENT DE RECETTE SANS VALEUR COMMERCIALE) Tj 0 -24 Td (${escaped}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let content = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(content));
    content += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(content);
  content +=
    'xref\n0 6\n0000000000 65535 f \n' +
    offsets
      .slice(1)
      .map((offset) => String(offset).padStart(10, '0') + ' 00000 n \n')
      .join('') +
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(content);
};
async function apiHeaders(page: Page) {
  const xsrf = (await page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN');
  return {
    Accept: 'application/json',
    Origin: new URL(page.url()).origin,
    'X-XSRF-TOKEN': decodeURIComponent(xsrf?.value ?? ''),
  };
}
async function client(page: Page) {
  const name = 'TEST P02B documents ' + Date.now();
  const response = await page.request.post('/api/v1/organizations', {
    headers: await apiHeaders(page),
    data: {
      legal_name: name,
      kind: 'prospect',
      ignore_duplicates: true,
      duplicate_justification: 'Fixture TEST indépendante pour la recette documentaire.',
    },
  });
  expect(response.status()).toBe(201);
  const id = (await response.json()).data.id;
  await page.goto('/clients/' + id + '?tab=docs');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajouter un fichier', exact: true })).toBeVisible();
  return { id, name };
}
async function upload(page: Page, name: string, buffer: Buffer, mimeType = 'application/pdf') {
  const received = page.waitForResponse(
    (r) => r.url().endsWith('/api/v1/attachments') && r.request().method() === 'POST',
  );
  await page
    .locator('input[type="file"][aria-label="Fichier à joindre"]')
    .setInputFiles({ name, mimeType, buffer });
  const response = await received;
  expect(response.status(), await response.text()).toBe(201);
  const doc = (await response.json()).data;
  await expect(page.locator(`[data-attachment-id="${doc.id}"]`)).toBeVisible();
  return doc;
}

test('pièces privées : ajout, versions, téléchargement exact, suppression et restauration', async ({
  page,
}, info) => {
  await login(page);
  await client(page);
  await page.getByLabel('Type de document', { exact: true }).selectOption('bon_commande');
  const first = await upload(page, 'commande.pdf', pdf('Version initiale'));
  const second = await upload(page, 'commande.pdf', pdf('Version deux'));
  expect(first.version).toBe(1);
  expect(second.version).toBe(2);
  expect(first.id).not.toBe(second.id);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger commande.pdf version 1', exact: true }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('commande.pdf');
  expect(await readFile((await download.path())!)).toEqual(pdf('Version initiale'));
  await page.getByRole('button', { name: 'Supprimer commande.pdf version 2', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect(page.locator(`[data-attachment-id="${second.id}"]`)).toHaveCount(0);
  await page.getByRole('button', { name: 'Voir les documents supprimés', exact: true }).click();
  await expect(
    page.locator(`[data-attachment-id="${second.id}"]`).getByText('Supprimé', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Restaurer commande.pdf version 2', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Télécharger commande.pdf version 2', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('.attachment-item')).toHaveCount(2);
  await page.locator('.attachments-card').screenshot({ path: info.outputPath('documents-desktop.png') });
  await logout(page);
});

test('un autre commercial et un invité ne peuvent pas lire les pièces ni leurs métadonnées', async ({
  page,
  browser,
}) => {
  await login(page);
  const org = await client(page);
  const doc = await upload(page, 'confidentiel-portefeuille.pdf', pdf('Portefeuille Awa'));
  await logout(page);
  await login(page, 'yao');
  const headers = await apiHeaders(page);
  expect((await page.request.get(`/api/v1/attachments/${doc.id}/file`, { headers })).status()).toBe(404);
  expect(
    (
      await page.request.get(`/api/v1/attachments?entity_type=organizations&entity_id=${org.id}`, { headers })
    ).status(),
  ).toBe(404);
  expect((await page.request.delete(`/api/v1/attachments/${doc.id}`, { headers })).status()).toBe(404);
  const guest = await browser.newContext({ baseURL: new URL(page.url()).origin });
  expect(
    (
      await guest.request.get(`/api/v1/attachments/${doc.id}/file`, {
        headers: { Accept: 'application/json' },
      })
    ).status(),
  ).toBe(401);
  await guest.close();
  await logout(page);
});

test('lecture seule : pièces stock lisibles sans permission d’ajout ou suppression', async ({ page }) => {
  await login(page, 'prod');
  const response = await page.request.post('/api/v1/stock-items', {
    headers: await apiHeaders(page),
    data: { code: 'DOC-' + Date.now(), label: 'TEST P02B fiche matière', unit: 'unité', kind: 'matiere' },
  });
  expect(response.status()).toBe(201);
  const id = (await response.json()).data.id;
  await page.goto('/stocks/' + id);
  const doc = await upload(page, 'fiche-matiere.pdf', pdf('Matiere'));
  await logout(page);
  await login(page);
  await page.goto('/stocks/' + id);
  await expect(
    page.getByRole('button', { name: 'Télécharger fiche-matiere.pdf version 1', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajouter un fichier', exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Supprimer fiche-matiere.pdf version 1', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Voir les documents supprimés', exact: true })).toHaveCount(
    0,
  );
  expect(
    (
      await page.request.delete(`/api/v1/attachments/${doc.id}`, { headers: await apiHeaders(page) })
    ).status(),
  ).toBe(403);
  await logout(page);
});

test('pièces RH : refus au profil flotte même avec un identifiant salarié connu', async ({ page }) => {
  await login(page, 'rh');
  const headers = await apiHeaders(page);
  const who = await (await page.request.get('/api/v1/auth/me', { headers })).json();
  const response = await page.request.post('/api/v1/erp/employees', {
    headers,
    data: {
      code: 'DOC-RH-' + Date.now(),
      name: 'TEST P02B salarié',
      job_title: 'Agent',
      service_id: who.data.department.id,
      hire_date: '2026-01-01',
      contract_type: 'CDI',
    },
  });
  expect(response.status()).toBe(201);
  const id = (await response.json()).data.id;
  await page.goto('/effectif/' + id);
  await page.getByLabel('Type de document', { exact: true }).selectOption('cv');
  const doc = await upload(page, 'cv-prive.pdf', pdf('RH'));
  await logout(page);
  await login(page, 'flotte');
  const fleetHeaders = await apiHeaders(page);
  expect(
    (await page.request.get(`/api/v1/attachments/${doc.id}/file`, { headers: fleetHeaders })).status(),
  ).toBe(403);
  expect(
    (
      await page.request.get(`/api/v1/attachments?entity_type=erp/employees&entity_id=${id}`, {
        headers: fleetHeaders,
      })
    ).status(),
  ).toBe(403);
  await logout(page);
});

test('formats : validation client, contenu déguisé refusé côté serveur et reprise après erreur', async ({
  page,
}) => {
  await login(page);
  await client(page);
  await page
    .locator('input[type="file"][aria-label="Fichier à joindre"]')
    .setInputFiles({ name: 'intrus.php', mimeType: 'application/x-php', buffer: Buffer.from('<?php') });
  await expect(page.getByText(/Format non autorisé\. Choisissez/)).toBeVisible();
  const rejected = page.waitForResponse(
    (r) => r.url().endsWith('/api/v1/attachments') && r.request().method() === 'POST',
  );
  await page.locator('input[type="file"][aria-label="Fichier à joindre"]').setInputFiles({
    name: 'faux.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('<html>Ne pas accepter</html>'),
  });
  expect((await rejected).status()).toBe(422);
  await expect(page.getByText(/Le contenu réel ne correspond pas/).first()).toBeVisible();
  await expect(page.locator('.attachment-item')).toHaveCount(0);
  await upload(page, 'preuve-valide.pdf', pdf('Valide'));
  await expect(page.locator('.attachment-item')).toHaveCount(1);
  await logout(page);
});

test('fichier de plus de 2 Mo accepté, contrôle client 15 Mo et limite PHP directe', async ({ page }) => {
  await login(page);
  const org = await client(page);
  const contents = Buffer.from('Nom;Montant\n' + 'COMSIG;1800000\n'.repeat(230000));
  const doc = await upload(page, 'donnees-volume.csv', contents, 'text/csv');
  expect(contents.length).toBeGreaterThan(2 * 1024 * 1024);
  expect(doc.size_bytes).toBe(contents.length);
  expect(doc.sha256).toBe(createHash('sha256').update(contents).digest('hex'));
  await page.locator('input[type="file"][aria-label="Fichier à joindre"]').setInputFiles({
    name: 'trop-grand.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.alloc(15 * 1024 * 1024 + 1, 32),
  });
  await expect(page.getByText(/Fichier vide ou trop volumineux\. Limite : 15 Mo/)).toBeVisible();
  const oversized = await page.request.post('/api/v1/attachments', {
    headers: await apiHeaders(page),
    multipart: {
      entity_type: 'organizations',
      entity_id: org.id,
      kind: 'autre',
      file: {
        name: 'trop-grand.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.alloc(18 * 1024 * 1024, 32),
      },
    },
  });
  expect(oversized.status()).toBe(413);
  const aboveApplicationLimit = await page.request.post('/api/v1/attachments', {
    headers: await apiHeaders(page),
    multipart: {
      entity_type: 'organizations',
      entity_id: org.id,
      kind: 'autre',
      file: {
        name: 'limite-application.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.alloc(16 * 1024 * 1024, 32),
      },
    },
  });
  expect(aboveApplicationLimit.status()).toBe(422);
  await expect(page.locator('.attachment-item')).toHaveCount(1);
  await logout(page);
});

test('mobile : nom long, téléchargement, annulation clavier et absence de débordement', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await client(page);
  const filename = 'justificatif-' + 'nom-long-'.repeat(16) + '.pdf';
  await upload(page, filename, pdf('Mobile'));
  await page.getByRole('button', { name: `Supprimer ${filename} version 1`, exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.attachment-item')).toHaveCount(1);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: `Télécharger ${filename} version 1`, exact: true }).click();
  expect((await downloaded).suggestedFilename()).toBe(filename);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.locator('.attachments-card').screenshot({ path: info.outputPath('documents-mobile.png') });
  await logout(page);
});
