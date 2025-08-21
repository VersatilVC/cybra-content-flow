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

  

  // Enhanced loading state handling - wait longer for auth to settle
  if (!isReady || loading) {
    return <OptimizedLoadingSpinner showSkeleton skeletonType={fallbackSkeleton} />;
  }

  // Redirect to auth if no user (only after auth is fully ready)
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