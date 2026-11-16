# P07-C — Tableaux de bord et définitions

06/11/2026. Développé localement et contrôlé techniquement ; réception métier et comparaison visuelle détaillée avec la référence encore attendues.

- Tableau Indicateurs : affaires gagnées et pipeline, suivi commercial, devis acceptés, transformation, marge, nouveaux clients accessibles et réclamations ; tâches et ordres, y compris ordres terminés à temps ; stocks ; campagnes, occupation, maintenance, redevances et satisfaction ; factures, créances, encaissements et délais ; présence, retards et congés.
- La plupart des indicateurs mesurés sur une période sont comparés à une période précédente de même durée. Les états à date ne sont pas présentés comme historiques. Les cibles accessibles sont globales à l’entreprise ; elles ne sont pas faussement appliquées à une sélection individuelle ou de service.
- Espace de service : répartitions par statut et évolution mensuelle des tâches terminées, ordres reçus/terminés et, selon les droits, opportunités, factures et paiements. Les données restent soumises aux périmètres autorisés.
- Montant gagné : dernier devis accepté accessible, sinon montant de l’affaire ; gain selon `won_at`. Taux de gain : gagnées et perdues selon `closed_at`. Cycle : qualification, sinon création, jusqu’au gain. Le montant gagné reste distinct des factures et des encaissements.
- Les paiements comptés sont uniquement validés. La date de création de la facture sert de référence au délai de paiement, faute d’une date d’émission distincte. L’occupation représente les jours réservés des supports actifs et n’est donnée que sur le périmètre global autorisé. Les premières propositions acceptées sont calculées dans les devis accessibles.
- Les anciennes relances sans lien fiable vers un devis restent exclues du taux ; aucun rapprochement rétroactif n’a été inventé.

Vérifications : 10 tests Laravel / 86 assertions ; 3 tests frontend ; build React réussi ; accès navigateur et absence de débordement mobile vérifiés sur sept profils (commercial, production, finance, RH, direction, régie, administration). L’API MySQL locale a répondu pour cinq profils. Ces vérifications ne constituent pas une preuve de conformité visuelle trait pour trait ni une validation métier par COM&SIG.
