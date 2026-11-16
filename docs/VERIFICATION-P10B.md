# P10-B — Messagerie interne et rapports périodiques

06/11/2026. Deuxième sous-lot de P10 : messagerie interne avec règles d’accès strictes, et rapports périodiques calculés puis figés.

## Livré localement

### Messagerie interne
- Boîtes **Reçus**, **Envoyés** et **Archivés**, avec compteur de non-lus rafraîchi périodiquement.
- Règles d’accès appliquées côté serveur, sans exception :
  - un message n’est lisible **que** par son expéditeur et ses destinataires ; un tiers reçoit un 404, jamais une indication d’existence ;
  - l’expéditeur **ne peut pas** se mettre lui-même destinataire ;
  - les destinataires doivent être des comptes **actifs** d’un service actif ;
  - une réponse doit être envoyée par un **participant** de la conversation ;
  - l’archivage est **individuel** : archiver chez le destinataire ne retire rien à l’expéditeur ;
  - les messages ne sont **jamais supprimés**, seulement archivés.
- Marquage en lu à l’ouverture, avec horodatage ; l’expéditeur voit combien de destinataires ont lu.
- **Aucun envoi externe** : ni e-mail, ni SMS, ni notification hors CRM.

### Rapports périodiques
- Périodicités hebdomadaire, mensuelle, trimestrielle, semestrielle et annuelle, avec bornes de période calculées.
- Sections calculées depuis les dossiers réels : commercial (devis créés et acceptés, taux d’acceptation, montant accepté HT, pipeline ouvert), finance (factures, facturé TTC, encaissé, reste dû, échu), clients, production, régie, RH.
- **Aucune projection ni montant estimé** : une donnée absente vaut zéro et le rapport le mentionne.
- Le rapport est **figé** à la génération : régénérer la même période est refusé, et l’ouverture ultérieure conserve les chiffres d’origine même si les dossiers évoluent.
- **Périmètre** : un responsable de service ne peut produire que le rapport de son service ; la portée globale peut choisir un service ou le consolidé.

## Migration

Migration additive `2026_11_06_140000_create_messages_and_periodic_reports` : `messages`, `message_recipients`, `periodic_reports`. Aucune table existante modifiée.

## Permissions

`reporting.view` est accordée aux profils d’encadrement (direction générale, direction commerciale, responsable de service, auditeur) et `reporting.export` à ceux qui produisent les rapports. **Aucun droit métier élargi** : un commercial reste sans accès aux rapports. Les rôles existants doivent recevoir ces permissions une fois (`WorkspacePermissions::apply()`), ce qui a été fait en local.

## Erreurs corrigées pendant le lot

- Un scénario navigateur a révélé que le profil direction générale n’avait pas encore `reporting.view` en base locale : les permissions ont été réappliquées. Aucun code produit n’était en cause, mais l’écart d’environnement est désormais documenté.
- Une édition maladroite de la suite de tests avait supprimé l’en-tête du scénario P10-A : restauré et les deux scénarios rejoués.

## Contrôles exécutés

- Laravel ciblé : `6` tests réussis, `33` assertions.
- Laravel complet : `267` tests réussis, `2 307` assertions.
- Frontend : vérification TypeScript et `53` tests unitaires réussis.
- Navigateur : scénarios P10-A et P10-B réussis — message envoyé et retrouvé dans « Envoyés », rapport généré ou unicité confirmée selon l’état.
- Navigateur, scénario de parité CRM mis à jour : la messagerie ne mène plus à un écran d’attente.

## Limites conservées

Restent ouverts dans P10 : **courrier externe** (SMTP, gabarits et recette à configurer), **analyse SWOT** et **reporting avancé** (indicateurs croisés et exports), **assistant** (mode, périmètre et configuration à choisir), et les **tâches planifiées** associées. Aucun e-mail réel, aucune notification externe, aucun assistant factice.

Lien de démonstration local : [messagerie](http://127.0.0.1:5174/messagerie), [rapports](http://127.0.0.1:5174/rapports).
