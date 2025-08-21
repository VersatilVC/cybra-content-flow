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

  // DEBUGGING: Log authentication state for Content Ideas route
  if (location.pathname === '/content-ideas') {
    logger.info('🔍 OptimizedProtectedRoute /content-ideas DEBUG:', {
      pathname: location.pathname,
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { id: profile.id, role: profile.role } : null,
      loading,
      profileLoading,
      isReady,
      isAdmin,
      adminOnly
    });
  }

  // Show skeleton loading while auth is initializing
  if (!isReady) {
    if (location.pathname === '/content-ideas') {
      logger.info('🔍 OptimizedProtectedRoute /content-ideas: Not ready, showing spinner');
    }
    return <OptimizedLoadingSpinner showSkeleton skeletonType={fallbackSkeleton} />;
  }

  // Redirect to auth if no user
  if (!user) {
    if (location.pathname === '/content-ideas') {
      logger.info('🔍 OptimizedProtectedRoute /content-ideas: No user, redirecting to auth');
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // For admin routes, check permissions
  if (adminOnly) {
    // Still loading profile, show skeleton
    if (profileLoading) {
      if (location.pathname === '/content-ideas') {
        logger.info('🔍 OptimizedProtectedRoute /content-ideas: Admin route, profile loading');
      }
      return <OptimizedLoadingSpinner showSkeleton skeletonType={fallbackSkeleton} />;
    }
    
    // Profile loaded but user is not admin
    if (!isAdmin) {
      if (location.pathname === '/content-ideas') {
        logger.info('🔍 OptimizedProtectedRoute /content-ideas: Admin route, user not admin, redirecting');
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (location.pathname === '/content-ideas') {
    logger.info('🔍 OptimizedProtectedRoute /content-ideas: All checks passed, rendering children');
  }

  return <>{children}</>;
};

export default OptimizedProtectedRoute;