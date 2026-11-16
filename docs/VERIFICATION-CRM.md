# Recette de l’interface CRM — 3 novembre 2026

Recette historique avant P02-A. Pour l’authentification persistante et les résultats plus récents, consulter [VERIFICATION-P02.md](VERIFICATION-P02.md). Le scénario mobile exige désormais la conservation de session après rechargement, pas la reconnexion décrite dans le relevé initial ci-dessous.

Cette recette porte sur la reprise du design system CRM dans le frontend React actif et sur la conservation de son raccordement Laravel. Le [périmètre de conformité](CONFORMITE-CRM.md) détaille ce qui est identique et ce qui reste à aligner.

## Résultats

- TypeScript strict et build Vite : succès.
- Tests unitaires frontend : **23 réussis**.
- Tests Laravel sous PHP 8.2.29 : **68 réussis, 392 assertions**.
- Chromium sur le **build compilé** avec API Laravel et MySQL locaux : **14 tests réussis**.
- Les trois comparaisons publiques avec le CRM source sont **identiques au niveau des PNG** : portail à neuf tuiles, connexion directe, connexion Commerciale, en 1440 × 960. Le test ne tolère pas une différence de pixels ; le gabarit et les dimensions sont aussi comparés.
- Les **103 fichiers** historiques de `comsig-crm/web/src` sont conservés à l’identique dans la copie frontend (SHA-256 ; ancien `main.tsx` conservé comme `legacy-main.tsx`).
- Contrôle de style PHP et vérification des espaces Git : succès. L’API expose maintenant **78 routes**, sur **56 chemins OpenAPI**.

Les tests backend utilisent leur base de test isolée. Les parcours navigateur utilisent la base MySQL locale `comsig_v2`, et ajoutent des enregistrements `TEST`. Aucun import ou effacement de données historiques n’est effectué.

## Parcours navigateur

1. Comparaison visuelle du portail avec la source.
2. Comparaison visuelle de la connexion de département.
3. Comparaison visuelle de la connexion directe.
4. Connexion Commerciale, menu utilisateur, thèmes, onglet contacts, recherche réelle Ctrl+K, indication explicite d’une fonction non portée et déconnexion.
5. Trésorerie et validation par une autre personne.
6. Effectif, congé, bulletin préparatoire et PDF.
7. Véhicule, chauffeur, départ et retour ; absence du lien effectif sans droit RH.
8. Nomenclature, consommation matières, réception de produits finis et livraison.
9. Support régie et paramètre de taxe.
10. Tâche, changement de statut et calendrier.
11. Client, contact, opportunité, devis à deux lignes (**177 000 FCFA TTC**), validation, décision client, facture et règlement avec approbation distincte.
12. Entrée et sortie de stock, CUMP et refus d’une sortie excessive.
13. Navigation mobile 390 × 844, fermeture de modale avec Échap, absence de débordement global et reconnexion après rechargement.
14. Administration, droits de navigation et modules à porter.

La correction du chiffrage a supprimé une dépendance au nom CSS de l’ancien conteneur : le bouton utilise maintenant son formulaire réel. Le menu mobile se ferme aussi sur un lien déjà actif, et la déconnexion revient au portail sans course avec la garde de navigation.

Le focus des modales est positionné avant le premier affichage, sans le délai de 30 ms de l’ancienne implémentation. Cela évite qu’une saisie rapide dans le deuxième champ soit redirigée vers le premier. Les captures de l’accueil attendent le chargement des indicateurs et la fin de fermeture du menu mobile.

## Aperçus inspectés

- [Portail](apercu-crm-portail.png)
- [Connexion Commerciale](apercu-crm-connexion.png)
- [Accueil commercial](apercu-crm-bureau.png)
- [Accueil mobile](apercu-crm-mobile.png)
- [Devis](apercu-crm-devis.png)
- [Production](apercu-crm-production.png)

## Limites

Ces tests ne certifient pas une identité visuelle de toutes les pages et interactions historiques. Les fiches détaillées, l’éditeur de devis, le calendrier et certains formulaires restent à reprendre écran par écran. Les fonctionnalités sans API équivalente sont signalées, pas simulées.

FNE réelle, MFA, cookies/CSRF persistants, contrats, messagerie, assistant, imports et rapports avancés restent à finaliser selon le périmètre convenu. Aucun déploiement distant n’a été effectué. Le serveur de référence et les serveurs temporaires de recette sont arrêtés après vérification ; les serveurs utilisateur React/Laravel sont laissés actifs pour les essais locaux.
