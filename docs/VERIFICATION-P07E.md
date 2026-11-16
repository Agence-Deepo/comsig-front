# P07-E — Commissions, sécurité et gouvernance

## Réalisations

- Les affectations de plans sont historisées par mois d’effet. Le plan applicable est le dernier plan dont la date d’effet précède ou correspond au mois demandé ; les périodes précédentes ne se voient pas attribuer automatiquement un plan futur.
- Les relevés validés ou payés empêchent les modifications d’objectif et les changements de plan qui modifieraient leur période. Un relevé calculé devient « à recalculer » si son objectif ou son plan change. Un relevé est un instantané : les autres modifications ultérieures des dossiers sources nécessitent une vérification et un recalcul explicites avant validation.
- La finance dispose d’une liste restreinte aux relevés validés et payés et peut enregistrer une référence et une date de paiement déjà effectué. Aucun transfert ou paiement bancaire n’est déclenché. Le rôle finance accède pour ce seul suivi aux relevés validés des commerciaux d’autres services, sans accès automatique à leurs dossiers métier.
- La console de sécurité présente les comptes actifs, la double authentification activée, les changements de mot de passe attendus et les événements de connexion réellement enregistrés. Elle est réservée aux profils ayant `admin.view` et ne contient pas de données métier.
- Les rapports de gouvernance ajoutent les opportunités dont la date de clôture est dépassée et les factures échues, avec jusqu’à huit exemples et une recommandation par contrôle. Les dossiers sont soumis aux permissions effectives ; l’administrateur technique n’obtient pas d’accès métier implicite.
- Migration additive appliquée localement. Les éventuelles affectations existantes sont reprises à compter du mois de leur date d’enregistrement connue, sans inventer leurs affectations antérieures.

## Vérifications

- 4 tests Laravel ciblés, 57 assertions : périmètre, séparation des validations, enregistrement de paiement, refus du doublon, historique des plans, invalidation d’un relevé et restrictions des écrans sécurité/gouvernance.
- Compilation TypeScript et Vite réussie. Vite signale toujours un paquet principal supérieur à 500 Ko.
- Aucun paiement, relevé, plan, rapport ou compte réel n’a été créé par les tests isolés ou la migration.

## Limites

- Les bases, objectifs et taux de commission doivent être approuvés par la direction ; la recette de bout en bout en navigateur et la validation visuelle restent à faire.
- Les anciens changements de plan antérieurs à la première date conservée ne peuvent pas être reconstitués. Les paiements enregistrés ne constituent pas une preuve bancaire indépendante.
- La console de sécurité ne reprend pas encore les radars, blocages d’adresses, archives scellées et vérification d’intégrité du CRM source. Elle n’affirme pas que le journal est infalsifiable.
- Les quatre contrôles de gouvernance ne couvrent pas tous ceux du CRM source ; leurs recommandations ne remplacent pas une revue humaine. Les rubriques historiques du tableau commercial encore non raccordées sont détaillées dans P07-D.
