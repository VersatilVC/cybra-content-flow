import React from 'react';
import { cn } from '@/lib/utils';
import OptimizedSkeletonLoader from './OptimizedSkeletonLoader';

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
  if (showSkeleton && skeletonType) {
    switch (skeletonType) {
      case 'dashboard':
        return (
          <div className="space-y-6 p-6">
            <OptimizedSkeletonLoader type="stats" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OptimizedSkeletonLoader type="card" count={5} />
              <OptimizedSkeletonLoader type="card" count={4} />
            </div>
          </div>
        );
        
      case 'content-list':
        return (
          <div className="p-6">
            <OptimizedSkeletonLoader type="grid" count={6} />
          </div>
        );
        
      case 'content-item':
        return (
          <div className="p-6">
            <OptimizedSkeletonLoader type="form" />
            <div className="mt-6">
              <OptimizedSkeletonLoader type="grid" count={4} />
            </div>
          </div>
        );
        
      case 'profile':
        return (
          <div className="p-6">
            <OptimizedSkeletonLoader type="form" />
            <div className="mt-6">
              <OptimizedSkeletonLoader type="card" count={3} />
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-6">
            <OptimizedSkeletonLoader type="card" count={3} />
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