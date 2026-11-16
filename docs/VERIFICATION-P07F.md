# P07-F — Compléments pilotage, gouvernance et sécurité

## Pilotage et commissions

- Activités du jour ajoutées aux tâches et indicateurs de régie disponibles : réservations, redevances et campagnes à suivre. Les listes restent bornées mais les compteurs d’alerte sont calculés sur le périmètre complet.
- Correction des statuts de campagne réellement utilisés par l’ERP (`termine`, `annule`) ; filtre des commerciaux limité aux utilisateurs pertinents dans le périmètre. Le lien « Pipeline des commerciaux » ouvre le tableau consolidé.
- Avant validation d’un relevé, l’API recalcule les données déterminantes : si la base, le montant, l’objectif ou le plan ont changé, elle demande un nouveau calcul. Aucun taux ni paiement n’a été créé.

## Gouvernance

- Contrôles ajoutés sur les devis, approbations DG, factures, clients et doublons, coordonnées des contacts, stocks, opportunités, ordres, circuits, repérages, projets, congés et écritures comptables. Les contrôles facultatifs et leurs pièces sont masqués si le lecteur a perdu les droits correspondants.
- Les rapports sont figés et examinés manuellement. Un score indicatif reprend le barème 15/6/2 du CRM source mais ne concerne que les contrôles affichés ; il ne certifie pas l’entreprise dans son ensemble.
- Les contrôles de sécurité sur les comptes à privilèges, dormants ou sans service se trouvent dans la console technique, séparée des rapports métier.

## Sécurité

- Détection d’échecs de connexion répétés, d’essais de plusieurs identifiants et d’un identifiant essayé depuis plusieurs adresses ; les identifiants utilisés pour cette détection sont hachés avec une clé, sans mot de passe enregistré. Refus de quelques sondes de chemin sensibles sans stockage des paramètres ou contenus des requêtes.
- Alertes consultables et acquittables ; blocage d’IP publique limité à 24 heures, réservé au superadministrateur et refusant sa propre adresse et les adresses privées. Aucun blocage automatique n’est activé.
- Archives locales des connexions pour les mois scellés et points de contrôle HMAC du journal entier, avec vérification manuelle. Les journaux originaux ne sont pas supprimés. Les archives et empreintes ne garantissent pas l’intégrité avant leur création et dépendent de la conservation et de la protection de la clé applicative. Les anciens scellements sans copie restent vérifiables mais ne possèdent pas d’archive téléchargeable.
- La tâche Laravel `comsig:security-scan` est déclarée toutes les cinq minutes. Elle ne s’exécute automatiquement que si le planificateur Laravel est effectivement lancé sur l’environnement concerné ; aucun cron de production n’a été installé ici.
- Les migrations de sécurité ont été appliquées localement ; aucun blocage, scellement, paiement ou rapport réel n’a été créé pendant la vérification.

## Vérifications

- Contrôle navigateur en lecture seule avec le compte direction connecté par l’utilisateur : tableau de bord, filtres, page performance et page gouvernance. Le contrôle a révélé et permis de corriger des compteurs limités et des statuts de campagne incorrects.
- Tests ciblés Laravel : 17 tests et 164 assertions réussis. Compilation TypeScript/Vite réussie, avec avertissement sur la taille du paquet principal. La recette avec un compte administrateur technique et la validation visuelle par l’utilisateur restent nécessaires.

## Écarts et décisions encore ouverts

- La détection ne reprend pas toutes les signatures du radar source (injection, scripts, sondes et commandes) ni ses blocages automatiques ; elle ne doit pas être présentée comme un pare-feu complet. La politique de blocage automatique, le fonctionnement derrière les proxys Hostinger et le traitement des adresses partagées nécessitent validation avant toute activation en production.
- Certaines règles de gouvernance source reposent sur des informations non conservées à l’identique dans la V2, notamment la date réelle de prise en charge historique d’une tâche déléguée. Aucun historique n’a été inventé. Les contrats et suggestions de l’ancien tableau dépendent de fonctionnalités classées en P10.
- Les définitions métier, objectifs et taux de commissions restent à valider avec la direction. La conformité visuelle trait pour trait et la recette finale restent à confirmer par l’utilisateur : P07 ne peut donc pas être marquée entièrement terminée à ce stade.
