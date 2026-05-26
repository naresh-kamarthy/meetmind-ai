import type { User } from '../types';

/** Normalize API user objects so role and id are always reliable. */
export const normalizeUser = (raw: Record<string, unknown> | null | undefined): User | null => {
  if (!raw) return null;

  const id = String(raw.id ?? raw._id ?? '');
  if (!id) return null;

  const role = raw.role === 'admin' ? 'admin' : 'user';
  const avatarType =
    raw.avatarType === 'upload' || raw.avatarType === 'url' || raw.avatarType === 'generated'
      ? raw.avatarType
      : 'generated';

  return {
    id,
    _id: id,
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    avatar: raw.avatar ? String(raw.avatar) : '',
    avatarType,
    role,
    isActive: raw.isActive !== false,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
};

export const isAdmin = (user: User | null | undefined): boolean => user?.role === 'admin';

export const getPostAuthRedirect = (user: User | null): string =>
  isAdmin(user) ? '/admin' : '/';
