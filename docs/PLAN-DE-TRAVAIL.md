# Plan de travail partagé — COMSIG CRM / ERP

Date de départ : 3 novembre 2026.

## Objectif

Retrouver les écrans et les parcours du CRM d’origine dans `comsig-front-v1`, reliés à Laravel `comsig-v2`, puis compléter la fusion des fonctions ERP retenues. Le CRM source est la référence visuelle et ergonomique ; l’ancien ERP PHP est une référence fonctionnelle à comparer, pas une seconde interface à recopier arbitrairement.

Ce document est le suivi commun. Il ne déclenche aucun développement, import, envoi de message ou déploiement.

## Point de départ constaté

- React et Laravel existent, avec une première intégration CRM et ERP.
- Le portail et les connexions directe et Commerciale ont passé les comparaisons visuelles avec le code source dans les conditions documentées.
- Menus repliables, thèmes et composants CRM repris ; plusieurs fiches et parcours ne sont pas encore identiques.
- Trésorerie, comptabilité manuelle, RH/paie préparatoire, flotte, production, stocks et régie disposent déjà d’API et d’écrans. Il faut les compléter et les harmoniser, pas repartir de zéro.
- Recette au démarrage du plan : 68 tests Laravel / 392 assertions, 23 tests unitaires frontend et 14 tests navigateur réussis. Les résultats plus récents sont consignés dans les rapports P02-A et P02-B.
- Ce résultat technique ne remplace pas la validation de l’utilisateur et ne signifie pas que toute la fusion est terminée.

Références : [conformité CRM](CONFORMITE-CRM.md), [recette actuelle](VERIFICATION-CRM.md), [modules ERP](ERP.md), `C:\wamp64\www\comsig-v2\docs\FUSION.md`.

## Tableau de progression

| ID | Étape | Statut de départ | Résultat attendu pour validation |
|---|---|---|---|
| P00 | Socle existant | Réalisé techniquement, à valider ensemble | Vérifier l’accès local et les écrans déjà repris ; consigner les remarques |
| P01 | Inventaire et liste des écarts | Inventaire technique réalisé le 03/11/2026 — à valider ensemble | Matrice des 73 routes et 16 sections admin établie ; périmètre et options ERP à confirmer |
| P02 | Socle commun de raccordement | Réalisé techniquement en local — validation utilisateur en attente | Session, droits/profil, pièces privées, MFA/récupération et socles notifications/exports raccordés ; configuration externe en P12 |
| P03 | Clients, contacts et prospection | Réalisé techniquement en local — à valider ensemble | Référentiels, champs avancés, classement factures seules et synthèse 360° raccordés et testés ; circuits avancés hors P03 |
| P04 | Opportunités, pipeline et relances | Cinq parcours réalisés localement ; séquences automatiques restantes ; réception utilisateur ouverte | Parcours commercial complet, transitions et historique fiables |
| P05 | Devis et proformas | Développement clôturé le 09/11/2026 à la demande de l’utilisateur ; réserves reportées en P11 | Création, modification, consultation, validation et documents conformes au parcours source |
| P06 | Espaces métier et organisation du travail | Réalisé techniquement en local le 04/11/2026 — validation utilisateur en attente | Chaque espace dispose de son vrai écran, de ses tâches et de ses circuits |
| P07 | Pilotage, performance et administration | En cours — pilotage, commissions, sécurité et gouvernance étendus ; recette et écarts source ouverts | Indicateurs fiables, objectifs et écrans dédiés, administration selon les droits |
| P08 | Production, stocks et régie | Réalisé techniquement en local le 04/11/2026 — validation utilisateur en attente | Écrans harmonisés et parcours ERP/source retenus raccordés de bout en bout |
| P09 | Finance, RH, paie et flotte | P09-A, P09-B et P09-C réalisés localement le 06/11/2026 ; paie et FNE à valider avec les responsables | Circuits existants complétés et validés avec les responsables métier |
| P10 | Modules complémentaires du CRM | P10-A, P10-B et P10-C réalisés localement le 06/11/2026 ; courrier externe et assistant restants | Contrats, appels d’offres, messagerie, assistant et rapports retenus opérationnels |
| P11 | Recette globale de conformité | À refaire sur la cible complète | Validation visuelle, fonctionnelle, mobile et des droits pour tous les lots retenus |
| P12 | Reprise des données et mise en production | Non démarré | Migration pilote rapprochée, sauvegarde/restauration testée et bascule expressément approuvée |

Les statuts « partiel » indiquent des acquis existants, pas un pourcentage. Les lots n’ont pas tous la même charge. Une étape techniquement prête passe à « À valider ensemble », puis à « Validée » après accord explicite. Aucun accord n’est présumé.

## P01 — Inventaire et écarts

- [x] Recenser les routes et les écrans issus des 58 fichiers de pages historiques ; un fichier peut contenir plusieurs écrans.
- [x] Relever par écran les accès source, onglets, champs, filtres, actions et documents déclarés ; associer les contrôles mobiles à recetter, sans les annoncer déjà vérifiés.
- [x] Comparer avec le frontend V1 et les API réellement disponibles.
- [x] Classer les éléments : identique vérifié / à harmoniser / API à compléter / non porté, avec catégories explicites pour substitutions et attentes.
- [x] Identifier les simples alias, les écrans d’attente et les différences de données ou de règles.
- [x] Relever les différences avec l’ERP PHP et distinguer celles à fusionner des fonctions supplémentaires à confirmer.
- [ ] Valider ensemble le périmètre et l’ordre des sous-lots.

Livrable : matrice écran → référence → frontend → API → écart → action → preuve de recette. Cette matrice fixe la couverture cible ; les fonctions supplémentaires ne sont pas ajoutées silencieusement.

Résultat du 03/11/2026 : [synthèse P01](INVENTAIRE-P01.md), [matrice détaillée](inventaire-p01/MATRICE.md), [preuves par fichier](inventaire-p01/PREUVES.md). Analyse statique des 73 routes, 58 fichiers, 16 sections admin et comparaison des 19 ressources ERP ; 78 routes API Laravel relevées. Les 3 comparaisons publiques antérieures restent les seules vues classées identiques dans leurs conditions documentées. Recette fonctionnelle/visuelle/mobile exhaustive à réaliser dans les lots et P11. Pas de changement des fonctionnalités pendant P01.

## P02 — Socle commun

- [x] Finaliser une session navigateur persistante sécurisée, la déconnexion et l’expiration ; conserver les protections CSRF et les droits serveur.
- [x] Arrêter l’architecture d’origines et préparer les paramètres de cookies : choix utilisateur Vercel + Hostinger avec sous-domaines d’un même domaine ; modèles et contrôle statique fournis. Les noms réels/DNS/TLS et la recette distante relèvent de P12.
- [x] Reprendre le profil au design CRM, le changement obligatoire/volontaire de mot de passe, la révocation et la consultation/actualisation des droits sans élargissement de permissions.
- [x] Raccorder récupération de mot de passe et MFA TOTP : QR local, confirmation, codes à usage unique, anti-rejeu et révocation ; recette de mail privée sans envoi externe.
- [x] Stabiliser les composants communs utilisés : navigation, tableaux, filtres, formulaires, focus, confirmations et erreurs non répétées ; parcours ordinateur/mobile et cas négatifs testés.
- [x] Raccorder les pièces jointes et téléchargements privés : périmètres, formats, taille, stockage privé non exécutable, versions/corbeille et traçabilité.
- [x] Raccorder les mécanismes communs d’export authentifié et notifications serveur/état lu, avec leurs droits, filtres et limites explicites. Les futurs exports et notifications propres aux autres modules restent dans leurs lots.

