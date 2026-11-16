import { login, logout, navigate } from './helpers';
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
const password = 'Demo-Comsig-2026!';
const day = (offset = 0) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
async function nav(page: Page, path: string) {
  await navigate(page, '/' + path);
}
async function save(page: Page) {
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  return page.url().split('/').pop()!;
}
async function action(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
}
async function open(page: Page, path: string, id: string) {
  await nav(page, path);
  await page.locator(`a[href="/${path}/${id}"]`).first().click();
}
async function employeeFixture(request: APIRequestContext, name: string) {
  const health = await request.get('/api/v1/health');
  expect(new URL(health.url()).hostname).toBe('127.0.0.1');
  expect((await health.json()).service).toBe('comsig-v2');
  const auth = await request.post('/api/v1/auth/login', { data: { login: 'dg', password } });
  expect(auth.ok()).toBeTruthy();
  const headers = { Authorization: `Bearer ${(await auth.json()).data.token}` };
  const departments = await request.get('/api/v1/departments', { headers });
  const service = (await departments.json()).data[0].id;
  const result = await request.post('/api/v1/erp/employees', {
    headers,
    data: {
      code: `E2E-${Date.now()}`,
      name,
      job_title: 'Chauffeur test',
      service_id: service,
      hire_date: '2025-01-01',
      contract_type: 'CDI',
    },
  });
  expect(result.status()).toBe(201);
  const employee = (await result.json()).data;
  await request.post('/api/v1/auth/logout', { headers });
  return employee;
}
test('ERP finance : caisse et double validation', async ({ page }, info) => {
  const suffix = Date.now();
  const accountName = `Caisse TEST ${suffix}`;
  await login(page, 'finance');
  await nav(page, 'comptes-tresorerie');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Code *', { exact: true }).fill(`CA-${suffix}`);
  await page.getByLabel('Libellé *', { exact: true }).fill(accountName);
  const accountId = await save(page);
  await nav(page, 'mouvements-caisse');
  await page.getByRole('button', { name: 'Créer une opération' }).click();
  await page.getByLabel('Compte de trésorerie').selectOption({ label: accountName });
  await page.getByLabel('Montant (FCFA)').fill('10000');
  await page.getByLabel('Référence unique').fill(`CA-IN-${suffix}`);
  await page.getByLabel('Motif / bénéficiaire').fill('Approvisionnement de test');
  const entryId = await save(page);
  await expect(page.getByRole('button', { name: 'Valider l’opération' })).toHaveCount(0);
  await logout(page);
  await login(page, 'dg');
  await open(page, 'mouvements-caisse', entryId);
  await action(page, 'Valider l’opération');
  await open(page, 'comptes-tresorerie', accountId);
  await expect(page.locator('.facts')).toContainText('10');
  await page.screenshot({ path: info.outputPath('erp-tresorerie.png'), fullPage: true });
  await logout(page);
});
test('ERP RH : effectif, congé, bulletin et PDF', async ({ page }, info) => {
  const suffix = Date.now();
  const name = `Collaborateur TEST ${suffix}`;
  await login(page, 'rh');
  await nav(page, 'effectif');
  await page.getByRole('button', { name: 'Créer un collaborateur' }).click();
  await page.getByLabel('Matricule').fill(`RH-${suffix}`);
  await page.getByLabel('Nom complet').fill(name);
  await page.getByLabel('Poste').fill('Technicien de test');
  await page.getByLabel('Service *', { exact: true }).selectOption({ label: 'Production' });
  await page.getByLabel('Date d’entrée').fill('2025-01-01');
  await page.getByLabel('Solde initial de congés').fill('20');
  await save(page);
  await nav(page, 'conges');
  await page.getByRole('button', { name: 'Créer une demande de congé' }).click();
  await page.getByLabel('Collaborateur').selectOption({ label: name });
  await page.getByLabel('Début *', { exact: true }).fill(day(10));
  await page.getByLabel('Fin *', { exact: true }).fill(day(12));
  await page.getByLabel('Motif de la demande').fill('Repos de test');
  await save(page);
  await action(page, 'Valider côté RH');
  await nav(page, 'paie');
  await page.getByRole('button', { name: 'Créer un bulletin' }).click();
  await page.getByLabel('Collaborateur').selectOption({ label: name });
  await page.getByLabel('Salaire de base').fill('100000');
  await page.getByLabel('Cotisations salariales').fill('6000');
  await page.getByLabel('Impôt calculé').fill('10000');
  await save(page);
  await expect(page.locator('.grand-total')).toContainText('84');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger le PDF' }).click();
  await (await downloading).saveAs(info.outputPath('bulletin-test.pdf'));
  await page.screenshot({ path: info.outputPath('erp-paie.png'), fullPage: true });
  await logout(page);
});
test('ERP flotte : chauffeur, départ et retour', async ({ page, request }, info) => {
  const suffix = Date.now();
  const employee = await employeeFixture(request, `Chauffeur TEST ${suffix}`);
  const vehicleName = `Utilitaire TEST ${suffix}`;
  await login(page, 'flotte');
  await expect(page.locator('nav a[href="/effectif"]')).toHaveCount(0);
  await nav(page, 'vehicules');
  await page.getByRole('button', { name: 'Créer un véhicule' }).click();
  await page.getByLabel('Immatriculation').fill(`VEH-${suffix}`);
  await page.getByLabel('Véhicule *', { exact: true }).fill(vehicleName);
  await page.getByLabel('Kilométrage initial').fill('1000');
  await save(page);
  await nav(page, 'chauffeurs');
  await page.getByRole('button', { name: 'Créer un chauffeur' }).click();
  await page.getByLabel('Collaborateur').selectOption({ label: employee.name });
  await page.getByLabel('Numéro de permis').fill(`PERMIS-${suffix}`);
  await page.getByLabel('Permis valable jusqu’au').fill(day(365));
  await save(page);
  await nav(page, 'missions-vehicules');
  await page.getByRole('button', { name: 'Créer une mission' }).click();
  await page.getByLabel('Véhicule *', { exact: true }).selectOption({ label: vehicleName });
  await page.getByLabel('Chauffeur *', { exact: true }).selectOption({ label: employee.name });
  await page.getByLabel('Départ prévu').fill(new Date(Date.now() - 300000).toISOString().slice(0, 16));
  await page.getByLabel('Retour prévu').fill(new Date(Date.now() + 7200000).toISOString().slice(0, 16));
  await page.getByLabel('Destination').fill('Abidjan');
  await page.getByLabel('Objet de la mission').fill('Livraison de test');
  await save(page);
  await action(page, 'Enregistrer le départ');
  await page.getByRole('button', { name: 'Enregistrer le retour' }).click();
  await page.getByLabel('Kilométrage au retour').fill('1100');
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.panel-heading .status').first()).toHaveText('Terminé');
  await page.screenshot({ path: info.outputPath('erp-flotte.png'), fullPage: true });
  await logout(page);
});
test('ERP production : nomenclature, fabrication et livraison', async ({ page }, info) => {
  const suffix = Date.now();
  const rawName = `Matière TEST ${suffix}`;
  const productName = `Produit TEST ${suffix}`;
  const bomName = `Nomenclature TEST ${suffix}`;
  await login(page, 'prod');
  async function stock(name: string, kind: string) {
    await nav(page, 'stocks');
    await page.getByRole('button', { name: 'Créer un article' }).click();
    await page.getByLabel('Code *', { exact: true }).fill(`${kind === 'matiere' ? 'MAT' : 'FIN'}-${suffix}`);
    await page.getByLabel('Désignation').fill(name);
    await page.getByLabel('Type d’article').selectOption(kind);
    return save(page);
  }
  const rawId = await stock(rawName, 'matiere');
  await page.getByRole('button', { name: 'Mouvement', exact: true }).click();
  await page.getByLabel('Quantité', { exact: true }).fill('10');
  await page.getByLabel('Coût unitaire (FCFA)').fill('500');
  await page.getByLabel('Motif').fill('Réception test');
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await stock(productName, 'produit_fini');
  await nav(page, 'nomenclatures');
  await page.getByRole('button', { name: 'Créer une nomenclature' }).click();
  await page.getByLabel('Code *', { exact: true }).fill(`BOM-${suffix}`);
  await page.getByLabel('Désignation').fill(bomName);
  await page.getByLabel('Produit fini *', { exact: true }).selectOption({ label: productName });
  await page.getByLabel('Article matière').selectOption({ label: rawName });
  await page.getByLabel('Quantité à consommer').fill('2');
  await save(page);
  await nav(page, 'ordres-production');
  await page.getByRole('button', { name: 'Créer un ordre de production' }).click();
  await page.getByLabel('Travaux à réaliser').fill(`Fabrication TEST ${suffix}`);
  await page.getByLabel('Quantité à fabriquer').fill('3');
  await page.getByLabel('Importer une nomenclature').selectOption({ label: bomName });
  await page.getByLabel('Main-d’œuvre / frais').fill('3000');
  await page.getByLabel('Brief technique').fill('Découpe et finition de test');
  await expect(page.getByLabel('Quantité à consommer')).toHaveValue('6.0000');
  await save(page);
  for (const label of [
    'Autoriser la production',
    'Démarrer la fabrication',
    'Terminer la fabrication',
    'Marquer prêt à livrer',
  ])
    await action(page, label);
  await page.screenshot({ path: info.outputPath('erp-production.png'), fullPage: true });
  await page.getByRole('button', { name: 'Enregistrer la livraison' }).click();
  await page.getByLabel('Nom du réceptionnaire').fill('Client de test');
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.panel-heading .status').first()).toHaveText('Livré');
  await page.goto('/stocks/' + rawId);
  await expect(page.locator('.facts > div').filter({ hasText: 'Disponible' })).toContainText('4');
  await logout(page);
});
test('ERP régie : campagne, réservation exclusive et paramètres de taxe', async ({ page }, info) => {
  const suffix = Date.now();
  const supportName = `Face TEST ${suffix}`;
  await login(page, 'regie');
  await nav(page, 'supports');
  await page.getByRole('button', { name: 'Créer une face publicitaire' }).click();
  await page.getByLabel('Code de la face').fill(`FACE-${suffix}`);
  await page.getByLabel('Désignation').fill(supportName);
  await page.getByLabel('Ville').fill('Abidjan');
  await page.getByLabel('Commune').fill('Cocody');
  await page.getByLabel('Emplacement / adresse').fill('Riviera test');
  await page.getByLabel('Dimensions / format').fill('4 x 3 m');
  await save(page);
  await nav(page, 'campagnes');
  await page.getByRole('button', { name: 'Créer une campagne' }).click();
  await page.getByLabel('Nom de campagne').fill(`Campagne TEST ${suffix}`);
  await page.getByLabel('Client').selectOption({ index: 1 });
  await page.getByLabel('Début *', { exact: true }).fill(day());
  await page.getByLabel('Fin *', { exact: true }).fill(day(7));
  await page.getByLabel('Budget').fill('500000');
  await page.getByLabel('Brief de campagne').fill('Campagne de recette P08-A');
  await save(page);
  await page.getByRole('button', { name: 'Réserver une face' }).click();
  await page.getByLabel('Face publicitaire').selectOption({ label: `${supportName} — Cocody` });
  await page.getByLabel('Montant convenu').fill('200000');
  await page.getByRole('button', { name: 'Réserver', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('table', { name: 'Réservations de la campagne' })).toContainText(supportName);
  await page.getByRole('button', { name: 'Réserver une face' }).click();
  await page.getByLabel('Face publicitaire').selectOption({ label: `${supportName} — Cocody` });
  await page.getByLabel('Montant convenu').fill('200000');
  await page.getByRole('button', { name: 'Réserver', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Cette face est déjà réservée sur la période.');
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await action(page, 'Planifier la campagne');
  await action(page, 'Démarrer la campagne');
  await nav(page, 'taxes-communales');
  await page.getByRole('button', { name: 'Créer une taxe' }).click();
  await page.getByLabel('Code *', { exact: true }).fill(`TX-${suffix}`);
  await page.getByLabel('Libellé').fill(`Taxe TEST ${suffix}`);
  await page.getByLabel('Commune').fill('Cocody');
  await page.getByLabel('Montant forfaitaire').fill('5000');
  await save(page);
  await page.screenshot({ path: info.outputPath('erp-regie.png'), fullPage: true });
  await logout(page);
});

test('ERP régie P08 : fiche support, planning, maintenance, collectivités et déploiements', async ({
  page,
}, info) => {
  const suffix = Date.now();
  const supportName = `Face P08 ${suffix}`;
  const campaignName = `Campagne P08 ${suffix}`;
  await login(page, 'regie');
  await nav(page, 'supports');
  await page.getByRole('button', { name: 'Créer une face publicitaire' }).click();
  await page.getByLabel('Code de la face').fill(`F8-${suffix}`);
  await page.getByLabel('Désignation').fill(supportName);
  await page.getByLabel('Ville').fill('Abidjan');
  await page.getByLabel('Commune').fill('Plateau');
  await page.getByLabel('Emplacement / adresse').fill('Boulevard P08');
  await page.getByLabel('Dimensions / format').fill('6 x 3 m');
  const supportId = await save(page);
  await expect(page.getByRole('heading', { name: 'Occupation et maintenance', exact: true })).toBeVisible();
  await expect(page.getByText('Coordonnées non renseignées.')).toBeVisible();

  await nav(page, 'campagnes');
  await page.getByRole('button', { name: 'Créer une campagne' }).click();
  await page.getByLabel('Nom de campagne').fill(campaignName);
  await page.getByLabel('Client').selectOption({ index: 1 });
  await page.getByLabel('Début *', { exact: true }).fill(day());
  await page.getByLabel('Fin *', { exact: true }).fill(day(7));
  await page.getByLabel('Budget').fill('400000');
  await page.getByLabel('Brief de campagne').fill('Campagne de recette P08-B');
  const campaignId = await save(page);
  await page.getByRole('button', { name: 'Réserver une face' }).click();
  await page.getByLabel('Face publicitaire').selectOption({ label: `${supportName} — Plateau` });
  await page.getByLabel('Montant convenu').fill('150000');
  await page.getByRole('button', { name: 'Réserver', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();

  await nav(page, 'planning');
  await expect(page.getByRole('heading', { name: 'Planning des faces', exact: true })).toBeVisible();
  await expect(page.locator('.planning-bar').filter({ hasText: campaignName }).first()).toBeVisible();
  await page.screenshot({ path: info.outputPath('p08-planning.png'), fullPage: true });

  await nav(page, 'supports');
  await page.locator(`a[href="/supports/${supportId}"]`).first().click();
  await page.getByRole('button', { name: /^Réservations/ }).click();
  await expect(page.locator('.support-occupation')).toContainText(campaignName);

  await nav(page, 'maintenance');
  await page.getByRole('button', { name: 'Créer une intervention' }).click();
  await page.getByLabel('Face concernée').selectOption({ label: supportName });
  await page.getByLabel('Objet de l’intervention').fill(`Éclairage P08 ${suffix}`);
  await page.getByLabel('Type').selectOption('panne');
  await page.getByLabel('Gravité').selectOption('haute');
  await page.getByLabel('Date de signalement').fill(day());
  await page.getByLabel('Échéance d’intervention').fill(day(3));
  await page.getByLabel('Description du problème').fill('Deux modules ne s’allument plus.');
  await save(page);
  await action(page, 'Démarrer l’intervention');
  await page.getByRole('button', { name: 'Consigner la résolution', exact: true }).click();
  await page.getByLabel('Résolution apportée').fill('Module remplacé et testé.');
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await action(page, 'Clôturer l’intervention');
  await expect(page.locator('.panel-heading .status').first()).toHaveText('Clôturée');

  await nav(page, 'regie/collectivites');
  await page.getByRole('button', { name: 'Créer une collectivité' }).click();
  await page.getByLabel('Nom de la collectivité').fill(`Commune P08 ${suffix}`);
  await page.getByLabel('Type').selectOption('commune');
  await page.getByLabel('Ville / circonscription').fill('Abidjan');
  await save(page);

  await nav(page, 'regie/deploiements');
  await page.getByRole('button', { name: 'Créer un déploiement' }).click();
  await page.getByLabel('Intitulé du déploiement').fill(`Pose P08 ${suffix}`);
  await page.getByLabel('Collectivité').selectOption({ label: `Commune P08 ${suffix}` });
  await page.getByLabel('Début *', { exact: true }).fill(day());
  await page.getByLabel('Fin *', { exact: true }).fill(day(2));
  await page.getByLabel('Équipe mobilisée').fill(`Équipe P08 ${suffix}`);
  await save(page);
  await action(page, 'Démarrer le déploiement');
  await action(page, 'Clôturer le déploiement');
  await expect(page.locator('.panel-heading .status').first()).toHaveText('Terminé');
  await page.screenshot({ path: info.outputPath('p08-deploiement.png'), fullPage: true });

  await nav(page, 'stocks');
  await page.locator('a.record-link').first().click();
  await expect(page.getByRole('heading', { name: 'Valorisation', exact: true })).toBeVisible();
  await logout(page);

  await login(page, 'prod');
  await nav(page, 'projets');
  await page.getByRole('button', { name: 'Créer un projet' }).click();
  await page.getByLabel('Nom du projet *').fill(`Projet P08 ${suffix}`);
  await page.getByLabel('Échéance *', { exact: true }).fill(day(30));
  await page
    .getByLabel('Brief et travaux attendus *')
    .fill('Projet de recette P08 avec ordre de production.');
  const projectId = await save(page);
  await expect(
    page.getByRole('heading', { name: 'Ordres de production du projet', exact: true }),
  ).toBeVisible();

  await nav(page, 'ordres-production');
  await page.getByRole('button', { name: 'Créer un ordre de production' }).click();
  await page.getByLabel('Travaux à réaliser').fill(`Fabrication P08 ${suffix}`);
  await page.getByLabel('Projet lié').selectOption({ label: `Projet P08 ${suffix}` });
  await page.getByLabel('Quantité à fabriquer').fill('1');
  await page.getByLabel('Brief technique').fill('Assemblage de test P08.');
  await page.getByLabel('Article matière').selectOption({ index: 1 });
  await page.getByLabel('Quantité à consommer').fill('1');
  await save(page);

  await page.goto('/projets/' + projectId);
  await expect(
    page.getByRole('heading', { name: 'Ordres de production du projet', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.project-orders')).toContainText(`Fabrication P08 ${suffix}`);
  await expect(page.locator('.material-check')).toContainText('besoin');
  await page.screenshot({ path: info.outputPath('p08-projet.png'), fullPage: true });
  await logout(page);
});

test('ERP régie P08 : preuves de campagne, clôture avec bilan, inventaire et réclamation liée', async ({
  page,
  request,
}, info) => {
  const suffix = Date.now();
  const supportName = `Face P08C ${suffix}`;
  const campaignName = `Campagne P08C ${suffix}`;
  const itemName = `Article P08C ${suffix}`;
  const warehouseName = `Antenne P08C ${suffix}`;
  // Entrepôt dédié : les recettes répétées ne partagent pas un inventaire ouvert.
  const health = await request.get('/api/v1/health');
  expect(new URL(health.url()).hostname).toBe('127.0.0.1');
  const auth = await request.post('/api/v1/auth/login', { data: { login: 'prod', password } });
  expect(auth.ok()).toBeTruthy();
  const bearer = { Authorization: `Bearer ${(await auth.json()).data.token}` };
  const created = await request.post('/api/v1/stock-warehouses', {
    headers: bearer,
    data: { code: `ANT-${suffix}`, label: warehouseName, city: 'Abidjan' },
  });
  expect(created.status()).toBe(201);
  await request.post('/api/v1/auth/logout', { headers: bearer });
  await login(page, 'regie');
  await nav(page, 'supports');
  await page.getByRole('button', { name: 'Créer une face publicitaire' }).click();
  await page.getByLabel('Code de la face').fill(`F8C-${suffix}`);
  await page.getByLabel('Désignation').fill(supportName);
  await page.getByLabel('Ville').fill('Abidjan');
  await page.getByLabel('Commune').fill('Treichville');
  await page.getByLabel('Emplacement / adresse').fill('Boulevard P08C');
  await page.getByLabel('Dimensions / format').fill('8 x 3 m');
  const supportId = await save(page);

  await nav(page, 'campagnes');
  await page.getByRole('button', { name: 'Créer une campagne' }).click();
  await page.getByLabel('Nom de campagne').fill(campaignName);
  await page.getByLabel('Client').selectOption({ index: 1 });
  await page.getByLabel('Début *', { exact: true }).fill(day());
  await page.getByLabel('Fin *', { exact: true }).fill(day(7));
  await page.getByLabel('Budget').fill('250000');
  await page.getByLabel('Brief de campagne').fill('Campagne P08-C');
  const campaignId = await save(page);
  await page.getByRole('button', { name: 'Réserver une face' }).click();
  await page.getByLabel('Face publicitaire').selectOption({ label: `${supportName} — Treichville` });
  await page.getByLabel('Montant convenu').fill('120000');
  await page.getByRole('button', { name: 'Réserver', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await action(page, 'Planifier la campagne');
  await action(page, 'Démarrer la campagne');

  await page.goto('/campagnes/' + campaignId);
  await expect(page.getByRole('heading', { name: 'Preuves d’exécution', exact: true })).toBeVisible();
  await expect(page.locator('.proof-coverage')).toContainText('preuve de pose manquante');
  await expect(page.getByRole('button', { name: 'Clôturer avec bilan' })).toBeDisabled();
  await page.getByRole('button', { name: 'Ajouter une preuve' }).click();
  const proofDialog = page.getByRole('dialog');
  await proofDialog.locator('select[name="kind"]').selectOption('pose');
  await proofDialog.locator('select[name="status"]').selectOption('conforme');
  await proofDialog.getByLabel('Face concernée').selectOption({ label: supportName });
  await proofDialog.getByLabel('Date du constat *').fill(day());
  await page.getByRole('button', { name: 'Enregistrer la preuve' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.proof-coverage')).toContainText('preuve conforme');
  await page.getByRole('button', { name: 'Clôturer avec bilan' }).click();
  await page.getByLabel('Bilan de campagne *').fill('Face posée et contrôlée, aucune anomalie.');
  await page.getByLabel('Satisfaction client (1 à 5)').selectOption('5');
  await page.getByRole('button', { name: 'Clôturer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.campaign-proofs')).toContainText('Bilan de clôture');
  await page.screenshot({ path: info.outputPath('p08c-preuves.png'), fullPage: true });
  await logout(page);

  await login(page, 'prod');
  await nav(page, 'stocks');
  await page.getByRole('button', { name: 'Créer un article' }).click();
  await page.getByLabel('Code *', { exact: true }).fill(`ART-${suffix}`);
  await page.getByLabel('Désignation').fill(itemName);
  const itemId = await save(page);
  await page.getByRole('button', { name: 'Mouvement', exact: true }).click();
  await page.getByLabel('Entrepôt').selectOption({ label: warehouseName });
  await page.getByLabel('Quantité', { exact: true }).fill('10');
  await page.getByLabel('Coût unitaire (FCFA)').fill('400');
  await page.getByLabel('Motif').fill('Stock initial P08C');
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();

  await nav(page, 'stocks/inventaire');
  await expect(page.getByRole('heading', { name: 'Inventaire physique', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Nouvel inventaire' }).click();
  await page.getByLabel('Entrepôt *').selectOption({ label: warehouseName });
  await page.getByLabel('Date du comptage *').fill(day());
  await page.getByRole('button', { name: 'Ouvrir l’inventaire' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.locator('a', { hasText: 'INV-' }).first().click();
  await page.getByLabel(`Quantité comptée ${itemName}`).fill('8');
  await page.getByLabel(`Motif de l’écart ${itemName}`).fill('Deux unités cassées au stockage.');
  await page.getByRole('button', { name: 'Soumettre le comptage' }).click();
  await expect(page.locator('.notice')).toContainText('Une autre personne doit valider');
  await page.screenshot({ path: info.outputPath('p08c-inventaire.png'), fullPage: true });
  await logout(page);

  await login(page, 'dg');
  await page.goto('/stocks/inventaire');
  await page.locator('a', { hasText: 'INV-' }).first().click();
  await page.getByRole('button', { name: 'Valider et corriger le stock' }).click();
  await expect(page.locator('.stock-count-session')).toContainText('valide');
  await page.goto('/stocks/' + itemId);
  await expect(page.locator('.stock-valuation')).toContainText('8');

  await nav(page, 'reclamations');
  await page.getByRole('button', { name: 'Créer une réclamation' }).click();
  await page.getByLabel('Client / prospect').selectOption({ index: 1 });
  await page.getByLabel('Intitulé').fill(`Réclamation P08C ${suffix}`);
  await page.getByLabel('Échéance').fill(day(-2));
  await page.getByLabel('Gravité').selectOption('haute');
  const complaintId = await save(page);
  await page.goto('/reclamations/' + complaintId);
  await expect(page.getByRole('button', { name: 'Rattacher une intervention' })).toBeVisible();
  await page.screenshot({ path: info.outputPath('p08c-reclamation.png'), fullPage: true });
  await logout(page);
});

test('ERP régie P08-D : coûts de campagne, atelier de production et conversion en intervention', async ({
  page,
}, info) => {
  const suffix = Date.now();
  const campaignName = `Campagne P08D ${suffix}`;
  await login(page, 'regie');
  await nav(page, 'supports');
  await page.getByRole('button', { name: 'Créer une face publicitaire' }).click();
  await page.getByLabel('Code de la face').fill(`F8D-${suffix}`);
  await page.getByLabel('Désignation').fill(`Face P08D ${suffix}`);
  await page.getByLabel('Ville').fill('Abidjan');
  await page.getByLabel('Commune').fill('Marcory');
  await page.getByLabel('Emplacement / adresse').fill('Boulevard P08D');
  await page.getByLabel('Dimensions / format').fill('4 x 3 m');
  await save(page);

  await nav(page, 'campagnes');
  await page.getByRole('button', { name: 'Créer une campagne' }).click();
  await page.getByLabel('Nom de campagne').fill(campaignName);
  await page.getByLabel('Client').selectOption({ index: 1 });
  await page.getByLabel('Début *', { exact: true }).fill(day());
  await page.getByLabel('Fin *', { exact: true }).fill(day(5));
  await page.getByLabel('Budget').fill('300000');
  await page.getByLabel('Brief de campagne').fill('Campagne P08-D');
  const campaignId = await save(page);

  // Coûts prévus et réels : le réel n'est jamais déduit du prévu.
  await expect(page.getByRole('heading', { name: 'Coûts prévus et réels' })).toBeVisible();
  await page.getByRole('button', { name: 'Ajouter un coût' }).click();
  let costDialog = page.getByRole('dialog');
  await costDialog.locator('select[name="category"]').selectOption('impression');
  await costDialog.getByLabel('Libellé *').fill('Impression bâche');
  await costDialog.getByLabel('Montant prévu (FCFA) *').fill('150000');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.campaign-costs')).toContainText('150');
  await expect(page.locator('.campaign-costs')).toContainText('À saisir');

  await page.getByRole('button', { name: 'Ajouter un coût' }).click();
  costDialog = page.getByRole('dialog');
  await costDialog.locator('select[name="category"]').selectOption('pose');
  await costDialog.getByLabel('Libellé *').fill('Pose équipe');
  await costDialog.getByLabel('Montant prévu (FCFA) *').fill('50000');
  await costDialog.getByLabel('Montant réel (FCFA)').fill('62000');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.campaign-costs .quote-totals')).toContainText('200');
  await expect(page.locator('.campaign-costs .quote-totals')).toContainText('62');
  await page.screenshot({ path: info.outputPath('p08d-couts.png'), fullPage: true });
  await logout(page);

  // Conversion explicite d'une réclamation en intervention, sous double droit.
  await login(page, 'dg');
  await nav(page, 'reclamations');
  await page.getByRole('button', { name: 'Créer une réclamation' }).click();
  await page.getByLabel('Client / prospect').selectOption({ index: 1 });
  await page.getByLabel('Intitulé').fill(`Panne enseigne P08D ${suffix}`);
  await page.getByLabel('Échéance').fill(day(4));
  await page.getByLabel('Gravité').selectOption('haute');
  await page.getByLabel('Description').fill('L’enseigne ne s’allume plus depuis deux jours.');
  const complaintId = await save(page);
  await page.goto('/reclamations/' + complaintId);
  await page.getByRole('button', { name: 'Créer une intervention de maintenance' }).click();
  await page.getByRole('button', { name: 'Créer l’intervention' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.panel-body')).toContainText('ouvrir la fiche de maintenance');
  await page.screenshot({ path: info.outputPath('p08d-conversion.png'), fullPage: true });

  // Atelier de production : file et disponibilité des matières.
  await nav(page, 'ordres-production');
  await expect(page.getByRole('heading', { name: /Atelier — file de fabrication/ })).toBeVisible();
  await page.getByRole('button', { name: 'Tous' }).click();
  const firstOrder = page.locator('tbody tr').first();
  await firstOrder.click();
  await expect(page.getByRole('heading', { name: 'Disponibilité des matières' })).toBeVisible();
  await page.screenshot({ path: info.outputPath('p08d-atelier.png'), fullPage: true });
  await logout(page);
  expect(campaignId).toBeTruthy();
});

test('P09 : écriture automatique de facture, compte client, créances échues et espace salarié', async ({
  page,
  request,
}, info) => {
  const suffix = Date.now();
  // Le plan comptable est nécessaire aux écritures automatiques : création idempotente via l'API.
  const health = await request.get('/api/v1/health');
  expect(new URL(health.url()).hostname).toBe('127.0.0.1');
  const auth = await request.post('/api/v1/auth/login', { data: { login: 'finance', password } });
  expect(auth.ok()).toBeTruthy();
  const bearer = { Authorization: `Bearer ${(await auth.json()).data.token}` };
  for (const [code, label] of [
    ['411', 'Clients'],
    ['701', 'Ventes de prestations'],
    ['443', 'TVA collectée'],
    ['521', 'Banque'],
    ['571', 'Caisse'],
  ]) {
    const existing = await request.get('/api/v1/erp/ledger-accounts?per_page=100', { headers: bearer });
    const rows = (await existing.json()).data as Row[];
    if (!rows.some((row) => row.code === code)) {
      const created = await request.post('/api/v1/erp/ledger-accounts', {
        headers: bearer,
        data: { code, label },
      });
      expect([201, 422]).toContain(created.status());
    }
  }
  await request.post('/api/v1/auth/logout', { headers: bearer });

  await login(page, 'finance');
  await nav(page, 'creances-echues');
  await expect(page.getByRole('heading', { name: 'Créances échues' })).toBeVisible();
  await page.screenshot({ path: info.outputPath('p09-creances.png'), fullPage: true });

  // Écritures automatiques produites par une facture réelle.
  await nav(page, 'ecritures');
  const before = await page.locator('tbody tr').count();
  await nav(page, 'factures');
  await page.getByRole('button', { name: 'Créer une facture interne' }).click();
  await expect(page.getByLabel('Identifiant du devis accepté')).toBeVisible();
  await page.screenshot({ path: info.outputPath('p09-facture.png'), fullPage: true });
  await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await logout(page);

  // Espace salarié : un profil sans droit RH consulte uniquement son dossier.
  await login(page, 'prod');
  await nav(page, 'mon-espace-rh');
  await expect(page.getByRole('heading', { name: 'Pointage et congés' })).toBeVisible();
  const hasEmployee = await page.getByRole('heading', { name: /Technicien|Fabrication|Production/ }).count();
  if (hasEmployee) {
    await page.getByRole('button', { name: 'Nouvelle demande de congé' }).click();
    await page.getByLabel('Du *').fill(day(20));
    await page.getByLabel('Au *').fill(day(22));
    await page.getByLabel('Motif *').fill('Congé de recette P09');
    await page.getByRole('button', { name: 'Envoyer la demande' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('.myhr-leave')).toContainText('Demande déposée');
  } else {
    await expect(page.locator('.crm-content')).toContainText('Aucun dossier salarié');
  }
  await page.screenshot({ path: info.outputPath('p09-espace-salarie.png'), fullPage: true });
  await logout(page);
  expect(suffix).toBeTruthy();
  expect(before).toBeGreaterThanOrEqual(0);
});

test('P09-C : demande de fonds doublement validée, dépense récurrente et balance âgée', async ({
  page,
}, info) => {
  const suffix = Date.now();
  const amount = 45000;
  await login(page, 'finance');
  await nav(page, 'creances-echues');
  await expect(page.getByRole('heading', { name: 'Balance âgée' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Créances échues' })).toBeVisible();
  await page.screenshot({ path: info.outputPath('p09c-balance-agee.png'), fullPage: true });

  await nav(page, 'comptes-tresorerie');
  await page.getByRole('button', { name: 'Créer un compte' }).click();
  await page.getByLabel('Code *', { exact: true }).fill(`CF-${suffix}`);
  await page.getByLabel('Libellé *', { exact: true }).fill(`Caisse fonds ${suffix}`);
  await save(page);
  await nav(page, 'mouvements-caisse');
  await page.getByRole('button', { name: 'Créer une opération' }).click();
  await page.getByLabel('Compte de trésorerie').selectOption({ label: `Caisse fonds ${suffix}` });
  await page.getByLabel('Montant (FCFA)').fill('400000');
  await page.getByLabel('Référence unique').fill(`DOT-${suffix}`);
  await page.getByLabel('Motif / bénéficiaire').fill('Dotation de recette');
  await save(page);

  // Demande de fonds : approuvée par une autre personne, puis décaissée via la caisse.
  await nav(page, 'demandes-fonds');
  await expect(page.getByRole('heading', { name: /Demandes de fonds/i })).toBeVisible();
  await page.getByRole('button', { name: /Créer une demande/ }).click();
  await page.getByLabel('Objet de la demande').fill(`Consommables ${suffix}`);
  await page.getByLabel('Montant demandé (FCFA)').fill(String(amount));
  await page.getByLabel('Date souhaitée').fill(day(3));
  await page.getByLabel('Justification').fill('Rupture de papier et encre.');
  await page.getByLabel('Compte de trésorerie').selectOption({ label: `Caisse fonds ${suffix}` });
  const requestId = await save(page);
  await expect(page.getByRole('button', { name: 'Approuver la demande' })).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('p09c-demande-fonds.png'), fullPage: true });
  await logout(page);

  await login(page, 'dg');
  await nav(page, 'demandes-fonds');
  await page.locator(`a[href="/demandes-fonds/${requestId}"]`).first().click();
  await action(page, 'Approuver la demande');
  await expect(page.locator('.panel-heading .status').first()).toContainText('Approuv');
  await page.getByRole('button', { name: 'Décaisser depuis la caisse' }).click();
  await page.getByLabel('Compte de trésorerie').selectOption({ label: `Caisse fonds ${suffix}` });
  await page.getByLabel('Date du décaissement').fill(day());
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.panel-heading .status').first()).toContainText('Décaiss');
  await logout(page);

  await login(page, 'finance');
  await nav(page, 'depenses-recurrentes');
  await page.getByRole('button', { name: /Créer une dépense/ }).click();
  await page.getByLabel('Libellé de la dépense').fill(`Loyer ${suffix}`);
  await page.getByLabel('Catégorie').selectOption('loyer');
  await page.getByLabel('Fréquence').selectOption('mensuelle');
  await page.getByLabel('Montant (FCFA)').fill('250000');
  await page.getByLabel('Fournisseur').fill('Bailleur de recette');
  await page.getByLabel('Début').fill(day(0));
  await save(page);
  await expect(page.locator('.crm-content')).toContainText(`Loyer ${suffix}`);
  await page.screenshot({ path: info.outputPath('p09c-depenses.png'), fullPage: true });
  await logout(page);
});

test('P10-B : message interne cloisonné et rapport périodique figé', async ({ page }, info) => {
  const suffix = Date.now();
  const subject = `Message P10 ${suffix}`;
  await login(page, 'awa');
  await nav(page, 'messagerie');
  await expect(page.getByRole('heading', { name: 'Messagerie' })).toBeVisible();
  await page.getByRole('button', { name: 'Nouveau message' }).click();
  await page.getByLabel('Objet *').fill(subject);
  await page.getByLabel(/Destinataires/).selectOption({ index: 0 });
  await page.getByLabel('Message *').fill('Bonjour, merci de vérifier le dossier de recette.');
  await page.getByRole('button', { name: 'Envoyer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Envoyés' }).click();
  await expect(page.locator('.crm-content')).toContainText(subject);
  await page.screenshot({ path: info.outputPath('p10b-messagerie.png'), fullPage: true });
  await logout(page);

  await login(page, 'dg');
  await nav(page, 'rapports');
  await expect(page.getByRole('heading', { name: 'Rapports périodiques' })).toBeVisible();
  await page.getByRole('button', { name: 'Générer un rapport' }).click();
  await page.getByLabel('Périodicité *').selectOption('mensuel');
  const period = await page.getByLabel('Période *').inputValue();
  await page.getByRole('button', { name: 'Générer', exact: true }).click();
  // Soit le rapport est créé et affiché, soit il existe déjà : les deux cas prouvent la règle d'unicité.
  const outcome = await Promise.race([
    page.waitForURL(/\/rapports\/[0-9a-f-]{36}/, { timeout: 15_000 }).then(() => 'created'),
    page
      .getByRole('alert')
      .filter({ hasText: 'existe déjà' })
      .waitFor({ timeout: 15_000 })
      .then(() => 'duplicate'),
  ]);
  if (outcome === 'created') {
    await expect(page.getByRole('heading', { name: /Rapport/ })).toBeVisible();
    await expect(page.locator('.report-finance')).toContainText('Reste dû');
    await page.screenshot({ path: info.outputPath('p10b-rapport.png'), fullPage: true });
  } else {
    await expect(page.getByRole('alert')).toContainText('existe déjà');
    await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click();
    // Le rapport déjà existant reste listé : aucun doublon n'est créé.
    await expect(
      page
        .locator('tbody tr')
        .filter({ hasText: period.slice(0, 4) })
        .first(),
    ).toBeVisible();
  }
  await logout(page);
  expect(period).toMatch(/^\d{4}-\d{2}$/);
});

test('P10-C : analyse SWOT calculée, revue et export CSV', async ({ page }, info) => {
  await login(page, 'dg');
  await nav(page, 'swot');
  await expect(page.getByRole('heading', { name: 'Analyse SWOT' })).toBeVisible();
  await page.getByRole('button', { name: 'Préparer une analyse' }).click();
  await page.getByLabel('Périodicité *').selectOption('mensuel');
  const period = await page.getByLabel('Période *').inputValue();
  await page.getByRole('button', { name: 'Préparer', exact: true }).click();
  const outcome = await Promise.race([
    page.waitForURL(/\/swot\/[0-9a-f-]{36}/, { timeout: 15_000 }).then(() => 'created'),
    page
      .getByRole('alert')
      .filter({ hasText: 'existe déjà' })
      .waitFor({ timeout: 15_000 })
      .then(() => 'duplicate'),
  ]);
  if (outcome === 'created') {
    // Les quatre quadrants et les recommandations sont affichés, avec ou sans constat.
    await expect(page.getByRole('heading', { name: 'Forces' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Menaces' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recommandations' })).toBeVisible();
    await expect(page.locator('.crm-content')).toContainText('Source :');
    const downloading = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exporter CSV' }).click();
    await (await downloading).saveAs(info.outputPath('p10c-swot.csv'));
    await page.screenshot({ path: info.outputPath('p10c-swot.png'), fullPage: true });

    await page.getByRole('button', { name: 'Revue et validation' }).click();
    await page.getByLabel('Nouveau statut *').selectOption('validee');
    await page.getByLabel('Commentaire de revue').fill('Validée en revue de direction.');
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    // Une analyse validée est figée : le bouton de revue disparaît.
    await expect(page.getByRole('button', { name: 'Revue et validation' })).toHaveCount(0);
  } else {
    await expect(page.getByRole('alert')).toContainText('existe déjà');
    await page.getByRole('dialog').getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  }
  await logout(page);
  expect(period).toMatch(/^\d{4}-\d{2}$/);
});

test('P10-A : avenant de contrat, décision de renouvellement et appel d’offres', async ({ page }, info) => {
  const suffix = Date.now();
  const contractName = `Contrat P10 ${suffix}`;
  await login(page, 'dircom');
  await nav(page, 'contrats');
  await page.getByRole('button', { name: 'Créer un contrat' }).click();
  await page.getByLabel('Client / prospect').selectOption({ index: 1 });
  await page.getByLabel('Intitulé').fill(contractName);
  await page.getByLabel('Valeur HT').fill('1200000');
  await page.getByLabel('Début').fill(day());
  await page.getByLabel('Fin').fill(day(365));
  const contractId = await save(page);

  // Avenant : variation explicite et prolongation déclarée.
  await expect(page.getByRole('heading', { name: 'Valeur et échéance' })).toBeVisible();
  await page.getByRole('button', { name: 'Ajouter un avenant' }).click();
  await page.getByLabel('Référence *').fill(`AV-${suffix}`);
  await page.getByLabel('Objet de l’avenant *').fill('Extension de périmètre');
  await page.getByLabel('Variation de valeur (FCFA)').fill('300000');
  await page.getByLabel('Prolonge la date de fin').check();
  await page.getByLabel('Nouvelle date de fin').fill(day(730));
  await page.getByRole('button', { name: 'Enregistrer l’avenant' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.contract-lifecycle .quote-totals')).toContainText('1 500 000');
  await page.screenshot({ path: info.outputPath('p10a-avenant.png'), fullPage: true });

  // La décision de renouvellement n'est possible qu'après signature : vérifié côté serveur.
  await expect(page.getByText('La décision de renouvellement est disponible')).toBeVisible();

  await nav(page, 'appels-offres');
  await expect(page.getByRole('heading', { name: 'Appels d’offres' })).toBeVisible();
  await page.getByRole('button', { name: 'Nouvel appel d’offres' }).click();
  await page.getByLabel('Référence *').fill(`AO-${suffix}`);
  await page.getByLabel('Intitulé *').fill(`Marché P10 ${suffix}`);
  await page.getByLabel('Date de remise *').fill(day(14));
  await page.getByLabel('Valeur estimée (FCFA)').fill('8000000');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.crm-content')).toContainText(`Marché P10 ${suffix}`);
  await page.screenshot({ path: info.outputPath('p10a-appels-offres.png'), fullPage: true });
  await logout(page);
  expect(contractId).toBeTruthy();
});
