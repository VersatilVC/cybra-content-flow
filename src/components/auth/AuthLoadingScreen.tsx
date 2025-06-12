
import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
};
