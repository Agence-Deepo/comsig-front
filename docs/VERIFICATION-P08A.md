# P08-A — Campagnes et réservations de faces

04/11/2026. Premier sous-lot P08 développé dans un périmètre séparé des espaces de service, tâches, ordres de travail et tableaux de bord P06/P07.

## Livré localement

- La fiche d’une campagne affiche désormais uniquement les réservations qui lui sont rattachées.
- Une face peut être réservée directement depuis la campagne, dans les limites de sa période.
- Le conflit HTTP 409 existant est présenté explicitement lorsque la face est déjà réservée sur une période qui se chevauche.
- La liste filtrée reste calculée par Laravel dans le périmètre de données du compte ; le frontend ne télécharge pas toutes les réservations pour les filtrer localement.
- Les actions existantes de planification, démarrage, clôture et annulation restent pilotées par les règles serveur.

## Contrôles exécutés

- Laravel ciblé : `1` test réussi, `18` assertions.
- Laravel complet : `206` tests réussis, `1 718` assertions.
- Frontend : vérification TypeScript et compilation de production réussies.
- Frontend : `53` tests unitaires réussis dans `7` fichiers.
- Navigateur : scénario P08-A réussi ; suite complète isolée réussie avec `32` tests exécutés et `24` scénarios optionnels ignorés par leur configuration.
- Diagnostics IDE et Pint ciblé : aucune erreur sur les fichiers modifiés.
- Manuels : sources mises à jour et sept exports Word/PDF régénérés.

La première exécution globale avait réutilisé les serveurs locaux et atteint leurs limites normales. Le lanceur Playwright utilise désormais des ports dédiés, transmet les origines de session, applique les limites HTTP au vrai processus PHP et relève uniquement le plafond API de recette. La suite finale réussie n’a ni arrêté ni remplacé les serveurs de développement 5174/8002.

Le contrôle Pint global signale encore des écarts de style dans des fichiers P04/P06 et dans le script OpenAPI qui ne font pas partie de P08-A. Ils n’ont pas été réécrits afin de ne pas interférer avec les autres travaux ; le contrôle limité aux fichiers PHP de ce lot réussit.

Lien de démonstration local vérifié : [campagnes](http://127.0.0.1:5174/campagnes) avec l’API [opérationnelle](http://127.0.0.1:8002/api/v1/health).

## Limites conservées

P08 n’est pas déclaré terminé. Le planning visuel, la carte et les fiches enrichies des supports, la pose/dépose, la maintenance, les collectivités, les déploiements et les paiements partiels des redevances restent à traiter. Aucun déploiement, migration, import, envoi externe ou réservation sur des données réelles n’a été effectué.
