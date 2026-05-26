import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getDisplayAvatar, getInitials } from '../utils/avatar';
import type { User } from '../types';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-24 h-24 text-2xl',
  xl: 'w-32 h-32 text-3xl',
};

interface AvatarProps {
  user?: Pick<User, 'avatar' | 'email' | 'name'> | null;
  size?: AvatarSize;
  className?: string;
  loading?: boolean;
  showRing?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  className = '',
  loading = false,
  showRing = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const src = getDisplayAvatar(user);
  const initials = getInitials(user?.name);
  const showImage = !imgError && !loading;

  return (
    <motion.div
      layout
      className={`
        relative shrink-0 rounded-full overflow-hidden
        bg-gradient-to-br from-brand-500/30 to-purple-500/20
        border border-white/10
        ${sizeClasses[size]}
        ${showRing ? 'ring-2 ring-brand-500/40 ring-offset-2 ring-offset-[#090d1a]' : ''}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-slate-200" aria-hidden />
      )}

      {showImage ? (
        <img
          src={src}
          alt={user?.name ? `${user.name} avatar` : 'User avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-bold text-brand-200 bg-brand-500/20"
          aria-hidden
        >
          {initials}
        </div>
      )}

      {!loading && showImage && (
        <span className="sr-only">{user?.name ?? 'User'}</span>
      )}
    </motion.div>
  );
};
