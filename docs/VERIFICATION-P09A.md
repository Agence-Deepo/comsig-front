# P09-A et P09-B — Finance, RH et espace salarié

06/11/2026. Premier lot de P09, exécuté dans le périmètre isolé des travaux P06/P07/P08 et sans migration de base.

## Livré localement

### Écritures comptables automatiques (P09-A)
- Facture interne : écriture équilibrée **débit client / crédit ventes / crédit TVA**, produite à la création.
- Règlement validé : écriture **débit banque (ou caisse/mobile money) / crédit client**, produite uniquement à l’approbation par une autre personne.
- Toutes les écritures sont créées en **brouillon** : elles doivent être comptabilisées par un tiers selon le circuit existant. Aucun contournement du contrôle à quatre yeux.
- **Idempotence** : une facture ou un règlement ne peut produire qu’une écriture (référence `FAC-<numéro>` / `ENC-<référence>`).
- **Aucun barème, taux ou montant inventé** : les montants viennent strictement de la facture ou du règlement. Les codes de comptes utilisés sont déclarés dans `config/finance.php` (`411`, `701`, `443`, `521`, `571` par défaut) et restent modifiables par variables d’environnement.
- Si un compte est absent ou inactif, **aucune écriture n’est produite**, la facture ou le règlement reste valide, et l’incident est journalisé (`accounting.skipped`) pour être traité par la finance.
- Une panne comptable ne fait jamais échouer une facture déjà émise.

### Compte client et créances (P09-A)
- Compte client : factures, règlements validés, total facturé, total encaissé, reste dû et montant échu, calculés depuis les données réelles.
- Seuls les règlements **validés** réduisent le reste dû ; une demande en attente ne le modifie pas.
- File des créances échues avec nombre de jours de retard, réservée au droit `finance.view`.
- Lien depuis la fiche client et entrée de menu « Créances échues ».

### Espace salarié (P09-B)
- `/mon-espace-rh` : dossier personnel, solde de congés, demandes récentes, pointages récents.
- Demande de congé qui entre dans le **circuit RH puis direction existant** ; aucune auto-validation. Chevauchement de périodes refusé, dates passées refusées, limite de 365 jours.
- Annulation possible **uniquement tant qu’aucun avis n’a été rendu** ; après l’avis RH, le salarié doit passer par les ressources humaines.
- Pointage d’arrivée **un seul par jour**, sans possibilité de corriger une journée passée : la correction reste une action RH motivée.
- Missions de flotte du collaborateur (véhicule, période, destination, compteurs) si un dossier chauffeur le lie.
- **Aucun droit `hr.view` n’est accordé** : le lien se fait par le compte utilisateur du dossier salarié, et toutes les lectures sont filtrées sur cet identifiant. Un compte sans dossier salarié reçoit un message explicite.

## Aucune migration, aucun droit nouveau

Ce lot n’ajoute ni table ni colonne. Les écritures utilisent les tables comptables existantes ; l’espace salarié lit les tables RH existantes. Aucun rôle n’est élargi.

## Contrôles exécutés

- Laravel ciblé : `10` tests réussis, `89` assertions (écritures équilibrées, idempotence, compte manquant tracé, compte client, retards, confidentialité de l’espace salarié, circuit de congé, pointage unique, flotte personnelle).
- Laravel complet : `253` tests réussis, `2 209` assertions.
- Frontend : vérification TypeScript, compilation de production et `53` tests unitaires réussis.
- Pint ciblé sur les fichiers du lot : réussite.
- Navigateur, scénario P09 : réussi — plan comptable vérifié via l’API, créances échues, formulaire de facture, espace salarié avec dépôt de demande ou message explicite.
- Navigateur, suite complète : `43` tests réussis, `24` scénarios optionnels ignorés, aucun échec.
- Manuels : sources mises à jour et sept exports Word/PDF régénérés.

## Erreurs corrigées pendant le lot

- Le retard de paiement était calculé avec un signe inversé (`diffInDays` de Carbon 3) et s’affichait en négatif : corrigé, le retard est désormais un nombre de jours positifs.
- L’annulation d’une demande de congé était initialement autorisée après l’avis RH, ce qui effaçait un avis rendu : resserrée à l’état « demande ».
- Un scénario P03 dépendait du chargement des référentiels clients pour enregistrer une fiche : le blocage a été retiré (les référentiels n’alimentent que des listes facultatives) et le filtre « Secteur » conserve désormais la valeur venue de l’URL.

## Limites conservées

Restent ouverts dans P09 : demandes de fonds et dépenses récurrentes avec justificatif, états et rapprochements de trésorerie, dossiers RH élargis (justificatifs, évaluations, formations, badge), entretien/carburant/géolocalisation de la flotte (aucun arbitrage confirmé), paramètres de paie à valider par le responsable, et recette FNE avec les interlocuteurs compétents. Aucune certification fiscale réelle n’est déclenchée.

Lien de démonstration local : [créances échues](http://127.0.0.1:5174/creances-echues), [mon espace RH](http://127.0.0.1:5174/mon-espace-rh), [écritures](http://127.0.0.1:5174/ecritures).
