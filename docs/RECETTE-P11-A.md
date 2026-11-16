# P11-A — Première comparaison visuelle commerciale

9 novembre 2026. Référence : démonstration intégrée en lecture seule du CRM source, profil commercial ; cible : React/Laravel sur SQLite de test isolée, profil commercial de démonstration. Même navigateur, thème sombre et dimensions de bureau. Les données sont différentes : la comparaison porte sur la structure et l’ergonomie, pas sur une égalité pixel ni une comparaison chiffrée des cartes.

Après corrections, compilation TypeScript et build Vite réussis ; avertissement de taille du paquet principal maintenu.

## Opportunités P04

- Kanban : les colonnes cibles étaient trop étroites et toutes étirées à la même hauteur. Largeur 264 px, alignement au début et retrait horizontal corrigés dans le pipeline dédié ; la largeur des colonnes et les états vides sont plus proches de la source.
- Liste : l’affichage montrait provisoirement zéro résultat au chargement. Les totaux ne sont maintenant affichés que lorsque les données sont disponibles. Les filtres de clôture et d’étape ainsi que l’export CSV restent des adaptations V2, et non une copie exacte.
- Fiche : le sélecteur « Autre étape » occupait la largeur entière et passait sous les boutons. Sa largeur est limitée et il est aligné à droite, comme dans la référence à la taille observée.
- Le modèle V2 conserve les étapes et règles de transition documentées en P04 ; la référence comporte davantage d’étapes. Les données fictives diffèrent entre les deux environnements. Le contrôle mobile a permis de constater le rendu en liste dans l’arbre accessible, mais la capture mobile obtenue n’était pas exploitable pour une comparaison visuelle : elle reste à refaire.
- Le formulaire de rappels, absent de cette comparaison source/cible, a été vérifié séparément en P04 sur une base isolée. Aucune donnée réelle n’a été modifiée et aucun envoi extérieur n’a été effectué.
- Écran `/activites` : écart majeur observé. La source présente « Activités et agenda », un choix liste/semaine et des filtres de période (retard, aujourd’hui, 7 jours, à venir, toutes), de type et de statut. La cible affiche une liste générique « Activités & relances », sans ces vues et filtres équivalents. Les jeux de données diffèrent ; l’absence de lignes en cible n’est pas un écart de contenu. Reprise de cet écran nécessaire avant validation P04/P11.

## Suites

Les autres fiches, profils, thèmes, tailles mobiles, documents et actions ne sont pas validés par cette passe. Comparer en particulier les activités, devis, clients et tableaux par profil, puis reprendre les tests mobile et l’inspection des documents Word. Ne pas déclarer P11 terminée ni la parité trait pour trait acquise sur cette base.
