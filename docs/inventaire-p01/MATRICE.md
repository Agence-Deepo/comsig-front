# P01 — Matrice des écrans et destinations

Généré le 2026-11-04T11:22:06.977Z. Les états sont une revue statique, sauf les trois comparaisons publiques déjà documentées dans [VERIFICATION-CRM.md](../VERIFICATION-CRM.md). « Identique vérifié » se limite à ces vues publiques et à leurs conditions de test, pas à toute leur logique.

| ID | Route source | Composant source | Accès source (statique) | Destination V1 effective | API cible disponible / base | État | Lot | Écart / réception attendue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CRM-001 | `/` | Home | Connecté ; conditions internes du composant/API | `/` | /api/v1/dashboard + agrégations de listes autorisées | à harmoniser | P07 | Accueil source selon profil : Dashboard OU Workspace ; cible toujours Dashboard. Agrégats et périmètres à rapprocher. |
| CRM-002 | `/activites` | Activities | activities.view | `/activites` | /api/v1/activities | à harmoniser | P04 | P03-C : contact/résultat/compte rendu/durée, date serveur, opposition et clôture protégée ; suivi explicite unique depuis fiche client. Agenda/filtres et moteur de séquences/récurrences source à poursuivre. |
| CRM-003 | `/admin` | Admin | Connecté ; conditions internes du composant/API | `/utilisateurs` | /api/v1/admin/users | substitution | P07 | Alias utilisateurs uniquement ; 16 sections source détaillées séparément. |
| CRM-004 | `/admin/:section` | Admin | Connecté ; conditions internes du composant/API | `/admin/:section` | Selon section : /api/v1/admin/users, /departments, /catalog, /admin/audit-logs ; autres non portées | API à compléter | P07 | P02-A : utilisateurs, départements, catalogue et audit redirigent vers leurs écrans ; les autres sections restent explicitement en attente. |
| CRM-005 | `/appels-offres` | Tenders | contracts.view | — | Aucun raccordement pour cette route | non porté | P10 | Dossiers, dates limites et suivi des réponses à porter. |
| CRM-006 | `/assistant` | Assistant | ai.view | — | Aucun raccordement pour cette route | non porté | P10 | Conversation/outils IA, propositions à confirmer et configuration serveur à porter après choix du mode. |
| CRM-007 | `/assistant/connaissances` | Assistant | ai.view | — | Aucun raccordement pour cette route | non porté | P10 | Base de connaissances et droits documentaires à porter. |
| CRM-008 | `/calendrier` | CalendarPage | calendar.view | `/calendrier` | /api/v1/tasks (chargement via pagination) | à harmoniser | P06 | Vue chronologique tâches ; pas le calendrier complet source ; droit tasks.view au lieu de calendar.view. |
| CRM-009 | `/campagnes` | Campaigns | campaigns.view | `/campagnes` | /api/v1/erp/campaigns | à harmoniser | P08 | CRUD ERP et transitions ; liste/filtres et périmètres source à harmoniser. |
| CRM-010 | `/campagnes/:id` | CampaignDetail | campaigns.view | `/campagnes/:id` | /api/v1/erp/campaigns/{id} | API à compléter | P08 | Pièces privées disponibles (P02-B) ; fiche générique, pose/dépose, preuves métier, bilan et rapprochement supports à compléter. |
| CRM-011 | `/circuits` | Flows | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P06 | Circuits et étapes interservices à porter. |
| CRM-012 | `/circuits/:id` | FlowDetail | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P06 | Détail, affectations, validations et documents du circuit à porter. |
| CRM-013 | `/clients/classement` | ClientRanking | organizations.view | `/clients/classement` | Aucun raccordement pour cette route | à harmoniser | P03 | Écran source adapté : cartes catégories, ABC, scores, périodes, filtres et CSV serveur. Choix utilisateur : CA des factures émises HT uniquement. Poids 40/30/20/10, ABC 80/95 ; données interdites null, score global uniquement complet. Aucun XLSX ou calcul source trompeur simulé. |
| CRM-014 | `/comptabilite` | Accounting | accounting.view | `/ecritures` | /api/v1/erp/journal-entries | substitution | P09 | Écritures manuelles/plan/balance existants ; vues source et génération automatique non équivalentes. |
| CRM-015 | `/connexion` | Login | Public | `/connexion` | /api/v1/auth/login | identique vérifié | P02 | Gabarit public comparé ; session HttpOnly/CSRF, récupération et MFA TOTP raccordées en P02. Configuration réelle des domaines/SMTP et recette distante en P12. |
| CRM-016 | `/connexion/:dept` | Login | Public | `/connexion/:dept` | /api/v1/auth/login | identique vérifié | P02 | Comparaison vérifiée pour Commercial seulement ; tester les autres départements et erreurs. |
| CRM-017 | `/contrats` | Contracts | contracts.view | `/contrats` | /api/v1/customer-cases/contracts | à harmoniser | P10 | Registre P03 raccordé au client, confidentialité et échéances. Le circuit juridique avancé et les renouvellements restent en P10. |
| CRM-018 | `/contrats/:id` | ContractDetail | contracts.view | `/contrats/:id` | /api/v1/customer-cases/contracts/{id} | API à compléter | P10 | Fiche générique P03 et pièces privées ; déclaration externe de signature avec preuve et direction. Avenants, revue juridique et renouvellements à porter en P10. |
| CRM-019 | `/devis` | Quotes | quotes.view | `/devis` | /api/v1/quotes | à harmoniser | P05 | P05-A : liste dédiée, recherche/statut/type persistants, pagination et marge serveur. Exports et conformité visuelle exhaustive restent P05-B/réception utilisateur. |
| CRM-020 | `/devis/:id` | QuoteDetail | quotes.view | `/devis/:id` | /api/v1/quotes/{id} | à harmoniser | P05 | P05-A : fiche proposition/validations/versions/historique/documents, familles de révisions et snapshots, dates serveur, verrou PDF/envoi DG. Référence unique -Vn et éditeur séparé adaptés. Word/Excel et e-mail privé de test en P05-B ; pas de vrai envoi présumé. |
| CRM-021 | `/devis/nouveau` | NewQuoteRoute | quotes.view | `/devis/nouveau` | /api/v1/quotes/new ; /api/v1/quotes/new/context ; /quotes/simulate ; catalogue/stock ; /quotes pour affaire préremplie | à harmoniser | P05 | P05-A : wizard client existant/nouveau, contact et affaire, chiffrage/soumission atomiques, simulation Laravel. ?opportunity= et ?opportunite= préremplis ; coût/CUMP/catalogue raccordés. Catégories/tarifs fournisseur/nomenclature/faces et parité visuelle complète à poursuivre. |
| CRM-022 | `/espace` | Workspace | Connecté ; conditions internes du composant/API | `/espace` | /api/v1/dashboard + agrégations de listes autorisées | substitution | P06 | Affiche Dashboard ; véritable Workspace personnel/service non porté. |
| CRM-023 | `/espace-admin` | AdminSpace | admin.view | `/espace-admin` | /api/v1/dashboard + agrégations de listes autorisées | substitution | P06 | Affiche Dashboard, pas AdminSpace. |
| CRM-024 | `/espace-entreprise` | CompanyWorkspace | projects.view | `/projets` | /api/v1/erp/projects | substitution | P06 | Liste projets de production ; pas CompanyWorkspace ni le même droit projects.view. |
| CRM-025 | `/finance` | Finance | finance.view | `/factures` | /api/v1/invoices | substitution | P09 | Liste factures cible ; source finance plus large. Paiements, créances, exports et vues à rapprocher. |
| CRM-026 | `/gouvernance/audits` | GovernanceAudits | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P07 | Audits métier distincts du journal technique /audit. |
| CRM-027 | `/gouvernance/audits/:id` | GovernanceAuditDetail | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P07 | Constats, mesures et suivi d’audit à porter. |
| CRM-028 | `/indicateurs` | Indicators | Connecté ; conditions internes du composant/API | `/indicateurs` | /api/v1/dashboard + agrégations de listes autorisées | substitution | P07 | Même Dashboard ; filtres et indicateurs dédiés non portés. |
| CRM-029 | `/maintenance` | Maintenance | interventions.view | — | Aucun raccordement pour cette route | non porté | P08 | Interventions : liste, affectations, criticité, délais et escalades à porter. |
| CRM-030 | `/maintenance/:id` | InterventionDetail | interventions.view | — | Aucun raccordement pour cette route | non porté | P08 | Fiche intervention, photos/rapports et clôture à porter. |
| CRM-031 | `/messagerie` | Messages | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P10 | Conversations, courrier, pièces jointes, lectures et rappels à porter. |
| CRM-032 | `/mon-assistant` | MyAssistant | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P10 | Espace assistant personnel distinct du chat global à porter. |
| CRM-033 | `/mon-equipe/acces` | TeamAccess | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P07 | Accès d’équipe et délégations à porter, sans élargir les privilèges techniques. |
| CRM-034 | `/mon-espace-rh` | MyHr | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P09 | Self-service pointage/congés absent ; ne pas donner hr.view pour le remplacer. |
| CRM-035 | `/opportunites` | Opportunities | opportunities.view | `/opportunites` | /api/v1/opportunities | à harmoniser | P04 | P04 : liste/Kanban dédiés, filtres/tri/URL et CSV serveur, totaux exhaustifs, cartes bornées20 par étape avec accès à la liste paginée. Six étapes existantes conservées et suspension ajoutée, pas de reclassement automatique vers les étapes détaillées source. |
| CRM-036 | `/opportunites/:id` | OpportunityDetail | opportunities.view | `/opportunites/:id` | /api/v1/opportunities/{id} | à harmoniser | P04 | P04 : fiche dédiée, contact, brief/faisabilité, historique daté, critères/proof réels, dérogations et réouverture direction, pièces privées, activités/relances/agenda et devis/proforma préremplis. Circuits internes/passation opérations en P06/P08 ; séquences automatiques dédiées non activées. |
| CRM-037 | `/ordres-travail` | WorkOrders | workorders.view | — | Aucun raccordement pour cette route | non porté | P06 | Demandes entre services distinctes des ordres de production ERP. |
| CRM-038 | `/ordres-travail/:id` | WorkOrderDetail | workorders.view | — | Aucun raccordement pour cette route | non porté | P06 | Fiche ordre de travail, prise en charge et livrables à porter. |
| CRM-039 | `/organisations` | Organizations | organizations.view | `/clients` | /api/v1/organizations | à harmoniser | P03 | P03 final : référentiels administrables, tags/CA estimé, contact principal, filtres/tri CA facturé et dernier contact, CSV, pagination et doublons justifiés raccordés. Adaptation locale contrôlée ; parité pixel exhaustive non certifiée. Import de données en P12. |
| CRM-040 | `/organisations/:id` | OrganizationDetail | organizations.view | `/clients/:id` | /api/v1/organizations/{id} | à harmoniser | P03 | Synthèse 360° réelle, qualification, historique et décisions filtrés, contacts, opportunités/devis/finance/projets/campagnes/contrats/réclamations selon droits, documents privés et fusion conservatoire. Conditions tarifaires avancées en P05 ; séquences automatiques en P04, pas une fausse exhaustivité de ces modules. |
| CRM-041 | `/performance` | Performance | performance.view | — | Aucun raccordement pour cette route | non porté | P07 | Objectifs, commissions, classement et règles de calcul à porter. |
| CRM-042 | `/pipeline-commerciaux` | SalesPipeline | opportunities.view | `/pipeline` | /api/v1/opportunities ; /api/v1/pipeline/stages | substitution | P04 | Kanban opportunités ; pas la consolidation commerciale par vendeur de SalesPipeline. |
| CRM-043 | `/planning` | Planning | supports.view | — | Aucun raccordement pour cette route | non porté | P08 | Planning visuel des faces/réservations absent ; réservations ERP disponibles séparément. |
| CRM-044 | `/portail` | Portal | Public | `/portail` | Tuiles statiques ; pas d’API publique portail cible | identique vérifié | P02 | Portail public comparé ; administration dynamique des tuiles source absente. |
| CRM-045 | `/production` | Production | production.view | `/ordres-production` | /api/v1/erp/production-orders | substitution | P08 | Ordres ERP opérationnels ; pas le tableau atelier multi-vues source. |
| CRM-046 | `/profil` | Profile | Connecté ; conditions internes du composant/API | `/profil` | /api/v1/auth/me ; PUT /api/v1/auth/password | à harmoniser | P02 | Socle P02 raccordé : profil, droits, mots de passe, MFA TOTP/QR/codes de secours, récupération privée et révocation. Composants CRM conservés ; recette utilisateur et configuration externe à confirmer. |
| CRM-047 | `/projets` | Projects | projects.view | `/projets` | /api/v1/erp/projects | à harmoniser | P08 | Ressource ERP sous production.view ; projets CRM sous projects.view : modèle et accès à rapprocher. |
| CRM-048 | `/projets/:id` | ProjectDetail | projects.view | `/projets/:id` | /api/v1/erp/projects/{id} | API à compléter | P08 | Pièces privées disponibles (P02-B) ; fiche générique, étapes, ressources, budget et collaboration source à reprendre. |
| CRM-049 | `/prospection` | Prospection | organizations.view | `/prospection` | Aucun raccordement pour cette route | à harmoniser | P03 | P03-A/C : page prospects, agrégats serveur, qualification 5/7, premier contact à 2 jours, filtres/CSV ; interaction récente basée sur réalisation datée, pas correction. Résultats de contact et relance explicite raccordés ; séquences avancées et parité exhaustive à poursuivre. |
| CRM-050 | `/protocole-priorites` | PriorityProtocol | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P06 | Matrice/protocole, décisions et escalades à porter. |
| CRM-051 | `/rapports` | PeriodicReports | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P10 | Rapports périodiques et validation/publication à porter. |
| CRM-052 | `/rapports/:id` | ReportView | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P10 | Consultation/décision sur rapport à porter. |
| CRM-053 | `/reclamations` | Complaints | complaints.view | `/reclamations` | /api/v1/customer-cases/complaints | à harmoniser | P08 | Registre P03 client/responsable, gravité, échéance, résolution avant clôture et alertes 360° raccordés. Automatisation des escalades et activités spécifiques à poursuivre en P08. |
| CRM-054 | `/redevances` | Royalties | royalties.view | `/redevances` | /api/v1/erp/royalties | à harmoniser | P08 | Ressource ERP ; paiements partiels, dossiers administratifs et alertes source à rapprocher. |
| CRM-055 | `/regie/collectivites` | Collectivities | collectivities.view | — | Aucun raccordement pour cette route | non porté | P08 | Relations collectivités distinctes du référentiel taxes municipales ERP. |
| CRM-056 | `/regie/collectivites/:id` | CollectivityDetail | collectivities.view | — | Aucun raccordement pour cette route | non porté | P08 | Fiche collectivité, contacts, conventions/dossiers et historique à porter. |
| CRM-057 | `/regie/deploiements` | Deployments | projects.view | — | Aucun raccordement pour cette route | non porté | P08 | Planning/suivi déploiements distinct des projets et campagnes génériques. |
| CRM-058 | `/reperages` | Surveys | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P06 | Demandes de repérage et suivi terrain à porter. |
| CRM-059 | `/reperages/:id` | SurveyDetail | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P06 | Fiche repérage, constat, photos et clôture à porter. |
| CRM-060 | `/reporting` | Reporting | reporting.view | — | Aucun raccordement pour cette route | non porté | P10 | Reporting métier et exports distincts des cartes du tableau de bord. |
| CRM-061 | `/rh` | Hr | HrGate : hr.view OU cross_department OU data_scope ≠ own | `/effectif` | /api/v1/erp/employees | substitution | P09 | Liste salariés ERP ; pas le cockpit RH source ni les mêmes conditions HrGate. |
| CRM-062 | `/rh/agents/:id` | EmployeeDetail | HrGate : hr.view OU cross_department OU data_scope ≠ own | `/effectif/:id` | /api/v1/erp/employees/{id} | à harmoniser | P09 | P02-A : alias corrigé vers /effectif/:id ; la fiche reste générique, pas le dossier RH source complet. |
| CRM-063 | `/securite` | Security | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P07 | Écran agents/événements de sécurité absent ; protections Laravel ne remplacent pas cette interface. |
| CRM-064 | `/services` | Palettes | Connecté ; conditions internes du composant/API | `/services` | Tuiles et destinations locales ; droits du profil | à harmoniser | P06 | Tuiles reprises ; leurs destinations restent limitées aux modules disponibles, pas de recette exhaustive. |
| CRM-065 | `/stocks` | Stocks | stocks.view | `/stocks` | /api/v1/stock-items | à harmoniser | P08 | Articles/mouvements existent ; inventaire, réception, valorisation et vues source à rapprocher. |
| CRM-066 | `/stocks/:id` | StockItemDetail | stocks.view | `/stocks/:id` | /api/v1/stock-items/{id} | API à compléter | P08 | Détail générique ; mouvements et onglets historiques à comparer avec StockItemDetail. |
| CRM-067 | `/supports` | Supports | supports.view | `/supports` | /api/v1/erp/supports | à harmoniser | P08 | Ressource ERP supports ; filtres, faces, carte, photos et documents source à compléter. |
| CRM-068 | `/supports/:id` | SupportDetail | supports.view | `/supports/:id` | /api/v1/erp/supports/{id} | API à compléter | P08 | Fiche générique ; faces/disponibilités, réservations et historique à reprendre. |
| CRM-069 | `/swot` | SwotList | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P10 | Liste/production SWOT périodique à porter. |
| CRM-070 | `/swot/:id` | SwotView | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P10 | Consultation SWOT et plan d’action à porter. |
| CRM-071 | `/taches` | Tasks | tasks.view | `/taches` | /api/v1/tasks | à harmoniser | P06 | CRUD tâches existant ; matrices, vues, récurrence et dépendances source à compléter. |
| CRM-072 | `/todo` | Todo | Connecté ; conditions internes du composant/API | — | Aucun raccordement pour cette route | non porté | P06 | To-do/checklists personnelles et rappels distincts du CRUD tâches. |
| CRM-073 | `/validations` | Approvals | Connecté ; conditions internes du composant/API | `/devis?status=soumis` | /api/v1/quotes | substitution | P06 | Seulement devis soumis ; pas la boîte de validations intermodules source. |

