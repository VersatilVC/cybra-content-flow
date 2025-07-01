
import React, { createContext, useContext } from 'react';
import { AuthContextType } from './auth/types';
import { useAuthState } from './auth/useAuthState';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { authService } from './auth/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuthState();
  const { validateSession, recoverSession } = useSessionRecovery();

  const signOut = async () => {
    console.log('AuthContext: Initiating sign out');
    try {
      // Clear local state first to prevent UI flickering
      await authService.signOut();
      console.log('AuthContext: Sign out completed successfully');
    } catch (error) {
      console.error('AuthContext: Sign out error (continuing anyway):', error);
      // Even if signOut fails, we'll let the auth state change handler manage the redirect
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signInWithGoogle: authService.signInWithGoogle,
      signOut,
      validateSession,
      recoverSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
