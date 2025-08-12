import React, { createContext, useContext, useCallback } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { AuthContextType } from './auth/types';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { authService } from './auth/authService';

const OptimizedAuthContext = createContext<AuthContextType | undefined>(undefined);

export function OptimizedAuthProvider({ children }: { children: React.ReactNode }) {
  const { user, session, loading, signOut: optimizedSignOut } = useOptimizedAuth();
  const { validateSession, recoverSession } = useSessionRecovery();

  const signOut = useCallback(async () => {
    console.log('OptimizedAuthContext: Initiating sign out');
    try {
      await optimizedSignOut();
      console.log('OptimizedAuthContext: Sign out completed successfully');
    } catch (error) {
      console.error('OptimizedAuthContext: Sign out error (continuing anyway):', error);
    }
  }, [optimizedSignOut]);

  return (
    <OptimizedAuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signInWithGoogle: authService.signInWithGoogle,
      signOut,
      validateSession,
      recoverSession
    }}>
      {children}
    </OptimizedAuthContext.Provider>
  );
}

export function useOptimizedAuthContext() {
  const context = useContext(OptimizedAuthContext);
  if (context === undefined) {
    throw new Error('useOptimizedAuthContext must be used within an OptimizedAuthProvider');
  }
  return context;
}