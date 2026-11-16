# P01 — Inventaire CRM / ERP et écarts de la fusion

Relevé du 3 novembre 2026. Statut : inventaire technique réalisé, périmètre à valider ensemble.

Mise à jour après P02-A : les chiffres d’écarts ci-dessous conservent le constat initial de P01. La [matrice et son relevé structuré](inventaire-p01/MATRICE.md) ont été actualisés : 79 routes API Laravel ; alias RH corrigé et sections admin existantes reliées ; profil/session refaits. Il ne reste plus de route classée « alias sans écran » dans cette matrice, mais les sections non portées restent en attente. Voir [la recette P02-A](VERIFICATION-P02.md). Les options ERP non arbitrées ne sont pas considérées comme approuvées par l’autorisation de démarrer P02-A.

Mise à jour P02-B : **84 routes API** dans le relevé courant ; pièces jointes privées raccordées aux fiches de 26 ressources. Ajout, types, versions, téléchargement, corbeille/restauration et audit sont disponibles, pas la GED globale ni les générations Word/Excel. Voir [la recette P02-B](VERIFICATION-P02B.md). Les nombres du tableau « Couverture constatée » restent le point de départ historique P01, et non le dernier état des tests/API.

Mise à jour P02-C/P03-A : **97 routes API**, trois déclarations de planificateur ; MFA/récupération et socles communs raccordés, [P02 réalisé localement](VERIFICATION-P02-COMPLETE.md). [P03-A](VERIFICATION-P03A.md) apporte les pages clients/contacts/prospection, qualification et dossiers liés. La matrice courante retire l’ancienne substitution prospection ; P03 complet reste en cours. Noms réels/SMTP et recette Vercel/Hostinger restent en P12.

## Conclusion

Mise à jour P03 finale : 112 routes API, 30 modules frontend dont19 ERP ; référentiels clients, classement (factures émises seules) et synthèse360°/registres liés raccordés. La matrice est régénérée sans modifier les 94 copies historiques. Les chiffres de couverture plus bas restent le constat historique P01, pas le bilan final. [Grille P03](RECETTE-P03-FINALE.md).

La cible React V1 / Laravel V2 possède un socle exploitable, mais elle ne reprend pas encore tous les écrans et parcours du CRM. La présence des anciens fichiers React dans `src/pages` ne signifie pas qu’ils sont utilisés : l’entrée active charge `src/v2/main.tsx` et ses composants raccordés à Laravel.

Mise à jour P04/P05-A du 04/11/2026 : **125 routes API Laravel**, 99 chemins OpenAPI et toujours 30 modules dont19 ERP. Opportunités dédiées, critères/historique/dérogations raccordés ; parcours Nouveau devis, fiche, versions et validation DG ajoutés. Les 94 copies historiques restent identiques. [Recette P04](VERIFICATION-P04.md), [recette P05-A et limites P05-B](VERIFICATION-P05A.md). Les tableaux initiaux ci-dessous ne sont pas une mesure de l’état final de ces lots.

Il faut conserver les acquis CRM/ERP, puis remplacer progressivement les substitutions et compléter les API. Aucun écran, modèle métier ou traitement de production n’a été modifié dans ce lot d’inventaire.

## Livrables et lecture

| Document | Utilité |
|---|---|
| [Matrice écran → cible → API → écart → lot](inventaire-p01/MATRICE.md) | Une ligne identifiée pour chacune des 73 routes source ; 16 sections d’administration développées séparément ; modules et automatisations |
| [Preuves détaillées](inventaire-p01/PREUVES.md) | Pour les 58 fichiers : fonctions/exportations, onglets, champs, filtres, actions, références API, documents et liens vers les lignes du code ; inventaire PHP historique et routes Laravel |
| [Relevé structuré](inventaire-p01/snapshot.json) | Expressions dynamiques conservées, composants partagés, définitions des modules cible, droits source par défaut, empreintes SHA-256 |
| [Plan de travail](PLAN-DE-TRAVAIL.md) | Étapes P00 à P12 et validation utilisateur |

