import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

type DashboardCardPadding = 'sm' | 'md' | 'lg';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: DashboardCardPadding;
  delay?: number;
}

const paddingMap: Record<DashboardCardPadding, string> = {
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
  delay,
}) => {
  const card = (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`
        dashboard-card
        ${paddingMap[padding]}
        ${hover ? 'dashboard-card-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );

  if (delay !== undefined) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.28, ease: 'easeOut' }}
        className="h-full min-h-0"
      >
        {card}
      </motion.div>
    );
  }

  return card;
};

interface DashboardCardHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  action?: React.ReactNode;
  description?: string;
}

export const DashboardCardHeader: React.FC<DashboardCardHeaderProps> = ({
  title,
  icon: Icon,
  iconClassName = 'text-brand-400',
  action,
  description,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-white/[0.06] pb-4 mb-5">
    <div className="min-w-0 space-y-1">
      <h3 className="section-title flex items-center gap-2">
        {Icon && <Icon size={18} className={`shrink-0 ${iconClassName}`} aria-hidden />}
        {title}
      </h3>
      {description && <p className="section-description">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
