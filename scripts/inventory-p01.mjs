/** Inventaire statique reproductible. Aucun code source audité n'est évalué.
 * Seule commande applicative exécutée : artisan route:list --path=api --json.
 * Pas d'accès SQL, HTTP, .env, pièces jointes, secrets ou script historique.
 * Écrit uniquement les trois rapports générés dans docs/inventaire-p01/.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { scope, adminGaps } from './inventory-p01-scope.mjs';

const front = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const www = path.dirname(front);
const crm = path.join(www, 'comsig-crm');
const back = path.join(www, 'comsig-v2');
const erp = path.join(www, 'comsig');
const out = path.join(front, 'docs/inventaire-p01');
const posix = (p) => p.replaceAll('\\', '/');
const uniq = (a) => [...new Set(a)];
const hashes = new Map();
function read(file) {
  const bytes = fs.readFileSync(file);
  hashes.set(posix(file), crypto.createHash('sha256').update(bytes).digest('hex'));
  return bytes.toString('utf8');
}
function files(dir, ext) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() && !['node_modules', 'vendor', 'uploads', 'assets', '_archive', 'tmp', 'output', '.git'].includes(d.name)
      ? files(path.join(dir, d.name), ext)
      : d.isFile() && d.name.endsWith(ext) ? [path.join(dir, d.name)] : [],
  ).sort();
}
function parse(file) {
  return ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}
function walk(n, fn) { fn(n); ts.forEachChild(n, (c) => walk(c, fn)); }
const short = (s) => s.replace(/\s+/g, ' ').trim();
const line = (sf, n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
const literal = (n) => n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : null;
const prop = (o, key) => {
  const p = o.properties?.find((p) => (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && p.name.getText().replaceAll("'", '').replaceAll('"', '') === key);
  return p && (ts.isShorthandPropertyAssignment(p) ? p.name : p.initializer);
};
function attr(n, key) {
  const a = n.attributes?.properties.find((a) => ts.isJsxAttribute(a) && a.name.text === key);
  return a?.initializer ? literal(a.initializer) ?? (ts.isJsxExpression(a.initializer) ? a.initializer.expression?.getText() : a.initializer.getText()) : a ? true : null;
}
function owner(n) {
  for (let p = n.parent; p; p = p.parent) {
    if (ts.isFunctionDeclaration(p)) return p.name?.text ?? 'default';
    if ((ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && ts.isVariableDeclaration(p.parent)) return p.parent.name.getText();
  }
  return '(partagé / module)';
}
function scan(file) {
  const sf = parse(file);
  const result = { file: posix(file), components: [], imports: [], apiReferences: [], controls: [], labels: [], permissions: [] };
  walk(sf, (n) => {
    const at = { line: line(sf, n), owner: owner(n) };
    if (ts.isImportDeclaration(n) && literal(n.moduleSpecifier)?.startsWith('.')) result.imports.push({ path: n.moduleSpecifier.text, line: at.line });
    if (ts.isFunctionDeclaration(n) && n.name) result.components.push({ name: n.name.text, line: at.line, exported: !!n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword), default: !!n.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword) });
    if (ts.isVariableDeclaration(n) && n.initializer && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))) result.components.push({ name: n.name.getText(), line: at.line });
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) && n.getText().includes('/api/')) {
      result.apiReferences.push({ ...at, expression: n.getText() });
    }
    if (ts.isCallExpression(n) && (/^api\.(get|post|put|patch|delete|del)$/.test(n.expression.getText()) || ['request', 'downloadFile', 'download'].includes(n.expression.getText()))) {
      result.apiReferences.push({ ...at, expression: n.expression.getText() + '(' + (n.arguments[0]?.getText() ?? '') + ')', method: n.expression.getText().split('.').at(-1) });
    }
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = n.tagName.getText();
      if (/^(Field|Input|Select|Textarea|MoneyInput|DateInput|input|select|textarea|Tabs|Tab|Segmented|Button|button|Modal|ConfirmModal|DataTable|Documents|Document|Link$|a$|label$|form$)/.test(tag) || tag.endsWith('Button') || ['onClick', 'onSubmit', 'onChange', 'href', 'to'].some((k) => attr(n, k) !== null)) {
        const attrs = Object.fromEntries(['label', 'title', 'name', 'id', 'type', 'placeholder', 'required', 'value', 'onChange', 'onClick', 'onSubmit', 'items', 'tabs', 'options', 'columns', 'permission', 'href', 'url', 'to', 'download', 'entityType', 'entityId', 'kinds', 'aria-label'].map((k) => [k, attr(n, k)]).filter(([, v]) => v !== null));
        const children = ts.isJsxOpeningElement(n) && (tag.endsWith('Button') || ['button', 'Link', 'a', 'label'].includes(tag)) ? n.parent.children.map((c) => short(c.getText(sf))).filter(Boolean).join(' ') : '';
        result.controls.push({ ...at, tag, attrs, children });
      }
    }
    if (ts.isPropertyAssignment(n) && /^(label|title|placeholder|key|name|id)$/.test(n.name.getText()) && literal(n.initializer) !== null) result.labels.push({ ...at, property: n.name.getText(), value: n.initializer.text });
    if (ts.isCallExpression(n) && /^(can|useCan|hasPermission|requirePermission)$/.test(n.expression.getText())) result.permissions.push({ ...at, expression: n.getText() });
  });
  return result;
}

const main = parse(path.join(crm, 'web/src/main.tsx'));
const lazy = {};
walk(main, (n) => {
  if (!ts.isVariableDeclaration(n) || !n.initializer || !n.initializer.getText().startsWith('lazy(')) return;
  const refs = [];
  walk(n.initializer, (c) => { const s = literal(c); if (s?.startsWith('./pages/')) refs.push(s); });
  lazy[n.name.getText()] = uniq(refs);
});
lazy.Home = ['./pages/Dashboard', './pages/Workspace'];
lazy.NewQuoteRoute = ['./pages/NewQuote', './pages/QuoteDetail'];
const routes = [];
walk(main, (n) => {
  if (!(ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n)) || n.tagName.getText() !== 'Route') return;
  const p = attr(n, 'path');
  if ((!p && attr(n, 'index') !== true) || p === '*') return;
  const route = p ? '/' + p.replace(/^\//, '') : '/';
  const element = n.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.text === 'element');
  const components = []; const needs = [];
  if (element) walk(element, (c) => {
    if (ts.isJsxOpeningElement(c) || ts.isJsxSelfClosingElement(c)) {
      if (lazy[c.tagName.getText()]) components.push(c.tagName.getText());
      if (c.tagName.getText() === 'Need') needs.push(attr(c, 'module') + '.view');
      if (c.tagName.getText() === 'HrGate') needs.push('HrGate : hr.view OU cross_department OU data_scope ≠ own');
    }
  });
  if (!scope[route]) throw new Error('Correspondance manquante : ' + route);
  const [status, target, phase, gap] = scope[route];
  routes.push({ id: '', path: route, line: line(main, n), components, pageFiles: uniq(components.flatMap((c) => lazy[c])), sourceAccess: needs.length ? needs.join(' ; ') : route.startsWith('/connexion') || route === '/portail' ? 'Public' : 'Connecté ; conditions internes du composant/API', status, target, phase, gap });
});
routes.sort((a, b) => a.path.localeCompare(b.path, 'fr')).forEach((r, i) => { r.id = 'CRM-' + String(i + 1).padStart(3, '0'); });
if (Object.keys(scope).length !== routes.length) throw new Error('Routes de correspondance obsolètes ou dupliquées');
if (new Set(routes.map((r) => r.path)).size !== routes.length) throw new Error('Routes source dupliquées');

const pages = files(path.join(crm, 'web/src/pages'), '.tsx').map(scan);
for (const page of pages) {
  const name = './pages/' + path.basename(page.file, '.tsx');
  page.routeIds = routes.filter((r) => r.pageFiles.includes(name)).map((r) => r.id);
  if (!page.routeIds.length) throw new Error('Fichier de page non couvert : ' + page.file);
}
// Composants/lib partagés inventoriés à part : ne pas attribuer tous leurs appels à chaque écran importateur.
const shared = [...files(path.join(crm, 'web/src/components'), '.tsx'), ...files(path.join(crm, 'web/src/lib'), '.tsx'), ...files(path.join(crm, 'web/src/lib'), '.ts')].map(scan);
const targetFiles = [...files(path.join(front, 'src/v2'), '.tsx'), ...files(path.join(front, 'src/v2'), '.ts')].filter((f) => !/\.(test|spec)\./.test(f)).map(scan);

const api = [];
const unresolvedApi = [];
const apiFiles = [...files(path.join(crm, 'server/src/modules'), '.ts'), path.join(crm, 'server/src/ai/routes.ts')];
for (const file of apiFiles) {
  const sf = parse(file);
  walk(sf, (n) => {
    if (!ts.isCallExpression(n) || !ts.isPropertyAccessExpression(n.expression)) return;
    const verb = n.expression.name.text;
    if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'route'].includes(verb)) return;
    const receiver = n.expression.expression.getText();
    if (!['app', 'fastify', 'server'].includes(receiver)) return;
    const p = literal(n.arguments[0]);
    if (p?.startsWith('/api/')) api.push({ method: verb.toUpperCase(), path: p, file: posix(file), line: line(sf, n) });
    else unresolvedApi.push({ file: posix(file), line: line(sf, n), expression: short(n.expression.getText() + '(' + (n.arguments[0]?.getText() ?? '') + ')') });
  });
}
const backendRoutes = JSON.parse(execFileSync(process.env.P01_PHP_BINARY || 'php', ['artisan', 'route:list', '--path=api', '--json'], { cwd: back, encoding: 'utf8', windowsHide: true }));
read(path.join(back, 'routes/api.php')); read(path.join(back, 'routes/erp.php')); read(path.join(back, 'config/erp.php'));
read(path.join(back, 'config/attachments.php')); read(path.join(back, 'config/filesystems.php'));
read(path.join(back, 'config/security.php')); read(path.join(front, 'src/v2/customerFields.ts'));
const modules = [];
const moduleSf = parse(path.join(front, 'src/v2/modules.ts'));
walk(moduleSf, (n) => {
  if (!ts.isObjectLiteralExpression(n)) return;
  const p = literal(prop(n, 'path')); const key = literal(prop(n, 'key'));
  if (p && key) modules.push({ path: '/' + p, key, title: literal(prop(n, 'title')), permission: literal(prop(n, 'permission')), detail: prop(n, 'detail')?.getText() === 'true', line: line(moduleSf, n), definition: n.getText() });
});
// Fabriques calculées, analysées sans eval. Échec explicite si leur structure change.
let workFactory;
walk(moduleSf, (n) => {
  if (ts.isObjectLiteralExpression(n) && prop(n, 'key')?.getText() === 'key' && prop(n, 'path')?.getText().includes("'taches'")) workFactory = n;
});
if (!workFactory) throw new Error('Fabrique activities/tasks modifiée : adapter l’analyse statique');
for (const [key, p, title] of [['activities', 'activites', 'Activités & relances'], ['tasks', 'taches', 'Tâches']]) modules.push({ path: '/' + p, key, title, permission: key, detail: true, line: line(moduleSf, workFactory), definition: workFactory.getText() });
let caseFactory;
walk(moduleSf, (n) => {
  if (ts.isObjectLiteralExpression(n) && prop(n, 'key')?.getText() === "'customer-cases/' + resource") caseFactory = n;
});
if (!caseFactory) throw new Error('Fabrique contrats/réclamations modifiée : adapter l’analyse statique');
for (const [resource, p, title] of [['contracts', 'contrats', 'Contrats clients'], ['complaints', 'reclamations', 'Réclamations clients']]) modules.push({ path: '/' + p, key: 'customer-cases/' + resource, title, permission: resource, detail: true, line: line(moduleSf, caseFactory), definition: caseFactory.getText() });
const erpSf = parse(path.join(front, 'src/v2/erpModules.ts'));
walk(erpSf, (n) => {
  if (!ts.isCallExpression(n) || n.expression.getText() !== 'resource' || !literal(n.arguments[0])) return;
  const [key, p, title, , permission] = n.arguments.map(literal);
  modules.push({ path: '/' + p, key: 'erp/' + key, title, permission, detail: true, line: line(erpSf, n), definition: n.parent && ts.isSpreadAssignment(n.parent) ? n.parent.parent.getText() : n.getText() });
});
const erpKeys = modules.filter((m) => m.key.startsWith('erp/')).map((m) => m.key.slice(4));
const erpConfig = fs.readFileSync(path.join(back, 'config/erp.php'), 'utf8');
for (const key of erpKeys) if (!erpConfig.includes("'" + key + "' =>")) throw new Error('Ressource ERP sans configuration serveur : ' + key);
const targetMain = parse(path.join(front, 'src/v2/main.tsx'));
const explicitTargetRoutes = [];
walk(targetMain, (n) => {
  if (!(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) || n.tagName.getText() !== 'Route') return;
  const p = attr(n, 'path');
  if (typeof p === 'string' && !p.includes('+') && !p.includes('module.') && !p.includes('${') && p !== '*') explicitTargetRoutes.push('/' + p.replace(/^\//, ''));
  if (attr(n, 'index') === true) explicitTargetRoutes.push('/');
});
const targetPaths = new Set([...explicitTargetRoutes, ...modules.flatMap((m) => [m.path, ...(m.detail ? [m.path + '/:id'] : [])])]);
for (const r of routes) if (r.target !== '—' && !targetPaths.has(r.target.split('?')[0])) throw new Error('Destination cible inexistante : ' + r.target);
for (const r of routes) {
  const target = r.target.split('?')[0];
  const m = modules.find((m) => target === m.path || (m.detail && target === m.path + '/:id'));
  r.targetApi = m ? '/api/v1/' + m.key + (target.endsWith('/:id') ? '/{id}' : '') : ({
    '/': '/api/v1/dashboard + agrégations de listes autorisées',
    '/espace': '/api/v1/dashboard + agrégations de listes autorisées',
    '/espace-admin': '/api/v1/dashboard + agrégations de listes autorisées',
    '/indicateurs': '/api/v1/dashboard + agrégations de listes autorisées',
    '/connexion': '/api/v1/auth/login', '/connexion/:dept': '/api/v1/auth/login',
    '/portail': 'Tuiles statiques ; pas d’API publique portail cible',
    '/profil': '/api/v1/auth/me ; PUT /api/v1/auth/password',
    '/admin/:section': 'Selon section : /api/v1/admin/users, /departments, /catalog, /admin/audit-logs ; autres non portées',
    '/pipeline': '/api/v1/opportunities ; /api/v1/pipeline/stages',
    '/calendrier': '/api/v1/tasks (chargement via pagination)',
    '/devis/nouveau': '/api/v1/quotes/new ; /api/v1/quotes/new/context ; /quotes/simulate ; catalogue/stock ; /quotes pour affaire préremplie',
    '/services': 'Tuiles et destinations locales ; droits du profil',
  }[target] ?? 'Aucun raccordement pour cette route');
  r.mobile = 'À recetter écran, onglets et actions sur mobile ; ne pas déduire la conformité des seuls styles responsive';
}

const legacyFiles = files(path.join(erp, 'public'), '.php').map((file) => {
  const relative = posix(path.relative(erp, file));
  const name = path.basename(file);
  const excluded = /\/(?:_tools|_setup)\//.test(relative) || /(?:^setup_|-test\.)/.test(name);
  if (excluded) return { file: relative, category: 'outil / setup / test — non exécuté, hors écran', excluded: true };
  // Lecture des noms de champs uniquement dans les modules métier ; pas de config/inclusion ni de données téléchargées.
  const module = relative.split('/')[1];
  const business = ['sales', 'parties', 'treasury', 'human_resources', 'fleet', 'inventory', 'production', 'projects', 'documents', 'reporting', 'dashboard', 'admin'].includes(module);
  const text = business ? read(file) : '';
  const fields = uniq([...text.matchAll(/\bname\s*=\s*["']([^"'<>]+)["']/gi)].map((m) => m[1]).filter((s) => !s.includes('<?')));
  const category = /(?:save|delete|update|status|get|fetch|controller|generate|send|record|check|setup|totals|events)\b/i.test(name) ? 'traitement / endpoint probable' : /(?:export|pdf|print|template|xls)/i.test(name) ? 'document / export probable' : 'écran potentiel — accessibilité à recetter';
  return { file: relative, module, category, fields };
});
const scheduler = parse(path.join(crm, 'server/src/jobs/scheduler.ts'));
const scheduledRules = [];
walk(scheduler, (n) => { if (ts.isPropertyAssignment(n) && n.name.getText() === 'code' && literal(n.initializer)) scheduledRules.push({ code: n.initializer.text, line: line(scheduler, n) }); });
const realtimeSf = parse(path.join(crm, 'server/src/jobs/realtime.ts'));
const realtimeRules = [];
walk(realtimeSf, (n) => { if (ts.isArrayLiteralExpression(n) && literal(n.elements[0]) && ts.isArrowFunction(n.elements[1])) realtimeRules.push({ code: n.elements[0].text, line: line(realtimeSf, n) }); });
const jobsConfig = read(path.join(crm, 'server/src/core/config.ts'));
const targetSchedule = read(path.join(back, 'routes/console.php')).split(/\r?\n/).map((s, i) => ({ line: i + 1, code: s.trim() })).filter((s) => s.code.startsWith('Schedule::'));
const rolesSf = parse(path.join(crm, 'server/src/core/rbac.ts'));
const roles = [];
walk(rolesSf, (n) => {
  if (!ts.isObjectLiteralExpression(n) || !prop(n, 'data_scope') || !literal(prop(n, 'code'))) return;
  roles.push({ code: literal(prop(n, 'code')), label: literal(prop(n, 'label')), scope: literal(prop(n, 'data_scope')), line: line(rolesSf, n), definition: n.getText() });
});
// Preuves serveur cible : uniquement du code métier contrôleurs/services/requêtes/modèles,
// empreintes uniquement, jamais de lecture des fichiers de configuration locale ou du stockage.
for (const dir of ['app/Http/Controllers/Api', 'app/Http/Requests', 'app/Services', 'app/Models']) {
  if (fs.existsSync(path.join(back, dir))) for (const file of files(path.join(back, dir), '.php')) read(file);
}
const adminSf = parse(path.join(crm, 'web/src/pages/Admin.tsx'));
const adminSections = [];
walk(adminSf, (n) => {
  if (!ts.isObjectLiteralExpression(n) || !prop(n, 'show') || !literal(prop(n, 'id'))) return;
  const id = literal(prop(n, 'id'));
  if (!adminGaps[id]) throw new Error('Section admin non couverte : ' + id);
  adminSections.push({ id, label: literal(prop(n, 'label')), access: prop(n, 'show').getText(), line: line(adminSf, n), target: adminGaps[id][0], status: adminGaps[id][1], gap: adminGaps[id][2] });
});
if (adminSections.length !== Object.keys(adminGaps).length) throw new Error('Sections admin obsolètes');
// Vérification de préservation des copies historiques. Ce contrôle ne prouve pas leur utilisation par l'entrée V2.
const copied = [...files(path.join(crm, 'web/src'), '.tsx'), ...files(path.join(crm, 'web/src'), '.ts'), ...files(path.join(crm, 'web/src'), '.css')].map((source) => {
  const relative = path.relative(path.join(crm, 'web/src'), source);
  const target = path.join(front, 'src', relative === 'main.tsx' ? 'legacy-main.tsx' : relative);
  const same = fs.existsSync(target) && crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex') === crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
  return { file: posix(relative), present: fs.existsSync(target), same };
});
const summary = { sourcePageFiles: pages.length, sourceRoutePatterns: routes.length, adminSections: adminSections.length, sourceApiLiteralDeclarations: api.length, sourceApiDynamicDeclarations: unresolvedApi.length, targetLaravelRouteEntries: backendRoutes.length, targetFrontendModules: modules.length, targetErpResources: erpKeys.length, sourceScheduledRules: scheduledRules.length, sourceRealtimeRules: realtimeRules.length, targetScheduleDeclarations: targetSchedule.length, legacyPublicPhpFiles: legacyFiles.length, sourceFilesCompared: copied.length, sourceFilesDifferent: copied.filter((f) => !f.same).length, byStatus: Object.fromEntries(uniq(routes.map((r) => r.status)).map((s) => [s, routes.filter((r) => r.status === s).length])) };
const report = { generatedAt: new Date().toISOString(), method: 'Analyse statique AST TypeScript + noms/champs HTML PHP + artisan route:list ; aucune recette fonctionnelle nouvelle', summary, routes, adminSections, pages, shared, targetFiles, sourceApi: api, sourceApiDynamic: unresolvedApi, targetBackendRoutes: backendRoutes, targetModules: modules, targetExplicitRoutes: explicitTargetRoutes, legacyFiles, scheduledRules, realtimeRules, jobsDefaults: { mainSeconds: Number(jobsConfig.match(/jobsIntervalSeconds:.*?\?\?\s*(\d+)/)?.[1]), realtimeSeconds: Number(jobsConfig.match(/realtimeIntervalSeconds:.*?\?\?\s*(\d+)/)?.[1]) }, targetSchedule, sourceDefaultRoles: roles, copied, fingerprints: Object.fromEntries([...hashes].sort()) };
const cell = (s) => String(s ?? '—').replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
const table = (headers, rows) => [headers, headers.map(() => '---'), ...rows].map((row) => '| ' + row.map(cell).join(' | ') + ' |').join('\n');
const link = (file, ln, label) => `[${label ?? path.basename(file)}](${posix(file)}${ln ? ':' + ln : ''})`;
const routeRows = routes.map((r) => [r.id, '`' + r.path + '`', r.components.join(', '), r.sourceAccess, r.target === '—' ? '—' : '`' + r.target + '`', r.targetApi, r.status, r.phase, r.gap]);
let matrix = `# P01 — Matrice des écrans et destinations\n\nGénéré le ${report.generatedAt}. Les états sont une revue statique, sauf les trois comparaisons publiques déjà documentées dans [VERIFICATION-CRM.md](../VERIFICATION-CRM.md). « Identique vérifié » se limite à ces vues publiques et à leurs conditions de test, pas à toute leur logique.\n\n${table(['ID', 'Route source', 'Composant source', 'Accès source (statique)', 'Destination V1 effective', 'API cible disponible / base', 'État', 'Lot', 'Écart / réception attendue'], routeRows)}\n\n## Sections d’administration à ne pas masquer derrière /admin/:section\n\n${table(['Source', 'Libellé', 'Condition source', 'Cible séparée', 'État', 'Écart'], adminSections.map((s) => ['/admin/' + s.id, s.label, s.access, s.target, s.status, s.gap]))}\n\n## Modules réellement déclarés dans le frontend V1\n\nChaque liste générique n’est pas un écran CRM source identique. Les champs/actions complets figurent dans les définitions de snapshot.json et le code pointé.\n\n${table(['Chemin', 'Ressource API (sous /api/v1/)', 'Droit lecture', 'Fiche', 'Définition'], modules.map((m) => [m.path, m.key, m.permission + '.view', m.detail ? m.path + '/:id' : 'Non', link(path.join(front, m.key.startsWith('erp/') ? 'src/v2/erpModules.ts' : 'src/v2/modules.ts'), m.line)]))}\n\n## Rôles CRM par défaut\n\nLa base peut les modifier : il ne s’agit pas d’une preuve des droits d’un utilisateur réel. Détail des permissions par module dans snapshot.json/sourceDefaultRoles.\n\n${table(['Code', 'Rôle', 'Périmètre par défaut', 'Preuve'], roles.map((r) => [r.code, r.label, r.scope, link(path.join(crm, 'server/src/core/rbac.ts'), r.line)]))}\n\n## Tâches planifiées à porter\n\nSource : intervalle principal ${report.jobsDefaults.mainSeconds} s et boucle rapide ${report.jobsDefaults.realtimeSeconds} s par défaut, variables serveur et activation à confirmer. Les règles peuvent être désactivées en base. Aucune tâche n’a été exécutée pour cet audit.\n\n${table(['Code source', 'Boucle', 'Preuve', 'Cible / écart'], [...scheduledRules.map((r) => [r.code, 'principale', link(path.join(crm, 'server/src/jobs/scheduler.ts'), r.line), r.code === 'preresa_expiree' ? 'Expiration devis partielle via comsig:expire-quotes ; pré-réservations à porter' : 'Pas de tâche planifiée Laravel correspondante déclarée']), ...realtimeRules.map((r) => [r.code, 'rapide', link(path.join(crm, 'server/src/jobs/realtime.ts'), r.line), 'Non portée'])])}\n\nÀ ajouter au périmètre technique source : retryPendingAi (reprise IA, lorsque runJobs sans filtre), lancement initial différé et verrous/déduplication. Ne pas remplacer par autant de cron indépendants sans conserver ces garanties.\n\nCible déclarée :\n\n${table(['Ligne', 'Déclaration'], targetSchedule.map((s) => [s.line, '\x60' + s.code + '\x60']))}\n`;
let appendix = '# P01 — Preuves détaillées de l’inventaire statique\n\nGénéré le ' + report.generatedAt + '.\n\nLes contrôles sont extraits sans exécuter React. Les expressions dynamiques et les noms de fonctions sont conservés ; ils sont des points à recetter, pas des valeurs utilisateur. Le propriétaire indique la fonction englobante, ce qui sépare les écrans exportés d’un même fichier. Les dépendances locales importées sont explicites ; leurs appels ne sont pas attribués automatiquement à tous les écrans. Les objets de libellés incluent onglets, colonnes, filtres et options : ne pas les compter tous comme champs de saisie.\n\n';
for (const p of [...pages, ...shared.filter((p) => /\/(forms|Documents|ExportButton|Layout|NotificationBell|AiPanel|auth)\.tsx$/.test(p.file))]) {
  appendix += `## ${path.basename(p.file)} — ${p.routeIds?.join(', ') ?? 'composant partagé'}\n\nSource : ${link(p.file)}. Mobile : ${/Login|Portal/.test(path.basename(p.file)) && !/Demo/.test(p.file) ? 'comparaisons publiques documentées sur ordinateur ; mobile spécifique à valider' : 'parcours écran/onglets/actions non recetté exhaustivement sur mobile'}.\n\n`;
  appendix += `Exports/fonctions : ${p.components.map((c) => link(p.file, c.line, c.name + (c.exported ? ' (export)' : ''))).join(', ') || 'Voir source'}.\n\nDépendances locales : ${p.imports.map((d) => '\x60' + d.path + '\x60').join(', ') || '—'}.\n\n`;
  appendix += '### Appels / références API de ce fichier\n\n' + (p.apiReferences.length ? table(['Fonction', 'Expression', 'Preuve'], p.apiReferences.map((a) => [a.owner, '`' + a.expression + '`', link(p.file, a.line)])) : 'Aucun littéral /api/ direct ; vérifier les dépendances partagées.') + '\n\n';
  appendix += '### Onglets, champs, filtres, actions et documents (contrôles)\n\n' + (p.controls.length ? table(['Fonction', 'Contrôle', 'Attributs', 'Contenu/action', 'Preuve'], p.controls.map((c) => [c.owner, c.tag, Object.entries(c.attrs).map(([k, v]) => k + '=' + v).join(' ; '), c.children, link(p.file, c.line)])) : 'Pas de contrôle littéral reconnu ; consulter les dépendances.') + '\n\n';
  appendix += '### Libellés et permissions déclarés\n\n' + table(['Fonction', 'Déclaration', 'Preuve'], [...p.labels.map((a) => [a.owner, a.property + ' = ' + a.value, link(p.file, a.line)]), ...p.permissions.map((a) => [a.owner, a.expression, link(p.file, a.line)])]) + '\n\n';
}
appendix += `## Dépendances partagées et code cible\n\nLe détail par fonction des ${shared.length} fichiers partagés et ${targetFiles.length} fichiers V2 est dans [snapshot.json](snapshot.json), propriétés shared et targetFiles. Les références dans les gabarits PDF/Word ou les endpoints ne prouvent pas un téléchargement raccordé.\n\n## API CRM source — déclarations statiques\n\nCes déclarations Fastify ne sont pas nécessairement les seules routes : les déclarations calculées sont listées séparément. Le nombre n’est pas comparable directement aux routes Laravel génériques.\n\n${table(['Méthode', 'Chemin', 'Preuve'], api.map((a) => [a.method, a.path, link(a.file, a.line)]))}\n\nDéclarations calculées à lire séparément :\n\n${table(['Expression', 'Preuve'], unresolvedApi.map((a) => [a.expression, link(a.file, a.line)]))}\n\n## API cible Laravel enregistrée\n\n${table(['Méthode', 'URI', 'Action', 'Middleware'], backendRoutes.map((r) => [r.method, r.uri, r.action, r.middleware.join(', ')]))}\n\n## Fichiers PHP historiques sous public\n\nIl s’agit de fichiers présents, pas d’un nombre d’écrans opérationnels. Traitements, wrappers, exports et outils sont séparés par classification indicative. Aucun fichier PHP n’a été exécuté. Les champs sont des noms HTML littéraux, pas des données personnelles.\n\n${table(['Fichier', 'Catégorie indicative', 'Noms de champs HTML'], legacyFiles.map((f) => [f.file, f.category, f.fields?.join(', ') ?? 'Non lu']))}\n`;
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'snapshot.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'MATRICE.md'), matrix);
fs.writeFileSync(path.join(out, 'PREUVES.md'), appendix);
console.log(JSON.stringify({ output: posix(out), ...summary }, null, 2));
