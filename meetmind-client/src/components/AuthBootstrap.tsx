import React, { useEffect } from 'react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { normalizeUser } from '../utils/auth';

/**
 * Syncs session + role from the server on app load (refresh token → latest DB role in JWT).
 */
export const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setAuthReady } = useStore();

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const res = await api.post('/auth/refresh-token');
        if (!cancelled && res.data?.user) {
          setUser(normalizeUser(res.data.user));
        }
      } catch (refreshErr: unknown) {
        const refreshStatus = (refreshErr as { response?: { status?: number } })?.response?.status;
        try {
          const profileRes = await api.get('/auth/profile');
          if (!cancelled && profileRes.data) {
            setUser(normalizeUser(profileRes.data));
          }
        } catch (profileErr: unknown) {
          const profileStatus = (profileErr as { response?: { status?: number } })?.response?.status;
          if (!cancelled && (refreshStatus === 401 || profileStatus === 401)) {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [setUser, setAuthReady]);

  return <>{children}</>;
};
