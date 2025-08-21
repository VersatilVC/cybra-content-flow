import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import OptimizedLoadingSpinner from './OptimizedLoadingSpinner';
import { logger } from '@/utils/logger';

interface OptimizedProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  fallbackSkeleton?: 'dashboard' | 'content-list' | 'content-item' | 'profile';
}

const OptimizedProtectedRoute: React.FC<OptimizedProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  fallbackSkeleton = 'content-list'
}) => {
  const { user, profile, loading, profileLoading, isReady, isAdmin } = useOptimizedAuth();
  const location = useLocation();

  // Show skeleton loading while auth is initializing
  if (!isReady) {
    return <OptimizedLoadingSpinner showSkeleton skeletonType={fallbackSkeleton} />;
  }

  // Redirect to auth if no user
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // For admin routes, check permissions
  if (adminOnly) {
    // Still loading profile, show skeleton
    if (profileLoading) {
      return <OptimizedLoadingSpinner showSkeleton skeletonType={fallbackSkeleton} />;
    }
    
    // Profile loaded but user is not admin
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default OptimizedProtectedRoute;