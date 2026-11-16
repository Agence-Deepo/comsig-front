// Contrôles documentaires et de couverture, sans HTTP ni accès à la base.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { matchRoutes } from 'react-router-dom';
import { scope, adminGaps } from './inventory-p01-scope.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(root, 'docs/inventaire-p01');
const s = JSON.parse(fs.readFileSync(path.join(reportDir, 'snapshot.json'), 'utf8'));

test('chaque route source a un état, un lot, une API et une réception attendue', () => {
  assert.equal(s.routes.length, 73);
  assert.equal(new Set(s.routes.map((r) => r.path)).size, s.routes.length);
  assert.equal(new Set(s.routes.map((r) => r.id)).size, s.routes.length);
  assert.deepEqual(s.routes.map((r) => r.path).sort(), Object.keys(scope).sort());
  for (const r of s.routes) for (const key of ['id', 'status', 'phase', 'gap', 'sourceAccess', 'targetApi', 'mobile']) assert.ok(r[key], `${r.path} : ${key}`);
  assert.equal(Object.values(s.summary.byStatus).reduce((a, b) => a + b), 73);
});

test('les 58 fichiers de pages, y compris les exports multiples, sont couverts', () => {
  assert.equal(s.pages.length, 58);
  for (const page of s.pages) {
    assert.ok(page.routeIds.length, page.file);
    assert.ok(page.routeIds.every((id) => s.routes.some((r) => r.id === id)));
  }
  for (const name of ['EmployeeDetail', 'MyHr', 'FlowDetail', 'GovernanceAuditDetail', 'ReportView', 'SwotView', 'ProjectDetail', 'CollectivityDetail']) assert.ok(s.routes.some((r) => r.components.includes(name)), name);
});

test('16 sections admin distinctes, sans assimilation à la liste utilisateurs', () => {
  assert.equal(s.adminSections.length, 16);
  assert.deepEqual(s.adminSections.map((a) => a.id).sort(), Object.keys(adminGaps).sort());
  assert.equal(s.routes.find((r) => r.path === '/admin/:section').status, 'API à compléter');
  assert.equal(s.adminSections.find((a) => a.id === 'audit').target, '/audit');
});

test('les onglets, champs et actions de référence sont conservés dans les preuves', () => {
  const org = s.pages.find((p) => p.file.endsWith('/OrganizationDetail.tsx'));
  assert.ok(org.controls.find((c) => c.tag === 'Tabs').attrs.tabs.includes("id: 'decisions'"));
  const hr = s.pages.find((p) => p.file.endsWith('/Hr.tsx'));
  assert.ok(hr.controls.some((c) => c.tag === 'Tabs' && c.owner === 'EmployeeDetail'));
  assert.ok(s.shared.find((p) => p.file.endsWith('/forms.tsx')).controls.some((c) => c.tag === 'Field'));
  assert.ok(s.shared.find((p) => p.file.endsWith('/Documents.tsx')).controls.some((c) => c.tag === 'input' && c.attrs.type === 'file'));
});

test('les ressources API annoncées pour les modules cible ont une route GET', () => {
  assert.equal(s.targetModules.length, 30);
  assert.equal(s.targetModules.filter((m) => m.key.startsWith('erp/')).length, 19);
  const routes = s.targetBackendRoutes.filter((r) => r.method.split('|').includes('GET'));
  for (const m of s.targetModules) {
    const uri = 'api/v1/' + m.key;
    assert.ok(routes.some((r) => r.uri === uri || (m.key.startsWith('erp/') && r.uri === 'api/v1/erp/{resource}') || (m.key.startsWith('customer-cases/') && r.uri === 'api/v1/customer-cases/{resource}')), uri);
  }
});

test('les anciennes mauvaises destinations ne sont pas des fiches, la route effectif correcte existe', () => {
  const declared = [...s.targetExplicitRoutes, ...s.targetModules.flatMap((m) => [m.path, ...(m.detail ? [m.path + '/:id'] : [])])].map((p) => ({ path: p, id: p }));
  declared.push({ path: '*', id: 'pending' });
  for (const p of ['/effectif/agents/abc', '/utilisateurs/parametres']) assert.equal(matchRoutes(declared, p)?.at(-1).route.id, 'pending');
  assert.equal(matchRoutes(declared, '/effectif/abc')?.at(-1).route.id, '/effectif/:id');
});

test('automatisations source et déclarations Laravel comptées séparément', () => {
  assert.equal(s.scheduledRules.length, 22);
  assert.equal(s.realtimeRules.length, 4);
  assert.equal(s.targetSchedule.length, 3);
  assert.ok(s.targetSchedule.some((j) => j.code.includes('comsig:expire-quotes')));
  assert.equal(s.sourceApiDynamic.length, 3);
  assert.ok(s.sourceApiDynamic.every((r) => r.file.endsWith('/letterhead.ts')));
});

test('aucune différence entre les copies historiques TS/TSX/CSS', () => {
  assert.equal(s.copied.length, 94);
  assert.equal(s.copied.filter((p) => !p.same).length, 0);
});

test('les fichiers audités n’ont pas changé depuis la génération', () => {
  for (const [file, expected] of Object.entries(s.fingerprints)) {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), expected, file);
  }
});

test('liens de documents résolus et validation utilisateur laissée ouverte', () => {
  for (const filename of ['docs/INVENTAIRE-P01.md', 'docs/PLAN-DE-TRAVAIL.md', 'docs/inventaire-p01/MATRICE.md', 'docs/inventaire-p01/PREUVES.md']) {
    const full = path.join(root, filename);
    const content = fs.readFileSync(full, 'utf8');
    for (const m of content.matchAll(/\]\(([^)]+)\)/g)) {
      const href = m[1].replace(/:\d+$/, '');
      if (/^https?:|^#/.test(href)) continue;
      assert.ok(fs.existsSync(path.resolve(path.dirname(full), href)), `${filename} → ${href}`);
    }
  }
  const plan = fs.readFileSync(path.join(root, 'docs/PLAN-DE-TRAVAIL.md'), 'utf8');
  assert.ok(plan.includes('- [ ] Valider ensemble le périmètre et l’ordre des sous-lots.'));
});
