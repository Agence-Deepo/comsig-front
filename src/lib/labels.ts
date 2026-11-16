// Libellés et tonalités des statuts — un statut est toujours affiché avec son libellé (jamais par la couleur seule)
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'primary';
type Map = Record<string, [string, Tone]>;

export const STATUS: Record<string, Map> = {
  org_kind: { prospect: ['Prospect', 'info'], client: ['Client', 'success'], ancien_client: ['Ancien client', 'neutral'], fournisseur: ['Fournisseur', 'accent'], partenaire: ['Partenaire', 'accent'], institution: ['Institution', 'primary'] },
  qualification: { a_qualifier: ['À qualifier', 'neutral'], en_cours: ['En cours', 'info'], qualifie: ['Qualifié', 'success'], disqualifie: ['Disqualifié', 'danger'], en_veille: ['En veille', 'warning'] },
  quote: { brouillon: ['Brouillon', 'neutral'], soumis: ['En validation', 'warning'], valide: ['Validé', 'info'], envoye: ['Envoyé', 'primary'], accepte: ['Accepté', 'success'], refuse: ['Refusé', 'danger'], expire: ['Expiré', 'neutral'], annule: ['Annulé', 'neutral'] },
  contract: { brouillon: ['Brouillon', 'neutral'], en_revue: ['En revue', 'warning'], valide: ['Validé', 'info'], signe: ['Signé', 'primary'], actif: ['Actif', 'success'], a_renouveler: ['À renouveler', 'warning'], expire: ['Expiré', 'neutral'], resilie: ['Résilié', 'danger'], renouvele: ['Renouvelé', 'accent'] },
  review: { non_requise: ['Non requise', 'neutral'], a_faire: ['À faire', 'warning'], validee: ['Validée', 'success'], reserve: ['Avec réserve', 'danger'] },
  activity: { a_faire: ['À faire', 'info'], en_cours: ['En cours', 'primary'], termine: ['Terminé', 'success'], reporte: ['Reporté', 'warning'], annule: ['Annulé', 'neutral'] },
  priority: { basse: ['Basse', 'neutral'], normale: ['Normale', 'info'], haute: ['Haute', 'warning'], critique: ['Critique', 'danger'], urgente: ['Urgente', 'danger'] },
  face: { disponible: ['Disponible', 'success'], pre_reserve: ['Pré-réservé', 'info'], reserve: ['Réservé', 'primary'], occupe: ['Occupé', 'accent'], en_maintenance: ['En maintenance', 'warning'], indisponible: ['Indisponible', 'danger'], retire: ['Retiré', 'neutral'] },
  support: { disponible: ['Exploitable', 'success'], en_maintenance: ['En maintenance', 'warning'], indisponible: ['Indisponible', 'danger'], retire: ['Retiré', 'neutral'] },
  campaign: { a_accepter: ['Passation à accepter', 'warning'], preparation: ['Préparation', 'info'], production: ['Production', 'info'], pose: ['Pose', 'primary'], en_cours: ['En cours', 'success'], depose: ['Dépose', 'primary'], terminee: ['Terminée — bilan', 'warning'], cloturee: ['Clôturée', 'neutral'], annulee: ['Annulée', 'neutral'] },
  ctask: { a_faire: ['À faire', 'info'], en_cours: ['En cours', 'primary'], termine: ['Terminé', 'success'], bloque: ['Bloqué', 'danger'], annule: ['Annulé', 'neutral'] },
  intervention: { ouvert: ['Ouvert', 'warning'], planifie: ['Planifié', 'info'], en_cours: ['En cours', 'primary'], resolu: ['Résolu', 'success'], clos: ['Clos', 'neutral'], annule: ['Annulé', 'neutral'] },
  criticality: { mineure: ['Mineure', 'neutral'], majeure: ['Majeure', 'warning'], critique: ['Critique', 'danger'] },
  royalty: { a_calculer: ['À calculer', 'neutral'], a_valider: ['À valider', 'warning'], a_payer: ['À payer', 'info'], partiellement_paye: ['Partiellement payé', 'primary'], paye: ['Payé', 'success'], conteste: ['Contesté', 'accent'], en_retard: ['En retard', 'danger'] },
  invoice: { emise: ['Émise', 'info'], partiellement_payee: ['Partiellement payée', 'primary'], payee: ['Payée', 'success'], annulee: ['Annulée', 'neutral'] },
  payment: { a_rapprocher: ['À rapprocher', 'warning'], rapproche: ['Rapproché', 'success'], rejete: ['Rejeté', 'danger'] },
  complaint: { ouverte: ['Ouverte', 'warning'], en_cours: ['En cours', 'info'], resolue: ['Résolue', 'success'], close: ['Close', 'neutral'] },
  approval: { en_attente: ['En attente', 'warning'], approuve: ['Approuvé', 'success'], rejete: ['Rejeté', 'danger'], annule: ['Annulé', 'neutral'] },
  ai_action: { proposee: ['À valider', 'warning'], acceptee: ['Acceptée', 'info'], rejetee: ['Rejetée', 'neutral'], executee: ['Exécutée', 'success'], echouee: ['Échec', 'danger'], annulee: ['Annulée', 'neutral'] },
  brief: { a_completer: ['À compléter', 'neutral'], incomplet: ['Incomplet', 'warning'], valide: ['Validé', 'success'] },
  feasibility: { non_evaluee: ['Non évaluée', 'neutral'], en_cours: ['En cours', 'info'], confirmee: ['Confirmée', 'success'], avec_reserve: ['Avec réserve', 'warning'], impossible: ['Impossible', 'danger'] },
  tender: { veille: ['Veille', 'neutral'], en_preparation: ['En préparation', 'info'], soumis: ['Soumis', 'primary'], gagne: ['Gagné', 'success'], perdu: ['Perdu', 'danger'], non_soumis: ['Non soumis', 'neutral'] },
  production_order: { planifie: ['Planifié', 'info'], en_cours: ['En cours', 'primary'], termine: ['Terminé', 'success'], annule: ['Annulé', 'neutral'] },
  stock_kind: { matiere_premiere: ['Matière première', 'neutral'], semi_fini: ['Semi-fini', 'info'], produit_fini: ['Produit fini', 'primary'] },
  doc_type: { devis: ['Devis', 'neutral'], proforma: ['Facture proforma', 'accent'] },
  kb: { brouillon: ['Brouillon', 'neutral'], actif: ['Actif', 'success'], archive: ['Archivé', 'neutral'] },
  task: { a_faire: ['À faire', 'info'], en_cours: ['En cours', 'primary'], en_attente: ['En attente', 'warning'], termine: ['Terminé', 'success'], annule: ['Annulé', 'neutral'] },
  workorder: { demande: ['Demandé', 'warning'], planifie: ['Planifié', 'info'], en_cours: ['En cours', 'primary'], en_controle: ['Contrôle qualité', 'accent'], termine: ['Terminé', 'success'], livre: ['Livré', 'success'], bloque: ['Bloqué', 'danger'], annule: ['Annulé', 'neutral'] },
  project: { cadrage: ['Cadrage', 'neutral'], planifie: ['Planifié', 'info'], en_cours: ['En cours', 'primary'], en_pause: ['En pause', 'warning'], termine: ['Terminé', 'success'], annule: ['Annulé', 'neutral'] },
  deployment: { planifie: ['Planifié', 'info'], autorisation: ['Autorisation en cours', 'warning'], pret: ['Prêt', 'accent'], en_cours: ['En cours', 'primary'], realise: ['Réalisé', 'success'], annule: ['Annulé', 'neutral'] },
  risk: { identifie: ['Identifié', 'warning'], en_traitement: ['En traitement', 'info'], maitrise: ['Maîtrisé', 'success'], clos: ['Clos', 'neutral'] },
  relationship: { excellente: ['Excellente', 'success'], bonne: ['Bonne', 'info'], a_ameliorer: ['À améliorer', 'warning'], tendue: ['Tendue', 'danger'] },
  stage: { neutral: ['', 'neutral'], info: ['', 'info'], accent: ['', 'primary'], warning: ['', 'warning'], success: ['', 'success'], danger: ['', 'danger'] },
};

