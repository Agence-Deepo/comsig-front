# P07-D — Pilotage, performance et gouvernance

## Réalisé le 06/11/2026

- Le tableau commercial consomme une réponse calculée par Laravel, sans rapatrier toutes les pages d’opportunités, devis et activités. Les listes de priorités et de tâches sont bornées ; les filtres de période, responsable et prestation restent soumis aux droits serveur.
- Les objectifs sont mensuels. Une direction générale peut créer des plans de commission avec des paliers et une base explicites ; un responsable habilité les affecte aux commerciaux de son périmètre. Les résultats séparent devis acceptés HT, marge, paiements validés et pipeline pondéré. Le classement des clients demeure fondé sur les factures émises.
- Les estimations ne valent pas paiement. Le relevé est calculé explicitement et figé ; sa validation nécessite un autre responsable, distinct du bénéficiaire et de la personne ayant calculé le relevé. Aucun plan ni taux n’est préconfiguré ; aucun paiement n’est effectué.
- Un responsable de service habilité peut créer un accès de base pour son service, sans accorder un rôle dont il ne possède pas les permissions. Le mot de passe temporaire n’est affiché qu’à la création et le changement est obligatoire.
- Les contrôles de gouvernance enregistrent des constats limités, datés et examinables ; la direction métier doit posséder les permissions correspondantes. L’administrateur technique ne reçoit pas ces droits par ce seul statut. La page sécurité s’appuie sur le journal d’audit existant.
- Les migrations additives des tables de performance et de gouvernance ont été appliquées à la base locale ; aucun relevé, plan, compte, rapport ou paiement réel n’a été créé par ces opérations.

## Vérifications

- Suite Laravel ciblée : 3 tests, 29 assertions, dont périmètre commercial, paramètres de commission, validation séparée et refus des élévations de privilèges.
- Suite Indicateurs : 7 tests, 61 assertions.
- Compilation TypeScript et Vite réussie ; avertissement Vite sur la taille du paquet principal.

## Limites restant à traiter

- Validation visuelle et métier par l’utilisateur, notamment les définitions des indicateurs, les bases et taux de commission.
- Le suivi administratif d’un paiement de commission n’est pas encore réalisé. La création du plan de commissions et l’affectation actuelles ne fournissent pas d’historique d’affectation daté ; les recalculs de périodes antérieures utilisent donc l’affectation courante jusqu’à figement du relevé.
- La gouvernance fournit deux contrôles simples, pas encore la totalité des audits et règles du CRM source. La page sécurité donne accès au journal d’audit existant, pas encore à un tableau de sécurité équivalent à celui du CRM source.
- Certaines sections historiques du tableau commercial (activités, contrats, campagnes et suggestions) n’ont pas encore d’équivalent serveur dans cette réponse et ne doivent pas être considérées comme portées intégralement. La recette en navigateur reste à faire.
