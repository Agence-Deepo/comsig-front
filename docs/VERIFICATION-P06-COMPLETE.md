# P06 — Recette technique finale

Date : 04/11/2026. Statut : réalisé techniquement en local ; validation visuelle et métier de l’utilisateur encore attendue.

## Périmètre livré

- Espaces service, administration et entreprise ; publication des projets et gestion de leurs intervenants.
- Tâches en liste, Kanban et matrice Eisenhower, rattachement projet, registre des risques et rapport du temps.
- Ordres de travail interservices avec affectation, transitions, journal, spécifications, quantité/unité, machine, projet, circuit, pièces jointes et temps saisi.
- Circuits à trois itinéraires : production (informatique puis atelier choisi), régie et direction ; prise en charge, transmission, retour, réorientation, annulation, journal et création d’ordre de travail aux étapes de production.
- To-do et checklists privées avec synchronisation bidirectionnelle, rappel programmé, relance interne au plus toutes les quatre heures entre 7 h et 20 h et annonce vocale navigateur si autorisée.
- Rapports de repérage : lieu/GPS, mesures, contraintes, risques, recommandations, photos, soumission, validation ou reprise.
- Calendrier jour/semaine/mois/année/frise, rendez-vous récurrents, sources tâches/activités/ordres et délégation en consultation ou modification.
- Protocole P1–P5 avec règles communes et volume de tâches ouvertes.

## Preuves exécutées

- Migration additive `2026_11_04_200000_complete_p06_workflows` appliquée sur MySQL Wamp.
- `P06CompletionTest` : circuit, ordre automatique, repérage soumis/validé, risque critique, récurrence calendrier, rappel et checklist synchronisée.
- `DailyWorkflowsTest` + `P06CompletionTest` : **5 tests, 70 assertions, tous réussis**.
- Build React : TypeScript puis Vite réussis.
- Recette sur l’API locale réelle : `flows/stats`, `surveys`, `risks`, `priority-protocol`, `calendar/owners` et `company-projects` répondent tous HTTP 200.
- Frontend local `http://127.0.0.1:5174` répond HTTP 200 ; API `http://127.0.0.1:8002` conservée en fonctionnement.
- Planificateur Laravel local démarré pour les rappels et relances.

## Limites explicites

- L’annonce vocale dépend de l’autorisation et des règles d’autoplay du navigateur ; la notification interne reste disponible si la voix est bloquée.
- Les rappels externes par e-mail/SMS ne font pas partie de P06 et aucun message externe n’est envoyé.
- La production exige en hébergement l’exécution permanente de `php artisan schedule:run` chaque minute (cron Hostinger) ; la configuration distante relève de P12.
- Les exports PDF/Word/Excel des nouveaux écrans ne sont pas affichés tant qu’un générateur cible n’est pas raccordé ; aucune action visible ne mène vers une route inexistante.
