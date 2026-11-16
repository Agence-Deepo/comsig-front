import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { advanceSession, api, HttpError, initializeCsrf, onUnauthenticated, request } from './api';
import type { User } from './types';

interface Auth {
  user: User | null;
  loading: boolean;
  error: unknown;
  notice: string | null;
  session: SessionInfo | null;
  refresh: () => Promise<void>;
  login: (login: string, password: string, department?: string) => Promise<User | null>;
  verifyMfa: (code: string, recovery: boolean) => Promise<User>;
  logout: () => Promise<void>;
  clear: (notice?: string) => void;
}
interface SessionInfo {
  authentication: 'session' | 'token';
  idle_timeout_minutes: number | null;
}
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const operation = useRef(0);
  const currentUser = useRef<User | null>(null);
  const refreshPending = useRef<Promise<void> | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);
  const qc = useQueryClient();
  const clear = useCallback(() => {
    operation.current += 1;
    advanceSession();
    currentUser.current = null;
    setUser(null);
    setSession(null);
    setLoading(false);
    setError(null);
    qc.clear();
  }, [qc]);
  const refresh = useCallback(() => {
    if (refreshPending.current) return refreshPending.current;
    const op = operation.current;
    const pending = (async () => {
      try {
        const response = await api.get<{ data: User; meta: SessionInfo }>('/auth/me');
        if (op !== operation.current) return;
        // Never reuse another account's data, or data fetched with older rights.
        if (JSON.stringify(currentUser.current) !== JSON.stringify(response.data)) qc.clear();
        currentUser.current = response.data;
        setUser(response.data);
        setSession(response.meta);
        setError(null);
      } catch (e) {
        if (op === operation.current) {
          if (e instanceof HttpError && [401, 419].includes(e.status)) clear();
          else setError(e);
        }
      } finally {
        if (op === operation.current) setLoading(false);
      }
    })();
    refreshPending.current = pending;
    void pending.finally(() => {
      if (refreshPending.current === pending) refreshPending.current = null;
    });
    return pending;
  }, [clear, qc]);
  useEffect(() => {
    const unsubscribe = onUnauthenticated(clear);
    void refresh();
    const focus = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', focus);
    if (typeof BroadcastChannel !== 'undefined') {
      channel.current = new BroadcastChannel('comsig-session');
      channel.current.onmessage = () => {
        clear();
        setLoading(true);
        // A previous /me may still be in flight. Ignore it, and fetch this cookie's identity.
        const wait = refreshPending.current ?? Promise.resolve();
        void wait.then(() => refresh());
      };
    }
    return () => {
      unsubscribe();
      window.removeEventListener('focus', focus);
      document.removeEventListener('visibilitychange', focus);
      channel.current?.close();
      channel.current = null;
    };
  }, [clear, refresh]);
  async function login(login: string, password: string, department?: string) {
    const op = ++operation.current;
    advanceSession();
    await initializeCsrf();
    const response = await api.post<{ data: { user: User; mfa_required?: boolean }; meta: SessionInfo }>(
      '/auth/session',
      {
        login,
        password,
        ...(department ? { department } : {}),
      },
    );
    if (op !== operation.current) throw new Error('La connexion a changé. Recommencez.');
    if (response.data.mfa_required) {
      qc.clear();
      currentUser.current = null;
      setUser(null);
      setSession(null);
      return null;
    }
    qc.clear();
    currentUser.current = response.data.user;
    setUser(response.data.user);
    setSession(response.meta);
    setLoading(false);
    setError(null);
    channel.current?.postMessage('changed');
    setNotice(null);
    return response.data.user;
  }
  async function verifyMfa(code: string, recovery: boolean) {
    const op = ++operation.current;
    advanceSession();
    const response = await api.post<{ data: { user: User }; meta: SessionInfo }>('/auth/mfa/challenge', {
      ...(recovery ? { recovery_code: code } : { code }),
    });
    if (op !== operation.current) throw new Error('La connexion a changé. Recommencez.');
    qc.clear();
    currentUser.current = response.data.user;
    setUser(response.data.user);
    setSession(response.meta);
    setLoading(false);
    setError(null);
    setNotice(null);
    channel.current?.postMessage('changed');
    return response.data.user;
  }
  async function logout() {
    try {
      // Refresh CSRF first (another tab may have rotated it). A failed logout
      // must leave the UI available to report the error and let the user retry.
      await initializeCsrf();
      await request('/auth/logout', { method: 'POST', invalidateSessionOnError: false });
    } catch (e) {
      // An already-expired session is logged out, but a network failure is not
      // presented as a successful server-side logout.
      if (!(e instanceof HttpError) || e.status !== 401) throw e;
    }
    clear();
    channel.current?.postMessage('changed');
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        notice,
        session,
        refresh,
        login,
        verifyMfa,
        logout,
        clear: (message) => {
          clear();
          setNotice(message ?? null);
          channel.current?.postMessage('changed');
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider manquant');
  return auth;
}
