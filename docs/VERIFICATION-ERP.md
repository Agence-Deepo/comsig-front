# Recette locale de l’extension ERP — 2 novembre 2026

> Rapport de la première extension ERP. La reprise de l’interface CRM et sa recette du 3 novembre sont décrites dans [VERIFICATION-CRM.md](VERIFICATION-CRM.md).

Cette extension est ajoutée au frontend actif `src/v2` et au backend Laravel `comsig-v2`. Elle ne constitue pas une reprise exhaustive de toutes les fonctions historiques.

## Résultats

- Backend : **65 tests, 366 assertions**, réussis sous PHP **8.2.29 et 8.5.0** ; tests transactionnels, permissions, états métier et documents inclus.
- Frontend : **20 tests unitaires réussis** ; TypeScript strict et build Vite réussis.
- Navigateur : **10 parcours Chromium réussis sur le build compilé**, avec l’API et la base MySQL locales réelles.
- `composer validate`, `composer audit`, `npm audit` et le contrôle de style Pint : succès ; aucune vulnérabilité signalée par les audits au moment de la vérification.
- API : **77 routes HTTP**, documentation OpenAPI couvrant **55 chemins** et les schémas des **19 ressources ERP**.

## Couverture navigateur

1. Trésorerie : création d’un compte et d’un mouvement ; validation par une autre personne, mise à jour du solde.
2. RH : création d’un collaborateur, demande et validation RH d’un congé ; préparation d’un bulletin, téléchargement PDF. Les étapes direction et paiement sont couvertes côté serveur, pas dans ce parcours navigateur.
3. Flotte : véhicule et chauffeur, réservation d’une mission, départ puis retour avec mise à jour du kilométrage.
4. Production : nomenclature et matières, fabrication d’un lot de produits finis, coût et consommation, livraison.
5. Régie : support et paramètre de taxe. Les campagnes, réservations concurrentes et redevances sont testées côté serveur.
6. Tâches et calendrier.
7. Clients, contacts, opportunités, devis à deux lignes, facture et demande de règlement ; validation par la direction et facture payée.
8. Entrées/sorties de stock et rejet d’une sortie excessive.
9. Navigation mobile 390 × 844 ; session non persistante après rechargement.
10. Administration, permissions et absence d’accès métier implicite pour l’administrateur technique.

## Contrôles particuliers

Les tests serveur couvrent notamment : séparation saisie/validation, écritures équilibrées et contrepassation, congés et restauration de solde, cohérence des pointages, calcul préparatoire de paie, chevauchements de missions et de réservations, fabrication atomique avec rollback, cloisonnement par service, PDF authentifiés et CSV protégés contre l’injection de formules.

Le connecteur FNE est testé avec des réponses HTTP simulées uniquement : désactivation par défaut, sandbox, absence de double envoi, délais d’attente et montants incohérents bloquants. **Aucune facture réelle n’a été certifiée auprès de la DGI.**

Les PDF issus du contrôleur ont été rendus en image et inspectés visuellement. Les écrans ERP ont aussi été inspectés dans le navigateur ; les aperçus ci-dessous sont issus de ces parcours.

## Aperçus

- [Trésorerie](apercu-erp-tresorerie.png)
- [Paie préparatoire](apercu-erp-paie.png)
- [Production](apercu-erp-production.png)
- [Flotte](apercu-erp-flotte.png)
- [Régie](apercu-erp-regie.png)

## Périmètre et limites

Les migrations additives et les comptes de recette ont été installés dans **la base locale dédiée `comsig_v2` uniquement**. Les tests ont ajouté des enregistrements de démonstration dans cette base. Aucun import des données historiques, effacement de base source ou déploiement distant n’a été effectué.

Les serveurs temporaires de vérification sont arrêtés. Pour les tests navigateur, les limites de connexion étaient relevées dans le seul processus PHP de test (`COMSIG_LOGIN_IP_LIMIT=100`, `COMSIG_LOGIN_ACCOUNT_LIMIT=30`) ; les valeurs applicatives par défaut restent 10 et 5.

Avant usage réel : recette métier des règles de congés, paie et tarifs, plan comptable, configuration et recette officielle FNE, comptes réels, sauvegarde/restauration et authentification persistante cookie/CSRF. Aucun transfert bancaire ni écriture comptable automatique depuis la trésorerie ou la paie. Voir [ERP.md](ERP.md) et `C:\wamp64\www\comsig-v2\docs\ERP-DEPLOIEMENT.md`.