Les libellés, contrôles et appels partagés sont relevés séparément pour éviter d’attribuer toutes les fonctions d’un formulaire commun à tous les écrans. Les fichiers comportant plusieurs écrans, notamment RH, projets, régie, gouvernance, rapports et circuits, sont distingués par fonction/exportation et par route.

## Couverture constatée

| Élément | Résultat | Interprétation |
|---|---|---|
| Fichiers de pages CRM | 58 | Tous rattachés à au moins une route ; `DemoLogin` est une variante de démonstration, pas un module métier supplémentaire |
| Routes CRM | 73 | 3 routes publiques et 70 routes protégées, hors route générique « introuvable » ; un motif `:id` représente plusieurs dossiers |
| Sections d’administration | 16 | Développement de `/admin/:section`, à ne pas additionner mécaniquement aux routes comme autant de routes indépendantes |
| Rôles source par défaut | 17 | Les permissions sont modifiables en base ; ce relevé ne certifie pas les droits actuels d’un compte réel |
| Modules déclarés dans le frontend V1 | 28 | 9 ressources du socle CRM et 19 ressources ERP ; nombre de ressources, pas nombre de parcours entièrement portés |
| Routes API Laravel enregistrées | 78 | Relevé réel par `artisan route:list`, middleware compris ; les routes ERP génériques desservent plusieurs ressources autorisées |
| Déclarations API source littérales | 397 | Plus 3 déclarations calculées dans `letterhead.ts`, chacune déclinée en PDF/DOCX ; ce total n’est pas un taux de couverture Laravel |
| Automatisations source | 22 règles + 4 traitements rapides | Plus la reprise des demandes IA en attente ; activation et fréquence réelles non consultées en base |
| Planification Laravel déclarée | 2 commandes | Expiration des devis toutes les 5 minutes et purge des jetons expirés à 02:30 ; exécution effective du planificateur non vérifiée ici |
| Fichiers PHP sous `comsig/public` | 281 | Écrans potentiels, traitements, exports, outils et wrappers : pas 281 écrans fonctionnels certifiés |
| Copies historiques comparées | 94 fichiers TS/TSX/CSS, 0 différence | Contrôle des sources de ces extensions ; ne couvre pas les autres types d’assets et ne prouve pas leur utilisation dans V1 |

État des 73 routes :

| État | Nombre | Signification |
|---|---|---|
| Identique vérifié, périmètre limité | 3 | Portail, connexion directe, connexion départementale Commercial dans les conditions des comparaisons publiques antérieures |
| À harmoniser | 14 | Écran et base de fonctionnement présents, conformité détaillée non acquise |
| API à compléter | 8 | Base disponible, mais sections/actions/données du parcours source non entièrement raccordées |
| Substitution | 12 | Menu ou alias débouchant sur un autre écran, insuffisant pour la conformité demandée |
| Alias sans écran correspondant | 2 | Destination construite sans route métier correspondante |
| Écran d’attente | 1 | Route affichant explicitement l’attente, pas la fonctionnalité |
| Non porté | 33 | Aucun écran cible actif équivalent pour cette route |

Ce sont des catégories de travail, pas un pourcentage d’avancement ni une estimation de charge. « API à compléter » ne signifie pas que l’écran est visuellement conforme. Les trois comparaisons publiques ne valident ni tous les départements ni tous les états d’erreur/MFA/session.

## Écarts prioritaires constatés

1. `/prospection` renvoie à la liste clients ; la qualification commerciale détaillée n’est pas reproduite.
2. `/espace`, `/espace-admin` et `/indicateurs` affichent le même tableau de bord. Leurs véritables interfaces source restent à reprendre.
3. `/rh/agents/:id` produit `/effectif/agents/:id`, alors que la fiche cible existante est `/effectif/:id`.
4. `/admin/:section` produit `/utilisateurs/:section`, sans écran correspondant. Les écrans séparés catalogue, départements et audit ne corrigent pas cet alias.
5. `/validations` ne montre que les devis soumis, pas la boîte de validation transverse.
6. `/pipeline-commerciaux`, `/production`, `/finance` et `/comptabilite` aboutissent à des vues plus limitées que leurs références métier.
7. La session cible utilise un jeton en mémoire : actualiser déconnecte. Les parcours MFA/récupération source ne sont pas raccordés.
8. Les fiches clients, opportunités et projets restent largement génériques. Les sections, historiques, documents et liens entre dossiers demandent un vrai raccordement.

