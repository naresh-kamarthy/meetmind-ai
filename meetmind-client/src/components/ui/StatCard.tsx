import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  delay?: number;
  trend?: string;
  trendClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  icon: Icon,
  iconClassName = 'from-brand-500/20 to-fuchsia-500/20 text-brand-400 border-brand-500/10',
  delay = 0,
  trend,
  trendClassName = 'text-emerald-400',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3, ease: 'easeOut' }}
    className="h-full"
  >
    <DashboardCard hover padding="md" className="h-full justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-2">{value}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-1.5 leading-snug">{description}</p>
          )}
        </div>
        <div
          className={`p-2.5 rounded-xl bg-gradient-to-br border shrink-0 ${iconClassName}`}
        >
          <Icon size={18} aria-hidden />
        </div>
      </div>
      {trend && (
        <p className={`text-xs font-medium mt-4 pt-3 border-t border-white/[0.05] ${trendClassName}`}>
          {trend}
        </p>
      )}
    </DashboardCard>
  </motion.div>
);
