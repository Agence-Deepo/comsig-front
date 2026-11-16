# Rétablissement de l’interface CRM — 3 novembre 2026

## Référence et périmètre

La référence est `C:\wamp64\www\comsig-crm\web\src`, et non l’ancien ERP PHP. Les projets source n’ont pas été modifiés. Le frontend actif reste React, connecté à Laravel V2 ; il ne démarre pas le backend Node.

### Repris de la source

- Portail à **neuf tuiles**, mêmes images, composition, textes et liens par département.
- Connexion directe et connexion de département : même structure, illustrations, champs et composants.
- Menu latéral par groupes repliables, préférences par utilisateur, barre de recherche Ctrl+K, menu utilisateur et thèmes clair/sombre/système.
- Couleurs de département issues des migrations du CRM source ; même logo et typographie.
- Gabarit du tableau de bord et graphiques d’origine, composants PageHeader, Card, DataTable, Tabs, Segmented et Badge réutilisés. Les modales reprennent le balisage CRM avec un focus immédiat, sans minuterie susceptible de déplacer la saisie.
- Opportunités en Kanban avec confirmation de déplacement et vue liste ; devis avec filtres de statut ; clients avec onglet contacts. PDF, stocks, circuits financiers et modules ERP conservent leurs API Laravel.

## Ce qui est vérifié à l’identique

`e2e/crm-parity.spec.ts` compare le portail, la connexion directe et la connexion Commerciale avec un serveur Vite de la source, sous Chromium en 1440 × 960. Après chargement des polices et des images, les captures PNG et les dimensions des conteneurs sont identiques, y compris sur le build compilé.

Le serveur de référence reçoit uniquement des fixtures de métadonnées publiques et un utilisateur non connecté pour ces trois comparaisons. **Aucune donnée métier simulée n’est activée dans l’application Laravel testée.** Cette comparaison ne vaut pas certification de toutes les pages, de tous les profils et de toutes les tailles d’écran.

## Raccordement fonctionnel

La connexion de département envoie `department` à Laravel, qui vérifie le département **avant** de créer la session. La connexion directe conserve son comportement. Le serveur refuse toujours les accès hors rôle/service ; l’adaptateur visuel ne crée aucune permission.

L’onglet contacts utilise `GET /api/v1/contacts`, cloisonné par les organisations accessibles. Les recherches devis/opportunités sont filtrées côté serveur ; leur regroupement SQL ne peut pas ouvrir les autres portefeuilles. Les responsables visibles dans les listes ne sont exposés que sous la forme `id`/`name` d’un dossier déjà autorisé.

Le tableau de bord calcule les indicateurs depuis les listes paginées accessibles. Les objectifs et le suivi des relances ne sont pas encore raccordés ; ils ne sont pas remplacés par des nombres inventés. Faute de date de clôture dédiée dans V2, les agrégats de gains/pertes utilisent la dernière mise à jour, ce qui est indiqué dans l’interface. Ce calcul client doit devenir un agrégat serveur pour de gros volumes.

La cloche affiche les échéances des tâches réelles : ce n’est pas encore le service de notifications/messagerie historique. Les liens conservés vers des fonctions non portées aboutissent à un écran explicite « Raccordement à finaliser ».

## Ce qui n’est pas encore identique écran par écran

Les fiches détaillées, l’éditeur de devis, le calendrier et plusieurs formulaires restent ceux adaptés à l’API Laravel. Ils utilisent maintenant le design system CRM mais ne constituent pas une copie exhaustive de leurs homologues historiques. Les champs, filtres avancés et fonctions dont l’API manque ne sont pas présentés comme opérationnels. Les écrans ERP nouvellement portés n’ont pas tous un équivalent strict dans le CRM source.

P02 local est raccordé : session HttpOnly/CSRF, profil/droits, mot de passe, MFA TOTP avec QR/codes de secours et récupération sans contournement de la MFA ; pièces privées sur 26 ressources, notifications réelles avec état lu et exports communs. Voir [la clôture P02](VERIFICATION-P02-COMPLETE.md). L’architecture Vercel/Hostinger à sous-domaines communs est choisie, pas déjà déployée/configurée à distance.

[P03-A](VERIFICATION-P03A.md) remplace les listes/fiches clients génériques et l’alias prospection par de vrais écrans : champs détaillés, filtres, qualification, contacts et onglets de dossiers accessibles. Les éléments métier restent cloisonnés, notamment les factures. Cela ne termine pas les doublons/fusion, la vue 360° et la parité exhaustive. Contrats, assistant, messagerie, GED globale et rapports avancés restent à raccorder. Voir [ERP](ERP.md).

## Reproduire les vérifications

```powershell
# Dans le dossier du CRM source, serveur de référence visuelle uniquement :
Set-Location C:\wamp64\www\comsig-crm\web
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort

# Autre terminal, après avoir démarré Wamp :
Set-Location C:\wamp64\www\comsig-front-v1
npm run build
$env:CRM_REFERENCE_URL='http://127.0.0.1:5175'
node node_modules/@playwright/test/cli.js test --config=playwright.local-qa.config.ts
```

Le build est servi temporairement sur **5176**, avec une API de test sur **8004**. Par défaut elle utilise la base MySQL V2 configurée et y crée des données `TEST` sans les supprimer automatiquement. Pour P02-B, `P02_QA_DATABASE` pointe vers une nouvelle base SQLite dédiée préalablement migrée/ensemencée et `P02B_QA_STORAGE` vers son stockage documentaire temporaire : voir le rapport correspondant. Les serveurs utilisateur **5174/8002** restent indépendants. Le processus API de recette utilise un cache en mémoire et des plafonds de connexion 100/30 ; le serveur utilisateur garde ses paramètres normaux. Les tests publics seuls peuvent tourner sans MySQL avec `playwright.visual.config.ts`.

Voir [le rapport de recette](VERIFICATION-CRM.md) pour les résultats et captures de cette passe.