Preuves : [routage actif](C:/wamp64/www/comsig-front-v1/src/v2/main.tsx), [construction des alias](C:/wamp64/www/comsig-front-v1/src/v2/CrmRoutes.tsx), [session et requêtes cible](C:/wamp64/www/comsig-front-v1/src/v2/api.ts), [routes API](C:/wamp64/www/comsig-v2/routes/api.php). Ces problèmes sont inventoriés, pas corrigés dans P01.

### Rôles et périmètres à rapprocher en P02

La référence définit 17 rôles, contre 13 rôles prévus par les seeders/services cible (pas un relevé des comptes réellement créés). `assistante_dg`, `marketing`, `technicien`, `juridique` et `compte_service` n’ont pas de définition équivalente dans ces seeders cible ; `fleet_manager` est un ajout ERP. Il faut établir leurs correspondances sans les remplacer arbitrairement par administrateur.

Plusieurs valeurs par défaut de périmètre ont aussi changé, notamment `all` vers `department`. Le code source applique d’autres restrictions de service : un simple mot `all` n’est pas une preuve d’accès universel. Il faut comparer les règles complètes des deux serveurs avant toute modification des accès. Les droits supports/redevances/projets/calendrier sont regroupés différemment dans la cible.

Preuves : [rôles source](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts), [seeder cible](C:/wamp64/www/comsig-v2/database/seeders/DatabaseSeeder.php), [droits ERP cible](C:/wamp64/www/comsig-v2/app/Services/Erp/ErpPermissions.php), [périmètres serveur cible](C:/wamp64/www/comsig-v2/app/Services/AccessScope.php).

## Contrats de données et interactions à reprendre

Ce tableau synthétise les écarts structurants. Le relevé des contrôles et expressions exactes de chaque fichier est dans les preuves détaillées ; les champs dynamiques doivent être confirmés à la recette du lot concerné.

