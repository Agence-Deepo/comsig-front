# P03-B — Doublons et fusion contrôlée

3 novembre 2026. Sous-lot suivant réalisé en local ; P03 reste en cours, validation utilisateur non présumée. Aucun déploiement Vercel/Hostinger, courriel externe, import historique ou opération fiscale/bancaire réelle.

## Ce qui est disponible

- Formulaire client/prospect : recherche différée des fiches similaires, liens de vérification, refus serveur si non confirmé, dérogation motivée et auditée ; conservation des valeurs en cas d’erreur. Même protection lors d’une modification d’identité.
- Fiche client, profils direction autorisés : « Fusionner une fiche », recherche de la source, aperçu des relations et blocages, référence source à retaper, justification et confirmation de même identité. Aperçu périmé refusé ; aucune fusion automatique.
- Cible inchangée pour ses valeurs renseignées ; champs vides indiqués dans l’aperçu complétés. Contacts, opposition, IDs et dossiers liés conservés ; principal cible prioritaire. Source archivée et profil original conservé en base.
- Documents privés : regroupement sans écrasement ni déplacement physique ; renumérotation des versions homonymes, corbeille et quotas inclus, téléchargement/restauration préservés. Fusion et mapping de versions audités sans chemin/nom sensible.
- Historique « Fiches regroupées » et ancienne URL menant vers la cible, uniquement dans le périmètre autorisé.
- Onglets Projets/Campagnes de la fiche : vraies tables ERP, pagination, permissions et périmètre propres à chaque module.

Le skill Sites a guidé le travail dans le checkout local, la réutilisation des composants existants et la vérification des captures ordinateur/mobile ; aucun site distant créé. Ce lot n’est pas déclaré pixel-identique à toutes les fiches source.

## Limites explicites

La fusion nécessite les droits organizations.view/update/delete sur les deux fiches, **le même responsable et service**, ainsi que view/update/périmètre sur chaque module comportant des dossiers source. Un commercial ordinaire n’a pas de bouton de fusion. La direction commerciale ne récupère pas de droits production/finance implicites.

Toute facture ou devis non brouillon de la source, même archivé, bloque la fusion : l’identité historique complète des pièces n’est pas encore figée. Aucun statut ou montant n’est recalculé. Pas de défusion automatique ; choisir la cible avec soin. Une panne d’audit annule la transaction.

La recherche de doublons est limitée aux fiches accessibles, sans garantie d’unicité entre portefeuilles ni contre deux créations simultanées. Son algorithme Dice/normalisation est portable MySQL/SQLite, pas identique à pg_trgm. Parcours des colonnes minimales en curseur : temps proportionnel au volume ; indexation dédiée à prévoir pour une reprise volumineuse. Formats téléphoniques nationaux/internationaux non unifiés implicitement.

Contrats/réclamations non portés, décisions métier, taxonomies, tags/estimation annuelle, résultats de contact, relances avancées et classement selon formule validée restent à traiter. Recette multi-connexions InnoDB et validation métier à prévoir avant production.

## Recette locale

La suite API couvre normalisation/casse/accents/NCC, non-divulgation de portefeuille, exclusion d’ID contrôlée, refus et dérogation de doublon, droits de fusion, portefeuilles différents, confirmation incorrecte, aperçu périmé, archivage/liens/IDs/opt-out/principal, brouillons déplacés, blocage des pièces émises, documents homonymes/corbeille/octets privés, quotas, droits ERP et rollback en cas de panne d’audit.

Deux scénarios navigateur dédiés : doublon/erreur/saisie conservée/dérogation, puis fusion réelle de fixtures avec aperçu, contacts, archive et ancienne URL ; captures ordinateur et mobile 390 × 844. Les tests de fusion exigent `P02_QA_DATABASE` et ne s’exécutent pas sur la base utilisateur.

Résultats finaux : **139 tests Laravel / 925 assertions**, dont 11 tests P03-B ; **38 tests frontend** ; **38 scénarios Chromium sans échec ni saut** sur build compilé/API réelle et base isolée, puis nouvelle passe des **2 scénarios P03-B** après ajustement visuel des cases de confirmation. Les trois vues publiques source/cible restent identiques dans la comparaison automatisée existante. **10 contrôles d’inventaire** passent ; 94 copies historiques TS/TSX/CSS inchangées.

Build/typecheck validés ; avertissement de découpage du bundle principal conservé (environ 519 Ko minifiés / 155 Ko gzip), sans erreur. Lecture de la fiche TEST P03-A existante et détection de doublons sur les services utilisateur Wamp/MySQL : succès HTTP 200, sans écriture de fiche. La recette de concurrence multi-connexion n’est pas couverte par ces seuls tests.

Captures inspectées, modales défilées vers leurs contrôles de confirmation : [doublons ordinateur](apercu-p03b-doublons-desktop.png), [fusion ordinateur](apercu-p03b-fusion-desktop.png), [fusion mobile](apercu-p03b-fusion-mobile.png).

Base isolée : `C:\wamp64\www\comsig-v2\tmp\p03b-20261103.sqlite`, avec stockage et boîte privée sous `tmp/p03b-attachments-qa` et `tmp/p03b-mail-qa`. Artefacts de recette conservés, ignorés par Git. Sur MySQL local, seule la migration additive `merged_into_id` a été appliquée ; aucune fiche utilisateur existante fusionnée ou supprimée par ce lot.

Contrat technique : [CUSTOMERS-API.md](../../comsig-v2/docs/CUSTOMERS-API.md). Contrat HTTP régénéré : 78 chemins OpenAPI, 100 entrées de routes API.

## Essai utilisateur

Ouvrir [Clients et contacts](http://127.0.0.1:5174/clients). Avec `awa`, créer une fiche portant un nom/e-mail déjà visible : vérifier l’avertissement et la justification. Utiliser exclusivement des fiches TEST pour une fusion ; avec `dircom`, conserver une fiche cible et choisir une source du même portefeuille sans pièce émise, calculer l’aperçu et contrôler les dossiers avant confirmation. Mot de passe de démonstration inchangé : `Demo-Comsig-2026!`.

Prochaine tranche : décisions et historique détaillé de la fiche 360°, interactions/prospection avancées ; classement seulement après validation de sa formule.

Mise à jour : l’historique, les décisions filtrées, les résultats de contact et le suivi explicitement planifié sont maintenant traités dans [P03-C](VERIFICATION-P03C.md). Les nombres ci-dessus restent ceux de la livraison P03-B.
