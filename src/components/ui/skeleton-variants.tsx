import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonVariantsProps {
  className?: string;
}

// Card skeleton for content items
export const SkeletonCard: React.FC<SkeletonVariantsProps> = ({ className }) => (
  <div className={cn("space-y-3", className)}>
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <div className="flex space-x-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
    </div>
    <Skeleton className="h-16 w-full" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

// Table skeleton for data tables
export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn("space-y-3", className)}>
    <div className="grid grid-cols-4 gap-4 pb-3 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 py-2">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);

// Grid skeleton for card layouts
export const SkeletonGrid: React.FC<{ items?: number; className?: string }> = ({ 
  items = 6, 
  className 
}) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="border rounded-lg p-4">
        <SkeletonCard />
      </div>
    ))}
  </div>
);

// Dashboard stats skeleton
export const SkeletonStats: React.FC<SkeletonVariantsProps> = ({ className }) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="border rounded-lg p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
);

// Form skeleton
export const SkeletonForm: React.FC<SkeletonVariantsProps> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-32 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full" />
    </div>
    <Skeleton className="h-10 w-24" />
  </div>
);

// Chat skeleton
export const SkeletonChat: React.FC<SkeletonVariantsProps> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
        <div className={cn("max-w-xs space-y-2", i % 2 === 0 ? "mr-auto" : "ml-auto")}>
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);