| Ensemble | Référence source à préserver | Acquis cible | Travail à réaliser |
|---|---|---|---|
| Organisations / contacts | Deux vues organisations/contacts ; raison sociale, personne ressource/fonction, nom commercial, secteur, structure, commune/ville, source, taille/potentiel, responsable ; vérification de doublons et justification | Liste organisations/contacts, saisie du tiers, contacts liés, recherche et filtre catégorie | Reprendre les champs absents du formulaire, listes administrables, détection de doublons et réattribution contrôlée ; ne pas assimiler sans règle `legal_id` au seul NCC |
| Qualification et fiche client | 7 critères : activité, besoin, budget, calendrier, décideur, processus, potentiel ; seuil de qualification 5/7 ; motif de disqualification et fusion justifiée | Statut de qualification saisissable ; fiche chargeant les contacts | Ajouter service/validation de qualification et fusion ; sections vue d’ensemble, historique, contacts, opportunités, propositions, contrats, campagnes, réclamations/factures, documents, décisions selon droits |
| Opportunités | Brief/faisabilité, synthèse, activités, propositions, documents, historique ; contacts/décideurs et étapes | Liste, Kanban, montant, besoin, prochaine action, date prévue, progression avec contrôles et preuve/motif de clôture | Rapprocher les champs et règles ; historique exploitable et liens complets. Ne pas inventer de dates de clôture pour calculer les indicateurs |
| Activités / calendrier | Types, période, affectation, échéance, contact, résultat, statut, relances ; calendrier dédié | CRUD activités/tâches ; vue chronologique | Raccorder les résultats/relances et vues du calendrier source ; rapprocher droits `calendar` et `tasks` plutôt que les confondre |
| Devis / proforma | Wizard autonome ou création depuis opportunité ; catalogue, matières et faces disponibles ; simulations, versions, validations, PDF/Word/Excel et décision client | Éditeur multilignes, simulation Laravel, remises/marge/taxes, validation, décision, PDF et conversion en facture interne | Reprendre le parcours et les sections exactes, choix des faces/périodes, documents/versionnement et liens. L’action « envoyer » ne prouve pas l’envoi effectif d’un e-mail |
| Documents | Pièces rattachées à une entité, type, versions, téléchargement, suppression/restauration ; documents privés | P02-B : pièces privées sur 26 ressources, types contextuels, versions, téléchargement, corbeille/restauration et audit ; PDF générés et CSV existants | Socle documentaire raccordé ; reprise des onglets historiques, GED globale et génération Word/Excel encore à compléter |
| Production / projets | Atelier ; projets avec fiche, planification, Kanban, RACI, jalons/risques/ordres | Projets ERP, nomenclatures, ordres avec consommation/réception/livraison | Distinguer projets d’entreprise, ordres interservices et ordres de production ; harmoniser `projects.view` source avec `production.view` cible sans élargissement silencieux |
| Régie | Supports avec plusieurs faces, carte, planning, campagne avec faces/preuves, tâches, coûts, documents et dossier | Une ressource support représente une face ; réservations, campagnes, taxes municipales, redevances | Définir correspondance panneau/face pour migration et UX ; reprendre planning, maintenance, preuves, collectivités et déploiements |
| Finance / comptabilité | Factures et encaissements à rapprocher ; journal/balance/grand livre ; synchronisation comptable source | Factures internes, règlements à validation distincte, caisse, écritures manuelles équilibrées, contrepassation et balance | Refaire les vues et rapprochements ; définir les écritures automatiques. Une écriture manuelle disponible n’équivaut pas à un flux comptable intégré |
| RH | Tableau de bord/personnel/pointage/congés/postes ; fiche avec profil/recommandations, dossier, pointage/congés, évaluations/formations, CV/documents ; self-service personnel | Effectif, présences, congés à validation RH puis direction, paie préparatoire | Reprendre les sous-écrans et droits, postes/compétences/évaluations et espace personnel. Faire valider les règles de congés et paie, pas reprendre automatiquement des valeurs historiques |
| Pilotage | Période/service/responsable, objectifs, classements, commissions, rapports et SWOT | Tableau de bord et agrégations partielles côté navigateur | API d’agrégats autorisés, définitions explicites et rapprochement des montants ; ne pas confondre affaire gagnée, facturation et encaissement |
| Administration / sécurité | 16 sections, droits en base, équipes, sessions, corbeille, contrôles et gouvernance | Utilisateurs, lecture rôles, départements, audit, permissions serveur | Porter les vrais écrans et la gestion des droits ; conserver les séparations administrateur technique/métier et les périmètres de portefeuille |

Références principales : [formulaires source](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx), [fiche client](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx), [documents source](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx), [définitions CRM cible](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts), [définitions ERP cible](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts), [API ERP et limites documentées](C:/wamp64/www/comsig-v2/docs/ERP-API.md).

## Comparaison fonctionnelle avec l’ancien ERP PHP

Les chemins ci-dessous désignent du code effectivement présent sous `comsig/public`. Ce n’est pas une certification d’exécution de l’ancien ERP : wrappers, variantes `alt`, formulaires, traitements et documents sont distingués dans le relevé. Aucune ancienne page de configuration ou de migration n’a été exécutée.

