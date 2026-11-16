# COMSIG Front V1

Frontend autonome **React + TypeScript + Vite**, créé dans `C:\wamp64\www\comsig-front-v1`.
Il utilise l’API PHP/Laravel du projet voisin `comsig-v2`, pas le serveur Node du CRM historique.
Les projets `comsig` et `comsig-crm` n’ont pas été modifiés. **Extension ERP ajoutée** : trésorerie, comptabilité, RH/paie préparatoire, flotte, fabrication et régie sont maintenant reliées au backend V2. Voir [le portage ERP](docs/ERP.md) et [la recette avec aperçus](docs/VERIFICATION-ERP.md).

**Interface CRM rétablie (3 novembre 2026)** : le portail à neuf tuiles, les connexions, la structure de navigation, le thème, les composants de tableaux et de modales reprennent ceux du CRM source. Le tableau de bord reprend son gabarit, alimenté depuis Laravel. Voir [la portée et la vérification visuelle](docs/CONFORMITE-CRM.md).

## Ce qui est utilisable avec l’API V2

- Portail des équipes, connexion nominative, navigation selon les permissions et profil.
- Tableau de bord alimenté par l’API, sans statistiques inventées.
- Clients/prospects/fournisseurs/partenaires, recherche et pagination ; contacts associés.
- P03-A : clients et contacts dédiés, profils détaillés, filtres persistants/CSV, qualification 5/7 et vraie prospection avec premier contact planifié. [État et limites de P03](docs/VERIFICATION-P03A.md).
- Opportunités, étapes du pipeline et vue en colonnes.
- Devis et proformas à plusieurs lignes : catalogue, matières ou saisie libre, remises, simulation serveur, brouillon, soumission, approbation/rejet, marquage envoyé et décision client.
- Catalogue et tarifs.
- Activités, tâches et calendrier chronologique des échéances.
- Stocks, entrées/sorties et CUMP calculé par Laravel.
- Factures **internes non certifiées FNE** et enregistrement de règlements.
- Utilisateurs, services et journal d’audit, selon les droits du compte.
- Pièces jointes privées dans 26 ressources : types, versions, téléchargement authentifié, corbeille/restauration et audit. Voir [la recette P02-B](docs/VERIFICATION-P02B.md).
- Page « Modules & avancement » distinguant les API disponibles des modules à porter.

Les contrôles de droits côté interface servent à organiser l’affichage. **L’API reste l’autorité** pour les permissions, les périmètres, les montants et les transitions.

## Sources historiques conservées

Les **58 fichiers de pages** de `comsig-crm/web/src/pages`, leurs composants, styles, utilitaires, ressources graphiques et le mode démonstration ont été copiés dans ce dossier pour la migration.

- `src/main.tsx` : entrée active vers le frontend Laravel V2.
- `src/v2/` : interface réellement connectée à `comsig-v2`.
- `src/legacy-main.tsx` : ancien routeur conservé comme référence, **non exécuté**.
- `src/pages/` et `src/demo/` : pages et démonstration historiques, pas de bascule vers le routeur Node.
- `src/components/` : composants historiques effectivement réutilisés (tuiles, UI, graphiques). Les adaptateurs de pages et de navigation sont dans `src/v2/Crm*.tsx`.
- `src/styles/tokens.css` : palette et typographie de la marque réutilisées par la V1.

Les pages historiques complètes restent la référence ; leurs composants et gabarits sont désormais réemployés dans l’interface Laravel. Les écrans RH, production, flotte, comptabilité et régie sont déclarés dans `src/v2/erpModules.ts`. Contrats, assistant, messagerie et rapports avancés restent à porter : un lien conservé vers une fonction non raccordée affiche une indication explicite, pas un faux écran métier ni une opération simulée. Aucune redirection silencieuse vers le backend Node n’est utilisée.

## Démarrer en local

Prérequis : Node.js 22.12+ (Node 24 installé ici), npm, API Laravel V2 configurée et MySQL démarré dans Wamp.

Premier terminal PowerShell, pour l’API :

```powershell
Set-Location C:\wamp64\www\comsig-v2
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/serve-local.ps1 -Port 8002
```

Deuxième terminal, pour le frontend :

```powershell
Set-Location C:\wamp64\www\comsig-front-v1
npm ci
npm run dev
```

Ouvrir **http://127.0.0.1:5174** ou directement **http://127.0.0.1:5174/portail**.

Le lanceur API fixe les limites PHP pour permettre les fichiers jusqu’à 15 Mio, sans modifier le `php.ini` global. Le proxy Vite relaie `/api` vers `http://127.0.0.1:8002`. Aucun changement du fichier `.env` du backend n’est nécessaire pour ce fonctionnement local. Après compilation, `npm run preview` sert le build sur `http://127.0.0.1:4174`, avec le même proxy local. Ce proxy n’existe pas dans les fichiers statiques déployés : configurer l’URL d’API de production avant compilation.

