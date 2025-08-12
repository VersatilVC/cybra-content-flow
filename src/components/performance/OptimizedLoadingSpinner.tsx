import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedLoadingSpinnerProps {
  type?: 'page' | 'auth' | 'component' | 'skeleton';
  className?: string;
  showSkeleton?: boolean;
  skeletonType?: 'dashboard' | 'content-list' | 'content-item' | 'profile';
}

const OptimizedLoadingSpinner: React.FC<OptimizedLoadingSpinnerProps> = ({ 
  type = 'component',
  className = '',
  showSkeleton = false,
  skeletonType = 'content-list'
}) => {
  // For skeleton loading states
  if (showSkeleton) {
    switch (skeletonType) {
      case 'dashboard':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-white">
            <div className="px-6 py-8 space-y-8">
              {/* Header skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
              </div>
              
              {/* Stats cards skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border-0 shadow-sm">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Content grid skeleton */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl">
                <div className="xl:col-span-2 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'content-list':
        return (
          <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'content-item':
        return (
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4 p-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        );
    }
  }

  // Standard loading spinners
  const getSpinnerSize = () => {
    switch (type) {
      case 'page':
        return 'h-32 w-32';
      case 'auth':
        return 'h-8 w-8';
      case 'component':
        return 'h-6 w-6';
      default:
        return 'h-6 w-6';
    }
  };

  const getContainerClasses = () => {
    switch (type) {
      case 'page':
        return 'min-h-screen flex items-center justify-center';
      case 'auth':
        return 'flex items-center justify-center p-8';
      case 'component':
        return 'flex items-center justify-center p-4';
      default:
        return 'flex items-center justify-center p-4';
    }
  };

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary ${getSpinnerSize()}`} />
    </div>
  );
};

export default OptimizedLoadingSpinner;