Validation : une actualisation conserve la session, un compte ne consulte pas le portefeuille d’un autre et les documents privés restent protégés.

P02-A autorisé par « vas y fait cela », puis implémenté le 03/11/2026. [Rapport de cette passe](VERIFICATION-P02.md) : sessions HttpOnly/CSRF, profil, deux onglets, changement de compte/mot de passe et destinations RH/admin. Aucun nouveau rôle ni droit accordé. Les limites de ce rapport historique sont complétées ci-dessous.

Pièces jointes P02-B autorisées par « vas y fait le », puis réalisées le 03/11/2026 : Documents sur 26 ressources, stockage privé, droits du parent, versions, corbeille et audit. [Rapport de cette passe](VERIFICATION-P02B.md). Pas de GED globale, génération Word/Excel ou antivirus annoncé.

Clôture technique locale P02 autorisée par « termine totalement la p2 et attaque la p3 » : MFA/récupération, notifications persistantes, exports communs et stabilisation raccordés le 03/11/2026. [Recette de clôture P02](VERIFICATION-P02-COMPLETE.md). Architecture Vercel/Hostinger choisie explicitement ; domaines réels, SMTP, DNS/TLS et recette externe restent en P12. Aucun déploiement ni validation utilisateur présumés.

## P03 — Clients, contacts et prospection

- [x] Raccorder listes, recherche, référentiels, filtres et formulaires au socle visuel de référence ; parité pixel exhaustive à valider ensemble.
- [x] Raccorder les fiches détaillées, synthèse, onglets, historiques et actions du périmètre P03.
- [x] Relier contacts, opportunités, devis, activités et documents sans perdre les liens existants ; compléter les liens projets/campagnes/contrats/réclamations selon droits.
- [x] Raccorder les parcours de prospection et documenter les champs absents avant migration.
- [x] Raccorder le classement réel avec méthode explicite et base choisie par l’utilisateur : factures émises HT uniquement, sans devis ni opportunités gagnées.
- [ ] Effectuer la réception visuelle et métier ensemble selon la [grille finale](RECETTE-P03-FINALE.md).

Validation : créer et modifier un client, gérer son contact, consulter son historique et retrouver ses dossiers, avec contrôle des droits.

P03-A réalisé le 03/11/2026 : listes/contacts dédiés, filtres/tri/pagination dans l’URL, champs étendus, fiches à onglets et dossiers liés par droits, vraie prospection avec agrégats serveur, qualification 5/7, premier contact à deux jours et CSV. [Preuves P03-A](VERIFICATION-P03A.md).

P03-B réalisé le 03/11/2026 : détection des doublons dans le périmètre, dérogation justifiée et auditée, fusion manuelle avec aperçu/confirmation, conservation des contacts/documents, archive source et liens projets/campagnes ERP. [Preuves et limites P03-B](VERIFICATION-P03B.md). Fusion bloquée sur les pièces émises de la source, les portefeuilles différents, quotas ou droits enfants insuffisants.

P03-C réalisé le 03/11/2026 : historique en timeline, compte rendu/résultat/durée/contact, réalisation datée serveur sans réécrire les anciennes dates inconnues, relance explicitement planifiée et unique, opposition/refus et journal métier filtré par module. [Preuves et limites P03-C](VERIFICATION-P03C.md). Les compléments alors ouverts sont développés dans la passe finale ci-dessous ; les séquences/récurrences automatiques suivent P04.

P03 final, autorisé par « fais les 5 points et ensuite tu feras les tests » : référentiels administrables, tags/estimation, classement source adapté avec factures seules et pondération40/30/20/10, tri financier/dernier contact, synthèse et registres liés. [Bilan et réception](RECETTE-P03-FINALE.md). Tests effectués en fin de lot :164 API /1 134 assertions,45 React,44 scénarios navigateur après reprise ciblée,10 contrôles d’inventaire ; migration MySQL additive et lectures de contrôle réussies. Aucun accord visuel/métier utilisateur présumé ; imports en P12, conditions tarifaires en P05, circuits juridiques complets en P10.

## P04 — Opportunités et relances

- [x] Raccorder la fiche opportunité, les vues liste/Kanban et les filtres applicables ; réception visuelle exhaustive encore ouverte.
- [x] Raccorder transitions, validations, preuves et motifs ; adaptation conservant les six étapes existantes, avec suspension, à valider ensemble.
- [x] Raccorder activités, agenda, prochaines actions et relances explicites ; rappel interne de réactivation sans sollicitation externe.
- [x] Fiabiliser les dates et l’historique des étapes pour les indicateurs ; ne pas inventer une date de clôture pour les anciennes données.
- [x] Vérifier techniquement les portefeuilles commercial, direction commerciale et direction générale.
- [ ] Complément P04 : séquences de rappels internes configurables développées localement avec déduplication, arrêt manuel, clôture et opposition. La recette visuelle utilisateur et la vérification du planificateur sur l’hébergement restent ouvertes ; aucun envoi externe automatique.
- [ ] Effectuer la réception visuelle/métier ensemble, sans présumer une parité pixel exhaustive.

Validation : un commercial fait avancer une affaire, enregistre ses actions et prépare un devis depuis cette affaire ; la direction voit le périmètre prévu.

Les cinq parcours locaux sont développés. [Rapport P04](VERIFICATION-P04.md) : 176 API/1 256 assertions et 48 tests frontend avant P05 ; dernier scénario client → devis → facture → règlement relancé avec succès le 04/11/2026 sur SQLite isolée. La recette P05 inclut la non-régression de ces parcours. Aucun séquencement automatique ou accord utilisateur n’est présumé.

P04 complément du 09/11/2026 : renforcement de l’opposition du contact. Lorsqu’une opposition est enregistrée depuis sa fiche ou à l’issue d’une interaction, les relances générées associées encore ouvertes sont annulées, y compris dans les autres portefeuilles, sans divulguer leur contenu ; les tâches manuelles ne sont pas modifiées. Test ciblé initial : 12 tests, 93 assertions. Ce premier travail a été complété par les séquences ci-dessous ; aucun message externe n’a été activé.

