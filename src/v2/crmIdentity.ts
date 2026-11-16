import { useAuth } from './auth';
import { can } from './types';

// Department palette from the CRM source migrations; never an authorization input.
export const departmentColors: Record<string, string> = {
  direction: '#1e3a8a',
  commercial: '#2563eb',
  comptabilite: '#16a34a',
  production: '#ca8a04',
  regie: '#f97316',
  rh: '#ec4899',
  assistanat_dg: '#a855f7',
  informatique: '#06b6d4',
  imprimerie: '#8b5cf6',
  decoration: '#14b8a6',
  atelier: '#eab308',
  cnc: '#ef4444',
  juridique: '#64748b',
  administration: '#475569',
};

// View-model only: permissions and authorization still come from Laravel.
export function useCrmIdentity() {
  const auth = useAuth();
  const user = auth.user;
  const permissions: Record<string, string[]> = {};
  for (const permission of user?.role.permissions ?? []) {
    const [module, action] = permission.split('.');
    (permissions[module] ??= []).push(action);
  }
  const admin = can(user, 'admin.view');
  return {
    logout: auth.logout,
    me: user
      ? {
          id: String(user.id),
          full_name: user.name,
          role_code: user.role.code,
          role_label: user.role.label,
          department_code: user.department.code,
          department_label: user.department.label,
          department_color: departmentColors[user.department.code] ?? '#5b8ff0',
          data_scope: user.role.data_scope,
          cross_department: user.role.data_scope === 'all' && !admin,
          is_admin: admin,
          is_superadmin: user.role.code === 'superadmin',
          is_manager: user.role.data_scope !== 'own',
          account_kind: 'personne',
          must_change_password: user.must_change_password,
          mfa_enrollment_required: false,
          perms: permissions,
        }
      : null,
  };
}
export function useCrmCan() {
  const { user } = useAuth();
  const aliases: Record<string, string> = {
    calendar: 'tasks',
    supports: 'campaigns',
    royalties: 'campaigns',
    projects: 'production',
    // Maintenance, collectivités et déploiements sont des dossiers de la Régie :
    // aucune permission nouvelle n'est accordée, le serveur reste l'autorité.
    interventions: 'campaigns',
    collectivities: 'campaigns',
    deployments: 'campaigns',
  };
  return (module: string, action = 'view') => can(user, `${aliases[module] ?? module}.${action}`);
}
