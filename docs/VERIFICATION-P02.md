# P02-A — Session persistante, droits et profil

Rapport de cette passe historique ; pour l’état actuel, voir [la clôture locale P02](VERIFICATION-P02-COMPLETE.md), puis [P03-A](VERIFICATION-P03A.md). Les limites MFA/récupération de cette ancienne passe ne décrivent plus la version actuelle.

Réalisé le 3 novembre 2026, après autorisation de démarrer ce sous-lot. Statut : réalisé techniquement, à tester/valider ensemble. P02 complet reste partiel.

## Ce qui change

- Connexion React par session Laravel **HttpOnly**, et non par jeton conservé en mémoire. Actualiser ou ouvrir un deuxième onglet conserve l’identité connectée tant que la session reste valide.
- Initialisation CSRF avant connexion ; header CSRF sur chaque mutation ; rotation de l’identifiant de session et du CSRF à la connexion. Aucun secret d’authentification dans localStorage, sessionStorage ou l’URL.
- Identité chargée depuis `/auth/me` au démarrage et au retour sur l’onglet. Le garde de navigation attend la réponse avant d’afficher les données ; une panne réseau propose de réessayer, sans prétendre que l’utilisateur est déconnecté.
- Déconnexion synchronisée entre onglets. Une réponse tardive d’une ancienne connexion ne ferme pas la nouvelle. Une erreur réseau lors de la déconnexion reste visible et n’est pas annoncée comme une fermeture réussie.
- Nouveau profil utilisant les composants CRM : compte, rôle/service/périmètre, droits attribués en lecture, état de session et formulaire de mot de passe avec erreurs par champ.
- Changement de mot de passe : contrôle du mot de passe actuel, confirmation, politique existante de 12 caractères, révocation des jetons et session courante ; les autres sessions sont refusées à leur prochaine requête grâce au contrôle du hash de mot de passe.
- Les mots de passe temporaires continuent à bloquer les routes métier tant qu’ils ne sont pas changés. Les permissions et portefeuilles restent contrôlés côté Laravel ; aucun nouveau rôle ni droit n’est accordé dans ce lot.
- Ancien lien `/rh/agents/:id` corrigé vers `/effectif/:id`. Sections admin utilisateurs/départements/catalogue/audit reliées aux écrans existants. Les autres sections affichent toujours une attente explicite, sans fausse fiche `/utilisateurs/:section`.
- Un invité API reçoit un JSON 401 même sans en-tête Accept, au lieu de provoquer une tentative de redirection vers une page Blade inexistante.

## Contrat HTTP

| Appel | Résultat |
|---|---|
| `GET /sanctum/csrf-cookie` | Initialise les cookies anonymes session/CSRF |
| `POST /api/v1/auth/session` | Identifiants et département facultatif ; retourne utilisateur/métadonnées de session, aucun jeton |
| `GET /api/v1/auth/me` | Identité, rôle, service et métadonnées actualisés ; réponse non stockable |
| `POST /api/v1/auth/logout` | Invalidation de la session courante, ou révocation du jeton pour un client API |
| `PUT /api/v1/auth/password` | Modification puis révocation ; reconnexion nécessaire |
| `POST /api/v1/auth/login` | Compatibilité conservée pour les clients API non-stateful ; React ne l’utilise plus |

Le frontend emploie `credentials: include`, lit seulement le cookie CSRF et le transmet URL-décodé dans `X-XSRF-TOKEN`. Les requêtes API ne sont pas mises en cache HTTP côté client. Les erreurs 401, 419 ou la révocation explicite du compte effacent l’état local ; un simple refus métier 403 ne ferme pas la session. Les mutations ne sont pas rejouées automatiquement. Pour la déconnexion, le CSRF est rafraîchi avant l’appel et les erreurs restent affichables jusqu’à une nouvelle tentative explicite.

Durée actuelle : 120 minutes d’inactivité par défaut, fournie par `SESSION_LIFETIME`. C’est la durée de session Laravel, pas l’expiration de 12 heures des jetons API. Aucun mécanisme « se souvenir de moi » n’a été ajouté.