P04 rappels internes du 09/11/2026 : choix utilisateur confirmé, sans sollicitation automatique externe. Dans l’onglet Activités d’une opportunité, une séquence limitée est configurée explicitement avec première date, intervalle et nombre maximal ; une seule séquence active par affaire. Notifications personnelles, arrêt manuel ou à la clôture/suspension/opposition et contrôle d’éligibilité à l’exécution ; les périodes manquées ne sont pas rattrapées en rafale. Commande `comsig:opportunity-reminders` horaire déclarée, verrouillage par séquence et transaction ; le cron de production n’est pas activé ici. Migration additive appliquée localement. Vérification regroupée : 14 tests et 111 assertions, build frontend réussi. Recette visuelle et fonctionnement du planificateur sur hébergement à vérifier avant validation finale.

P04 contrôle visuel du 09/11/2026 : sur SQLite isolée et compte commercial de démonstration, affichage de l’onglet Activités et du formulaire, création d’une séquence puis arrêt confirmés en navigateur. Aucun dossier réel ni sollicitation externe. La conformité visuelle complète au CRM source, le test utilisateur et l’exécution du planificateur sur l’hébergement restent ouverts.

P04 activités du 09/11/2026 : écran dédié « Activités et agenda » avec vues liste/semaine, périodes, type, statut, périmètre autorisé, création et modification, et clôture avec compte rendu ; filtres et pagination au serveur. Vues liste vide et semaine contrôlées visuellement sur SQLite isolée ; la parité complète, la recette sur données représentatives et le mobile restent à vérifier. Les accès et l’opposition continuent à être contrôlés côté serveur.

P04 complément du 09/11/2026 : comparaison statique avec la page et le service activités du CRM source. Correction du filtre « 7 jours » pour exclure les activités en retard et celles à partir du huitième jour ; distinction conforme au filtre « En retard ». Vue semaine rapprochée de la source : en-têtes sur deux lignes, jour courant mis en évidence, hauteur et rendu des activités terminées ; regroupement par jour local après interprétation des dates UTC. Contrôles isolés : 4 tests API / 51 assertions, 53 tests frontend, build et parcours navigateur liste/semaine/répartition des périodes réussis. La comparaison visuelle exhaustive sur mêmes données et la validation métier restent ouvertes.

P04 agenda d'affaire du 09/11/2026 : le lien depuis une opportunité applique effectivement un filtre serveur aux activités de cette affaire, avec vérification des droits et du périmètre ; les autres événements sont exclus et un bouton rétablit le calendrier complet. Le filtre reste limité au titulaire de l'agenda sélectionné. Tests ciblés du périmètre et du parcours navigateur réussis sur base isolée.

## P05 — Devis et proformas

- [x] P05-A : raccorder le parcours « Nouveau devis » (client existant/nouveau, contact, affaire, chiffrage et soumission atomiques) et l’éditeur lié à l’affaire ; parité exhaustive encore à valider.
- [x] P05-A : fiche dédiée, onglets proposition/validations/versions/historique/documents et décisions serveur.
- [x] P05-A : calculs Laravel conservés pour catalogue/CUMP/coût déclaré, quantité, durée, remises, marge et TVA de ligne ; sources/coûts conservés dans les snapshots.
- [x] P05-A : versions de famille, référence technique unique, liens client/contact/opportunité et verrou optimiste React ; historique ancien non inventé.
- [x] Complément de chiffrage : tarifs par catégorie et choix CUMP/dernière entrée/fournisseur/nomenclature raccordés aux articles et nomenclatures P08 ; les coûts de nomenclature comprennent les matières uniquement, sans main-d’œuvre inventée. La parité exhaustive avec la source reste à confirmer.
- [x] Raccorder les exports PDF, Word et Excel et les pièces jointes au socle documentaire ; vérifier les modèles PDF. Les exports sont contrôlés techniquement ; PDF et tableur ont été inspectés. **Réserve P11 : rendu visuel Word non vérifié**, faute de moteur LibreOffice intégré.
- [x] Préparer l’envoi par e-mail dans un environnement de test : fichier EML privé avec PDF, sans SMTP ni envoi réel et sans changement du statut du devis.

Validation : client → opportunité → devis/proforma → contrôle/validation → décision client → facture, sans ressaisie injustifiée ni écart de montant.

P05-A démarré à la demande « relance le dernier scénario et passe à la p5 », puis repris le 04/11/2026. [Recette P05-A](VERIFICATION-P05A.md). P05-B est développé ; sa réception ciblée et le contrôle visuel Word restent ouverts : [état P05-B](VERIFICATION-P05B.md). Aucun envoi externe, comptabilisation automatique, réservation ou facture créé implicitement par ce lot.

P05-C du 06/11/2026 : reprise de la recette ciblée sur SQLite isolée ; 39 tests serveur et 446 assertions réussis ; six scénarios navigateur réussis après correction du débordement mobile des courriers et des sélecteurs de recette. Les trois téléchargements, le courrier de test, la catégorie client et le tarif fournisseur sont vérifiés. Le rendu DOCX a été tenté avec le moteur prévu, indisponible (LibreOffice absent) : la conformité visuelle Word ne peut pas être déclarée acquise. Validation utilisateur et conformité exhaustive au CRM source restent à faire.

Clôture du développement P05 le 09/11/2026, à la demande de l’utilisateur. Cette clôture ne constitue ni une validation visuelle Word ni une acceptation de la conformité au CRM source. Le rendu Word, la réception métier et visuelle et la comparaison exhaustive restent obligatoires en P11, avant toute déclaration de conformité ou mise en production. Aucun envoi réel n’a été autorisé.

## P06 — Espaces métier et travail quotidien

P06-A démarrée le 04/11/2026 à la demande de privilégier l’implémentation : [bilan du sous-lot](VERIFICATION-P06A.md). Espaces service/admin et vues tâches raccordés, sans annoncer toute P06 terminée. [État P05-B avant passage](VERIFICATION-P05B.md), notamment rendu Word et réception ciblée restants.

P06-B : demandes interservices avec affectation, suivi, commentaires et journal ; to-do privées et checklists privées, éventuellement liées à une tâche ; points obligatoires contrôlés à la clôture ; notifications internes. [Bilan et limites](VERIFICATION-P06B.md). La réception métier et visuelle avec l’utilisateur reste ouverte.

P06-C termine le lot : espace entreprise, liens projet, circuits de production, ordres enrichis, repérages, risques/temps, protocole, agenda récurrent et délégué, rappels automatiques et annonce vocale navigateur. [Recette finale P06](VERIFICATION-P06-COMPLETE.md).

P06 sécurité agenda du 09/11/2026 : correction du périmètre de l'agenda personnel ou délégué. Les tâches et activités sont limitées au titulaire sélectionné ; les ordres de travail à ceux qui lui sont affectés et les modules sensibles respectent les droits des deux utilisateurs. Un rendez-vous marqué privé n'est plus visible, modifiable ou supprimable par le délégué. Contrôle isolé : 3 tests API / 50 assertions et 2 scénarios navigateur réussis ; cette correction ne constitue pas une validation générale des autres droits.