| ID | Référence PHP historique | Cible existante | Écart à fusionner / décision | Lot |
|---|---|---|---|---|
| ERP-01 | `parties/clients*`, `sales/client-*`, `parties/fournisseur-*` | Tiers avec catégories et contacts | Consolider les variantes de fiches ; compléter les relations fournisseurs et données utiles avant migration | P03 |
| ERP-02 | `sales/devis-*`, `devis-projet`, `devis-regie`, `devis-particulier` | Devis/proformas Laravel et éditeur | Comparer les trois modes, taxes et calculs ; reprendre leur parcours sans dupliquer trois moteurs de chiffrage | P05 |
| ERP-03 | `sales/commandes*`, `commande-*`, `bon-commande*`, `bon-livraison`, `livraison-modify` | Facture depuis devis accepté ; livraison des ordres de production | Confirmer le cycle commande/bon/livraison commercial et ses documents ; pas de module commandes autonome équivalent | P05 / P08 |
| ERP-04 | `sales/facture-*`, `historiques-versement`, `compte-client*`, `facture-fne-sign` | Factures, paiements à valider, PDF, FNE désactivée/configurable | Reprendre compte client, historique et documents ; configuration/recette FNE séparée avant toute certification réelle | P09 |
| ERP-05 | `sales/rdv-*`, `rdv-calendar`, `rappel-mail-send` | Activités et calendrier partiel | Fusionner rendez-vous, statuts, rappels et calendrier CRM ; ne pas maintenir deux agendas incohérents | P04 / P06 |
| ERP-06 | `treasury/caisse*`, `encaissement*`, `decaissement*`, `demande-fond`, `depenses-stables*`, `bilan` | Comptes, mouvements, validations et balance | Demandes de fonds, dépenses récurrentes avec justificatif, états et rapprochements non couverts par le simple mouvement de caisse | P09 |
| ERP-07 | `inventory/stock*`, `produit-finis-*`, `mouvements-*`, `approvisionnement-*`, `demande-stock*`, `inventaire` | Matières/produits finis, mouvements, CUMP et consommation atelier | Reprendre approvisionnements, demandes internes, statuts/validation et véritable inventaire ; contrôler conservation des unités et valorisations | P08 |
| ERP-08 | `production/fiche-*`, `fiches` | Ordres, autorisation, fabrication, préparation, livraison et PDF | Rapprocher tous les champs/états de la fiche, consignes techniques, impression et réception ; uploads/signature restent à porter | P08 |
| ERP-09 | `projects/projet-*`, `travail*`, `task-*`, `taches`, `medias`, `espaces-map` | Projets ERP, tâches et ordres ; supports/réservations séparés | Compléter travaux, pièces médias, affectations et retours ; relier projets CRM/ERP sans effacer les distinctions entreprise/atelier/régie | P06 / P08 |
| ERP-10 | `human_resources/effectif`, `profil-employe`, `presence*`, `conge-*`, `holiday*`, `imprimer_badge` | Effectif, pointage et congés | Reprendre dossier, récapitulatifs, espace salarié, justificatifs et badge retenu ; préserver confidentialité et lien compte/salarié | P09 |
| ERP-11 | `human_resources/paie*`, `fiche_de_paie` | Paie préparatoire, validations, déclaration interne du paiement et PDF | Comparer rubriques et historique ; paramètres sociaux/fiscaux à valider par le responsable, aucun barème ancien repris automatiquement | P09 |
| ERP-12 | `fleet/vehicules`, `vehicules-utilises`, `list_chauffeurs`, `stats-vehicules` et API véhicules | Véhicules/chauffeurs/missions, compteurs et disponibilité | Champs historiques achat/prix, année, couleur, type, état et prochaine révision à arbitrer ; statistiques et écran détail à harmoniser | P09 |
| ERP-13 | `documents/document-create`, `document-edit`, `index`, `documents-controller` | P02-B : pièces privées par dossier, types, versions, corbeille ; PDF générés existants | GED globale, description, échéance, tags et recherche restent à définir/raccorder. Versions de fichiers disponibles, distinctes des versions métier | P02 |
| ERP-14 | `admin/support-*`, `campagne-*`, `espaces`, `taxes`, `map` | Supports-faces, campagnes, réservations, taxes et redevances | Rapprocher carte, surfaces/faces, périodes, tarifs, taxes et droits avec le CRM de référence | P08 |
| ERP-15 | `reporting/rapport-travail-*`, `stats-*`, `export-projets` ; tableaux de bord par service | Tableau de bord générique et quelques exports | Rapports de travail, statistiques et tableaux métier à intégrer aux espaces/rapports CRM ; pas des duplications indépendantes | P06 / P07 / P10 |
| ERP-16 | `admin/visiteur*`, `agenda*`, `message-save`, `notifications-*`, `send-mail` ; `api/smsapi` | Utilisateurs/audit ; pas d’équivalent complet | Décider explicitement de conserver visiteurs/accueil et SMS ; messagerie, notifications et courrier CRM déjà recensés à reprendre | P07 / P10 |

