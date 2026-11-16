# P08-D — Coûts de campagne, atelier et conversion

04/11/2026. Quatrième et dernier sous-lot P08 : il traite les trois points qui restaient ouverts dans le plan de travail.

## Livré localement

### Coûts prévus et réels de campagne
- Lignes de coût par catégorie (impression, production, pose, transport, maintenance, sous-traitance, redevance, autre) avec montant prévu, montant réel facultatif, libellé et fournisseur.
- **Aucun montant n’est déduit** d’un devis, d’un tarif de support ou d’un mouvement de stock : tout est saisi par l’équipe.
- Le total réel ne compte que les montants réellement saisis ; les lignes sans réel sont signalées « À saisir » et comptées séparément.
- Les coûts sont **figés** dès que la campagne est clôturée ou annulée.
- Le montant réservé de la campagne est rappelé en regard, sans le confondre avec un coût.

### Vue atelier de production
- `/ordres-production` devient une vue atelier : file des ordres à gauche avec filtre « En cours » / « Tous », fiche de l’ordre sélectionné à droite.
- Disponibilité **réelle** des matières (besoin / disponible / unité) calculée depuis le stock serveur, avec alerte si une matière manque.
- Le circuit de fabrication existant (autoriser, démarrer, terminer, prêt, livrer, annuler) reste inchangé et piloté par Laravel.

### Escalades et conversion
- La commande horaire `comsig:escalate-overdue` crée désormais une **notification interne nominative** : le responsable de la réclamation, ou l’intervenant affecté à l’intervention (à défaut son responsable). Aucun e-mail, aucun envoi externe.
- L’escalade reste **idempotente** : un second passage ne crée ni nouvelle marque ni nouvelle notification.
- **Conversion explicite** d’une réclamation en intervention de maintenance : uniquement avec la case dédiée, sous double droit (`complaints.update` + droits Régie). L’intervention reprend l’objet, la gravité et l’échéance ; l’échéance passée est ramenée à aujourd’hui. Aucun intervenant n’est affecté automatiquement. Une seconde conversion est refusée et la réclamation reste ouverte.
- Une réclamation résolue ne peut pas être convertie.

## Migration et données

Migration additive `2026_11_04_210000_create_campaign_costs` : une seule nouvelle table, appliquée en local. Aucune table existante modifiée, aucun montant recalculé, aucun import, aucun déploiement.

## Aucun droit nouveau

Écrans et conversion réutilisent `campaigns.view`/`update` et `complaints.update`. Aucun rôle élargi.

## Contrôles exécutés

- Laravel ciblé : `5` tests réussis, `42` assertions (coûts prévus/réels, gel après clôture, notification unique, affectation notifiée, conversion sous conditions).
- Frontend : vérification TypeScript, compilation et `53` tests unitaires réussis.
- Navigateur : scénario P08-D réussi — coûts saisis avec réel partiel, conversion d’une réclamation en intervention, file d’atelier avec disponibilité des matières.

## État de P08

Toutes les cases du lot P08 sont réalisées en local. **La validation visuelle et métier reste à faire avec toi** : aucune conformité pixel ni accord métier n’est présumé. Restent explicitement hors périmètre : lots et dates de péremption, transferts planifiés entre entrepôts.

Lien de démonstration local : [campagnes](http://127.0.0.1:5174/campagnes), [atelier de production](http://127.0.0.1:5174/ordres-production), [réclamations](http://127.0.0.1:5174/reclamations).