La solution suit le [circuit SPA de Sanctum](https://laravel.com/framework/docs/12.x/sanctum), en conservant la compatibilité des clients Bearer. Le [contrat API backend](C:/wamp64/www/comsig-v2/docs/API.md) et [OpenAPI](C:/wamp64/www/comsig-v2/docs/openapi.json) ont été actualisés : 79 routes API, 58 chemins OpenAPI incluant le point d’entrée CSRF hors `/api/v1`.

## Vérifications

| Contrôle | Résultat |
|---|---|
| Laravel, PHP 8.2.29, base SQLite de test | 81 tests réussis, 448 assertions |
| Dont nouvelle suite navigateur/session côté API | 13 tests, CSRF réellement activé dans cette suite ; cookies, expiration, droits, rotation et révocation |
| Tests unitaires frontend | 28 réussis |
| TypeScript et build Vite | Réussite |
| Chromium sur le build compilé et API Laravel réelle | 24 parcours réussis, dont les 10 nouveaux parcours session/profil |
| Comparaisons publiques source/cible | Portail, connexion directe et Commerciale : PNG identiques en 1440 × 960 |
| Mobile profil | 390 × 844, session conservée et absence de débordement global |
| Sources historiques TS/TSX/CSS | 94 fichiers comparés, aucune différence ; projets CRM/ERP source inchangés |
| Inventaire actualisé et contrôles de couverture/liens | 10 contrôles réussis sur 10 |
| Serveurs habituels React 5174 / Laravel 8002 avec MySQL Wamp | Un test navigateur supplémentaire réussi : connexion, actualisation de liste, profil, cookie HttpOnly et déconnexion |

Les parcours navigateur de cette recette utilisent une **base SQLite temporaire distincte** de la base MySQL locale, avec le vrai backend et ses migrations. Les comptes, salariés, devis, factures et autres pièces `TEST` sont des données de recette dans cette base dédiée. Le mot de passe changé appartient à un utilisateur de test créé pour ce scénario, pas à un compte de démonstration existant de la base Wamp.

Les échecs réseau sont provoqués explicitement dans deux tests pour contrôler le traitement d’erreur. Les seules fixtures de la comparaison visuelle concernent les métadonnées publiques de la référence CRM. Les opérations métier testées utilisent le vrai serveur, pas une fausse API.

Aperçus inspectés : [profil ordinateur](apercu-p02-profil-desktop.png) et [profil mobile](apercu-p02-profil-mobile.png). Ils montrent les composants CRM repris, sans prétendre reproduire la carte MFA fonctionnelle de la source.

### Parcours session/profil

1. Connexion, accès direct à une liste, actualisation, cookie HttpOnly et profil avec droits réels.
2. Deux onglets, déconnexion, reconnexion avec un autre compte et absence de cache d’identité précédent.
3. Déconnexion en panne réseau, message visible, session encore valide puis nouvelle tentative réussie.
4. Perte de cookie simulant une session expirée, retour à la connexion puis reprise de l’URL protégée.
5. Panne réseau lors du chargement initial de session puis nouvelle tentative réussie.
6. Refus d’accès admin sans fermeture de session ; mutation sans CSRF refusée réellement par Laravel.
7. Correspondances des liens d’administration et attente explicite des sections non portées.
8. Ancien lien RH vers une vraie fiche de salarié de test.
9. Mot de passe temporaire, confirmation différente, mauvais mot de passe actuel, modification réussie et refus d’une seconde session indépendante.
10. Profil mobile, rechargement connecté et contrôle de largeur.

La suite complète conserve les parcours commercial, devis/facture/règlement, stocks, trésorerie, RH/paie, flotte, production/régie et navigation. Elle ne certifie pas les fonctionnalités de ces modules qui restent non portées.

## Reproduire

Backend : `C:\wamp64\www\comsig-v2`.

```powershell
& C:\wamp64\bin\php\php8.2.29\php.exe artisan test --compact
```

Frontend : `C:\wamp64\www\comsig-front-v1`.

```powershell
npm test
npm run build
```

Pour refaire les parcours isolés, préparer une base SQLite **de recette distincte**, appliquer les migrations et `DemoSeeder` uniquement dans cette base, puis définir `P02_QA_DATABASE` avec son chemin absolu avant `npx playwright test --config=playwright.local-qa.config.ts`. Le serveur QA écoute sur 8004 et le frontend compilé sur 5176. `CRM_REFERENCE_URL=http://127.0.0.1:5175` active les trois comparaisons si le serveur Vite de la référence est lancé sur 5175 ; sinon ces tests sont explicitement ignorés. Ne pas lancer une réinitialisation/migration de recette sur une base contenant des données réelles.

Les serveurs locaux habituels restent `http://127.0.0.1:5174` (React) et `http://127.0.0.1:8002` (Laravel/MySQL Wamp). Ils ne sont pas remplacés par les serveurs de recette.

Après la recette, le serveur de référence 5175 a été arrêté et la base SQLite temporaire, contenant uniquement les données de test de ce lot, a été supprimée (non conservée pour récupération ; recréable par migrations/seeders). Les serveurs habituels et les bases historiques/MySQL sont conservés.

## Limites et suite

- MFA et récupération/réinitialisation par e-mail non implémentées. Le profil le signale ; aucune fausse MFA n’est présentée comme active. Les rôles source manquants ne sont pas créés avec des permissions improvisées.
- Architecture de production non figée. Il faut confirmer domaines, HTTPS, stockage de session, durée, CORS et hôtes stateful. Configuration `.env.example` fournie, aucun secret ni `.env` réel modifié.
- Pour React sur Vercel et Laravel chez Hostinger : utiliser des sous-domaines du même domaine ou un proxy de même origine. Le couple `vercel.app` + domaine Hostinger indépendant n’est pas validé par cette recette locale ; il ne faut pas contourner le problème avec un jeton dans localStorage.
- Aucun déploiement, import historique, e-mail, SMS, tâche planifiée, paiement réel ou appel FNE exécuté.
- GED privée, composants communs restant à harmoniser, notifications et exports complémentaires relèvent de P02-B et des lots métier.

La compétence Sites a été appliquée en mode local uniquement : conservation des composants et du style CRM, prévisualisation locale, vérification du build et des rendus, sans publication. Les validations métier/utilisateur et la recette complète de production restent distinctes de cette vérification technique.