- [x] Remplacer les alias de « Mon espace », « Espace administration » et des autres espaces retenus par leurs véritables écrans.
- [x] Reprendre tâches, matrices de priorités, to-do/checklists et calendrier d’origine. **Conformité visuelle « Tâches et matrices » alignée sur la démonstration le 06/11/2026 :** onglet Planification, filtres Mes tâches / Mon service / Confiées, export Excel, légende et pastilles P1–P5, glisser-déposer, comptage complet du périmètre. **Onglet Gestion du temps aligné le 06/11/2026 :** tableau Personne / Temps saisi / Charge / Répartition en barre empilée aux couleurs de la démonstration, légende des cinq parts, détail chiffré au clic sur la barre, export Excel de la période. Corrige aussi des défauts réels : deux filtres clients choisis coup sur coup s’écrasaient, « 1 jours ouvrés », et deux catégories de risques refusées par l’API. [Bilan et limites](CONFORMITE-P06-TACHES.md).
- [x] Raccorder ordres de travail, projets, circuits et demandes entre services.
- [x] Reprendre repérages et protocole de priorités dans le périmètre confirmé.
- [x] Vérifier techniquement les affectations, échéances, notifications et la clôture du circuit d’ordres interservices ; réception métier par l’utilisateur encore attendue.

Acquis : espaces service, administration et entreprise ; Kanban et matrice Eisenhower ; demandes interservices et ordres spécialisés avec pièces, temps, projet et circuit ; circuits à trois itinéraires ; to-do/checklists privées synchronisées ; rappels programmés, relances internes toutes les quatre heures dans la plage 7 h–20 h et annonce vocale navigateur ; agenda récurrent et délégué ; repérages avec mesures/photos et validation ; registre des risques ; rapport de charge et protocole P1–P5. La réception globale avec l’utilisateur reste à faire ; aucune validation utilisateur n’est présumée.

Validation : une demande passe d’un service à l’autre avec son responsable, son statut et sa traçabilité ; chaque profil voit un espace utile, pas un tableau de bord générique substitué.

## P07 — Pilotage, performance et administration

- [ ] Reprendre les vrais tableaux de bord et écrans d’indicateurs de chaque profil. **P07-C développé localement :** indicateurs commerciaux, stocks, production, régie, finance et RH, graphiques de service sur 12 mois et cibles globales ; affichage vérifié pour sept profils sur ordinateur et mobile. La parité visuelle trait pour trait et l’adéquation métier restent à valider avec l’utilisateur.
- [ ] Valider les définitions des montants gagnés, du pipeline, des délais et du suivi commercial. **P07-C développé et contrôlé techniquement :** règles source documentées, devis acceptés, cycle, clôtures, relances et paiements validés. Les données historiques sans lien ne sont pas reconstituées ; validation métier explicite encore attendue.
- [x] Déplacer les agrégats du tableau commercial vers l’API pour éviter le téléchargement intégral des portefeuilles. Réponse Laravel limitée au périmètre et aux filtres ; listes d’actions bornées. Contrôle automatisé du périmètre commercial le 06/11/2026.
- [ ] Raccorder objectifs, commissions, performance et classement selon des règles validées ; ne pas confondre affaire gagnée, facturation et encaissement. **Avancement P07-E :** objectifs, plans et affectations datées, estimation, relevé figé, validation séparée et enregistrement administratif d’un paiement déjà effectué. Les règles et taux restent à valider par la direction et la recette métier reste à réaliser.
- [ ] Reprendre administration, accès d’équipe, sécurité et gouvernance, sans donner automatiquement des droits métier à un administrateur technique. **Avancement P07-E :** création limitée de comptes d’équipe, tableau de sécurité sur les événements réels et contrôles de gouvernance avec exemples de dossiers. La parité complète avec le CRM source et la recette utilisateur restent à terminer.

**P07-F :** activités et régie raccordées au tableau, compteurs et statuts corrigés ; contrôles de gouvernance étendus, alertes de sécurité et blocages manuels encadrés, archives de connexion et points de contrôle du journal, revues des comptes sensibles. Les écarts résiduels et validations à obtenir sont listés dans le [bilan P07-F](VERIFICATION-P07F.md) ; ils empêchent de déclarer P07 entièrement terminée.

**P07-G :** signatures SQL, scripts, traversées, commandes, gabarits et outils ajoutées au radar en mode alerte ; suivi horodaté des nouvelles délégations et de leur prise en charge. [Détails et validation restante](VERIFICATION-P07G.md). Les choix de mise en production et la recette utilisateur restent ouverts ; les cases concernées ne sont pas cochées sans validation.

**P07-H :** limite du corps JSON inspecté par le radar renforcée même si l’en-tête de taille est absent ou inexact ; seuils de commission et classement calculés sur l’atteinte exacte avant arrondi d’affichage, précision des taux contrôlée. Tests ciblés réussis. Console de sécurité et page d’archives ouvertes et inspectées en lecture seule avec le compte super-administrateur de démonstration ; la recette visuelle avec un administrateur technique distinct et la validation utilisateur restent ouvertes.

**P07-I :** vérification technique des droits, du pilotage, des commissions et de la sécurité. Correction du filtre des créances par responsable et par prestation ; la prestation ne peut être utilisée sans les droits sur les opportunités et devis. Résultat : 31 tests ciblés, 231 assertions réussies. Les validations métier et visuelle ne sont pas présumées.

**P07-J :** COMSIG a choisi les encaissements validés comme base par défaut des nouveaux plans ; les taux restent à définir. Le superadministrateur peut créer des plans et de nouvelles versions des taux dans Administration V2 → Taux de commission. Les versions antérieures et affectations restent inchangées : la direction affecte explicitement la nouvelle version à partir du mois choisi. Les anciens plans conservent leur base. Contrôle visuel sur base isolée : la console de sécurité est accessible à un administrateur technique distinct, sans bouton de blocage et sans accès aux clients. Tests P07 ciblés : 9 réussis, 115 assertions. La validation des taux et la recette métier et visuelle globale restent ouvertes ; P07 n'est pas déclarée terminée.

**P07-K — recette technique du 06/11/2026 :** vérification regroupée des indicateurs, commissions, habilitations, sécurité et classement clients sur base SQLite en mémoire : 53 tests et 452 assertions réussis. Un scénario supplémentaire vérifie que seuls les paiements validés alimentent les commissions et qu'un nouveau paiement impose le recalcul avant validation du relevé ; les taux du scénario sont fictifs et ne constituent pas les taux COMSIG. Le classement est testé sur les factures émises non annulées. Aucun paiement, taux ou compte réel n'a été créé. Restent à confirmer par COMSIG : taux et paliers lorsqu'ils seront connus, acceptation des définitions et conformité visuelle à la référence ; les choix et vérifications de déploiement du radar, des proxys et du planificateur restent hors recette locale. Les cases correspondantes ne sont pas cochées par défaut.

**P07 commissions du 09/11/2026 :** choix confirmé : les taux restent configurables sans valeur par défaut. Les identifiants de plans sont affichés pour distinguer les versions portant le même nom ; une saisie de palier incomplète est refusée dans le formulaire de direction. Les règles et taux réels restent à valider par COMSIG avant utilisation.

Validation : les indicateurs se rapprochent des dossiers source et les filtres de période, service et responsable produisent les bons résultats.

