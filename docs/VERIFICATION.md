# Vérification locale — 2 novembre 2026

> Rapport initial de la V1, conservé comme historique. L’extension ERP et les nouveaux contrôles financiers sont vérifiés dans [VERIFICATION-ERP.md](VERIFICATION-ERP.md), qui remplace les chiffres et limites ci-dessous pour la version actuelle.

- `npm run build` : succès (TypeScript strict puis compilation Vite).
- `npm test` : **18 tests unitaires réussis**.
- `npm run test:e2e`, avec `E2E_PREVIEW=1` : **5 parcours Chromium réussis sur le build compilé**, avec l’API Laravel et MySQL locaux.
- `npm audit` : aucune vulnérabilité signalée au moment de la vérification.
- Comparaison SHA-256 : les **103 fichiers** du répertoire `comsig-crm/web/src` sont conservés à l’identique, y compris l’ancien point d’entrée renommé `legacy-main.tsx`. Parmi eux : 58 fichiers de pages.
- Inspection visuelle des captures ordinateur, mobile et fiche de devis : pas de débordement global observé ; tables défilantes et navigation mobile repliable.

## Parcours réellement exécutés

1. Création d’une tâche avec échéance, passage à « Terminé », présence dans le calendrier.
2. Création d’un tiers, de son contact et d’une opportunité ; changement d’étape ; devis à deux lignes, calcul serveur à 177 000 FCFA TTC ; soumission, marquage envoyé, acceptation ; connexion finance, facture interne et paiement intégral.
3. Création d’un article, entrée de 10 unités à 2 500 FCFA, sortie de 3 unités ; refus d’une sortie supplémentaire de 8 unités, solde maintenu à 7.
4. Affichage 390 × 844, absence de débordement global, navigation mobile, fermeture d’une modale avec Échap, reconnexion exigée après rechargement.
5. Connexion administrateur, absence du menu devis sans permission métier, formulaire utilisateurs, journal d’audit et modules à porter.

Les tests n’effectuent pas la certification FNE, l’envoi de courriels, la génération de documents ou les traitements des modules non portés. L’approbation hiérarchique exceptionnelle et le changement obligatoire de mot de passe sont implémentés dans l’interface, mais ne font pas partie de ces cinq parcours navigateur.

Des enregistrements de test ont été ajoutés dans **la base locale comsig_v2 uniquement**. Aucun import, effacement ou changement de schéma des projets historiques n’a été effectué. Les serveurs de vérification ont été arrêtés après les tests. Aucun déploiement distant n’a été lancé.

## Aperçus

- [Tableau de bord ordinateur](apercu-bureau.png)
- [Tableau de bord mobile](apercu-mobile.png)
- [Devis](apercu-devis.png)

## Avant production

Finaliser en particulier l’authentification persistante par cookies/CSRF, les comptes réels et leur cloisonnement, la sauvegarde/restauration et les contrôles financiers. Les documents de facturation actuels sont des documents internes non certifiés FNE. Voir `DEPLOIEMENT.md`.
