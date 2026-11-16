# P10-A — Avenants, renouvellements et appels d’offres

06/11/2026. Premier sous-lot de P10, qui traite les trois points les plus proches du registre contrats existant.

## Livré localement

### Avenants de contrat
- Enregistrement d’un avenant : référence unique **par contrat**, objet, date de signature (jamais future), date d’effet, variation de valeur (positive ou négative), description.
- Le **total avenanté** est la somme explicite de la valeur d’origine et des variations saisies : aucun montant n’est recalculé depuis un devis ou un tarif.
- Modification de la date de fin **uniquement** si la prolongation est cochée, et la nouvelle fin doit être postérieure. Une date sans prolongation est refusée pour éviter toute ambiguïté.
- Un contrat annulé ne peut plus recevoir d’avenant.
- La **fin effective** affichée est la dernière date de fin portée par un avenant de prolongation, sinon la fin du contrat.

### Décision de renouvellement
- Trois décisions possibles : **renouveler**, **ne pas renouveler**, **à négocier**.
- La décision est **datée** et peut porter un motif ; elle n’est possible que sur un contrat **signé ou actif**.
- Un renouvellement exige la nouvelle date de fin ; un refus **ne modifie jamais** la date de fin.
- Une échéance à 120 jours ou moins est signalée, sans décision automatique.

### Appels d’offres
- Registre avec référence unique, intitulé, source, date de remise, valeur estimée, critères et pièces à produire.
- **Délai calculé** depuis la date de remise (négatif si dépassé).
- Statuts : veille, en préparation, soumis, gagné, perdu, non soumis.
- Un appel **non soumis exige un motif** ; l’absence de motif est refusée.
- Accès réservé à `contracts.view` (lecture) et `contracts.create`/`update` (écriture).

## Migration

Migration additive `2026_11_06_130000_create_amendments_tenders_and_renewals` : deux tables (`contract_amendments`, `tenders`) et trois colonnes de décision de renouvellement sur `contracts`. Aucune table supprimée, aucun montant contractuel réécrit.

## Erreurs corrigées pendant le lot

- `Undefined variable $row` lors de la création d’un appel d’offres : variable désormais initialisée, écriture d’audit unifiée.
- Le bouton « Consigner la décision de renouvellement » s’affichait sur un brouillon alors que la règle serveur l’interdit : l’interface affiche maintenant un message explicite tant que le contrat n’est pas signé ou actif.

## Contrôles exécutés

- Laravel ciblé : `4` tests réussis, `27` assertions.
- Frontend : vérification TypeScript et `53` tests unitaires réussis.
- Navigateur : scénario P10-A réussi — avenant avec prolongation (total 1 500 000), message de renouvellement différé, création d’un appel d’offres.

## Limites conservées

Restent ouverts dans P10 : **messagerie et courrier** (règles d’accès et envoi réel non configurés), **rapports périodiques, reporting avancé et SWOT**, **assistant** (mode, périmètre et configuration à choisir), et les **tâches planifiées** nécessaires. Aucun e-mail, aucune notification externe ni assistant factice n’a été ajouté.

Lien de démonstration local : [contrats](http://127.0.0.1:5174/contrats), [appels d’offres](http://127.0.0.1:5174/appels-offres).
