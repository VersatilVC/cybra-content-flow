
import React, { createContext, useContext } from 'react';
import { AuthContextType } from './auth/types';
import { useAuthState } from './auth/useAuthState';
import { authService } from './auth/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuthState();

  const signOut = async () => {
    // Clear local state first to prevent UI flickering
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn: authService.signIn,
      signInWithGoogle: authService.signInWithGoogle,
      signUp: authService.signUp,
      signOut 
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