Les groupes techniques `includes`, `layout`, `api`, `login` ainsi que les outils/setup sont inventoriés comme tels, pas comme modules métier à recopier. L’ancien ERP et son code restent inchangés.

### À confirmer, sans ajout silencieux

- Visiteurs/accueil, badges et SMS : fonctions historiques repérées, priorité et maintien à décider.
- Gestion détaillée entretien/carburant et GPS temps réel de flotte : pas de module complet démontré par les fichiers flotte examinés. Le champ « prochaine révision » existe dans l’ancien ERP ; il ne prouve pas un module d’entretien. Les coordonnées des supports publicitaires sont un autre sujet.
- Multi-dépôts, achat fournisseur complet et charge machine : ne pas les considérer acquis ni les ajouter comme obligations sans confirmer le besoin.
- Assistant IA : choisir mode, fournisseur éventuel et périmètre des données avant raccordement. Les brouillons/actions doivent rester soumis aux confirmations requises.
- Documents Word/Excel et papier à en-tête source : portage à prévoir pour les modules retenus ; aucune production/envoi externe déclenché pendant l’inventaire.

## Automatisations et dépendances transverses

Les 22 règles source couvrent comptabilisation des devis, absences, récurrence/retards de tâches, contrôles assistant, rapports/SWOT, résumés courrier, archives de connexions, gouvernance/priorités, stocks bas, opportunités inactives/en retard, qualification, contrats, interventions, redevances, expiration des pré-réservations/devis, bilan campagne, réclamations et brouillons de relance IA.

La boucle rapide gère rappels messagerie, rappels to-do, relance groupée to-do et agents de sécurité. La reprise des demandes IA en attente est un traitement supplémentaire dans `runJobs`, hors des 22 règles.

La [matrice](inventaire-p01/MATRICE.md) fournit les codes exacts et les lignes source. Les intervalles par défaut sont 300 s et 30 s, pas des fréquences métier garanties pour chaque événement. Les seuils, activation, déduplication et conditions internes doivent être conservés. Seule la partie expiration des devis a un équivalent planifié partiel côté Laravel ; les autres tâches ne doivent pas être annoncées comme déjà reprises.

Avant exploitation : définir commande, fréquence, fuseau, verrouillage anti-chevauchement, idempotence, reprise, journal d’erreurs et notification. Vérifier ensuite l’exécution réelle sur l’hébergement. Aucun cron, worker, e-mail, SMS, traitement IA ou job historique n’a été activé ici.

## Recette à appliquer à chaque ligne

Pour chaque identifiant CRM, le lot d’implémentation ajoutera ses preuves à la matrice :

1. Profil autorisé et profil interdit, périmètre propre/équipe/service/direction, confidentialité et pièces liées.
2. Liste, recherche, filtres, pagination, états vide/chargement/erreur et accès direct par URL.
3. Champs requis, formats, sélecteurs, erreurs de validation, modification et conservation de la saisie.
4. Chaque onglet/action, transition, confirmation, motif/preuve et historique ; contrôles serveur et répétition d’action.
5. Documents/export, montants et rapprochement des liens vers les autres modules.
6. Comparaison visuelle source/cible avec mêmes données, profil, thème, dimensions et polices.
7. Mobile : navigation, tableau/cartes, formulaires/modales, onglets, actions et documents ; clavier/focus sur ordinateur ; rechargement et expiration de session.