P07-A : [détails et vérifications](VERIFICATION-P07A.md). Le déplacement complet des agrégats du tableau de bord historique vers l’API reste le troisième point de P07 ; l’écran Indicateurs utilise déjà des calculs serveur.

Vérification complémentaire : [écarts initiaux des deux premiers points](VERIFICATION-P07-ECARTS.md) ; [avancement P07-B](VERIFICATION-P07B.md). Les cases restent ouvertes tant que la reprise complète et la validation métier ne sont pas obtenues.

P07-C : [réalisation et limites](VERIFICATION-P07C.md). Les travaux de déplacement intégral des agrégats vers l’API, objectifs commerciaux et commissions restent aux points 3 et 4.

P07-D du 06/11/2026 : [travaux, contrôles et limites](VERIFICATION-P07D.md). Les deux premiers points restent ouverts pour validation visuelle et métier ; les points 4 et 5 restent ouverts pour les compléments indiqués.

P07-E du 06/11/2026 : [compléments, vérifications et limites](VERIFICATION-P07E.md). Les validations métier et visuelle, la reprise complète de gouvernance et la surveillance de sécurité du CRM source restent ouvertes.

P07-F du 06/11/2026 : [réalisations et écarts restants](VERIFICATION-P07F.md).

P07-G du 06/11/2026 : [réalisations et validation restante](VERIFICATION-P07G.md).

## P08 — Production, stocks et régie

P08-A démarré le 04/11/2026 dans un périmètre isolé des travaux P06/P07 : fiche campagne enrichie avec ses réservations, création d’une réservation rattachée et message explicite en cas de chevauchement. Le filtre API reste soumis au périmètre de données existant ; aucune migration, donnée source, notification externe ou réservation réelle n’a été déclenchée. [Bilan du sous-lot](VERIFICATION-P08A.md).

- [x] P08-A : fiche campagne affichant ses seules réservations, création d’une réservation rattachée dans la période de campagne et refus explicite du chevauchement de face ; filtre serveur par campagne. Preuves : test Laravel ciblé, scénario navigateur et suite complète du 04/11/2026 — [bilan](VERIFICATION-P08A.md).
- [x] P08-B : planning des faces (frise et liste) calculé depuis les réservations serveur, fiche support avec carte en lecture seule, réservations et interventions, fiche stock avec valorisation et alerte de seuil, fiche projet avec ordres de production et disponibilité des matières. Trois ressources régie auparavant absentes sont portées avec migration additive : maintenance, collectivités, déploiements — [bilan](VERIFICATION-P08B.md).
- [x] P08-C : preuves d’exécution par face et clôture de campagne avec bilan (une preuve de pose conforme par face réservée, satisfaction et enseignements) ; stock multi-entrepôts avec inventaire physique contradictoire (motif d’écart obligatoire, validation par un tiers, correction en mouvements tracés) ; planning affichant aussi les faces libres ; escalades horaires idempotentes des réclamations et interventions en retard ; rattachement réclamation ↔ intervention réservé aux profils disposant des deux droits — [bilan](VERIFICATION-P08C.md).
- [x] P08-D : coûts prévus et réels de campagne (saisie humaine, réels jamais déduits d’un devis, figés après clôture) ; vue atelier de production en file + fiche avec disponibilité réelle des matières ; notification nominative à l’escalade (responsable de la réclamation, intervenant affecté) ; conversion explicite d’une réclamation en intervention sous double droit, sans affectation inventée — [bilan](VERIFICATION-P08D.md).
- [x] Harmoniser les écrans disponibles avec leurs références CRM/ERP : fiche campagne (réservations, preuves, bilan, coûts), atelier de production, fiches support, stock, projet, maintenance, collectivités et déploiements.
- [x] Compléter les parcours production/projets/ordres/nomenclatures, matières, produits finis et livraison retenus dans l’inventaire.
- [x] P08-C stocks : fiches, mouvements, valorisation et vues de suivi ; inventaire physique et multi-dépôts livrés. Reste ouvert : lots et dates de péremption, transferts planifiés entre entrepôts.
- [x] P08-C régie : supports et faces (carte, réservations, interventions), planning des faces avec faces libres, collectivités et déploiements. Campagnes : preuves, bilan et coûts prévus/réels livrés.
- [x] P08-C maintenance et déploiements : registre des interventions avec signalement, démarrage, résolution obligatoire et clôture ; déploiements rattachés à une collectivité, un projet ou une campagne, avec refus de double mobilisation d’une équipe. Preuves : tests API et recette navigateur du 04/11/2026 — [bilan](VERIFICATION-P08B.md).
- [x] P08-C réclamations : escalade horaire idempotente des échéances dépassées (réclamations et interventions) et rattachement d’une intervention de maintenance depuis la réclamation, sous double droit. Preuves : tests API et commande planifiée.
- [x] P08-D réclamations : notification nominative du responsable à l’escalade et conversion explicite d’une réclamation en intervention de maintenance.

Validation : fabrication sans stock négatif, valorisation cohérente, livraison traçable et impossibilité de réserver deux fois une même face sur une période incompatible.

État au 04/11/2026 : les deux premiers critères restent adossés aux tests ERP existants (stock non négatif, CUMP et livraison) ; le troisième est désormais prouvé côté API **et** dans l’interface avec la fiche campagne. La validation métier et visuelle de l’ensemble P08 reste ouverte, aucun accord n’est présumé.

P08-B livré localement le 04/11/2026 : planning des faces, fiche support, fiche stock, fiche projet, et portage des trois ressources régie manquantes (maintenance, collectivités, déploiements) avec une migration additive `2026_11_04_180000_create_regie_operations`, appliquée sur la base locale uniquement. Aucun déploiement, import de données ou opération externe. [Bilan P08-B](VERIFICATION-P08B.md).

P08 est techniquement complet en local le 04/11/2026 : toutes les cases du lot sont réalisées, avec migration additive, tests et recettes. Il reste à **valider visuellement et métier avec toi**, et les extensions explicitement hors périmètre (lots et péremption, transferts planifiés entre entrepôts) ne sont pas déclarées livrées. Aucun déploiement, import ou opération externe. [Bilan P08-D](VERIFICATION-P08D.md).

Reste ouvert dans P08, hors périmètre annoncé : lots/dates de péremption et transferts planifiés entre entrepôts (stocks), parité pixel exhaustive de la fiche campagne et de l’atelier (P11).

## P09 — Finance, RH, paie et flotte

P09-A et P09-B démarrés le 06/11/2026 : écritures comptables automatiques explicites, compte client, créances échues, espace salarié en libre-service et consultation de ses propres missions. [Bilan du lot](VERIFICATION-P09A.md).

