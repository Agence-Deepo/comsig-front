# P07-A — Tableaux de bord et définitions d’indicateurs

04/11/2026. Développé localement ; validation visuelle et métier utilisateur en attente.

- L’accueil présente le tableau commercial aux profils commerciaux/direction, l’espace de service aux autres profils métier et l’espace administration aux administrateurs techniques.
- L’écran Indicateurs est distinct du tableau de bord. Il expose les données autorisées selon le profil, des filtres de dates et, selon le périmètre, de service et de responsable.
- Affaires gagnées : somme des montants d’opportunités au statut gagné, dont la date de gain est connue dans la période. Ce montant ne représente pas la facturation ou l’encaissement. Les gains sans date connue sont comptabilisés séparément et exclus des périodes.
- Pipeline brut : somme des opportunités ouvertes à date ; pipeline pondéré : somme montant × probabilité / 100. Affaires gagnées, perdues et suspendues exclues. Ce sont des états à date, non des historiques.
- Taux de gain : gagnées / (gagnées + perdues) selon les dates de gain ou de clôture connues dans la période. Cycle : moyenne des délais entre qualification et gain pour les gains de la période avec deux dates valides.
- Suivi commercial : affaires ouvertes avec prochaine action et date renseignées ; prochaine action dont la date est passée. Le taux de relance des devis n’est pas calculé : la liaison fiable devis–activité n’existe pas encore.
- Travail : tâches et activités terminées sur la période selon leur date effective ; tâches, activités et ordres ouverts en retard à date. Ordres terminés selon leur date de fin.
- Droits et périmètres vérifiés côté serveur ; aucun droit métier ne découle du rôle d’administration technique.

Vérifications : `IndicatorsTest` 2 tests et 23 assertions (formules, dates absentes, périmètres et profil production) ; `crmMetrics.test.ts` 3 tests réussis ; build React et TypeScript réussi ; réponse réelle de l’API locale contrôlée avec un profil commercial. Les définitions constituent une base de travail et restent à valider avec COM&SIG. Le tableau de bord commercial historique continue à charger les listes : agrégation serveur complète prévue au troisième point de P07.
