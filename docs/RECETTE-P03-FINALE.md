# P03 — Clôture technique et recette à deux

Date : 03/11/2026. Travail demandé : terminer les cinq compléments puis effectuer les tests regroupés. Aucun déploiement, e-mail réel, fusion ou suppression de fiche utilisateur.

## Les cinq points

1. Référentiels : quatre listes de valeurs administrables, codes stables, désactivation sans réécriture ; tags et CA annuel estimé ajoutés.
2. Classement : écran source adapté (catégories, ABC, scores, périodes/filtres/CSV), calcul autoritaire Laravel. **Base choisie par l’utilisateur : factures émises HT uniquement.** Ni devis ni affaires gagnées ajoutés. Méthode et visibilité selon droits expliquées dans l’écran.
3. Client 360° : synthèse réelle, prochaines activités/tâches, dernières interactions, alertes et dossiers liés selon droits ; registres de contrats/réclamations raccordés et pièces privées. Les circuits juridiques avancés ne sont pas déclarés terminés.
4. Comparaison source : `Organizations.tsx`, `OrganizationDetail.tsx`, `ClientRanking.tsx` et formulaires/listes de référence relus ; composants et CSS historiques conservés, contact principal et libellés rapprochés, alertes et blocs source raccordés. Filtres/pagination/CSV serveur et absence de données interdites sont des adaptations explicites. Les 94 copies historiques restent la référence, pas une preuve de parité pixel des nouveaux écrans.
5. Réception : scénarios de tests ajoutés, vérifications finales groupées et grille utilisateur ci-dessous. Aucune approbation visuelle ou métier de l’utilisateur n’est présumée.

## Vérifications finales exécutées

- Laravel : **164 tests réussis, 1 134 assertions**, SQLite mémoire ; droits, confidentialité, référentiels, validation des champs, chiffre d’affaires facturé seulement, périodes/ABC, CSV, synthèse, signatures déclarées avec pièce active, résolution et fusion conservatoire.
- React : **45 tests réussis**, TypeScript et build Vite réussis. Avertissement non bloquant : bundle principal de 543,55 ko avant gzip (optimisation de découpage à prévoir avant production).
- Navigateur Chromium : **44 scénarios couverts**. Passe complète : 43 réussis et 1 erreur de sélecteur de test (« Informations » au lieu d’« Informations du compte »). Sélecteur corrigé ; reprise des 4 nouveaux parcours : 4/4 réussis. Les parcours source publics, sécurité/MFA, pièces, session, CRM et ERP restent couverts. Rapports conservés dans `playwright-report/` et `playwright-report/p03-final-recheck/` ; captures dans `test-results/` et `test-results-p03-final-recheck/`.
- Inventaire : **10 contrôles réussis**, 112 routes Laravel, 30 modules frontend dont 19 ERP, 94 copies source inchangées. Les empreintes sont régénérées après les dernières retouches.
- MySQL Wamp : migration additive appliquée, puis lectures HTTP authentifiées réussies sur classement DG, liste triée CA, référentiels, contrats et synthèse. Connexion de contrôle déconnectée ensuite ; aucun client/contrat/facture utilisateur créé, fusionné ou supprimé pour ce contrôle.
- Recette visuelle : captures ordinateur/mobile inspectées. Retouche ciblée des libellés et du retour à la ligne du classement mobile, avec contrôle du débordement interne au tableau en plus de la largeur du document. Dernière reprise après cette retouche : **4/4 réussis** ; rapport `playwright-report/p03-final-visual/`, captures `test-results-p03-final-visual/`, inspectées à nouveau. Seuls les services utilisateur React5174/API8002 restent lancés ; serveurs temporaires de référence/QA arrêtés.

Base navigateur conservée : `C:/wamp64/www/comsig-v2/tmp/p03-final-20261103.sqlite`. Pièces et outbox QA privées distinctes. Les enregistrements TEST de cette base ne sont pas des données Wamp utilisateur. Aucun courrier réel ni déploiement distant.

Le skill Sites a été utilisé pour travailler sur le checkout local existant, conserver les composants/styles de référence et vérifier les rendus, sans créer de site distant ni remplacer l’application.

## À regarder ensemble en local

- [ ] Commercial : créer un prospect avec secteur/commune, tags, estimation, interlocuteur et qualification ; vérifier les filtres, le contact principal, la persistance après actualisation et le CSV.
- [ ] Fiche : consulter vue d’ensemble, contacts, historique et décisions ; retrouver les dossiers autorisés sans fuite sur les autres portefeuilles.
- [ ] Ajouter un brouillon de contrat et sa pièce, vérifier la déclaration par direction et le gel après signature ; vérifier le masquage des contrats confidentiels.
- [ ] Ajouter une réclamation échue, lire l’alerte puis saisir sa résolution et la clôturer.
- [ ] DG : consulter le classement sur une période et rapprocher le CA HT des seules factures émises non annulées ; contrôler les ABC et le détail de méthode.
- [ ] Commercial/mobile : constater que les données financières interdites restent indisponibles et qu’aucun score global fictif n’est affiché ; vérifier lisibilité et navigation à390px.
- [ ] Admin : modifier/désactiver un référentiel sans modifier les anciennes fiches ni accéder aux données métier.
- [ ] Confirmer les derniers ajustements visuels souhaités par rapport au CRM source.

## Frontières explicites

Import/reprise de données : P12 ; conditions tarifaires/exports XLSX avancés : P05 ; séquences/récurrences automatiques : P04 ; contrats juridiques/avenants/renouvellements : P10 ; escalades métier : P08. Les modules liés disposent de leur socle, pas de l’exhaustivité de leurs futurs lots. La conformité pixel exhaustive et la validation métier finale appartiennent à la recette utilisateur/P11.

La base des tests navigateur doit être une nouvelle SQLite isolée et les pièces/outbox dans des répertoires QA privés. Aucun reset de la base Wamp existante. Les preuves et comptes de démonstration ne constituent pas des données de production.