- [x] P09-A : écritures automatiques de facture (créance, produit, TVA) et de règlement validé (trésorerie), équilibrées, idempotentes, en brouillon à comptabiliser par un tiers ; aucune écriture si le compte est absent ou inactif, avec trace d’audit ; compte client détaillé et file des créances échues.
- [x] P09-A : factures, règlements, trésorerie et comptabilité conservent leurs validations distinctes ; aucun nouveau droit accordé (les écrans suivent `finance` et `accounting`).
- [x] P09-C : demandes de fonds (approbation par un tiers, puis décaissement passant par la double validation de caisse) ; dépenses récurrentes déclaratives avec prochaine échéance calculée depuis la fréquence, sans décaissement automatique ; balance âgée par tranches ; évaluations et formations RH avec note moyenne arithmétique et confidentialité préservée — [bilan](VERIFICATION-P09C.md).
- [ ] Configurer puis recetter la FNE avec les interlocuteurs compétents, sans certification réelle automatique ni réenvoi aveugle.
- [x] P09-B : espace salarié `/mon-espace-rh` — dossier personnel, solde de congés, demande de congé dans le circuit RH puis direction, annulation tant qu’aucun avis n’est rendu, pointage du jour unique et non rétroactif, missions de flotte du collaborateur. Aucun `hr.view` accordé.
- [x] P09-C : dossiers RH complétés par les évaluations et formations (notes saisies par un responsable, moyenne arithmétique, accès limité à `hr`). Reste ouvert : justificatifs de dossier élargis et badge.
- [ ] Faire valider les règles de congés et paramètres de paie avant leur automatisation ; la paie reste préparatoire, sans barème automatique.
- [ ] Compléter véhicules, chauffeurs et missions ; entretien, carburant et géolocalisation ne sont pas ajoutés faute d’arbitrage confirmé.

Validation : rapprochement des soldes et des écritures, absence de double paiement, confidentialité RH et validation métier des paramètres sensibles. Les opérations bancaires et fiscales réelles nécessitent leur propre autorisation/configuration.

P09-A et P09-B livrés localement le 06/11/2026 sans migration : les écritures automatiques utilisent le plan comptable existant et restent en brouillon ; l’espace salarié se lie au dossier par le compte utilisateur, sans accorder `hr.view`. Points restant ouverts : demandes de fonds et dépenses récurrentes, dossiers RH élargis, badge, entretien/carburant/géolocalisation de la flotte, paramètres de paie à valider et recette FNE. [Bilan P09-A/B](VERIFICATION-P09A.md).

P09 flotte du 09/11/2026 : une mission réservée peut être modifiée avant son départ, avec nouveau contrôle des disponibilités, du permis et des échéances du véhicule ; elle est verrouillée dès le départ. La modification ne se considère plus elle-même comme un chevauchement. Test ciblé : 1 test, 18 assertions, comprenant le refus d’un chevauchement et d’une modification après départ. Entretien, carburant et géolocalisation restent soumis à arbitrage ; la recette visuelle de la flotte reste ouverte.

P09 FNE et paie du 09/11/2026 : la page FNE affiche les contrôles de configuration sans révéler les secrets ; une facture annulée ne peut plus être préparée ni transmise. Aucun appel fiscal réel ni activation de production. Le module paie indique désormais explicitement que les cotisations et impôts sont saisis manuellement et que la base d’absence de 30 jours existante attend validation ; aucun barème n’a été inventé. Recette FNE réelle, règles de paie et validations responsables restent nécessaires.

P09 décision complémentaire : le DG et l’administrateur sont désignés pour valider les règles de paie. Les règles concrètes et la modalité de validation restent à préciser ; cette désignation ne vaut pas validation des calculs existants. Aucun accès FNE de test n’est encore disponible.

## P10 — Compléments CRM

P10-A démarré le 06/11/2026 : avenants, décisions de renouvellement et registre des appels d’offres. [Bilan du sous-lot](VERIFICATION-P10A.md).

- [x] P10-A : avenants de contrat (variation de valeur saisie, prolongation explicite, référence unique, total avenanté = somme des variations), décision de renouvellement datée et motivée (renouveler / ne pas renouveler / à négocier, réservée aux contrats signés ou actifs), registre des appels d’offres avec délai calculé et motif obligatoire si non soumis.
- [x] P10-B : messagerie interne cloisonnée — un message n’est lisible que par l’expéditeur et ses destinataires, pas d’auto-destinataire, destinataires actifs d’un service actif, réponse rattachée à la conversation par un participant, archivage individuel, jamais de suppression ni d’envoi externe ; rapports périodiques calculés depuis les dossiers réels et **figés** au moment de la génération, périmètre limité au service sauf portée globale — [bilan](VERIFICATION-P10B.md).- [x] P10-C : analyse SWOT dérivée de seuils mesurés (aucun constat sans chiffre ni source), recommandations déterministes priorisées, revue puis validation figée, export CSV ; rapport périodique exportable en CSV, avec les mêmes règles de périmètre — [bilan](VERIFICATION-P10C.md).
- [ ] Raccorder les espaces assistant uniquement après choix de son mode, de son périmètre de données et de sa configuration serveur.

P10 préparation de l’assistant du 09/11/2026 : l’écran propose des raccourcis locaux pour consulter, à la demande et selon les droits existants, les activités personnelles ouvertes en retard, du jour ou des sept prochains jours. Il ne s’agit pas d’une IA et aucune donnée n’est transmise à un service externe. Le choix et le raccordement d’un éventuel assistant IA restent ouverts. La messagerie demeure interne ; l’intégration du courrier externe et ses modalités d’envoi restent à définir.

P10 suite : choix OpenRouter et courrier Hostinger. Une connexion IA optionnelle, désactivée par défaut, transmet uniquement la question explicitement saisie et confirmée, sans récupération automatique des données CRM ; clé et modèle sont configurés côté serveur. Un courrier SMTP séparé, désactivé par défaut, permet un envoi manuel confirmé par les profils direction et administration ; tentative journalisée sans contenu, pas de réessai automatique. L’acceptation SMTP ne prouve pas la livraison ; il n’y a pas encore de réception IMAP, pièces jointes ni historique des courriels. Configuration des comptes, choix du modèle et recette avec services réels restent nécessaires ; aucun envoi réel ni appel OpenRouter réel effectué.
- [ ] Inventorier et configurer les tâches planifiées nécessaires à ces fonctions : commande, fréquence, verrouillage, reprise et journalisation.

P10 planificateur du 09/11/2026 : inventaire des huit commandes Laravel actuellement déclarées et de leurs fréquences ajouté au [guide de déploiement](../../comsig-v2/docs/DEPLOIEMENT.md), avec limites de reprise, verrous partagés et journalisation. La configuration et la vérification du cron réel restent en P12 ; aucune commande planifiée n’a été exécutée sur les données métier.

Validation : chaque fonction annoncée réalise une opération réelle et traçable. Aucun assistant factice, notification inventée ou traitement planifié déclaré exécuté sans preuve.

## P11 — Recette globale

P11-A du 09/11/2026 : première comparaison visuelle commerciale, liste/Kanban et fiche opportunité ; corrections de largeur et d’alignement, et suppression d’un zéro trompeur pendant le chargement. Données source/cible différentes et comparaison mobile encore à refaire ; la recette globale reste ouverte. [Compte rendu](RECETTE-P11-A.md).

