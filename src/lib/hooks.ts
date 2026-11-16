import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useState } from 'react';
import { api, ApiError } from './api';
import { useToast } from './toast';

export function useApi<T = any>(key: QueryKey, url: string | null, opts: { enabled?: boolean; refetchInterval?: number } = {}) {
  return useQuery<T, ApiError>({ queryKey: key, queryFn: () => api.get<T>(url!), enabled: url !== null && (opts.enabled ?? true), refetchInterval: opts.refetchInterval });
}

/**
 * Mutation avec retour visible : message de réussite, message d'erreur explicite, erreurs de champs
 * conservées pour l'affichage près des champs, invalidation des données concernées.
 */
export function useAction<TVars = any, TRes = any>(fn: (v: TVars) => Promise<TRes>, opts: { success?: string | ((r: TRes) => string); invalidate?: QueryKey[]; onSuccess?: (r: TRes) => void; onError?: (e: ApiError) => void; silent?: boolean } = {}) {
  const qc = useQueryClient();
  const toast = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<ApiError | null>(null);
  const m = useMutation<TRes, ApiError, TVars>({
    mutationFn: fn,
    onMutate: () => { setFieldErrors({}); setError(null); },
    onSuccess: (r) => {
      for (const k of opts.invalidate ?? []) qc.invalidateQueries({ queryKey: k });
      if (opts.success) toast('success', typeof opts.success === 'function' ? opts.success(r) : opts.success);
      opts.onSuccess?.(r);
    },
    onError: (e) => {
      setFieldErrors(e.fields ?? {});
      setError(e);
      if (!opts.silent && e.code === 'demo') toast('info', 'Démonstration', e.message);
      else if (!opts.silent && !e.fields) toast('error', e.status === 403 ? 'Action non autorisée' : e.status === 409 ? 'Conflit détecté' : 'Action impossible', e.message);
      else if (!opts.silent && e.fields) toast('error', 'Formulaire incomplet', e.message);
      opts.onError?.(e);
    },
  });
  return { ...m, run: m.mutate, runAsync: m.mutateAsync, fieldErrors, error, reset: () => { setFieldErrors({}); setError(null); m.reset(); } };
}

export { api };
