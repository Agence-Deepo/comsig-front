# P06-A — Espace de service et tâches

04/11/2026. Priorité donnée à l’implémentation à la demande utilisateur ; contrôles limités au nouveau lot, sans relance exhaustive.

Livré localement :

- `/espace` devient un véritable espace de service : tâches ouvertes, retards, urgentes/importantes, clôtures de la semaine, échéances à 14 jours (12 maximum), équipe accessible et accès aux dossiers métier autorisés. Agrégats serveur, pas téléchargement global des portefeuilles.
- `/espace-admin` : compteurs de comptes et de sécurité, accès utilisateurs/services/audit. Réservé à `admin.view`, aucun droit métier ajouté.
- `/taches` : liste conservée, vues Kanban et matrice des priorités. Statut « En attente », urgence/importance persistées, clôture datée au serveur, réouverture et audit. Pagination explicite de 50 tâches dans les tableaux ; classification historique inconnue laissée « À classer ».
- Les droits existants restent applicables : commercial limité à ses tâches ; changement de service réservé au périmètre global. Équipe personnelle limitée au compte lui-même. Aucun annuaire élargi pour un commercial.

Migration additive `2026_11_04_140000_extend_task_workspace`, appliquée au MySQL local. Aucun ancien statut/date de clôture réécrit. Trois tests API ciblés passent (25 assertions) : isolation, priorités/clôture/réouverture, contrôle de l’espace administration. Compilation React réussie. Un parcours navigateur ciblé passe : espace service, création d’une tâche, classement urgent/important, clôture persistée après rechargement et affichage mobile sans débordement. Deux sélecteurs de recette ont été corrigés avant cette réussite ; libellés accessibles explicites ajoutés aux sélections de la matrice. Capture mobile inspectée dans `test-results-p06a-receipt`. Aucune suite globale relancée pour P06-A. API normale 8002 et React 5174 répondent.

À poursuivre en P06 : to-do/checklists, demandes et ordres interservices, espace entreprise dédié, circuits, repérages, risques/temps, protocole de priorités et notifications propres aux demandes. Le calendrier existant reste accessible ; sa parité exhaustive avec la source n’est pas annoncée. Pas de clôture globale de P06 ni de validation visuelle utilisateur présumée.

Réserve de capture : le menu latéral était encore en transition au redimensionnement de la capture mobile inspectée. Attente de fin de transition ajoutée au scénario, sans relance supplémentaire ; réception visuelle finale mobile encore ouverte.
