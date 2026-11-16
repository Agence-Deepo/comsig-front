import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, setUnauthenticatedHandler } from './api';

export interface Me {
  id: string; email: string; username?: string; account_kind?: 'personne' | 'service'; is_admin?: boolean; is_superadmin?: boolean; is_manager?: boolean; full_name: string; role_code: string; role_label: string; team_id: string | null; department_code?: string | null; department_label?: string | null; department_color?: string | null; cross_department?: boolean; data_scope: 'own' | 'team' | 'department' | 'all';
  can_see_confidential: boolean; mfa_enabled: boolean; mfa_required: boolean; must_change_password: boolean; mfa_pending: boolean; mfa_enrollment_required: boolean;
  perms: Record<string, string[]>;
}

interface AuthCtx { me: Me | null; loading: boolean; setMe: (m: Me | null) => void; logout: () => Promise<void>; refresh: () => Promise<void> }
const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();
  const refresh = async () => {
    try {
      const r = await api.get<any>('/api/auth/me');
      const u = r.me ?? r.data;
      if (!u) setMe(null);
      else {
        const permissions: string[] = u.role?.permissions ?? [];
        const perms: Record<string, string[]> = {};
        for (const permission of permissions) {
          const [module, action] = permission.split('.');
          const actions = action === '*' ? ['view', 'create', 'update', 'delete', 'validate'] : [action];
          perms[module] = Array.from(new Set([...(perms[module] ?? []), ...actions]));
        }
        setMe({ id: String(u.id), email: u.email, username: u.username, full_name: u.name, role_code: u.role?.code ?? '', role_label: u.role?.label ?? '', team_id: null, department_code: u.department?.code, department_label: u.department?.label, data_scope: u.role?.data_scope ?? 'own', cross_department: u.role?.data_scope === 'all', can_see_confidential: u.role?.data_scope === 'all', is_admin: u.role?.code === 'superadmin', is_superadmin: u.role?.code === 'superadmin', is_manager: u.role?.data_scope !== 'own', mfa_enabled: !!u.two_factor_confirmed_at, mfa_required: false, must_change_password: !!u.must_change_password, mfa_pending: false, mfa_enrollment_required: false, perms });
      }
    } finally { setLoading(false); }
  };
  useEffect(() => {
    refresh();
    setUnauthenticatedHandler(() => { setMe(null); qc.clear(); });
  }, []);
  const logout = async () => { await api.post('/api/auth/logout'); setMe(null); qc.clear(); };
  return <Ctx.Provider value={{ me, loading, setMe, logout, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

/** Contrôle d'affichage : le serveur reste l'autorité, l'interface masque seulement l'inaccessible. */
export function useCan() {
  const { me } = useAuth();
  const aliases: Record<string, string> = { calendar: 'tasks', projects: 'production' };
  return (module: string, action = 'view') => !!me?.perms?.[aliases[module] ?? module]?.includes(action);
}

export type Lookups = Record<string, { code: string; label: string }[]>;
export function useLookups() {
  const q = useQuery({ queryKey: ['lookups'], queryFn: () => api.get<Lookups>('/api/lookups'), staleTime: 300_000 });
  const data = q.data ?? {};
  const label = (list: string, code?: string | null) => (code ? data[list]?.find((x) => x.code === code)?.label ?? code : '—');
  return { lookups: data, label, loading: q.isLoading };
}

export function useUsers() {
  const q = useQuery({ queryKey: ['users-options'], queryFn: () => api.get<{ rows: { id: string; full_name: string; role_code: string; role_label: string }[] }>('/api/users/options'), staleTime: 300_000 });
  return q.data?.rows ?? [];
}
