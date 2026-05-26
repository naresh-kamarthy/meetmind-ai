import React from 'react';

type GridVariant = 'stats' | 'main' | 'cards' | 'health';

interface DashboardGridProps {
  children: React.ReactNode;
  variant?: GridVariant;
  className?: string;
}

const variantClass: Record<GridVariant, string> = {
  stats: 'grid-stats',
  main: 'grid-main',
  cards: 'grid-cards',
  health: 'grid-health',
};

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  variant = 'stats',
  className = '',
}) => (
  <div className={`${variantClass[variant]} ${className}`}>{children}</div>
);
