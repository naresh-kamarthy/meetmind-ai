import type { User } from '../types';

export const getGeneratedAvatarUrl = (email: string, name?: string): string => {
  const seed = encodeURIComponent(name?.trim() || email);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=6366f1,8b5cf6`;
};

export const getDisplayAvatar = (
  user?: Pick<User, 'avatar' | 'email' | 'name'> | null
): string => {
  if (!user) return getGeneratedAvatarUrl('guest');
  if (user.avatar?.trim()) return user.avatar.trim();
  return getGeneratedAvatarUrl(user.email, user.name);
};

export const getInitials = (name?: string): string => {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};
