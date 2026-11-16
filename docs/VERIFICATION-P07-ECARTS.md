# P07 — Vérification des deux premiers points

Vérification du code source CRM et de la cible locale ; les deux points restent partiels.

## Tableaux de bord et indicateurs

- La cible oriente l’accueil vers le tableau commercial, l’espace service ou l’espace administration et dispose d’un écran Indicateurs distinct avec filtres.
- Le CRM source possède un catalogue d’indicateurs spécifique aux services, avec cible, comparaison à la période précédente, tendance et statut ; la cible n’en propose qu’un sous-ensemble générique commercial/travail.
- Les tableaux de service source comprennent notamment des graphiques d’activité, de répartition et, selon les droits et services, des séries financières. Ces vues ne sont pas toutes reprises dans l’espace service cible.
- La conformité visuelle et la couverture de chaque profil n’ont pas été établies. Les objectifs et commissions font aussi l’objet du quatrième point P07 et ne doivent pas être présumés terminés.

## Définitions

- La cible somme `opportunities.amount` pour les gains datés. Le tableau de bord CRM source prend le dernier devis accepté associé lorsqu’il existe, puis le montant d’opportunité en repli. Ces deux règles peuvent donner des résultats différents et nécessitent une décision métier.
- Le CRM source calcule le cycle depuis la qualification ou, à défaut, la création ; la cible exclut les affaires sans date de qualification. Cette différence doit être arbitrée, sans inventer de dates historiques.
- Le suivi de la prochaine action des opportunités est présent dans la cible, mais le taux de suivi des propositions du CRM source ne l’est pas : la liaison fiable entre activité de relance et devis n’est pas encore reprise.
- Le pipeline ouvert pondéré et la distinction montant gagné / facturé / encaissé sont explicités dans la cible. Leur validation métier reste à effectuer ; elle ne peut pas être déduite de tests techniques.

## Vérification exécutée

`IndicatorsTest` : 2 tests, 23 assertions réussies, couvrant certains calculs et périmètres. Ces tests ne démontrent pas la parité de tous les profils ni l’approbation des définitions métier. Aucun des deux points n’a été marqué terminé.
