import type { Row } from './types';
import { erpModules } from './erpModules';
import { customerFields } from './customerFields';
export interface Field {
  key: string;
  label: string;
  type?:
    | 'text'
    | 'email'
    | 'number'
    | 'date'
    | 'month'
    | 'time'
    | 'datetime-local'
    | 'textarea'
    | 'select'
    | 'password'
    | 'checkbox'
    | 'rows'
    | 'tags';
  wide?: boolean;
  fields?: Field[];
  minRows?: number;
  required?: boolean;
  options?: string[] | { value: string; label: string }[];
  lookup?: string;
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: string;
  maxLength?: number;
  hint?: string;
  nullable?: boolean;
  createOnly?: boolean;
}
export interface Module {
  editableStatuses?: string[];
  warning?: string;
  pdfResource?: string;
  actions?: {
    key: string;
    label: string;
    permission: string;
    statuses: string[];
    fields?: Field[];
    differentMaker?: boolean;
  }[];
  key: string;
  path: string;
  title: string;
  singular: string;
  description: string;
  permission: string;
  fields: Field[];
  columns: { key: string; label: string; format?: 'money' | 'date' | 'status' | 'boolean' | 'quantity' }[];
  createPermission?: string;
  updatePermission?: string;
  deletePermission?: string;
  detail?: boolean;
  filters?: string[];
  filterKey?: string;
}
const text = (key: string, label: string, required = false): Field => ({
  key,
  label,
  required,
  maxLength: 200,
});
const amount = (key: string, label: string, required = false): Field => ({
  key,
  label,
  type: 'number',
  min: 0,
  step: '1',
  required,
  default: 0,
});
const choice = (key: string, label: string, options: string[], defaultValue?: string): Field => ({
  key,
  label,
  type: 'select',
  options,
  default: defaultValue,
});
const org: Field = {
  key: 'organization_id',
  label: 'Client / prospect',
  type: 'select',
  lookup: 'organizations',
  required: true,
};
export const workStatuses = ['a_faire', 'en_cours', 'termine', 'annule'];
export const activityKinds = [
  'tache',
  'appel',
  'rendez_vous',
  'reunion',
  'visite',
  'note',
  'email',
  'relance',
];
const workFields: Field[] = [
  text('title', 'Intitulé', true),
  { key: 'description', label: 'Description', type: 'textarea', nullable: true },
  choice('status', 'Statut', workStatuses, 'a_faire'),
  { key: 'due_at', label: 'Échéance', type: 'datetime-local', nullable: true },
  {
    key: 'priority_level',
    label: 'Priorité (1 = la plus haute)',
    type: 'number',
    min: 1,
    max: 5,
    step: '1',
    default: 3,
  },
  { ...org, required: false, nullable: true },
  {
    key: 'opportunity_id',
    label: 'Opportunité liée',
    type: 'select',
    lookup: 'opportunities',
    nullable: true,
  },
];
export const modules: Module[] = [
  {
    key: 'organizations',
    path: 'clients',
    title: 'Clients & prospects',
    singular: 'un tiers',
    permission: 'organizations',
    description: 'Le portefeuille commercial, ses contacts et ses prochaines opportunités.',
    detail: true,
    createPermission: 'organizations.create',
    updatePermission: 'organizations.update',
    deletePermission: 'organizations.delete',
    filterKey: 'kind',
    filters: ['prospect', 'client', 'fournisseur', 'partenaire'],
    fields: customerFields,
    columns: [
      { key: 'legal_name', label: 'Entreprise' },
      { key: 'ref', label: 'Référence' },
      { key: 'kind', label: 'Catégorie', format: 'status' },
      { key: 'email', label: 'E-mail' },
      { key: 'phone', label: 'Téléphone' },
    ],
  },
  {
    key: 'opportunities',
    path: 'opportunites',
    title: 'Opportunités',
    singular: 'une opportunité',
    permission: 'opportunities',
    description: 'Faites progresser chaque affaire, du premier contact à la signature.',
    detail: true,
    createPermission: 'opportunities.create',
    updatePermission: 'opportunities.update',
    filterKey: 'stage',
    filters: ['nouveau', 'qualifie', 'proposition', 'negociation', 'gagne', 'perdu'],
    fields: [
      text('title', 'Intitulé', true),
      { ...org, createOnly: true },
      amount('amount', 'Montant estimé (FCFA)'),
      { key: 'expected_close_date', label: 'Date de conclusion prévue', type: 'date', required: true },
      text('offer_type', 'Type de prestation'),
      { key: 'need', label: 'Besoin identifié', type: 'textarea', nullable: true },
      { ...text('next_step', 'Prochaine action'), nullable: true },
    ],
    columns: [
      { key: 'title', label: 'Affaire' },
      { key: 'organization.legal_name', label: 'Entreprise' },
      { key: 'stage_code', label: 'Étape', format: 'status' },
      { key: 'amount', label: 'Valeur', format: 'money' },
      { key: 'expected_close_date', label: 'Conclusion', format: 'date' },
    ],
  },
  {
    key: 'quotes',
    path: 'devis',
    title: 'Devis & proformas',
    singular: 'un devis',
    permission: 'quotes',
    description: 'Chiffrage, validation et suivi des propositions commerciales.',
    detail: true,
    createPermission: 'quotes.create',
    updatePermission: 'quotes.update',
    fields: [],
    filters: ['brouillon', 'soumis', 'valide', 'envoye', 'accepte', 'refuse', 'annule', 'expire'],
    filterKey: 'status',
    columns: [
      { key: 'number', label: 'Référence' },
      { key: 'title', label: 'Objet' },
      { key: 'organization.legal_name', label: 'Client' },
      { key: 'total_ttc', label: 'Total TTC', format: 'money' },
      { key: 'status', label: 'Statut', format: 'status' },
      { key: 'valid_until', label: 'Validité', format: 'date' },
    ],
  },
  {
    key: 'catalog',
    path: 'catalogue',
    title: 'Catalogue & tarifs',
    singular: 'une prestation',
    permission: 'catalog',
    description: 'Vos prestations de référence et leurs prix de vente.',
    createPermission: 'catalog.update',
    updatePermission: 'catalog.update',
    fields: [
      text('code', 'Code', true),
      text('label', 'Désignation', true),
      { ...text('unit', 'Unité', true), default: 'unité' },
      amount('unit_price', 'Prix de vente HT (FCFA)', true),
      amount('unit_cost', 'Coût unitaire (FCFA)'),
      { key: 'tax_rate', label: 'TVA (%)', type: 'number', min: 0, max: 100, step: '0.01', default: 18 },
    ],
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'label', label: 'Prestation' },
      { key: 'unit', label: 'Unité' },
      { key: 'unit_price', label: 'Prix HT', format: 'money' },
      { key: 'tax_rate', label: 'TVA (%)' },
    ],
  },
  ...(['activities', 'tasks'] as const).map((key) => ({
    key,
    path: key === 'tasks' ? 'taches' : 'activites',
    title: key === 'tasks' ? 'Tâches' : 'Activités & relances',
    singular: key === 'tasks' ? 'une tâche' : 'une activité',
    permission: key,
    description: 'Organisez les actions à mener et suivez leur avancement.',
    detail: true,
    createPermission: `${key}.create`,
    updatePermission: `${key}.update`,
    deletePermission: `${key}.delete`,
    filterKey: 'status',
    filters: key === 'activities' ? [...workStatuses, 'reporte'] : [...workStatuses, 'en_attente'],
    fields:
      key === 'activities'
        ? [
            ...workFields.map((f) =>
              f.key === 'status' ? { ...f, options: [...workStatuses, 'reporte'] } : f,
            ),
            choice('kind', 'Type d’activité', activityKinds, 'appel'),
            {
              key: 'contact_id',
              label: 'Contact lié',
              type: 'select' as const,
              lookup: 'contacts',
              nullable: true,
            },
            {
              ...choice('contact_result', 'Résultat du contact', ['joint', 'injoignable', 'refus']),
              nullable: true,
              hint: 'Pour une interaction terminée. Un refus enregistre l’opposition du contact et annule vos relances générées accessibles.',
            },
            {
              key: 'duration_min',
              label: 'Durée (minutes)',
              type: 'number' as const,
              min: 0,
              max: 1440,
              step: '1',
              nullable: true,
            },
            {
              key: 'outcome',
              label: 'Compte rendu',
              type: 'textarea' as const,
              nullable: true,
              maxLength: 10000,
              hint: 'Décisions, besoins, objections et prochaines actions. Obligatoire pour terminer une activité de priorité 1.',
            },
          ]
        : [
            ...workFields.map((f) =>
              f.key === 'status' ? { ...f, options: [...workStatuses, 'en_attente'] } : f,
            ),
            { key: 'urgent', label: 'Urgent', type: 'checkbox' as const, default: false },
            { key: 'important', label: 'Important', type: 'checkbox' as const, default: true },
            { key: 'starts_at', label: 'Début (planification)', type: 'date' as const, nullable: true },
            {
              key: 'project_id',
              label: 'Projet lié',
              type: 'select' as const,
              lookup: 'company-projects',
              nullable: true,
            },
          ],
    columns: [
      { key: 'title', label: 'Intitulé' },
      { key: 'status', label: 'Statut', format: 'status' as const },
      { key: 'priority_level', label: 'Priorité' },
      { key: 'due_at', label: 'Échéance', format: 'date' as const },
    ],
  })),
  {
    key: 'stock-items',
    path: 'stocks',
    title: 'Stocks & matières',
    singular: 'un article',
    permission: 'stocks',
    description: 'Disponibilités, seuils d’alerte et journal des mouvements.',
    detail: true,
    createPermission: 'stocks.update',
    updatePermission: 'stocks.update',
    fields: [
      choice('kind', 'Type d’article', ['matiere', 'produit_fini'], 'matiere'),
      text('code', 'Code', true),
      text('label', 'Désignation', true),
      { ...text('unit', 'Unité', true), default: 'unité' },
      {
        key: 'minimum_quantity',
        label: 'Seuil d’alerte',
        type: 'number',
        min: 0,
        step: '0.0001',
        default: 0,
      },
    ],
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'label', label: 'Article' },
      { key: 'quantity_on_hand', label: 'Disponible', format: 'quantity' },
      { key: 'minimum_quantity', label: 'Seuil', format: 'quantity' },
      { key: 'average_cost', label: 'CUMP', format: 'money' },
    ],
  },
  {
    key: 'invoices',
    path: 'factures',
    title: 'Factures & règlements',
    singular: 'une facture interne',
    permission: 'finance',
    description: 'Créances, demandes de règlement et double validation. Connecteur FNE à configurer.',
    detail: true,
    createPermission: 'finance.create',
    fields: [
      {
        key: 'quote_id',
        label: 'Identifiant du devis accepté',
        required: true,
        hint: 'Copiez l’UUID depuis la fiche du devis accepté.',
      },
      { key: 'due_date', label: 'Échéance de paiement', required: true, type: 'date' },
    ],
    filterKey: 'status',
    filters: ['emise', 'partiellement_payee', 'payee'],
    columns: [
      { key: 'number', label: 'Référence' },
      { key: 'total_ttc', label: 'Total TTC', format: 'money' },
      { key: 'paid_amount', label: 'Réglé', format: 'money' },
      { key: 'status', label: 'Statut', format: 'status' },
      { key: 'due_date', label: 'Échéance', format: 'date' },
    ],
  },
  ...erpModules,
  ...(['contracts', 'complaints'] as const).map((resource): Module => ({
    key: 'customer-cases/' + resource,
    path: resource === 'contracts' ? 'contrats' : 'reclamations',
    title: resource === 'contracts' ? 'Contrats clients' : 'Réclamations clients',
    singular: resource === 'contracts' ? 'un contrat' : 'une réclamation',
    permission: resource,
    detail: true,
    createPermission: resource + '.create',
    updatePermission: resource + '.update',
    description:
      resource === 'contracts'
        ? 'Registre des pièces contractuelles et échéances. Déclaration d’une signature externe, pas de signature électronique.'
        : 'Suivi des incidents clients, échéances et résolutions.',
    filterKey: 'status',
    filters:
      resource === 'contracts'
        ? ['brouillon', 'en_revision', 'signe', 'actif', 'termine', 'annule']
        : ['ouverte', 'en_cours', 'resolue', 'close'],
    fields: [
      org,
      text('title', 'Intitulé', true),
      { key: 'description', label: 'Description', type: 'textarea', nullable: true, maxLength: 5000 },
      ...(resource === 'contracts'
        ? [
            amount('value_ht', 'Valeur HT', true),
            { key: 'start_date', label: 'Début', type: 'date' as const, required: true },
            { key: 'end_date', label: 'Fin', type: 'date' as const, required: true },
            { key: 'confidential', label: 'Confidentiel', type: 'checkbox' as const },
            choice(
              'status',
              'Statut',
              ['brouillon', 'en_revision', 'signe', 'actif', 'termine', 'annule'],
              'brouillon',
            ),
          ]
        : [
            { key: 'due_date', label: 'Échéance', type: 'date' as const, required: true },
            choice('severity', 'Gravité', ['faible', 'normale', 'haute', 'critique'], 'normale'),
            choice('status', 'Statut', ['ouverte', 'en_cours', 'resolue', 'close'], 'ouverte'),
            {
              key: 'resolution',
              label: 'Résolution',
              type: 'textarea' as const,
              nullable: true,
              maxLength: 5000,
            },
          ]),
    ],
    columns: [
      { key: 'ref', label: 'Référence' },
      { key: 'title', label: 'Dossier' },
      { key: 'status', label: 'Statut', format: 'status' },
      { key: resource === 'contracts' ? 'end_date' : 'due_date', label: 'Échéance', format: 'date' },
    ],
  })),
  {
    key: 'admin/users',
    path: 'utilisateurs',
    title: 'Utilisateurs',
    singular: 'un utilisateur',
    permission: 'admin',
    description: 'Comptes nominatifs, profils et rattachements aux services.',
    createPermission: 'admin.update',
    updatePermission: 'admin.update',
    fields: [
      text('name', 'Nom complet', true),
      { ...text('username', 'Identifiant', true), maxLength: 80 },
      { key: 'email', label: 'E-mail', required: true, type: 'email' },
      {
        key: 'password',
        label: 'Mot de passe initial / nouveau',
        type: 'password',
        hint: '12 caractères minimum, majuscule, minuscule, chiffre et symbole. Laisser vide en modification pour conserver le mot de passe.',
      },
      { key: 'role_id', label: 'Profil', lookup: 'admin/roles', type: 'select', required: true },
      { key: 'department_id', label: 'Service', lookup: 'departments', type: 'select', required: true },
      { key: 'is_active', label: 'Compte actif', type: 'checkbox', default: true },
    ],
    columns: [
      { key: 'name', label: 'Nom' },
      { key: 'username', label: 'Identifiant' },
      { key: 'role.label', label: 'Profil' },
      { key: 'department.label', label: 'Service' },
      { key: 'is_active', label: 'Actif', format: 'boolean' },
    ],
  },
];
export function read(row: Row, key: string): any {
  return key.split('.').reduce((value, part) => value?.[part], row);
}
export const byPath = (path: string) => modules.find((module) => module.path === path);
