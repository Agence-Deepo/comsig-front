# P09-C — Fonds, dépenses récurrentes, balance âgée et développement RH

06/11/2026. Troisième sous-lot de P09, qui traite les points laissés ouverts par P09-A et P09-B.

## Livré localement

### Demandes de fonds
- Création d’une demande avec objet, montant, date souhaitée, justification obligatoire, compte de trésorerie et bénéficiaire facultatif.
- Circuit explicite : **En attente → Approuvée ou Refusée → Décaissée**.
- L’approbation exige `treasury.validate` **et une autre personne que le demandeur** (contrôle à quatre yeux).
- Le décaissement exige `treasury.update`, une demande déjà approuvée, et crée un **mouvement de caisse en attente** : la double validation de caisse existante n’est jamais contournée.
- Une demande ne peut pas être approuvée deux fois, ni décaissée avant approbation.

### Dépenses récurrentes
- Modèle budgétaire déclaratif : libellé, catégorie (loyer, énergie, télécom, abonnement, assurance, salaire, autre), fréquence, montant, fournisseur, moyen de paiement, référence de document, début et fin facultatifs.
- La **prochaine échéance** est calculée à partir de la fréquence déclarée (`addMonthsNoOverflow`), jamais devinée : 31 janvier + 3 mois = 30 avril.
- **Aucun décaissement n’est créé automatiquement** : ce registre ne déclenche ni paiement ni écriture.

### Balance âgée
- Cinq tranches calculées depuis les échéances réelles : à échoir, 1–30 j, 31–60 j, 61–90 j, plus de 90 j.
- Seules les factures émises ou partiellement payées et dont le reste dû est positif sont comptées.
- Affichée au-dessus de la file des créances échues, avec l’encours total.

### Évaluations et formations RH
- Évaluation par période avec cinq critères notés de 1 à 5 ; la **note globale est la moyenne arithmétique** des critères saisis, jamais un barème externe.
- Une période ne peut être évaluée deux fois ; une note hors barème est refusée.
- Formations : intitulé, organisme, dates, statut (prévue, en cours, terminée, annulée), mise à jour du statut possible.
- Accès réservé à `hr.view` pour la lecture et `hr.update` pour l’écriture : un commercial reçoit un refus.

## Migration

Migration additive `2026_11_06_120000_create_fund_requests_expenses_evaluations`, appliquée en local :
- `erp_fund_requests`, `erp_recurring_expenses`, `erp_evaluations`, `erp_trainings`.
- Aucune table existante modifiée, aucun montant prérempli, aucun décaissement créé.

## Erreurs corrigées pendant le lot

- `ErpService` appliquait une règle d’unicité sur une colonne de référence non encore générée, provoquant une erreur 500 : la référence est désormais produite avant validation, et la règle d’unicité tolère une colonne absente des règles de base.
- La liste des responsables refusait le module `treasury`, ce qui bloquait l’enregistrement d’une demande de fonds : `treasury` est désormais accepté, sans élargir les droits (`treasury.view` reste exigé).
- Les statuts `approuvee`, `refusee` et `decaissee` s’affichaient en code brut : libellés français ajoutés.

## Contrôles exécutés

- Laravel ciblé : `4` tests réussis, `36` assertions.
- Frontend : vérification TypeScript et `53` tests unitaires réussis.
- Navigateur : scénario P09-C réussi — balance âgée, création d’une demande de fonds (approuvée par la direction puis décaissée), création d’une dépense récurrente avec échéance calculée.

## Limites conservées

Restent ouverts dans P09 : pièces justificatives jointes aux demandes de fonds (le registre documentaire existe mais n’est pas branché sur ce formulaire), rapprochements bancaires, badge d’accès, paramètres de paie à valider par le responsable, et recette FNE avec les interlocuteurs compétents. Aucun paiement, virement ou envoi externe n’a été déclenché.

Lien de démonstration local : [demandes de fonds](http://127.0.0.1:5174/demandes-fonds), [dépenses récurrentes](http://127.0.0.1:5174/depenses-recurrentes), [créances échues](http://127.0.0.1:5174/creances-echues).