export function statusOf(kind: string, code: string | null | undefined): [string, Tone] {
  if (!code) return ['—', 'neutral'];
  return STATUS[kind]?.[code] ?? [code.replace(/_/g, ' '), 'neutral'];
}

export const ACTIVITY_KIND: Record<string, string> = {
  tache: 'Tâche', appel: 'Appel', email: 'E-mail', reunion: 'Réunion', visite: 'Visite', note: 'Note', relance: 'Relance', demande_interne: 'Demande interne',
};
export const DECISION_ROLE: Record<string, string> = { decideur: 'Décideur', influenceur: 'Influenceur', prescripteur: 'Prescripteur', utilisateur: 'Utilisateur', acheteur: 'Acheteur', autre: 'Autre' };
export const CONTRACT_KIND: Record<string, string> = { contrat: 'Contrat', bon_commande: 'Bon de commande', marche_public: 'Marché public', convention: 'Convention' };
export const COST_CATEGORY: Record<string, string> = { impression: 'Impression', production: 'Production', pose: 'Pose', transport: 'Transport', maintenance: 'Maintenance', sous_traitance: 'Sous-traitance', redevance: 'Redevance', autre: 'Autre' };
export const CTASK_KIND: Record<string, string> = { lancement: 'Lancement', creation: 'Création', impression: 'Impression', production: 'Production', pose: 'Pose', controle: 'Contrôle', depose: 'Dépose', bilan: 'Bilan', autre: 'Autre' };
export const DOC_KIND: Record<string, string> = { cv: 'CV', diplome: 'Diplôme', piece_identite: 'Pièce d’identité', contrat: 'Contrat signé', bon_commande: 'Bon de commande', devis_accepte: 'Devis accepté', photo: 'Photo', attestation: 'Attestation / quittance', pv: 'Procès-verbal', autre: 'Autre' };
export const KB_CATEGORY: Record<string, string> = { offre_tarif: 'Offres et tarifs', modele: 'Modèles', procedure: 'Procédures', fiche_technique: 'Fiches techniques', regle_validation: 'Règles de validation', argumentaire: 'Argumentaires', faq: 'FAQ', documentation_ops: 'Documentation opérationnelle' };
export const AUDIT_ACTION: Record<string, string> = {
  login: 'Connexion', login_failed: 'Échec de connexion', create: 'Création', update: 'Modification', delete: 'Suppression', restore: 'Restauration', export: 'Export',
  validate: 'Validation', config: 'Paramétrage', admin: 'Administration', stage: 'Étape', won: 'Gagné', lost: 'Perdu', merge: 'Fusion', submit: 'Soumission', send: 'Envoi',
  accept: 'Acceptation', refuse: 'Refus', cancel: 'Annulation', workflow: 'Circuit', request: 'Demande', import: 'Import', security: 'Sécurité', ai_action: 'Action IA', ai_request: 'Requête IA',
};
export const STOCK_KIND: Record<string, string> = { matiere_premiere: 'Matière première', semi_fini: 'Semi-fini', produit_fini: 'Produit fini' };
export const MOVE_KIND: Record<string, string> = {
  entree_achat: 'Réception (achat)', sortie_consommation: 'Sortie (consommation)', entree_production: 'Entrée de production', sortie_production: 'Consommation de production', ajustement: 'Ajustement d’inventaire', retour: 'Retour',
};
export const DEPT_LEVEL: Record<string, string> = { lecture: 'Lecture', contribution: 'Contribution', gestion: 'Gestion' };

