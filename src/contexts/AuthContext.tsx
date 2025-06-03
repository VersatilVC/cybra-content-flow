
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
        } else {
          console.log('AuthContext: Initial session:', initialSession ? 'found' : 'not found');
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('AuthContext: Unexpected error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state change:', event, session ? 'session exists' : 'no session');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('AuthContext: User signed in');
            break;
          case 'SIGNED_OUT':
            console.log('AuthContext: User signed out');
            break;
          case 'TOKEN_REFRESHED':
            console.log('AuthContext: Token refreshed');
            break;
          case 'USER_UPDATED':
            console.log('AuthContext: User updated');
            break;
        }
      }
    );

    return () => {
      console.log('AuthContext: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out user');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthContext: Error signing out:', error);
        throw error;
      }
      
      console.log('AuthContext: Successfully signed out');
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      // Force a page reload to clear any cached state
      window.location.href = '/auth';
    } catch (error) {
      console.error('AuthContext: Sign out failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
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
