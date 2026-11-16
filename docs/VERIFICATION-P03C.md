# P03-C — Historique, décisions et suivi des contacts

3 novembre 2026. Sous-lot réalisé localement, P03 reste en cours et validation utilisateur ouverte. Les sources CRM/ERP ne sont pas modifiées. Aucun déploiement ou envoi externe.

## Livré et vérifiable

- Fiche client, onglet **Historique** : timeline CRM, objet, statut, résultat joint/injoignable/refus, contact, durée, date réelle de réalisation ou échéance, compte rendu et lien de dossier. Pagination et droits propres aux activités conservés.
- Formulaires activités : contact du client sélectionné, compte rendu, résultat et durée ; réunions, visites, notes et statut reporté. Compte rendu obligatoire pour clôturer une priorité 1. Les profils sans droit tiers gardent la création d’activités autonomes.
- Relance explicite depuis une interaction terminée : objet/date future choisis par l’utilisateur, une seule par source (même dans la corbeille), pas de création en double. Modification de la relance pour la replanifier ; aucun e-mail/appel/SMS réel.
- Refus avec contact : opposition persistante et annulation des suivis générés ouverts accessibles ; aucun effacement des travaux manuels ou dossiers d’un autre portefeuille. Nouvelles relances/e-mails programmés refusés si opposition.
- Onglet **Décisions** : événements réels du journal, référence du dossier et acteur, étapes d’affaires et décision accepté/refusé lorsqu’elles sont enregistrées. Chaque module respecte les permissions actuelles, sans exposer le journal administratif ou ses détails sensibles.
- Date de réalisation fixée par le serveur et inchangée lors d’une correction du compte rendu. Aucune date reconstituée sur les anciennes réalisations inconnues. Le filtre de prospection « Sans interaction datée depuis 14 j » ne se base plus sur une correction récente du dossier.

Le skill Sites a guidé la réutilisation des composants/timeline et la recette locale ordinateur/mobile, sans publication. Aucune parité pixel exhaustive des fiches n’est revendiquée.

## Garde-fous et limites

Une interaction consignée reste corrigeable mais n’est plus réaffectable/réouvrable/reclassable ; une note corrective permet de documenter une erreur d’identité. Suppression logique refusée au commercial, autorisable par un droit métier de validation. Cette restriction est conservatoire par rapport à la source.

Les liens client/contact/affaire et les propriétaires sont contrôlés sous verrous. Réalisation, opposition, annulations et audit sont atomiques : une panne d’audit annule l’ensemble. `done_at` et le lien de relance ne sont jamais acceptés en écriture libre.

Sans contact désigné, un refus bloque le suivi de l’événement, pas toute l’organisation. L’opposition ne se lève pas automatiquement si le résultat est corrigé. Les suivis d’un autre périmètre ne sont pas annulés arbitrairement ; aucun moteur d’envoi ne les exécute dans ce lot.

Pas de séquence automatique « injoignable +3 jours », de seuil de tentatives ou de récurrence implicite : ces règles du CRM source exigent encore leurs paramètres/configuration et recette. L’onglet Décisions est une projection filtrée d’événements choisis, pas l’intégralité des validations/paiements ni de l’audit technique. Contrats/réclamations, taxonomies, tags/estimation annuelle, classement et vue 360° exhaustive restent à poursuivre.

## Recette

Onze tests API spécifiques couvrent dates serveur/corrections, comptes rendus critiques, cohérence contact/client/affaire, droits et portefeuilles, relance future/unique/corbeille, refus/opposition/annulations, protection de l’historique, anciens événements non datés, correction après archivage du contact sans nouvelle sollicitation, projection de décisions sans IP/secrets/détails bruts et rollback sur panne d’audit.

Résultats finaux : **150 tests Laravel / 1 012 assertions**, **41 tests frontend**, **40 scénarios Chromium réussis sans échec ni saut** (build compilé et API réelle sur base QA), **10 contrôles d’inventaire** réussis. Les trois vues publiques source/cible restent identiques dans leur comparaison automatisée existante ; les 94 copies historiques TS/TSX/CSS sont inchangées. Cela ne vaut pas validation utilisateur de toute P03.

Deux scénarios navigateur dédiés couvrent le parcours de compte rendu, réalisation, relance, historique/décisions et rechargement mobile, puis le refus avec opposition persistante et annulation du suivi. Les tests exigent une base isolée `P02_QA_DATABASE`.

Base QA : `C:\wamp64\www\comsig-v2\tmp\p03c-20261103.sqlite`, stockage et boîte privée sous `tmp/p03c-attachments-qa` et `tmp/p03c-mail-qa`. Données TEST et artefacts conservés, ignorés par Git. Sur MySQL utilisateur, uniquement la migration additive des champs d’activité ; aucun ancien compte rendu, contact ou statut n’est réécrit par la migration.

Captures inspectées : [historique ordinateur](apercu-p03c-historique-desktop.png), [décisions mobile](apercu-p03c-decisions-mobile.png). Lecture des onglets de la fiche TEST P03-A existante sur les services utilisateur Wamp/MySQL : succès HTTP 200 pour historique et décisions, sans mutation de fiche. Les serveurs React 5174 et API 8002 restent disponibles.

Les fixtures de création répétées passent désormais par le vrai dialogue de justification de doublons lorsque nécessaire : aucun contournement du garde-fou produit. La première passe complète avait rencontré deux refus attendus sur des fixtures ressemblantes ; les scénarios ont été ajustés avant la passe finale.

Build et typecheck réussis ; avertissement non bloquant de bundle principal conservé (environ 526 Ko minifiés / 156 Ko gzip). Les trois déclarations de tâches planifiées restent inchangées : ces traitements d’interaction sont transactionnels à la demande, pas de nouveau cron installé ni de séquence exécutée en arrière-plan.

Contrat : [CUSTOMERS-API.md](../../comsig-v2/docs/CUSTOMERS-API.md), OpenAPI régénéré : 80 chemins, 102 entrées de routes API. Tests de concurrence multi-connexion InnoDB et validation métier à prévoir avant production.

## Pour essayer

Dans [Clients et contacts](http://127.0.0.1:5174/clients), ouvrir une fiche TEST avec `awa`, puis **Consigner une interaction** : statut terminé, contact et résultat, compte rendu. Retrouver l’entrée dans Historique ; planifier une relance future, puis vérifier Décisions et actualiser. Tester un refus exclusivement avec un contact TEST, car il modifie réellement son opposition.

Prochaine tranche P03 : référentiels et champs avancés, rapprochement du reste de la fiche 360°, définition du classement avant implémentation. Aucun calcul de classement inventé.
