# Architecture du frontend et migration

## Application active

`index.html` → `src/main.tsx` → `src/v2/main.tsx`.

`src/v2` regroupe :

| Fichier | Responsabilité |
|---|---|
| `api.ts` | URL configurable, jeton en mémoire, erreurs Laravel 401/403/422/429, requêtes JSON |
| `auth.tsx` | Utilisateur courant, connexion, déconnexion et vidage du cache |
| `types.ts` | Contrats de base, permissions et affichage FCFA / dates |
| `modules.ts` | Métadonnées des listes, colonnes, formulaires et permissions |
| `forms.tsx` | Formulaires accessibles, références paginées, conversion des valeurs et PATCH des seuls champs modifiés |
| `Records.tsx` | Listes paginées, recherche côté serveur, filtres et fiches |
| `actions.tsx` | Contacts, transitions commerciales, validations des devis, mouvements et règlements |
| `QuoteEditor.tsx` | Devis multilignes et simulation des montants par l’API |
| `Workspace.tsx` | Calendrier et avancement ; anciens gabarits V1 non utilisés pour l’accueil et le pipeline |
| `CrmPortal.tsx`, `CrmLogin.tsx` | Portail et connexions repris du CRM, contrôle du département à la connexion |
| `CrmLayout.tsx`, `crmIdentity.ts` | Structure CRM, groupes repliables, thèmes et adaptation des permissions Laravel |
| `CrmDashboard.tsx`, `crmMetrics.ts` | Gabarit du tableau de bord d’origine, agrégats réels, limites de calcul explicites |
| `CrmPipeline.tsx`, `CrmSearch.tsx`, `CrmRoutes.tsx` | Kanban avec confirmation, recherche dans le périmètre autorisé, alias et fonctions à porter |
| `Account.tsx` | Profil et changement de mot de passe ; ancien portail/ancienne connexion non utilisés |
| `Admin.tsx` | Services et journal d’audit |
| `ui.tsx` | PageHeader, Badge et Empty CRM ; gabarit des modales CRM avec focus synchrone, erreurs et pagination |
| `styles/app.css`, `styles/work.css` | Styles historiques actifs, réutilisés sans modification |
| `crm-compat.css`, `erp.css` | Adaptation des formulaires/détails Laravel et écrans ERP ; l’ancienne `v2/styles.css` n’est plus chargée |

Le routage garde les modules actifs séparés des écrans historiques. Les requêtes passent par TanStack Query : séparation des données par clé, invalidation après écriture, absence de relance automatique des écritures. À la déconnexion, le cache est effacé pour éviter de conserver les données du précédent profil.

Les échéances `due_at` de l’API actuelle sont des dates SQL en UTC. Le client convertit la saisie locale en `AAAA-MM-JJ HH:mm:ss` UTC pour MySQL, puis reconvertit les dates reçues vers le fuseau du navigateur pour l’affichage. Les dates sans heure (validité d’un devis, échéance de facture) restent des dates civiles, sans décalage de jour.

Les sélecteurs de référence parcourent la pagination de l’API, sans limiter silencieusement la sélection aux 25 premiers clients. Ils ont un garde-fou explicite de 10 000 lignes ; pour les gros volumes, ajouter un endpoint de recherche ciblée et un sélecteur asynchrone.

## Reprise du CRM source

La copie des fichiers de `comsig-crm/web/src` est conservée pour éviter de perdre les écrans, composants et visuels existants. Son ancien routeur a été déplacé en `src/legacy-main.tsx`. Les anciennes fonctions d’API `/api/...` ne sont pas utilisées par l’application active, qui cible `/api/v1/...`.

Les contrats JSON sont différents : authentification par cookie Node vs jeton Sanctum actuel, `data` Laravel, pagination, permissions `module.action`, noms des champs et circuits simplifiés. Remplacer seulement l’URL du serveur Node ne suffit donc pas à connecter ces anciens écrans à Laravel.

Pour porter un module :

1. Reprendre les comportements utiles de son écran source.
2. Implémenter et tester son API Laravel et ses permissions.
3. Ajouter ses types et ses appels dans `src/v2` ou un sous-dossier métier de ce répertoire.
4. Ajouter ses routes et entrées de navigation, puis retirer son statut « à porter » côté backend.
5. Tester les cas interdits autant que les cas de succès ; ne pas simuler une réussite pour une route absente.

## Limites métier visibles

**Extension ERP livrée depuis cette première architecture :** `erpModules.ts` déclare 19 ressources, `ErpPanels.tsx` gère leurs actions et documents, `forms.tsx` prend en charge les lignes structurées. Voir [ERP](ERP.md) pour les circuits et limites actuels.

- Marquage d’envoi des devis, sans envoi d’e-mail. PDF disponibles ; Word/XLSX non portés.
- Connecteur FNE livré mais désactivé ; aucune recette réelle ni visuel fiscal agréé dans ce lot. Pas d’avoirs.
- Double contrôle des règlements désormais appliqué ; comptabilité manuelle à double entrée et trésorerie disponibles, sans génération automatique des écritures depuis la trésorerie.
- Calendrier chronologique des tâches/activités, pas encore de réservation de supports ou de synchronisation externe.
- Réattribution des dossiers existants, imports, pièces jointes, contrats, assistant, messagerie et rapports avancés non portés. RH, paie préparatoire, flotte, production et régie ont leurs nouveaux écrans actifs, dans les limites documentées.
- Les départements désactivés ne sont pas listés par l’API actuelle ; prévoir une route d’administration dédiée pour leur réactivation.
- Pas de mode hors connexion : toute écriture passe par Laravel ; aucun faux succès local.

## Tests

Les tests unitaires vérifient le client HTTP et les transformations sensibles. Les parcours navigateur utilisent les comptes de démonstration de la base V2 locale. Ils ajoutent leurs propres tiers, opportunités, contacts, devis, factures, règlements et articles avec des libellés de test, sans modifier les bases des deux projets historiques.
