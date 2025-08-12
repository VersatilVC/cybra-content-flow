
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading: authLoading } = useOptimizedAuthContext();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // For admin routes, wait for profile to load and check role
  if (adminOnly) {
    if (profileLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    if (!profile || (profile.role !== 'super_admin' && profile.role !== 'admin')) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
