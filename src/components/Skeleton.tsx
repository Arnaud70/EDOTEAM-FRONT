import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="glass-card p-6 rounded-[2rem] space-y-4">
    <Skeleton className="w-12 h-12 rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="w-24 h-3" />
      <Skeleton className="w-16 h-8" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 py-4 px-8">
    <Skeleton className="w-10 h-10 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="w-1/3 h-4" />
      <Skeleton className="w-1/4 h-3" />
    </div>
    <Skeleton className="w-20 h-6 rounded-full" />
    <Skeleton className="w-10 h-10 rounded-lg" />
  </div>
);

export default Skeleton;
