import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  connectSocket,
  disconnectSocket,
  onAvatarUpdated,
  applyAvatarSyncToUser,
  type AvatarSyncPayload,
} from '../services/socket';
import { normalizeUser } from '../utils/auth';

export const AVATAR_SYNC_EVENT = 'meetmind:avatar-updated';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    connectSocket();

    const unsubscribe = onAvatarUpdated((payload: AvatarSyncPayload) => {
      window.dispatchEvent(new CustomEvent(AVATAR_SYNC_EVENT, { detail: payload }));

      const current = useStore.getState().user;
      const next = applyAvatarSyncToUser(current, payload);
      if (next) {
        setUser(normalizeUser(next as unknown as Record<string, unknown>));
      }
    });

    return () => {
      unsubscribe();
      disconnectSocket();
    };
  }, [user, setUser]);

  return <>{children}</>;
};
