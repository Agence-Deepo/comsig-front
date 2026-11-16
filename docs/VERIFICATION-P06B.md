# P06-B — Demandes interservices, to-do et checklists

04/11/2026. Développement local, sur les projets fusionnés ; aucune publication.

## Réalisé

- Ordres de travail : demande avec service destinataire, descriptif, priorité explicite et échéance ; files reçues, affectées et émises ; direction globale : tous les services. Le destinataire affecte un membre actif autorisé. États : demande, planifié, en cours, bloqué, en contrôle, terminé, livré et annulé, avec transitions contrôlées, motif de blocage ou annulation et date serveur de clôture/livraison. Historique des actions/commentaires, audit et protection contre l’écrasement d’une version modifiée.
- Périmètre : le demandeur voit ses demandes ; le service destinataire voit les dossiers accessibles à son rôle ; un agent personnel ne voit que les demandes dont il est demandeur ou responsable. La permission d’exécution ne donne pas de droit au demandeur commercial pour modifier le travail d’un autre service.
- To-do personnelles : ajout, modification, échéance, priorité, cochage et archivage. Checklists privées : création, ajout de points facultatifs/obligatoires, cochage et archivage. Une checklist peut être liée à une tâche appartenant à son propriétaire ; un point obligatoire non coché empêche sa clôture. La tâche doit être rouverte pour modifier une checklist après clôture. Avant réaffectation ou suppression d’une tâche, ses checklists doivent être archivées par leur propriétaire.
- Notifications internes pour les demandes accessibles et les to-do à échéance jusqu’à la fin de la journée ; aucune adresse ou envoi externe. L’espace service affiche les demandes reçues, émises et en retard dans le périmètre autorisé.

## Limites et vérification

Migration additive `2026_11_04_160000_create_daily_workflows` appliquée à MySQL local. Elle ajoute des permissions de travail par rôle, sans attribuer de droits métier à l’administration technique. Vérification groupée ciblée : 10 tests API, 95 assertions ; compilation React réussie. Deux parcours navigateur réussis sur base SQLite isolée : demande commerciale affectée et livrée par la production, puis to-do et checklist persistées après rechargement. Le contrôle du second parcours a été repris après ajustement de la synchronisation du test avec la réponse du serveur. Capture mobile de checklist inspectée ; aucun débordement constaté. Ces recettes ne remplacent pas la validation métier et visuelle avec l’utilisateur.

Pas encore repris : synchronisation bidirectionnelle automatique to-do/checklist, champs métier spécialisés par type d’ordre, suivi du temps, pièces rattachées aux ordres, liens projet/production et circuits de production. Les rappels vocaux et la relance groupée toutes les quatre heures ne sont pas activés. Une demande ne crée pas automatiquement de fabrication, facture ou mouvement de stock. La date de rappel distincte de l’échéance n’est pas encore disponible.

La P06 reste en cours : espace entreprise spécifique, repérages, protocole des priorités, risques, temps et réception métier/visuelle globale.