P11 passe globale du 09/11/2026 : 293 tests serveur / 2 525 assertions, 53 tests frontend et build réussis. Première passe navigateur : 66 réussites, 3 échecs et 3 comparaisons ignorées sans référence ; les trois scénarios corrigés et relancés réussissent, ainsi que les trois comparaisons publiques exécutées séparément avec la référence. Contrôles visuels ciblés et limites détaillés dans le [rapport de recette globale](RECETTE-P11-GLOBALE.md). L’acceptation métier, la conformité visuelle exhaustive, les services réels, les documents Word et la production restent ouverts : P11 ne peut pas être déclarée entièrement validée.

P11 passe complémentaire : l'écran « Palettes des services » ne renvoie plus vers des tuiles génériques ; il affiche les tâches, ordres et circuits en cours accessibles, leurs compteurs autorisés et un aperçu limité signalé. Les profils restreints ne voient que leur service et leur périmètre ; un administrateur technique sans droits métier ne reçoit pas ces missions. En parallèle, les écrans CRM repris utilisant l'ancien client HTTP passent désormais par le client V2 configuré pour l'API distante, cookies inclus et CSRF ; les exports et pièces utilisent l'adresse API configurée. Contrôles : 6 tests API / 63 assertions, 56 tests frontend, build, et deux parcours navigateur sur origines locales de ports distincts (palettes et calendrier) réussis. Une première tentative navigateur des palettes a échoué sur une connexion locale interrompue puis la relance a réussi. Cette simulation ne remplace pas les essais Vercel/Hostinger ni une comparaison visuelle exhaustive à données identiques.

- [ ] Lever les réserves P05 : rendre et inspecter toutes les pages Word de devis courts et multipages avec le moteur documentaire approprié ; corriger et revérifier si nécessaire. Faire également la réception métier et la comparaison visuelle avec le CRM source.
- [ ] Vérifier chaque ligne de la matrice P01, y compris champs, filtres, états vides, erreurs et droits.
- [ ] Comparer les captures source/cible avec mêmes données de test, profil, thème, dimensions et polices.
- [ ] Recetter ordinateur et mobile, clavier, focus, rechargement et expiration de session.
- [ ] Exécuter les tests unitaires, API et navigateur, y compris les cas négatifs, transactions concurrentes et non-régressions ERP.
- [ ] Tester au minimum commercial, direction commerciale, direction générale, finance, production, régie, RH, flotte et administration, plus les rôles ajoutés au périmètre.
- [ ] Te présenter les écarts restants ; aucun écran non contrôlé n’est déclaré identique.

Validation : aucune régression bloquante connue et acceptation explicite du périmètre complet ou d’exclusions précisément documentées.

## P12 — Données et production

Préparation du 09/11/2026 : [correspondances et procédure de reprise](../../comsig-v2/docs/REPRISE-DONNEES.md) issues de la lecture des schémas disponibles, sans accès aux bases sources ni import. Modèle de configuration de production complété pour le courrier manuel et OpenRouter désactivés par défaut ; le guide de déploiement précise également les répertoires privés à sauvegarder. Les schémas réellement exploités, la restauration et les services distants restent à vérifier.

P12 complément : commande locale `comsig:check-production-readiness` de contrôle statique, sans affichage de secrets ni appel externe, pour environnement, clé, base, sessions, pièces privées et configuration des services facultatifs. Un résultat positif ne valide ni la connexion réelle, ni DNS, TLS distant, cron ou restauration et doit être complété par `comsig:check-browser-security --production` et la recette du déploiement.

P12 préparation des tiers : `comsig:preview-legacy-organizations` contrôle un CSV UTF-8 borné en lecture seule, sans affichage des noms ni import : champs obligatoires, identifiants répétés et alerte sur noms normalisés identiques. Aucune comparaison aux données déjà présentes ni décision de fusion ; la mise en correspondance effective et l'import pilote restent à concevoir et recetter.

P12 pilote tiers/contacts du 09/11/2026 : commande `comsig:import-pilot-contacts`, strictement réservée à SQLite de test isolée. Simulation annulée par défaut, écriture seulement avec `--apply`, correspondances d'identifiants, contrôle des doublons simples et annulation atomique des erreurs ; pas d'actualisation ou fusion automatique. Sur une base temporaire neuve avec fixtures fictives, simulation puis création de deux tiers et deux contacts, puis nouvelle exécution sans doublons. [Format, limites et procédure](../../comsig-v2/docs/REPRISE-DONNEES.md). Les champs supplémentaires, comptes réels, documents, factures, règlements, stocks et rapprochements ne sont pas importés ; P12 reste ouverte.

P12 rapprochement pilote : `comsig:reconcile-pilot` compare un manifeste de champs attendus aux correspondances disponibles, en lecture seule sur SQLite de test ; prise en charge limitée des noms, montants, statuts, quantités globales et empreintes, avec vérification des octets des pièces. Sur la base fictive créée pour le pilote, 5 champs contrôlés et concordants ; le manifeste ne prouve ni l'exhaustivité ni la conformité métier et ne crée aucune correspondance. Tests ciblés : 9 tests / 44 assertions ; tentative de l'importeur depuis la configuration MySQL locale refusée avant écriture. L'import pilote n'accepte que la source CRM ; le schéma ERP, le rapprochement réel et les autres domaines restent ouverts.

Contrôles du complément P04/P06/P12 : 7 tests API / 53 assertions et compilation frontend réussis, plus deux parcours navigateur agenda/activités réussis. Le contrôle statique exécuté localement indique normalement que l'environnement Wamp n'est pas configuré en production ni en cookies de production ; il ne teste aucun service distant.

- [ ] Confirmer hébergement, domaines, HTTPS, stockage, e-mail et supervision ; aucun déploiement implicite.
- [ ] Préparer sauvegarde/restauration et test de retour arrière.
- [ ] Établir les correspondances des anciens identifiants, utilisateurs, tiers, documents et écritures ; commencer par un import pilote sans écraser les sources.
- [ ] Rapprocher volumes, soldes, montants, stocks et documents ; traiter les écarts avant bascule.
- [ ] Retirer les comptes/données démo de l’environnement de production selon une procédure vérifiée.
- [ ] Déployer après accord explicite, former les utilisateurs et vérifier les parcours critiques après bascule.

Validation : reprise rapprochée, restauration éprouvée, responsabilités de support définies et accord de mise en service.

## Notre rythme de suivi proposé

1. Choisir un sous-lot précis dans l’étape active et annoncer les fichiers/modules concernés.
2. Réaliser le raccordement frontend/API nécessaire, sans modifier les projets source ni exposer des données fictives comme réelles.
3. Fournir les tests, captures et identifiants de recette locaux utiles.
4. Te laisser vérifier ; consigner chaque remarque dans la liste ci-dessous.
5. Corriger, mettre à jour le statut et marquer « Validée » seulement après ton accord, puis passer à l’étape suivante.

Pas de pourcentage global artificiel ni de date de livraison ferme avant l’inventaire P01. Le développement visuel ne suffit pas à valider un lot dont les actions/API sont encore absentes.

