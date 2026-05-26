import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  compact = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className={`
      flex flex-col items-center justify-center text-center
      ${compact ? 'py-8 px-4' : 'py-12 sm:py-14 px-6'}
      ${className}
    `}
  >
    <div className="relative mb-5">
      <div
        className="absolute inset-0 rounded-3xl bg-brand-500/10 blur-xl scale-150 animate-pulse"
        aria-hidden
        style={{ animationDuration: '3s' }}
      />
      <div
        className="
          relative p-5 rounded-2xl
          bg-gradient-to-b from-white/[0.08] to-white/[0.02]
          border border-white/[0.08]
          text-brand-400/80
          animate-float
        "
      >
        <Icon size={compact ? 28 : 36} strokeWidth={1.25} aria-hidden />
      </div>
    </div>

    <h4 className="text-sm sm:text-base font-semibold text-slate-200 font-display tracking-tight">
      {title}
    </h4>
    <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
      {description}
    </p>

    {(action || secondaryAction) && (
      <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-6">
        {action && (
          <button type="button" onClick={action.onClick} className="btn-primary min-w-[10rem]">
            {action.label}
          </button>
        )}
        {secondaryAction && (
          <button type="button" onClick={secondaryAction.onClick} className="btn-secondary min-w-[10rem]">
            {secondaryAction.label}
          </button>
        )}
      </div>
    )}
  </motion.div>
);

/** Card-wrapped empty state for dashboard panels */
export const EmptyStateCard: React.FC<EmptyStateProps> = (props) => (
  <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02]">
    <EmptyState {...props} />
  </div>
);