Le fichier `.env.example` documente les variables ; aucun fichier `.env` ni secret du CRM historique n’a été copié.

### Comptes de démonstration

Si `DemoSeeder` a été exécuté dans `comsig-v2` : `awa` (commercial), `dircom`, `dg`, `finance`, `prod`, `regie`, `rh`, `flotte`, `yao`, `admin`. Mot de passe local : `Demo-Comsig-2026!`.

Ne jamais déployer ces comptes de démonstration en production. Le rappel des identifiants dans l’écran de connexion n’existe qu’en mode développement.

## Authentification navigateur

Le frontend utilise désormais une session Laravel par cookie **HttpOnly**, avec CSRF. Aucun jeton d’authentification n’est conservé dans localStorage/sessionStorage, ni dans l’URL. Une actualisation conserve la connexion ; la session expire après la durée d’inactivité configurée par le serveur (120 minutes par défaut).

Le client initialise `/sanctum/csrf-cookie`, puis appelle `POST /api/v1/auth/session`. Il recharge `/auth/me` au démarrage et au retour sur l’onglet. La déconnexion est synchronisée entre onglets ; une panne réseau n’est pas présentée comme une déconnexion réussie. Le changement obligatoire de mot de passe est pris en charge ; modifier son mot de passe révoque les jetons et invalide les sessions navigateur.

MFA TOTP et récupération de compte sont disponibles depuis la [clôture locale de P02](docs/VERIFICATION-P02-COMPLETE.md), ainsi que notifications serveur avec état lu et exports communs. Les e-mails de récupération locaux sont des `.eml` privés côté backend, sans envoi externe ; la MFA reste active lors d’une réinitialisation de mot de passe.

En développement, Vite relaie `/api` **et** `/sanctum` vers Laravel. Architecture choisie pour la production : React Vercel + API Hostinger, sous-domaines d’un même domaine, HTTPS/CORS/stateful explicites. Voir `.env.production.example` et le modèle backend `.env.vercel-hostinger.example`. Un domaine `vercel.app` indépendant d’Hostinger ne suffit pas à ces cookies. Noms réels, DNS/TLS, SMTP et recette distante restent à configurer en P12 ; aucun déploiement effectué.

## Vérifications

```powershell
npm run typecheck
npm test
npm run build
npm audit
```

Les tests unitaires couvrent permissions, sérialisation des formulaires, formatage et erreurs HTTP. Le typecheck inclut aussi les sources historiques conservées. Le build de production n’inclut que l’application active et ses ressources importées.

Tests navigateur avec les vrais services locaux :

```powershell
$env:PHP_BIN = 'C:\wamp64\bin\php\php8.2.29\php.exe'
npm run test:e2e
```

Pour tester le build compilé plutôt que le serveur de développement : exécuter `npm run build`, puis `$env:E2E_PREVIEW = '1'` avant `npm run test:e2e`. Retirer cette variable pour revenir au mode développement.

Playwright teste les parcours CRM et ERP, avec double validation financière, RH/paie/PDF, flotte, nomenclature et fabrication. Le serveur de test dispose de plafonds de connexion spécifiques (100/IP et 30/compte/minute) pour la recette multi-profils ; les valeurs normales restent 10/IP et 5/compte/minute. **Ils créent des données de test dans la base locale V2, sans suppression automatique.** Ils ne migrent ni ne réinitialisent aucune base. Installer Chromium avec `npx playwright install chromium` seulement si nécessaire.

La recette utilise par défaut des serveurs isolés sur `127.0.0.1:5199` (frontend) et `127.0.0.1:8019` (API), sans réutiliser les serveurs de développement 5174/8002. Les variables `E2E_FRONTEND_PORT` et `E2E_API_PORT` permettent de choisir d’autres ports libres. Le lanceur applique aussi les limites de fichiers locales au vrai processus PHP et un plafond API de recette, sans modifier les paramètres normaux de l’application.

La CI exécute les tests unitaires et la compilation ; les tests navigateur nécessitent le projet backend et sa base locale de démonstration.

## Livraison statique

```powershell
npm run build
```

Le résultat est dans `dist/`. Il peut être servi sans processus Node permanent. `public/.htaccess` fournit le fallback de navigation pour Apache ; `vercel.json` contient la configuration équivalente pour Vercel. Aucun déploiement distant n’a été effectué.

Voir [Déploiement](docs/DEPLOIEMENT.md) et [Architecture et migration](docs/ARCHITECTURE.md).
