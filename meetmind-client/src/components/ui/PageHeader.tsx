import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  badge,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-1"
  >
    <div className="space-y-1.5 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="page-title">{title}</h1>
        {badge && (
          <span className="badge-admin">{badge}</span>
        )}
      </div>
      {description && (
        <p className="page-description">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </motion.div>
);
