# P10-C — Analyse SWOT mesurée et exports

06/11/2026. Troisième sous-lot de P10 : analyse SWOT calculée depuis des indicateurs mesurés, avec revue, validation figée et exports CSV.

## Livré localement

### Analyse SWOT
- Génération pour une périodicité (mensuel, trimestriel, semestriel, annuel) et un périmètre (service ou direction générale consolidée).
- **Chaque constat porte sa preuve chiffrée et sa source** : par exemple « Taux d’acceptation de 25 % (3 sur 12 devis) — Devis de la période ».
- **Aucun constat n’est rédigé sans chiffre à l’appui.** Si les seuils ne sont pas atteints, le quadrant reste vide et le rapport l’indique explicitement au lieu d’inventer un texte.
- Seuils appliqués et vérifiés par tests : taux d’acceptation (≥ 50 % = force, < 30 % avec au moins 3 devis = faiblesse), encaissement (≥ 70 % = force, < 50 % = faiblesse), créances échues, pipeline ouvert, gains contre pertes, nouveaux tiers, fiches à qualifier, tâches en retard, articles sous seuil, demandes de fonds en attente.
- **Recommandations déterministes** : priorité, axe, constat, action, porteur suggéré et horizon. Ce ne sont pas des textes générés librement.
- **Revue puis validation** : préparée → revue → validée. Une analyse **validée est figée** et ne peut plus être modifiée ; il faut en préparer une nouvelle.
- Une même période et un même périmètre ne peuvent pas être dupliqués.
- Périmètre strict : un responsable de service ne peut ni produire ni lire une analyse d’un autre service.

### Exports CSV
- Rapport périodique et analyse SWOT exportables en CSV, avec en-tête lisible, séparateur `;`, BOM UTF-8 pour Excel.
- Les mêmes règles de périmètre s’appliquent à l’export : un profil hors périmètre reçoit un 404, jamais le fichier.
- Chaque export est journalisé.

## Migration

Migration additive `2026_11_06_150000_create_swot_analyses`. Aucune table existante modifiée.

## Contrôles exécutés

- Laravel ciblé : `5` tests réussis, `39` assertions.
- Frontend : vérification TypeScript et `53` tests unitaires réussis.
- Navigateur : scénario P10-C réussi — analyse préparée, quatre quadrants affichés avec sources, export CSV téléchargé, validation rendant l’analyse figée.

## Limites conservées

Restent ouverts dans P10, et **dépendent d’une décision ou d’une configuration de ta part** :

- **Courrier externe** : SMTP, gabarits, adresses réelles et recette d’envoi. Aucun e-mail n’est envoyé par l’application ; le générateur de courrier privé existe pour les tests locaux.
- **Assistant** : mode (règles ou modèle), périmètre de données et configuration serveur à choisir. Je n’ai créé aucun assistant factice.
- **Tâches planifiées** propres à ces fonctions : à inventorier et configurer avec toi.

Lien de démonstration local : [analyse SWOT](http://127.0.0.1:5174/swot), [rapports](http://127.0.0.1:5174/rapports).
