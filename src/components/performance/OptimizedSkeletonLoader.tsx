import React from 'react';
import { SkeletonCard, SkeletonTable, SkeletonGrid, SkeletonStats, SkeletonForm, SkeletonChat } from '@/components/ui/skeleton-variants';
import { cn } from '@/lib/utils';

interface OptimizedSkeletonLoaderProps {
  type: 'card' | 'table' | 'grid' | 'stats' | 'form' | 'chat' | 'content-ideas' | 'pr-pitches' | 'general-content';
  count?: number;
  className?: string;
}

const OptimizedSkeletonLoader: React.FC<OptimizedSkeletonLoaderProps> = ({
  type,
  count = 1,
  className
}) => {
  switch (type) {
    case 'content-ideas':
      return (
        <div className={cn("space-y-6", className)}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <SkeletonCard />
              <div className="mt-4 space-y-2">
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'pr-pitches':
      return (
        <div className={cn("space-y-4", className)}>
          <SkeletonTable rows={count} columns={6} />
        </div>
      );

    case 'general-content':
      return <SkeletonGrid items={count} className={className} />;

    case 'card':
      return (
        <div className={cn("space-y-4", className)}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <SkeletonCard />
            </div>
          ))}
        </div>
      );

    case 'table':
      return <SkeletonTable rows={count} className={className} />;

    case 'grid':
      return <SkeletonGrid items={count} className={className} />;

    case 'stats':
      return <SkeletonStats className={className} />;

    case 'form':
      return <SkeletonForm className={className} />;

    case 'chat':
      return <SkeletonChat className={className} />;

    default:
      return <SkeletonCard className={className} />;
  }
};

export default OptimizedSkeletonLoader;