## Sections d’administration à ne pas masquer derrière /admin/:section

| Source | Libellé | Condition source | Cible séparée | État | Écart |
| --- | --- | --- | --- | --- | --- |
| /admin/utilisateurs | Utilisateurs | admin && !!me?.is_admin | /utilisateurs | partiel | CRUD utilisateurs et rôles lus ; invitations/réinitialisation, restauration et protections source à rapprocher. |
| /admin/equipes | Équipes | admin | — | non porté | Équipes, responsables et rattachements. |
| /admin/roles | Rôles et droits | admin | — | API à compléter | Lecture /admin/roles présente ; pas d’éditeur de matrice des droits équivalent. |
| /admin/departements | Départements et accès | admin | /gestion-services | partiel | CRUD départements ; droits/couleurs et accès détaillés source à rapprocher. |
| /admin/portail | Portail des départements | admin | — | non porté | Configuration dynamique des tuiles, descriptions et visibilité. |
| /admin/parametres | Paramètres et seuils | admin \|\| dir | — | non porté | Seuils et paramètres métier administrables. |
| /admin/pipeline | Étapes du pipeline | admin \|\| dir | — | API à compléter | Étapes lues par /pipeline/stages ; éditeur d’étapes absent. |
| /admin/catalogue | Catalogue et tarifs | can('catalog') | /catalogue | partiel | CRUD catalogue existant ; tarification et contrôle des prix à comparer. |
| /admin/listes | Listes de valeurs | admin | /referentiels-clients | partiel | Quatre listes clients administrables : secteur, commune, structure et acquisition. Codes stables, libellés, ordre et désactivation ; autres listes métier en P07. |
| /admin/automatisations | Automatisations | admin \|\| dir | — | non porté | Activation, exécution contrôlée, résultats et historique des règles. |
| /admin/objectifs | Objectifs commerciaux | dir \|\| admin | — | non porté | Objectifs commerciaux par période/responsable. |
| /admin/imports | Imports | can('organizations', 'create') \|\| can('supports', 'create') \|\| can('finance', 'create') | — | non porté | Prévisualisation, validation et bilan des imports. |
| /admin/ia | Supervision IA | admin \|\| role === 'direction_generale' | — | non porté | Supervision IA et validation des actions/outils. |
| /admin/audit | Journal d’audit | admin \|\| ['direction_generale', 'auditeur'].includes(role) | /audit | partiel | Journal technique existant ; filtres, exports et détail source à comparer. |
| /admin/corbeille | Corbeille | admin | — | non porté | Éléments supprimés et restauration contrôlée. |
| /admin/sessions | Sessions actives | admin | — | non porté | Consultation et révocation des sessions actives. |

