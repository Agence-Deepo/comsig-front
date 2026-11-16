# P08-B — Régie, supports, stocks et projets

04/11/2026. Deuxième sous-lot P08, développé dans la continuité de P08-A et toujours isolé des espaces de service, tâches, ordres de travail et tableaux de bord P06/P07.

## Livré localement

- **Planning des faces** (`/planning`) : frise et liste calculées depuis les réservations actives du serveur. La période affichée peut être ajustée ; une réservation qui chevauche la période n’est jamais rognée ni masquée. Cet écran est en lecture seule : la réservation se crée depuis la campagne, ce qui conserve le contrôle anti-chevauchement existant.
- **Fiche support** : emplacement avec aperçu cartographique OpenStreetMap en lecture seule (aucune géolocalisation implicite), réservations de la face et interventions associées, chacune liée à sa fiche.
- **Fiche stock** : valorisation affichée depuis le solde et le CUMP renvoyés par Laravel, alerte de seuil explicite. Le journal détaillé reste dans le panneau « Mouvements de stock » existant, pour ne pas dupliquer la même liste. Aucun prix ni coût n’est calculé côté navigateur.
- **Fiche projet** : ordres de production rattachés et disponibilité réelle des matières, avec distinction besoin / disponible calculée depuis le stock serveur.
- **Trois ressources régie auparavant absentes** : maintenance (`interventions`), collectivités (`collectivities`) et déploiements (`deployments`), avec leurs écrans, leurs filtres et leurs circuits.
- Les trois nouvelles ressources réutilisent la permission `campaigns` existante : aucun nouveau rôle ni droit métier n’a été accordé.

## Règles métier ajoutées

- Une intervention exige une face active ou aucune face, une échéance postérieure au signalement, et un signalement non futur. Sa résolution est obligatoire avant clôture.
- Un déploiement doit être rattaché à une collectivité, un projet ou une campagne, rester dans la période de la campagne liée, et ne peut pas mobiliser la même équipe sur deux périodes qui se chevauchent.
- Les filtres de liste (`campaign_id`, `support_id`, `collectivity_id`, `project_id`, `from`, `to`) sont validés côté serveur et appliqués dans le périmètre de données du compte.

## Migration et données

Migration additive `2026_11_04_180000_create_regie_operations` : trois nouvelles tables seulement, aucune table existante modifiée ni supprimée. Appliquée sur la base locale `comsig_v2` après prévisualisation `migrate --pretend`. Aucun import, aucune donnée source, aucun déploiement.

## Contrôles exécutés

- Laravel ciblé sur `ErpModulesTest` : `12` tests réussis, `156` assertions, dont le nouveau scénario maintenance/collectivités/déploiements.
- Laravel complet : `207` tests réussis, `1 746` assertions.
- Frontend : vérification TypeScript, compilation de production et `53` tests unitaires réussis.
- Pint ciblé sur les fichiers de ce lot : réussite.
- Navigateur : scénario P08 complet réussi — support, campagne, réservation, planning, fiche support, intervention jusqu’à clôture, collectivité, déploiement jusqu’à clôture, stock, projet et ordre de production.
- Navigateur, suite complète isolée : `33` tests réussis, `24` scénarios optionnels ignorés par leur configuration.

Une première suite complète avait signalé deux échecs : un doublon de liste de mouvements introduit par la nouvelle fiche stock (corrigé en retirant le panneau redondant) et un scénario client ralenti par ce même rendu. Les deux scénarios ont été rejoués avec succès, puis la suite entière a été relancée avec succès.

## Limites conservées

Restent ouverts dans P08 : pose/dépose et preuves de campagne, bilan de campagne, inventaire physique et multi-dépôts, vue atelier multi-colonnes de la production, escalades automatiques des réclamations et rattachement réclamation ↔ intervention. Le planning n’affiche pas encore les faces libres sans réservation. Aucune validation visuelle ou métier utilisateur n’est présumée.

Lien de démonstration local : [planning des faces](http://127.0.0.1:5174/planning), [maintenance](http://127.0.0.1:5174/maintenance), [collectivités](http://127.0.0.1:5174/regie/collectivites), [déploiements](http://127.0.0.1:5174/regie/deploiements).
