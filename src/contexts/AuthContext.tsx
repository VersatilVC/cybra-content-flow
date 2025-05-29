
import React, { createContext, useContext, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';
import { useProfileManager } from '@/hooks/useProfileManager';
import { Profile } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useAuthState();
  const { fetchProfile, clearProfileCache } = useProfileManager();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        dispatch({
          type: 'SET_SESSION',
          payload: { user: session?.user ?? null, session }
        });

        // Handle profile fetching for authenticated users
        if (session?.user && event !== 'SIGNED_OUT') {
          try {
            const profile = await fetchProfile(session.user.id);
            if (mounted) {
              dispatch({ type: 'SET_PROFILE', payload: profile });
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            if (mounted) {
              dispatch({ type: 'SET_PROFILE', payload: null });
            }
          }
        } else {
          dispatch({ type: 'SET_PROFILE', payload: null });
          clearProfileCache();
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
          return;
        }

        if (!mounted) return;

        dispatch({
          type: 'SET_SESSION',
          payload: { user: session?.user ?? null, session }
        });

        if (session?.user) {
          try {
            const profile = await fetchProfile(session.user.id);
            if (mounted) {
              dispatch({ type: 'SET_PROFILE', payload: profile });
            }
          } catch (error) {
            console.error('Error fetching initial profile:', error);
            if (mounted) {
              dispatch({ type: 'SET_PROFILE', payload: null });
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
        }
      } finally {
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, clearProfileCache]);

  const signIn = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
      }
    });

    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    clearProfileCache();
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw new Error(error.message);
    }
    
    dispatch({ type: 'RESET' });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
