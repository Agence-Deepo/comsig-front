# P02 — Socle commun réalisé en local

3 novembre 2026. Autorisation reçue : « termine totalement la p2 et attaque la p3 ». Statut : **réalisé techniquement en local, validation utilisateur en attente**. Ce rapport complète les passes historiques [P02-A](VERIFICATION-P02.md) et [P02-B](VERIFICATION-P02B.md) ; il ne vaut pas mise en production.

Non-régression ultérieure : [P03-B](VERIFICATION-P03B.md), 139 tests Laravel, 38 tests frontend, 38 scénarios navigateur réussis ; les nombres ci-dessous restent ceux de la clôture P02/P03-A.

Passe suivante [P03-C](VERIFICATION-P03C.md) : 150 tests Laravel, 41 tests frontend et 40 scénarios navigateur réussis, socle P02 conservé.

## Livré

- Session persistante HttpOnly/CSRF, rechargement, déconnexion multi-onglets, profil, droits réels et révocation : conservés.
- MFA TOTP opérationnelle : QR généré localement, confirmation avant activation, dix codes de secours affichés une seule fois, anti-rejeu, annulation de configuration, renouvellement et désactivation avec vérification du mot de passe et du second facteur. Les autres sessions/jetons sont révoqués lors des changements de sécurité.
- Récupération de mot de passe : formulaire, message français, jeton haché expirant à usage unique, réinitialisation et révocation. La récupération **ne contourne pas** une MFA active.
- Pièces jointes privées, versions, corbeille et audit sur 26 ressources : conservés. Dans les nouvelles fiches client P03, elles se trouvent dans l’onglet **Documents**.
- Notifications serveur réelles : tâches échues/du jour et propositions à examiner, périmètres et droits recontrôlés, état lu persistant par utilisateur, fermeture au clavier/clic extérieur et compteurs non limités à une page.
- Composant d’export authentifié commun ; CSV organisations/contacts partageant les filtres des listes, erreurs et chargement explicites. Les PDF/CSV existants restent disponibles.
- Formulaires/modales/tableaux CRM réemployés ; erreurs de champ non répétées, focus immédiat, confirmations, filtres persistants, mobile et absence de débordement testés dans les parcours concernés.
- Architecture retenue avec l’utilisateur : **React Vercel + API Hostinger, sous-domaines d’un même domaine**. Exemples de configuration fournis, contrôle statique `comsig:check-browser-security`, sans secret imprimé ni modification distante.

La MFA est individuelle, pas activée de force sur les comptes de démonstration. Les tests de MFA/mot de passe portent sur de nouveaux comptes de recette isolés, jamais sur tes identifiants usuels.

## Essayer