## Modules réellement déclarés dans le frontend V1

Chaque liste générique n’est pas un écran CRM source identique. Les champs/actions complets figurent dans les définitions de snapshot.json et le code pointé.

| Chemin | Ressource API (sous /api/v1/) | Droit lecture | Fiche | Définition |
| --- | --- | --- | --- | --- |
| /clients | organizations | organizations.view | /clients/:id | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:127) |
| /opportunites | opportunities | opportunities.view | /opportunites/:id | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:149) |
| /devis | quotes | quotes.view | /devis/:id | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:178) |
| /catalogue | catalog | catalog.view | Non | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:200) |
| /stocks | stock-items | stocks.view | /stocks/:id | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:283) |
| /factures | invoices | finance.view | /factures/:id | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:315) |
| /utilisateurs | admin/users | admin.view | Non | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:399) |
| /activites | activities | activities.view | /activites/:id | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:225) |
| /taches | tasks | tasks.view | /taches/:id | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:225) |
| /contrats | customer-cases/contracts | contracts.view | /contrats/:id | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:344) |
| /reclamations | customer-cases/complaints | complaints.view | /reclamations/:id | [modules.ts](C:/wamp64/www/comsig-front-v1/src/v2/modules.ts:344) |
| /comptes-tresorerie | erp/cash-accounts | treasury.view | /comptes-tresorerie/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:123) |
| /mouvements-caisse | erp/cash-entries | treasury.view | /mouvements-caisse/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:146) |
| /plan-comptable | erp/ledger-accounts | accounting.view | /plan-comptable/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:175) |
| /ecritures | erp/journal-entries | accounting.view | /ecritures/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:187) |
| /effectif | erp/employees | hr.view | /effectif/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:233) |
| /presences | erp/attendance | hr.view | /presences/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:279) |
| /conges | erp/leave-requests | hr.view | /conges/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:304) |
| /paie | erp/payroll | payroll.view | /paie/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:336) |
| /vehicules | erp/vehicles | fleet.view | /vehicules/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:376) |
| /chauffeurs | erp/drivers | fleet.view | /chauffeurs/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:401) |
| /missions-vehicules | erp/vehicle-usages | fleet.view | /missions-vehicules/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:423) |
| /projets | erp/projects | production.view | /projets/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:460) |
| /nomenclatures | erp/boms | production.view | /nomenclatures/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:489) |
| /ordres-production | erp/production-orders | production.view | /ordres-production/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:506) |
| /supports | erp/supports | campaigns.view | /supports/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:553) |
| /campagnes | erp/campaigns | campaigns.view | /campagnes/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:589) |
| /reservations | erp/reservations | campaigns.view | /reservations/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:627) |
| /taxes-communales | erp/municipal-taxes | campaigns.view | /taxes-communales/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:653) |
| /redevances | erp/royalties | campaigns.view | /redevances/:id | [erpModules.ts](C:/wamp64/www/comsig-front-v1/src/v2/erpModules.ts:678) |

