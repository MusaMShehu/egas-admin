// src/hooks/useApi.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnackbar } from './useSnackbar';

/**
 * useApi — a stable hook for backend calls that use
 * the `{ success, message, data }` envelope.
 *
 * Usage:
 *   const { data, loading, error, execute, refetch } = useApi(
 *     () => adminUsersAPI.list({ page: 1 }),
 *     { immediate: true, errorToast: true }
 *   );
 *
 * execute() lets you re-run with new args:
 *   const { execute } = useApi((page) => adminUsersAPI.list({ page }));
 *   execute(2);
 */
export const useApi = (fetcher, options = {}) => {
  const {
    immediate = false,
    errorToast = true,
    initialData = null,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const { error: showError } = useSnackbar();

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher(...args);
      // Backend envelope: { success, message, data }
      const body = res?.data ?? res;
      if (!mountedRef.current || reqId !== requestIdRef.current) return null;

      if (body?.success === false) {
        const msg = body?.message || 'Request failed';
        setError(msg);
        if (errorToast) showError(msg);
        onError?.(msg);
        return null;
      }

      setData(body?.data ?? body);
      onSuccess?.(body);
      return body;
    } catch (err) {
      if (!mountedRef.current || reqId !== requestIdRef.current) return null;
      const msg = err?.message || 'Network error';
      setError(msg);
      if (errorToast) showError(msg);
      onError?.(msg);
      return null;
    } finally {
      if (mountedRef.current && reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, errorToast, onSuccess, onError, showError]);

  useEffect(() => {
    if (immediate) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return { data, loading, error, execute, refetch: execute };
};

export default useApi;