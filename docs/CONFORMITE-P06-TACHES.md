# Conformité P06 — écran « Tâches et matrices »

06/11/2026. Mise en conformité de l’écran `/taches` avec la démonstration visuelle `docs/crm-comsig-demo.html`, module **Mon travail › Tâches et matrices**.

## Méthode

La démonstration a été ouverte dans un navigateur, parcourue jusqu’à l’écran concerné, et sa structure DOM ainsi que ses styles ont été extraits (`matrix-2x2`, `matrix-cell`, `kanban`, `kanban-card`, `prio-badge`, `prio-legend`, tokens d’espacement, couleurs de quadrants). Les valeurs reprises sont celles du fichier de démonstration, pas des valeurs approchées.

## Conforme désormais

| Élément | Démonstration | État |
|---|---|---|
| Onglets | Kanban, Liste, Planification, Matrice des priorités, Matrice des risques, Gestion du temps | **Conforme**, y compris l’onglet Planification auparavant absent |
| Filtres de périmètre | Mes tâches / Mon service / Confiées | **Conforme** (case unique remplacée par le sélecteur à trois positions) |
| Export | Bouton Excel | **Conforme** : export `.xlsx` réel, dans le périmètre du compte |
| Légende | P1 à P5 avec « Critères et délais » | **Conforme** |
| Pastilles de priorité | Pastille colorée P1–P5 + infobulle de délai | **Conforme** : couleurs #C81E1E, #EA580C, #CA8A04, #2563EB, #64748B |
| Carte de tâche | Titre, référence `TCH-AAAA-NNNN`, échéance, responsable, badges Urgent/Important | **Conforme** |
| Kanban | Quatre colonnes + zone de dépôt | **Conforme**, glisser-déposer actif |
| Matrice | Quatre quadrants avec `n · x %` et sous-titres | **Conforme** |
| Planification | Frise : échelle de dates, marqueur « Aujourd’hui », chevrons colorés avec numéro et titre, légende numérotée avec statut | **Conforme** : ligne unique de chevrons contigus, tâches ouvertes seulement, largeur minimale garantissant l’affichage du titre |
| Risques | Grille probabilité × impact, axe Y « Probabilité », axe X « Impact → », score en bas à droite, pastilles-risques cliquables, légende en quatre pastilles colorées, registre avec état vide | **Conforme** : 25 cases, seuils et couleurs de la démonstration (#e04b3f, #f08c2e, #f2c94c, #4cbf86), pastilles `RSK-…` cliquables, icône et « Aucun risque enregistré » |
| Gestion du temps | Carte « Gestion du temps », sous-titre « n jours ouvrés · n h disponibles par personne », deux sélecteurs de dates, tableau Personne / Temps saisi / Charge / Répartition en barre empilée, légende de cinq pastilles | **Conforme** : voir la section dédiée ci-dessous |
| Comptage | Vue complète, pas une page | **Conforme** : parcours de toutes les pages (l’API plafonne à 100 par page) |

## Gestion du temps

La vue reprend la composition de la démonstration, extraite du DOM réel et non imitée à vue :

- carte titrée **Gestion du temps**, sous-titre calculé `n jours ouvrés · n h disponibles par personne` (8 h par jour ouvré) ;
- **deux sélecteurs de dates** dans l’en-tête, 30 derniers jours par défaut ; le second ne peut précéder le premier ;
- description d’origine : « Temps saisi sur les tâches et ordres de travail, réparti selon la matrice d’Eisenhower… » ;
- tableau `Personne | Temps saisi | Charge | Répartition` ;
- **Charge** : barre fine (`hbar-track`), pourcentage à une décimale comme la démonstration (`1,9 %`) ;
- **Répartition** : barre empilée de 12 px, coins en pastille, gouttière de 2 px entre segments, couleurs `--q-faire #d9443a`, `--q-planifier #2a78d6`, `--q-deleguer #e09a1a`, `--q-eliminer #8a909c`, `--q-ot #7a4fb8` ;
- **légende** des cinq parts sous le tableau, dans l’ordre de la démonstration ;
- état vide avec icône chronomètre et « Aucun temps saisi sur la période ».

Deux ajouts utiles, sans changer la composition :

- la barre de répartition est un **bouton** : le clic ouvre une fenêtre donnant le détail chiffré (durée et part de chaque quadrante, total et taux de charge). La démonstration ne se fie qu’à une infobulle, inaccessible au clavier et au tactile ;
- un bouton **Saisir du temps** sous le tableau, avec sa règle rappelée (« à une date qui ne peut être future »).

Le bouton **Excel** suit désormais l’onglet ouvert, comme la démonstration : `tasks/export.xlsx` pour les onglets de tâches, `risks/export.xlsx` pour le registre des risques, `time/export.xlsx?from=&to=` pour la gestion du temps.

Côté données, seules les personnes ayant réellement saisi du temps sur la période apparaissent : une ligne à zéro minute n’apprend rien. La démonstration fait de même.

## Fenêtre d’édition de tâche

Cliquer sur un chevron de la frise, une carte du Kanban ou une carte de la matrice ouvre une **fenêtre** (et non plus un panneau latéral), reprenant la démonstration :

- intitulé, personne chargée (**liste limitée au périmètre du compte**, jamais l’annuaire complet), début et échéance ;
- matrice d’Eisenhower (urgent / important) ;
- **niveaux P1 à P5** en pastilles sélectionnables, avec le délai et les critères du niveau choisi ;
- temps estimé en minutes, statut, projet lié, description ;
- **checklist de vérification** du titulaire : points obligatoires comptés, cases persistées, ajout d’un point, création d’une checklist si elle n’existe pas ;
- boutons Annuler / Enregistrer, fermeture par Échap ou clic sur le fond.

La checklist reste **privée** : elle n’est affichée qu’au titulaire de la tâche. Un profil sans `tasks.update` ouvre la fenêtre en lecture seule, sans bouton Enregistrer.

## Modifications techniques

- **Backend** : référence de tâche `TCH-AAAA-NNNN` (migration additive, séquence par année, attribuée une fois), colonne `starts_at`, filtre `confiees`, endpoint `tasks/export.xlsx`, endpoint `priority-levels`.
- **Rapport de temps** : calcul extrait dans `app/Services/TimeReportBuilder.php`, partagé par `GET /time/report` et par les deux exports, pour qu’un seul code décide de la répartition. `load_pct` passe à une décimale et les lignes sans temps saisi sont écartées.
- **Exports Excel** : `tasks/export.xlsx`, `risks/export.xlsx`, `time/export.xlsx` — tous écrits explicitement en texte, ce qui empêche qu’un intitulé commençant par `=` devienne une formule. Des tests le vérifient.
- **Frontend** : réécriture de `TaskWorkspace.tsx` et feuille dédiée `task-conformity.css` reprenant les styles de la démonstration ; les anciennes classes sont conservées pour ne rien casser.

## Trois défauts corrigés en cours de route

- `per_page=500` rejeté par l’API (plafond 100), ce qui affichait une erreur et une matrice vide : remplacé par un parcours de pages.
- La matrice ne comptait que la page courante : elle couvre désormais tout le périmètre.
- Un sélecteur visible dans chaque carte n’existait pas dans la démonstration : rendu accessible aux lecteurs d’écran uniquement, le glisser-déposer restant le geste principal.

## Contrôles exécutés

- Laravel complet : `284` tests réussis, `2 452` assertions.
- Nouveaux tests ciblés : `8` réussis, `53` assertions (référence, périmètre Confiées, niveaux de priorité, export sans formule et refus hors droit, répartition par quadrant, personnes sans saisie écartées, jours ouvrés et export du rapport de temps, export du registre des risques).
- Frontend : vérification TypeScript et `53` tests unitaires réussis.
- Navigateur : captures des cinq vues avec un profil portant 43 tâches ; structure vérifiée (six onglets, trois filtres, cinq pastilles, quatre quadrants, cartes rendues).
- Navigateur, fenêtre de tâche : ouverture au clic sur un chevron, dix champs présents, cinq pastilles P1–P5, checklist affichée ; **enregistrement vérifié** (intitulé, priorité P2 et temps estimé persistés après réouverture), modale fermée après validation.
- Navigateur, matrice des risques : `25` cases, axes présents, scores en bas à droite, quatre pastilles de légende, état vide « Aucun risque enregistré » ; **création d’un risque vérifiée** (probabilité 4 × impact 5 = 20) : pastille `RSK-2026-000001` dans la case critique, ligne au registre, clic ouvrant la fiche.
- Navigateur, gestion du temps : en-tête conforme (titre, sous-titre, deux dates, aucun bouton en trop), quatre colonnes, barre à trois segments réels (`seg-faire` 40,9 %, `seg-planifier` 30,7 %, `seg-eliminer` 28,4 %), cinq pastilles de légende, détail ouvert au clic (5 parts chiffrées + total et taux de charge), **export `gestion-du-temps-2026-11-06.xlsx` téléchargé** (6 446 octets), changement de période recalculé (« 1 jour ouvré · 8 h »), affichage mobile avec libellés de colonnes.
- Navigateur, exports par onglet : `risques` → `risques-2026-11-06.xlsx`, les quatre onglets de tâches → `taches-2026-11-06.xlsx`.
- Navigateur, suite complète : `47` tests réussis, `24` scénarios optionnels ignorés, aucun échec ; nouveau test `e2e/time-management.spec.ts` vert.

## Défauts réels corrigés en cours de route

- `per_page=500` rejeté par l’API (plafond 100) : erreur affichée et matrice vide, remplacée par un parcours de pages.
- La matrice ne comptait que la page courante : elle couvre désormais tout le périmètre.
- **Deux filtres clients choisis coup sur coup s’écrasaient** : le second effaçait le premier, car React Router résolvait la mise à jour sur la dernière URL validée. La fusion passe maintenant par une référence de paramètres en attente. Défaut préexistant, sans rapport avec cet écran, mais il empêchait la persistance du filtre Secteur après rechargement.
- Deux tests attendaient l’ancien libellé « Créer une tâche » ou une navigation par menu vers `/taches?vue=liste` : mis à jour.
- Un test supposait la fiche sur la première page d’un filtre qui renvoie 27 résultats : il cible maintenant la fiche par recherche.
- **Accord au singulier** : une période d’un seul jour affichait « 1 jours ouvrés ». Le sous-titre et le détail disent maintenant « 1 jour ouvré ».
- **Catégories de risques** : l’écran proposait `commercial` et `qualite`, absents de la démonstration, et refusait `technique` et `reputation`, qu’elle propose — une saisie de risque technique était donc impossible. Les huit catégories de la démonstration sont acceptées ; les deux anciennes restent valides pour les fiches déjà enregistrées.
- **Libellés mobiles** : en dessous de 760 px, le tableau passait en mode empilé sans intitulé de colonne. Chaque cellule porte désormais son libellé (« Temps saisi », « Charge », « Répartition »).

## Limites

- Les 43 tâches existantes n’ont pas de classement urgence/importance : elles apparaissent toutes en « Ni urgent ni important ». C’est le reflet des données, pas un défaut d’affichage. Leur classement reste une décision métier.
- L’onglet Planification place les tâches sur leur date de début ou d’échéance ; la démonstration n’affiche pas de frise proportionnelle, la nôtre suit le même principe de liste datée.
- Les pastilles P1–P5 sont affichées ; leur attribution par défaut à la création reste `P4`, comme avant.
- **Matrice des risques** : la grille, ses axes, ses scores et ses couleurs reprennent la démonstration. Les risques non clos apparaissent en pastilles cliquables `RSK-…` dans leur case ; cliquer ouvre la fiche. Le registre affiche un état vide avec icône quand aucun risque n’existe, au lieu d’un tableau à zéro ligne.
- **Frise Planification** : les chevrons, l’échelle de dates, le marqueur « Aujourd’hui », les couleurs par statut et la légende numérotée reprennent les styles de la démonstration, sur **une seule ligne de chevrons contigus**. Deux corrections après comparaison visuelle côte à côte :
  - la frise n’affiche que les **tâches ouvertes**, comme le sous-titre l’annonce ; les tâches terminées ou annulées n’y figurent plus ;
  - chaque segment a une **largeur minimale de 120 px** (et suit la durée au-delà). Sans ce plancher, 22 tâches d’un jour se réduisaient à ~57 px, les intitulés disparaissaient et la frise devenait un ruban de couleurs sans sens. Le débordement passe par le défilement horizontal, comme la démonstration.

- **Gestion du temps** : la répartition est calculée à partir de l’urgence et de l’importance **actuelles** de la tâche. Si une tâche est reclassée après coup, son temps passé change de quadrant dans les rapports passés. C’est le comportement de la démonstration, qui lit `t.urgent` / `t.important` en direct ; figer le classement au moment de la saisie demanderait une colonne dédiée et une décision métier.
- Le temps saisi en dehors des deux bornes de la période n’est pas compté, et une personne sans aucune minute n’apparaît pas dans le tableau.
- Le détail chiffré ouvert au clic est un ajout : la démonstration ne montre que l’infobulle du segment.

Lien local : [tâches et matrices](http://127.0.0.1:5174/taches?vue=temps).

## Captures de recette

- Référence (démonstration) : `demo-kanban.png`, `demo-matrice.png`, `demo-planification.png`, `demo-risques.png`, `demo-temps-awa.png`.
- Notre interface après alignement : `recette-taches-kanban.png`, `recette-taches-matrice.png`, `recette-taches-planification.png`, `recette-taches-risques.png`, `recette-temps.png`, `recette-temps-detail.png`, `recette-temps-mobile.png`.
