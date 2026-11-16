# P07-B — Compléments aux deux premiers points

06/11/2026. Avancement technique local ; les deux points ne sont pas encore clôturés.

- Montants gagnés : dernier devis accepté accessible à l’utilisateur, sinon montant de l’opportunité ; date de gain obligatoire. Cycle : qualification, sinon création, jusqu’au gain.
- Devis envoyé : action explicite pour planifier une activité de relance liée, sans envoi externe. Taux de suivi sur propositions envoyées dans la période : relance liée terminée au plus tard un jour après échéance ou décision client dans les sept jours. Les anciennes activités non reliées ne sont pas attribuées rétrospectivement.
- Page Indicateurs : mesures stocks, régie, finance et RH selon les droits ; comparaison à la période précédente pour le montant gagné et le cycle. Les espaces de service affichent des graphiques par statut des tâches et ordres reçus.
- Cibles globales et statuts atteint / à surveiller / alerte pour les indicateurs disponibles ; modification réservée à la direction générale et auditée, comparaison aux cibles uniquement sur le périmètre entreprise.
- Migrations additives `2026_11_06_100000_link_quote_followups` et `2026_11_06_110000_create_indicator_targets` appliquées sur MySQL local.
- Vérifications : 8 tests Laravel, 69 assertions ; 3 tests frontend et build React réussis.

Restent ouverts : catalogue complet des indicateurs source et graphiques par profil, comparaisons généralisées, contrôle de conformité visuelle, validation métier explicite des définitions et rapprochement sur des données représentatives. Les objectifs commerciaux et commissions relèvent également du point 4 de P07. Les règles et données d’origine ne sont pas présumées validées par l’utilisateur.
