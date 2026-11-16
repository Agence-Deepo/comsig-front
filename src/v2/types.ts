export type Row = Record<string, any>;
export interface Role {
  id: number;
  code: string;
  label: string;
  data_scope: string;
  permissions: string[];
}
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  must_change_password: boolean;
  role: Role;
  department: { id: number; code: string; label: string };
}
export interface Page<T = Row> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
export interface ApiModule {
  code: string;
  label: string;
  status: 'implemented' | 'planned';
  accessible: boolean;
}
export function can(user: User | null, permission: string): boolean {
  const permissions = user?.role?.permissions ?? [];
  return permissions.includes(permission) || permissions.includes(`${permission.split('.')[0]}.*`);
}
export const money = (value: unknown) =>
  `${new Intl.NumberFormat('fr-CI', { maximumFractionDigits: 0 }).format(Number(value ?? 0))} FCFA`;
// Les champs datetime de l'API actuelle sont sérialisés au format SQL, en UTC.
export const parseDateTime = (value: unknown) => {
  const input = String(value ?? '');
  return new Date(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(input) ? `${input.replace(' ', 'T')}Z` : input,
  );
};
export const toApiDateTime = (value: string) => new Date(value).toISOString().slice(0, 19).replace('T', ' ');
export const date = (value: unknown) =>
  value && !Number.isNaN(parseDateTime(value).getTime())
    ? new Intl.DateTimeFormat('fr-CI', {
        dateStyle: 'medium',
        ...(/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? { timeZone: 'UTC' } : {}),
      }).format(parseDateTime(value))
    : '—';
export const today = () => {
  const current = new Date();
  return `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
};
export const dateTime = (value: unknown) =>
  value && !Number.isNaN(parseDateTime(value).getTime())
    ? new Intl.DateTimeFormat('fr-CI', { dateStyle: 'medium', timeStyle: 'short' }).format(
        parseDateTime(value),
      )
    : '—';
export const label = (value: unknown): string => {
  const labels: Record<string, string> = {
    a_faire: 'À faire',
    en_cours: 'En cours',
    termine: 'Terminé',
    reporte: 'Reporté',
    joint: 'Interlocuteur joint',
    injoignable: 'Injoignable',
    refus: 'Refus de contact',
    reunion: 'Réunion',
    visite: 'Visite',
    rendez_vous: 'Rendez-vous',
    ouverte: 'Ouverte',
    resolue: 'Résolue',
    close: 'Close',
    signe: 'Signé (déclaré)',
    en_revision: 'En révision',
    appel: 'Appel',
    email: 'E-mail',
    relance: 'Relance',
    note: 'Note',
    tache: 'Tâche',
    annule: 'Annulé',
    brouillon: 'Brouillon',
    soumis: 'À valider',
    valide: 'Validé',
    approuve: 'Approuvé',
    seuil_direction_generale: 'Seuil de validation de la direction générale',
    marge_insuffisante: 'Marge inférieure au seuil autorisé',
    remise_hors_delegation: 'Remise supérieure à la délégation',
    envoye: 'Envoyé',
    accepte: 'Accepté',
    refuse: 'Refusé',
    expire: 'Expiré',
    emise: 'Émise',
    partiellement_payee: 'Partiellement payée',
    payee: 'Payée',
    nouveau: 'Nouveau',
    qualifie: 'Qualifié',
    proposition: 'Proposition',
    negociation: 'Négociation',
    gagne: 'Gagné',
    perdu: 'Perdu',
    suspendu: 'Suspendue',
    incomplet: 'Incomplet',
    non_evaluee: 'Non évaluée',
    confirmee: 'Confirmée',
    avec_reserve: 'Avec réserve',
    impossible: 'Impossible',
    prospect: 'Prospect',
    ancien_client: 'Ancien client',
    institution: 'Institution',
    partenaire: 'Partenaire',
    a_qualifier: 'À qualifier',
    disqualifie: 'Disqualifié',
    en_veille: 'En veille',
    faible: 'Faible',
    moyen: 'Moyen',
    fort: 'Fort',
    strategique: 'Stratégique',
    tpe: 'TPE',
    pme: 'PME',
    eti: 'ETI',
    grande: 'Grande entreprise',
    decideur: 'Décideur',
    influenceur: 'Influenceur',
    prescripteur: 'Prescripteur',
    utilisateur: 'Utilisateur',
    acheteur: 'Acheteur',
    autre: 'Autre',
    client: 'Client',
    fournisseur: 'Fournisseur',
    own: 'Portefeuille personnel',
    department: 'Service',
    all: 'Entreprise',
    actif: 'Actif',
    en_attente: 'En attente',
    comptabilise: 'Comptabilisé',
    enregistre: 'Enregistré',
    demande: 'Demande déposée',
    valide_rh: 'Validé RH',
    valide_dg: 'Approuvé direction',
    paye: 'Payé',
    reserve: 'Réservé',
    planifie: 'Planifié',
    nouvelle: 'Nouvelle',
    permission_de_produire: 'Production autorisée',
    finis: 'Fabrication terminée',
    pret_pour_livrer: 'Prêt à livrer',
    livre: 'Livré',
    a_payer: 'À payer',
    identifie: 'Identifié',
    en_traitement: 'En traitement',
    maitrise: 'Maîtrisé',
    clos: 'Clos',
    operationnel: 'Opérationnel',
    technique: 'Technique',
    reputation: 'Réputation',
    financier: 'Financier',
    commercial: 'Commercial',
    humain: 'Humain',
    juridique: 'Juridique',
    securite: 'Sécurité',
    qualite: 'Qualité',
    echeance_depassee: 'Échéance dépassée',
    en_retard: 'En retard',
    signalee: 'Signalée',
    cloturee: 'Clôturée',
    annulee: 'Annulée',
    basse: 'Basse',
    normale: 'Normale',
    haute: 'Haute',
    critique: 'Critique',
    prepare: 'À préparer',
    approuvee: 'Approuvée',
    refusee: 'Refusée',
    decaissee: 'Décaissée',
    prevue: 'Prévue',
    terminee: 'Terminée',
    panne: 'Panne',
    entretien: 'Entretien',
    remplacement: 'Remplacement',
    controle: 'Contrôle',
    commune: 'Commune',
    district: 'District',
    ministere: 'Ministère',
    non_integree: 'Non transmise',
    certifie_test: 'Certifiée en test',
    certifie: 'Certifiée',
    a_verifier: 'À rapprocher',
    refuse_api: 'Rejet API',
    matiere: 'Matière',
    produit_fini: 'Produit fini',
    entree: 'Entrée',
    sortie: 'Sortie',
  };
  return labels[String(value)] ?? String(value ?? '—').replaceAll('_', ' ');
};