export const EVENT_CATEGORY: Record<string, string> = { reunion: 'Réunion', rendez_vous: 'Rendez-vous', deplacement: 'Déplacement', travail: 'Travail', formation: 'Formation', personnel: 'Personnel', echeance: 'Échéance', autre: 'Autre' };
export const RISK_CATEGORY: Record<string, string> = { strategique: 'Stratégique', operationnel: 'Opérationnel', financier: 'Financier', juridique: 'Juridique', humain: 'Humain', technique: 'Technique', reputation: 'Réputation', securite: 'Sécurité' };
export const DEPLOYMENT_KIND: Record<string, string> = { installation: 'Installation', remplacement: 'Remplacement', renovation: 'Rénovation', depose: 'Dépose', deplacement: 'Déplacement' };
export const INTERACTION_KIND: Record<string, string> = { reunion: 'Réunion', courrier: 'Courrier', appel: 'Appel', autorisation: 'Autorisation', paiement: 'Paiement', visite: 'Visite', autre: 'Autre' };
export const COLLECTIVITY_KIND: Record<string, string> = { commune: 'Commune', district: 'District', region: 'Région', ministere: 'Ministère', agence: 'Agence publique', autre: 'Autre' };
/** Quadrants de la matrice d'Eisenhower. */
export const QUADRANT: Record<string, { label: string; hint: string; tone: Tone }> = {
  faire: { label: 'Urgent et important', hint: 'À faire tout de suite', tone: 'danger' },
  planifier: { label: 'Important, non urgent', hint: 'À planifier (zone de performance)', tone: 'primary' },
  deleguer: { label: 'Urgent, non important', hint: 'À déléguer ou traiter vite', tone: 'warning' },
  eliminer: { label: 'Ni urgent ni important', hint: 'À abandonner ou reporter', tone: 'neutral' },
};