## Rôles CRM par défaut

La base peut les modifier : il ne s’agit pas d’une preuve des droits d’un utilisateur réel. Détail des permissions par module dans snapshot.json/sourceDefaultRoles.

| Code | Rôle | Périmètre par défaut | Preuve |
| --- | --- | --- | --- |
| superadmin | Super-administrateur | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:65) |
| admin_tech | Administrateur | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:70) |
| direction_generale | Direction générale | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:75) |
| assistante_dg | Assistante de direction générale | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:85) |
| direction_commerciale | Direction commerciale | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:90) |
| commercial | Commercial / chargé de compte | own | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:99) |
| marketing | Marketing / communication | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:107) |
| operations | Régie publicitaire et médias | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:112) |
| technicien | Technicien / équipe terrain | own | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:123) |
| production | Production / atelier | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:128) |
| finance | Finance / comptabilité | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:133) |
| juridique | Direction juridique / contrats | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:142) |
| rh | Ressources humaines | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:147) |
| responsable_service | Responsable de service | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:152) |
| agent_service | Agent de service | own | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:157) |
| compte_service | Compte de service | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:162) |
| auditeur | Auditeur / lecteur | all | [rbac.ts](C:/wamp64/www/comsig-crm/server/src/core/rbac.ts:167) |

## Tâches planifiées à porter

