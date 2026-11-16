# P04 — Opportunités, pipeline et relances

Date : 03/11/2026. Demande : réaliser les cinq points annoncés, puis tester le lot. Développement local React V1/Laravel V2, sans déploiement distant, e-mail, facturation ou fusion de fiche utilisateur.

## Livré

1. Vues dédiées liste et Kanban avec filtres persistants, recherche, tri, export CSV, totaux serveur et pagination. Les20 cartes par étape ne sont pas présentées comme la totalité : compteurs exhaustifs et lien vers la liste complète.
2. Fiche opportunité dédiée, client/contact, montant HT, échéance, prochaine action datée, brief de découverte et faisabilité ; composants et styles du CRM source conservés, adaptation locale et mobile.
3. Critères de passage revérifiés, preuves privées réelles, perte/suspension motivées, dérogation commerciale puis décision séparée DC/DG, réouverture motivée réservée à la direction. Six étapes existantes conservées et suspension ajoutée : pas de reclassement silencieux vers les dix étapes source.
4. Activités et relances avec comptes rendus/opposition P03, agenda filtré par affaire, rappel interne de réactivation ; liens devis/proforma avec client/contact/affaire préremplis et contrôles serveur.
5. Historique des changements et dates serveur pour les nouveaux événements. Anciennes dates inconnues laissées vides ; séries temporelles des gains/clôtures désormais indépendantes de updated_at.

## Vérifications locales

Avant P05 : 176 tests Laravel / 1 256 assertions, 48 tests frontend, compilation réussie et 10 contrôles d’inventaire. La recette navigateur initiale a révélé des défauts corrigés (activité non liée à son affaire, formulaire de prestation et sélecteurs). La reprise ciblée de dix scénarios a passé neuf parcours ; le dernier scénario commercial a été relancé séparément le **04/11/2026** et réussi en 30,8 s, jusqu’au règlement validé par un autre profil. Preuve : `test-results-p04-acceptance/.last-run.json` et rapport `playwright-report/p04-acceptance`.

Un défaut de mise en page de la timeline a aussi été corrigé (contenu dans la colonne d’icône de 32 px). La recette P05 inclut les trois scénarios P04 et un contrôle de largeur du corps de timeline, avec nouvelles captures. Les chiffres cumulés et captures de cette passe figurent dans [le rapport P05-A](VERIFICATION-P05A.md). Les écritures de recette devis/facture/règlement sont uniquement sur SQLite isolée, jamais sur les dossiers métier MySQL.

Contrat technique complet : [API opportunités](../../comsig-v2/docs/OPPORTUNITIES-API.md). Source relue : pages Opportunities, OpportunityDetail, SalesPipeline, formulaires, StageMove et services/opportunities.ts. Les copies historiques ne sont pas modifiées. La conformité pixel exhaustive et la validation métier de ces adaptations ne sont pas présumées.

## Recette utilisateur à effectuer

- [ ] Commercial : créer une affaire depuis le client, choisir le contact, décrire besoin/prochaine action et constater la tâche initiale.
- [ ] Rechercher/filtrer, basculer liste/Kanban, actualiser et vérifier la persistance ; tester une liste plus longue que20 cartes.
- [ ] Consigner une interaction, qualifier, remplir/valider le brief et la faisabilité puis préparer une proposition sans ressaisir le client/contact.
- [ ] Essayer une transition non autorisée et vérifier l’erreur ; demander une dérogation puis la faire examiner par un autre décideur DC/DG.
- [ ] Vérifier une preuve de gain, le motif de perte, une suspension et son rappel d’agenda ; réouvrir avec justification en direction.
- [ ] Vérifier les portefeuilles commercial/DC/DG et la lisibilité mobile ; signaler les ajustements visuels souhaités.

## Frontières explicites

Pipeline consolidé par vendeur, objectifs/commissions/couverture/entonnoir de SalesPipeline : P07. Circuits internes, revue technique et passation automatique aux opérations : P06/P08. Wizard complet de devis et versionnement : P05. Les séquences/récurrences et envois automatiques du CRM source nécessitent un chantier dédié et ne sont pas annoncés activés par cette livraison. Le rappel de réactivation est une tâche interne, pas un message client.

La recette utilise une nouvelle SQLite et des pièces/outbox privées isolées, jamais un reset de MySQL Wamp. Migration additive seulement après vérification isolée. Reprise des données/concurrence InnoDB multi-connexions et recette de production Vercel/Hostinger restent P12.
