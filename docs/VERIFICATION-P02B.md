# P02-B — Pièces jointes privées

Rapport historique de P02-B. La [clôture locale de P02](VERIFICATION-P02-COMPLETE.md) et [P03-A](VERIFICATION-P03A.md) le complètent ; les pièces des nouvelles fiches client se consultent désormais dans l’onglet Documents, pas sous la fiche générique.

3 novembre 2026 — réalisé techniquement, **validation utilisateur en attente**. Ce lot a été autorisé par « vas y fait le ». Aucun déploiement, import historique, e-mail, paiement ou appel FNE réel.

## Ce qui est disponible

Le bloc **Documents** est raccordé aux fiches des 7 ressources CRM prises en charge et des 19 ressources ERP : ajout, type contextuel, métadonnées, versions, téléchargement privé, corbeille, suppression logique et restauration. Les PDF, images, DOCX/XLSX et CSV admissibles sont contrôlés côté serveur ; plafond applicatif de 15 Mio, quotas de 100 pièces/150 Mio par dossier, versions et corbeille incluses.

Les droits suivent toujours la fiche : lecture pour télécharger, lecture + modification pour gérer les pièces. Pas d’accès RH accordé au profil flotte, pas de lecture du portefeuille d’un autre commercial, pas de droits métier ajoutés à l’administrateur technique. Les CV sont proposés sur les salariés, les fiches de paie sur les bulletins ; le bon classement du contenu reste indispensable.

Les Card, champs, badges et couleurs du CRM sont réutilisés, avec confirmation au clavier et mise en page mobile. Le travail est resté local conformément au parcours Sites retenu, avec inspection des captures. **Cela ne rend pas toutes les fiches historiques identiques** : la reprise exhaustive des onglets et formulaires reste dans les lots suivants.

## Tester maintenant

1. Ouvrir [le frontend local](http://127.0.0.1:5174/clients). Compte de démonstration local `awa`, mot de passe `Demo-Comsig-2026!` si ces identifiants n’ont pas été changés.
2. Ouvrir une fiche client, opportunité ou devis, puis le bloc **Documents**. Un [client TEST de cette recette](http://127.0.0.1:5174/clients/01a1a167-b058-70b2-9565-21bfca5ec13d) est conservé avec deux versions d’un PDF sans valeur commerciale.
3. Choisir le type, joindre un fichier, le télécharger ; joindre le même nom pour créer la version suivante.
4. Supprimer une version, cliquer « Voir les documents supprimés », puis restaurer. Actualiser la page pour vérifier la persistance.
5. Vérifier avec un autre profil : les pièces hors périmètre ne doivent pas être lisibles, même en connaissant leur UUID.

React reste sur **5174**, Laravel sur **8002**, MySQL Wamp conservé. Le serveur Laravel a été redémarré avec `scripts/serve-local.ps1` du backend : limites PHP appliquées au seul processus local, sans modifier `php.ini` global ni le `.env`. Le README décrit le redémarrage.

## Preuves techniques

| Vérification | Résultat |
|---|---|
| Suite Laravel complète, PHP 8.2.29, SQLite isolé | 102 tests, 648 assertions réussis |
| Tests unitaires React | 34 tests réussis |
| TypeScript et build Vite | Réussis |
| Navigateur Chromium, build compilé et vraie API | 31 scénarios réussis, dont 7 sur les pièces jointes |
| Inventaire et liens documentaires | 10 contrôles réussis ; 94 copies historiques TS/TSX/CSS inchangées |
| Parcours documents sur MySQL Wamp, frontend 5174/API 8002 | 1 test réussi : ajout, versions, octets téléchargés, suppression/restauration et rechargement |
| Composer | Validation stricte et prérequis de plateforme réussis ; ajout des exigences fileinfo/zip sans changement de version des paquets |

La suite navigateur comprend 7 scénarios documents : cycle complet, refus autre commercial/invité, stock en lecture seule, confidentialité RH, formats déguisés, tailles et mobile. Un fichier supérieur à 2 Mio a été accepté ; les limites applicative 15 Mio et HTTP/PHP ont aussi été testées directement. Les autres scénarios couvrent sessions, CRM, ERP et les trois vues publiques comparées à la source. Deux sélecteurs de l’ancien test stock ont été précisés pour distinguer le champ « Type » de la fenêtre de mouvement du nouveau champ « Type de document ».

Les recettes complètes utilisent une **nouvelle base SQLite temporaire dédiée**, un stockage documentaire temporaire dédié et les ports 8004/5176. Aucun nettoyage ou réensemencement de la base MySQL utilisateur. Le parcours MySQL distinct a ajouté seulement son client `TEST P02B documents` et deux PDF de recette ; ils sont volontairement conservés pour ta vérification. Les pièces existantes n’ont pas été supprimées.

Les serveurs temporaires 5175/5176/8004 sont arrêtés. Le nettoyage des artefacts de recette a été refusé par la protection d’exécution : la base `comsig-v2/tmp/p02b-qa-20261103.sqlite` et le répertoire `comsig-v2/tmp/p02b-attachments-qa` restent donc sur disque, distincts du stockage utilisateur. Aucune suppression n’a été effectuée. Les serveurs de travail 5174/8002 restent disponibles.

Captures de recette : [ordinateur](apercu-p02b-documents-desktop.png), [mobile](apercu-p02b-documents-mobile.png).

## Fichiers principaux

- Front : `src/v2/Attachments.tsx`, `Records.tsx`, `api.ts`, `erp.css` ; tests unitaires et `e2e/attachments.spec.ts`.
- Backend : contrôleur `AttachmentController`, services `AttachmentAccess` et `AttachmentFileValidator`, modèle/migration `Attachment`, configurations `attachments` et disque privé.
- Contrat complet : `C:\wamp64\www\comsig-v2\docs\ATTACHMENTS-API.md`, OpenAPI régénéré : 62 chemins, 84 entrées de routes API Laravel dans l’inventaire.

## Ce qui reste ouvert

Les contrôles de signature/structure ne constituent **pas un antivirus** et ne certifient pas l’innocuité d’un PDF ou d’un document Office. Pas d’aperçu automatique ni de lien public. Sauvegardes coordonnées base/fichiers, rétention et antivirus de production restent à définir.

Ce lot n’est pas une GED globale : recherche, tags, OCR, purge et génération de modèles Word/Excel restent à porter. Le versionnement des pièces n’est pas celui des devis métier. Les rôles n’ont pas été élargis. Les projets source `comsig` et `comsig-crm` sont inchangés.

**Suite proposée : MFA et récupération de mot de passe**, avec choix de leur configuration avant tout envoi externe. P02 complet reste partiel (origines de production, composants communs, exports/notifications), et aucune validation utilisateur n’est présumée.