1. [Profil local](http://127.0.0.1:5174/profil) : saisir le mot de passe actuel dans la carte MFA, scanner le QR avec une application TOTP, confirmer, puis conserver les codes hors du CRM. Un code déjà utilisé ne fonctionne pas deux fois ; attendre le suivant ou utiliser un code de secours.
2. [Récupération locale](http://127.0.0.1:5174/mot-de-passe-oublie) : saisir l’e-mail du compte. **Aucun e-mail externe** : les messages de recette sont dans `C:\wamp64\www\comsig-v2\storage\app\mail-private`, sans accès HTTP. Ouvrir le `.eml` depuis le poste autorisé et suivre son lien. Une adresse inconnue reçoit la même réponse, sans message privé créé.
3. Cloche : consulter une échéance réelle, l’ouvrir ou marquer la liste comme lue, puis actualiser pour vérifier la persistance.
4. [Clients](http://127.0.0.1:5174/clients) : filtrer puis exporter en CSV ; ouvrir une fiche et son onglet Documents. [Prospection](http://127.0.0.1:5174/prospection) démarre P03.

Ne pas partager les fichiers `.eml`, QR ou codes de secours. Aucun lien secret n’est ajouté dans les captures publiables ; les codes des comptes de test y sont masqués.

## Vérifications

| Contrôle | Résultat |
|---|---|
| Laravel complet, PHP 8.2.29 / SQLite isolé | 128 tests, 819 assertions réussis |
| Frontend | 37 tests unitaires réussis ; TypeScript et build réussis |
| Nouveaux parcours Chromium | 5 réussis : MFA complète, récupération réelle locale, notifications, P03 ordinateur et mobile |
| Recette navigateur globale | 36 scénarios réussis, sans scénario ignoré, sur le build compilé et la vraie API |
| Contrat généré | 75 chemins OpenAPI ; 97 entrées de routes API Laravel |
| Prérequis de session locaux | Contrôle statique des origines/cookies/stockage réussi |
| Inventaire, liens et conservation des références | 10 contrôles réussis ; 94 copies historiques TS/TSX/CSS inchangées |
| Dépendances PHP | Composer valide, prérequis présents ; aucun avis de vulnérabilité signalé lors du contrôle |
| Parcours P03 sur MySQL Wamp, frontend 5174/API 8002 | 1 scénario réussi : création détaillée, premier contact, qualification, contact, filtres, CSV et onglets |

Les limites de session, CSRF réel, refus de portefeuille/service, formats déguisés et quotas documentaires restent couverts. Les nouveaux tests API ajoutent anti-rejeu TOTP/Bearer/codes de secours, expiration/configuration annulée, cinq échecs de défi, récupération sans désactiver la MFA, CORS et rejet de configurations de production incomplètes.

L’inspection mobile a détecté un conteneur de fiche non étiré et un risque de nom long ; ils ont été corrigés. Les sélecteurs d’anciens tests ont été limités à leur fenêtre/zone pour ne pas confondre les nouveaux contrôles. Le vrai parcours de récupération lit le `.eml` du mailer privé de recette et suit le lien ; aucune réponse de succès factice ni SMTP distant dans ce test.

Captures : [profil MFA, codes masqués](apercu-p02-mfa-desktop.png), [prospection](apercu-p03-prospection-desktop.png), [contacts](apercu-p03-contacts-desktop.png), [fiche mobile](apercu-p03-client-mobile.png).

## Environnement et prérequis avant production

React **5174**, Laravel **8002**, MySQL Wamp conservés. Deux migrations additives appliquées seulement à la base locale V2 ; aucune réinitialisation, aucun import et aucun seeder exécuté sur MySQL. Les projets source `comsig` et `comsig-crm` restent inchangés.

Le scénario MySQL a ajouté un [prospect TEST P03](http://127.0.0.1:5174/clients/01a1a19a-98fb-7200-90e9-3238561ca502), son appel planifié et un contact décideur en opposition aux sollicitations, conservés pour ton essai. Aucun compte usuel n’a changé de mot de passe ou activé sa MFA pendant la recette.

La recette complète utilise une nouvelle base SQLite `comsig-v2/tmp/p02c-p03a-20261103.sqlite`, un stockage et une boîte mail dédiés, avec serveurs temporaires 5176/8004. Ces artefacts privés restent isolés et reproductibles. Aucune suppression de données existantes.

Les serveurs temporaires 5175/5176/8004 sont arrêtés après vérification. Les données et courriels de recette privés restent sur disque, hors des espaces publics ; leurs sorties automatiques sont ignorées par Git. Les captures sélectionnées sont conservées dans `docs/` et les codes de secours y sont masqués.

Les domaines réels, DNS/TLS, variables Vercel/Hostinger, SMTP et essai cross-origin distant ne sont pas configurés : ils nécessitent les valeurs et accès d’exploitation et restent dans **P12**. Le code est prêt à les recevoir, pas un site distant déjà validé. Prévoir sauvegarde/restauration avec APP_KEY, traitement des pertes de MFA et politique antivirus/rétention des pièces.

Le bundle compile avec un avertissement de taille d’environ 512 Ko minifiés (environ 153 Ko gzip), non une erreur de build. Pas de génération Word/XLSX, messagerie/SMS ou automatismes des futurs modules annoncés comme terminés par ce socle. Trois traitements sont déclarés dans le planificateur, dont le nettoyage des jetons de récupération expirés ; aucun cron externe installé.

Contrat détaillé : `C:\wamp64\www\comsig-v2\docs\SECURITY-API.md`. **P03 a commencé avec le sous-lot [P03-A](VERIFICATION-P03A.md)** ; sa parité exhaustive et le classement client restent à poursuivre.
