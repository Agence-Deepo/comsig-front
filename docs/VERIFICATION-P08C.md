# P08-C — Preuves de campagne, inventaire et escalades

04/11/2026. Troisième sous-lot P08. Il complète les points restants du plan : preuves et bilan de campagne, inventaire physique multi-entrepôts, faces libres dans le planning, escalades de retard et lien réclamation ↔ intervention.

## Livré localement

### Campagne : preuves et clôture
- Preuve d’exécution par face : type (pose, contrôle, dépose, incident), constat (conforme, non conforme, à reprendre), date et commentaire.
- Une preuve non conforme exige un commentaire ; une preuve identique (même face, même type, même date) est refusée.
- Une face non réservée par la campagne est refusée.
- La clôture exige **une preuve de pose conforme par face réservée** et un bilan écrit ; la satisfaction client (1 à 5) et les enseignements sont facultatifs.
- La clôture reste une décision explicite : aucune preuve ne change le statut automatiquement.

### Stocks : multi-entrepôts et inventaire contradictoire
- Entrepôts nommés, avec un entrepôt principal créé par migration qui reprend le stock existant sans le déplacer.
- Niveaux de stock par entrepôt ; une sortie est refusée si le solde **de l’entrepôt** est insuffisant, même si le total global suffit.
- Le CUMP reste calculé globalement par article, comme avant.
- Inventaire : quantités théoriques figées à l’ouverture, un seul inventaire ouvert par entrepôt, motif obligatoire pour chaque écart.
- La validation est **forcée par une autre personne** que le compteur ; elle applique les écarts en mouvements de correction tracés et auditée. Aucun écart n’est appliqué avant cette validation.
- Écran `/stocks/inventaire` : niveaux par entrepôt, sessions d’inventaire, saisie des quantités comptées et motifs.

### Planning des faces
- Les faces sans réservation apparaissent désormais **libres** sur la période, en plus des barres de réservation.

### Réclamations et maintenance
- Commande planifiée `comsig:escalate-overdue` (horaire, sans chevauchement) : marque une seule fois les réclamations et interventions dont l’échéance est dépassée. Aucun e-mail, aucune notification externe.
- Filtre `overdue=1` sur la liste des réclamations.
- Rattachement d’une réclamation à une intervention de maintenance : **double droit** requis (`complaints.update` et `campaigns.view`). Le lien ne modifie ni le statut de la réclamation ni celui de l’intervention.

## Migration et données

Migration additive `2026_11_04_190000_add_warehouses_campaign_proofs_and_escalations`, appliquée en local après prévisualisation :
- nouvelles tables `stock_warehouses`, `stock_levels`, `stock_counts`, `stock_count_lines`, `campaign_proofs` ;
- colonnes ajoutées sur `stock_movements`, `erp_campaigns`, `complaints` et `erp_interventions` ;
- rattachement des mouvements existants à l’entrepôt principal.

Aucune table supprimée, aucun montant recalculé, aucun import de donnée source, aucun déploiement.

## Aucun droit nouveau

Les écrans réutilisent `stocks.view`, `stocks.update` et `campaigns.view`/`update`. Aucun rôle n’a été élargi. Une réclamation ne peut être liée à une intervention que par un profil disposant déjà des deux droits.

## Contrôles exécutés

- Laravel ciblé : `11` tests réussis, `128` assertions (stock multi-entrepôts, inventaire, preuves de campagne, escalades, lien réclamation ↔ intervention).
- Laravel complet : `218` tests réussis, `1 875` assertions.
- Frontend : vérification TypeScript et compilation de production réussies, `53` tests unitaires réussis.
- Navigateur : scénario P08-C réussi — campagne avec réservation, preuve de pose, clôture avec bilan, inventaire sur entrepôt dédié avec écart motivé, validation par un tiers, puis réclamation avec rattachement.
- Navigateur, suite complète : `34` tests réussis, `24` scénarios optionnels ignorés, aucun échec.

## Corrections d’erreurs rencontrées

- La migration P06 `2026_11_04_200000_complete_p06_workflows` ciblait une table inexistante (`personal_checklist_items` au lieu de `checklist_items`) et bloquait toute la suite de tests : corrigée.
- Le test P06 `StockInventoryAndCampaignProofTest` contenait un `echo $this` invalide et attendait qu’un profil Régie modifie une réclamation sans droit `complaints.update` : corrigé en conservant la règle de sécurité.
- `AttachmentAccess::canManage()` lisait une clé `model` absente pour les ressources ERP, ce qui cassait l’affichage des documents sur la fiche campagne : corrigé.
- `WorkspaceNotifications` produisait une colonne `user_id` ambiguë entre `personal_notifications` et `notification_reads` (erreur 500 sur les notifications) : colonnes qualifiées.
- La liste des inventaires renvoyait l’identifiant de l’entrepôt à la place de celui de l’inventaire : colonnes qualifiées.
- Le formulaire de mouvement envoyait un `warehouse_id` vide, refusé par la validation UUID : valeur vide retirée du payload.

## Limites conservées

Restent ouverts dans P08 : vue atelier multi-colonnes de la production, coûts prévus/réels de la campagne, lots et dates de péremption, transferts planifiés entre entrepôts, notification nominative du responsable à l’escalade et transformation automatique d’une réclamation en intervention. Aucune validation visuelle ou métier utilisateur n’est présumée.

Lien de démonstration local : [inventaire](http://127.0.0.1:5174/stocks/inventaire), [planning](http://127.0.0.1:5174/planning), [campagnes](http://127.0.0.1:5174/campagnes).