Pour les routes non portées, aucune recette d’écran cible n’est possible avant implémentation. La vérification mobile complète reste donc à faire en P11 et dans chaque lot ; l’extraction des styles responsive n’est pas une preuve de conformité. Les tests antérieurs sont dans [VERIFICATION-CRM.md](VERIFICATION-CRM.md) et ne sont pas présentés comme réexécutés pendant P01.

## Ordre de réalisation proposé après validation

| Ordre | Sous-lot | Pourquoi / sortie attendue |
|---|---|---|
| 1 | P02-A — session, droits, profil et navigation | Stabiliser rechargement, expiration, MFA retenue et correspondances des rôles sans casser les restrictions existantes |
| 2 | P02-B — documents et composants partagés | Un mécanisme privé commun, utilisable par toutes les fiches ; fixer tableaux, filtres, modales, erreurs et téléchargements |
| 3 | P03 — clients, contacts et prospection | Fiche source complète et qualification ; base nécessaire aux opportunités et devis |
| 4 | P04 — opportunités, activités, pipeline | Parcours et historique commercial fiables, avec preuves et portefeuilles |
| 5 | P05 — devis/proformas | Parcours complet et documents, depuis le client/l’opportunité jusqu’à la décision et la facture |
| 6 | P06 puis P07 | Véritables espaces, coordination du travail, indicateurs et administration, en réutilisant le socle |
| 7 | P08 puis P09 | Compléter et harmoniser les acquis production/stocks/régie, finance/RH/paie/flotte |
| 8 | P10, puis P11 et P12 | Compléments retenus, recette globale et reprise/déploiement expressément approuvés |

Les corrections d’alias seront rattachées à leur lot ou au socle de navigation, mais remplacer un alias par le bon lien ne suffira pas à déclarer le véritable écran repris.

## Méthode et contrôles de cet inventaire

Commande de régénération, depuis `C:\wamp64\www\comsig-front-v1` : `node scripts/inventory-p01.mjs`. Le générateur analyse l’AST TypeScript ; il n’évalue aucun ancien composant ni script PHP. La seule commande Laravel lancée est `artisan route:list --path=api --json`, à visée de diagnostic. Les seuls fichiers générés sont les trois rapports sous `docs/inventaire-p01`.

Contrôles intégrés : toute route source a une correspondance ; tout fichier de page est couvert ; toutes les sections admin ont un état ; toutes les destinations annoncées existent dans les déclarations cible ; les 19 ressources ERP du frontend figurent dans la configuration serveur ; les copies historiques TS/TSX/CSS sont comparées par SHA-256. Le générateur échoue si une correspondance requise manque. Les correspondances relues sont dans [inventory-p01-scope.mjs](C:/wamp64/www/comsig-front-v1/scripts/inventory-p01-scope.mjs).

Contrôles documentaires reproductibles : `node --test scripts/inventory-p01.test.mjs` (couverture, sous-écrans, alias, ressources/API, automatisations, liens et préservation des sources). Ces tests ne remplacent pas la recette navigateur.

Résultat du 03/11/2026 : génération terminée sans correspondance manquante ; **10 contrôles réussis sur 10**, aucun échec. Les empreintes des fichiers audités sont restées identiques entre génération et vérification.

Limites : audit statique, sans exploration navigateur de chaque écran, sans données métier réelles ni lecture des droits configurés en base. Les références calculées sont conservées plutôt qu’inventées ; les trois déclarations dynamiques de documents ont été relues dans `letterhead.ts` (formats PDF et DOCX). Les variantes de démo, erreurs, droits et états conditionnels restent à recetter. Les fichiers secrets, `.env`, documents téléchargés et données personnelles ne sont pas inclus.

## Validation attendue

- [x] Inventaire technique et matrice établis, avec limites et écarts explicites.
- [ ] Validation utilisateur du périmètre CRM + fonctions ERP à retenir.
- [ ] Arbitrage des options visiteurs/badges/SMS et autres extensions.
- [ ] Accord sur le sous-lot suivant : P02-A proposé.

P01 n’est pas marqué « Validée » sans ton accord. Aucun développement du lot suivant n’est présumé.