## Liste des points à suivre

| Référence | Étape | Point | Statut | Validation utilisateur |
|---|---|---|---|---|
| S001 | P01 | Matrice produite le 03/11/2026 ; confirmer le périmètre CRM/ERP et les options visiteurs, badges, SMS | Inventaire technique réalisé — [preuves](INVENTAIRE-P01.md) | En attente d’accord explicite |
| S002 | P00 | Recueillir ton retour sur portail, connexions et navigation déjà repris | À tester ensemble | En attente |
| S003 | P02-A | Session persistante, droits/profil et correspondances de navigation réalisés le 03/11/2026 | Réalisé techniquement — [recette](VERIFICATION-P02.md) | Autorisation de réalisation reçue ; recette utilisateur en attente |
| S004 | P02-B | Pièces jointes privées : ajout, téléchargement, versions, suppression/restauration, droits et audit | Réalisé techniquement le 03/11/2026 — [recette](VERIFICATION-P02B.md) | Autorisation reçue ; recette utilisateur en attente |
| S005 | P02-C | MFA TOTP, récupération privée, anti-rejeu et révocation | Réalisé techniquement le 03/11/2026 — [recette](VERIFICATION-P02-COMPLETE.md) | Autorisation reçue ; recette utilisateur en attente |
| S006 | P02-C | Composants communs, notifications persistantes et exports authentifiés | Réalisé techniquement le 03/11/2026 — même recette | Validation utilisateur en attente |
| S007 | P03-A | Clients/contacts/prospection dédiés, qualification et dossiers liés | Premier sous-lot réalisé — [recette](VERIFICATION-P03A.md), P03 reste en cours | À tester ensemble |
| S008 | P12 | React Vercel + API Hostinger, sous-domaines d’un même domaine | Architecture choisie ; modèles fournis, aucun service distant configuré | Noms réels, accès DNS/SMTP et recette distante nécessaires avant bascule |
| S009 | P03-B | Doublons justifiés, fusion manuelle sécurisée, documents conservés, liens projets/campagnes | Réalisé techniquement le 03/11/2026 — [recette](VERIFICATION-P03B.md) ; limites conservatoires explicites | À tester ensemble, aucune fusion de fiche existante utilisateur |
| S010 | P03-C | Historique détaillé, décisions métier filtrées, résultats/opposition et relance explicitement planifiée | Réalisé techniquement le 03/11/2026 — [recette](VERIFICATION-P03C.md) ; séquences avancées non présumées réalisées | À tester ensemble, aucune sollicitation réelle ni réécriture de dates historiques |
| S011 | P03 final | Référentiels, tags/CA estimé, classement factures seules, synthèse et registres liés | Réalisé techniquement le 03/11/2026 — [recette finale](RECETTE-P03-FINALE.md), tests groupés en fin de lot | Validation visuelle et métier utilisateur en attente ; aucun déploiement ni traitement de fiche utilisateur |
| S012 | P04 | Opportunités dédiées, critères/brief/faisabilité, dérogation, suspension/réouverture et liens commerciaux | Cinq parcours locaux réalisés ; dernier scénario passé le 04/11/2026 — [preuves](VERIFICATION-P04.md) | Réception utilisateur et complément séquences/récurrences ouverts |
| S013 | P05-A | Wizard atomique, fiche devis, chiffrage et snapshots, versions et gouvernance | Réalisé et testé localement le 04/11/2026 — [rapport](VERIFICATION-P05A.md) | Aucune validation visuelle/métier présumée ; P05-B restant |
| S016 | P06 final | Espaces, tâches, organisation personnelle, projets, circuits, repérages, risques/temps, agenda et protocole | Réalisé techniquement le 04/11/2026 — [recette finale](VERIFICATION-P06-COMPLETE.md) | Validation visuelle et métier utilisateur en attente |
| S014 | P08-A | Campagne avec réservations intégrées et refus des chevauchements de face | Développé localement le 04/11/2026 — [rapport](VERIFICATION-P08A.md) | Recette utilisateur en attente ; planning, carte, maintenance, collectivités et déploiements restent ouverts |
| S015 | P08-B | Planning des faces, fiches support/stock/projet, maintenance, collectivités et déploiements | Développé et recetté localement le 04/11/2026 — [rapport](VERIFICATION-P08B.md) | Recette utilisateur en attente ; pose/dépose de campagne, inventaire et réclamations restent ouverts |
| S016 | P08-C | Preuves et bilan de campagne, stock multi-entrepôts, inventaire contradictoire, faces libres, escalades et lien réclamation ↔ intervention | Développé et recetté localement le 04/11/2026 — [rapport](VERIFICATION-P08C.md) | Recette utilisateur en attente ; vue atelier, coûts réels de campagne et notification nominative d’escalade restent ouverts |
| S017 | P08-D | Coûts prévus/réels de campagne, atelier de production, notification nominative d’escalade et conversion réclamation → intervention | Développé et recetté localement le 04/11/2026 — [rapport](VERIFICATION-P08D.md) | Recette visuelle et métier de l’ensemble P08 à faire avec toi ; lots/péremption et transferts entre entrepôts hors périmètre |
| S018 | P09-A | Écritures automatiques équilibrées et idempotentes, compte client et créances échues | Développé et recetté localement le 06/11/2026 — [rapport](VERIFICATION-P09A.md) | Recette utilisateur en attente ; demandes de fonds, dépenses récurrentes et rapprochements restent ouverts |
| S019 | P09-B | Espace salarié : dossier, congés dans le circuit RH, pointage unique, missions personnelles, sans droit RH | Développé et recetté localement le 06/11/2026 — même rapport | Recette utilisateur en attente ; évaluations, formations, badge et paramètres de paie restent ouverts |
| S020 | P09-C | Demandes de fonds, dépenses récurrentes, balance âgée, évaluations et formations | Développé et recetté localement le 06/11/2026 — [rapport](VERIFICATION-P09C.md) | Recette utilisateur en attente ; badge, paramètres de paie et recette FNE restent à faire |
| S021 | P10-A | Avenants, décisions de renouvellement et appels d’offres | Développé et recetté localement le 06/11/2026 — [rapport](VERIFICATION-P10A.md) | Recette utilisateur en attente ; messagerie, rapports périodiques, SWOT et assistant restent ouverts |
| S022 | P10-B | Messagerie interne cloisonnée et rapports périodiques figés | Développé et recetté localement le 06/11/2026 — [rapport](VERIFICATION-P10B.md) | Recette utilisateur en attente ; courrier externe, SWOT, reporting avancé et assistant restent ouverts |
| S023 | P10-C | Analyse SWOT mesurée, revue et validation figée, exports CSV | Développé et recetté localement le 06/11/2026 — [rapport](VERIFICATION-P10C.md) | Recette utilisateur en attente ; courrier externe et assistant nécessitent une décision et une configuration de ta part |

À chaque point terminé, ajouter la date, le résultat concret et un lien vers sa preuve de recette. Conserver les remarques résolues au lieu de les effacer.
