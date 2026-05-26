import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const shape =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
        ? 'rounded h-4'
        : 'rounded-xl';

  return <div className={`skeleton-shimmer ${shape} ${className}`} aria-hidden />;
};

export const CardSkeleton: React.FC = () => (
  <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex gap-2 pt-2">
      <Skeleton variant="circle" className="h-8 w-8" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-label="Loading dashboard">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <Skeleton className="h-80 lg:col-span-2" />
      <Skeleton className="h-80" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3" role="status" aria-label="Loading table">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-14" />
    ))}
  </div>
);

export const AdminDashboardSkeleton: React.FC = () => (
  <div className="space-y-8" role="status" aria-label="Loading admin dashboard">
    <div className="flex justify-between gap-4">
      <Skeleton className="h-10 w-72 max-w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <Skeleton className="h-[380px] lg:col-span-2" />
      <Skeleton className="h-[380px]" />
    </div>
  </div>
);
