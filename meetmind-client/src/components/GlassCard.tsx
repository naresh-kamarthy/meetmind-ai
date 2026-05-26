import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        dashboard-card p-5 sm:p-6
        ${onClick ? 'cursor-pointer' : ''}
        ${hoverEffect ? 'dashboard-card-hover' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