Source : intervalle principal 300 s et boucle rapide 30 s par défaut, variables serveur et activation à confirmer. Les règles peuvent être désactivées en base. Aucune tâche n’a été exécutée pour cet audit.

| Code source | Boucle | Preuve | Cible / écart |
| --- | --- | --- | --- |
| comptabilisation_devis | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:12) | Pas de tâche planifiée Laravel correspondante déclarée |
| pointage_absent | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:13) | Pas de tâche planifiée Laravel correspondante déclarée |
| taches_recurrentes | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:14) | Pas de tâche planifiée Laravel correspondante déclarée |
| taches_en_retard | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:15) | Pas de tâche planifiée Laravel correspondante déclarée |
| controles_assistant | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:16) | Pas de tâche planifiée Laravel correspondante déclarée |
| rapports_periodiques | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:17) | Pas de tâche planifiée Laravel correspondante déclarée |
| swot_periodique | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:18) | Pas de tâche planifiée Laravel correspondante déclarée |
| resume_courrier | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:19) | Pas de tâche planifiée Laravel correspondante déclarée |
| archive_connexions | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:20) | Pas de tâche planifiée Laravel correspondante déclarée |
| audit_gouvernance | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:21) | Pas de tâche planifiée Laravel correspondante déclarée |
| protocole_priorite | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:22) | Pas de tâche planifiée Laravel correspondante déclarée |
| stock_bas | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:23) | Pas de tâche planifiée Laravel correspondante déclarée |
| opportunite_inactive | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:25) | Pas de tâche planifiée Laravel correspondante déclarée |
| date_cible_depassee | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:41) | Pas de tâche planifiée Laravel correspondante déclarée |
| qualification_en_retard | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:49) | Pas de tâche planifiée Laravel correspondante déclarée |
| contrat_echeance | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:58) | Pas de tâche planifiée Laravel correspondante déclarée |
| intervention_retard | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:82) | Pas de tâche planifiée Laravel correspondante déclarée |
| redevance_echeance | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:97) | Pas de tâche planifiée Laravel correspondante déclarée |
| preresa_expiree | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:108) | Expiration devis partielle via comsig:expire-quotes ; pré-réservations à porter |
| bilan_campagne | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:116) | Pas de tâche planifiée Laravel correspondante déclarée |
| reclamation_retard | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:125) | Pas de tâche planifiée Laravel correspondante déclarée |
| ia_priorisation_relances | principale | [scheduler.ts](C:/wamp64/www/comsig-crm/server/src/jobs/scheduler.ts:136) | Pas de tâche planifiée Laravel correspondante déclarée |
| rappels_messages | rapide | [realtime.ts](C:/wamp64/www/comsig-crm/server/src/jobs/realtime.ts:7) | Non portée |
| rappels_todo | rapide | [realtime.ts](C:/wamp64/www/comsig-crm/server/src/jobs/realtime.ts:8) | Non portée |
| rappels_todo_4h | rapide | [realtime.ts](C:/wamp64/www/comsig-crm/server/src/jobs/realtime.ts:9) | Non portée |
| agents_securite | rapide | [realtime.ts](C:/wamp64/www/comsig-crm/server/src/jobs/realtime.ts:10) | Non portée |

À ajouter au périmètre technique source : retryPendingAi (reprise IA, lorsque runJobs sans filtre), lancement initial différé et verrous/déduplication. Ne pas remplacer par autant de cron indépendants sans conserver ces garanties.

Cible déclarée :

| Ligne | Déclaration |
| --- | --- |
| 47 | `Schedule::command('comsig:expire-quotes')->everyFiveMinutes()->withoutOverlapping();` |
| 48 | `Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('02:30')->withoutOverlapping();` |
| 49 | `Schedule::command('auth:clear-resets')->dailyAt('02:35')->withoutOverlapping();` |
