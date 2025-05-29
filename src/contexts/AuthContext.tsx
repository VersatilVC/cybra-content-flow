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
    let profileFetchInProgress = false;

    // Set up auth state listener - NEVER use async here to avoid hooks violations
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        // Always update session state immediately (synchronous)
        dispatch({
          type: 'SET_SESSION',
          payload: { user: session?.user ?? null, session }
        });

        // Handle profile fetching for authenticated users with setTimeout to avoid hooks violations
        if (session?.user && event !== 'SIGNED_OUT' && !profileFetchInProgress) {
          console.log('User authenticated, scheduling profile fetch for:', session.user.id);
          profileFetchInProgress = true;
          
          // Use setTimeout to defer async operations and prevent hooks violations
          setTimeout(() => {
            if (!mounted) return;
            
            // Pass user data directly to avoid recursive auth calls
            fetchProfile(
              session.user.id, 
              session.user.email || '', 
              session.user.user_metadata || {}
            )
              .then(profile => {
                if (mounted) {
                  dispatch({ type: 'SET_PROFILE', payload: profile });
                  console.log('Profile set successfully:', profile);
                }
              })
              .catch(error => {
                console.error('Profile fetch error - continuing gracefully:', error);
                if (mounted) {
                  // Continue without profile rather than failing auth
                  dispatch({ type: 'SET_PROFILE', payload: null });
                }
              })
              .finally(() => {
                profileFetchInProgress = false;
              });
          }, 0);
        } else {
          // User signed out or no user
          dispatch({ type: 'SET_PROFILE', payload: null });
          if (event === 'SIGNED_OUT') {
            clearProfileCache();
          }
          profileFetchInProgress = false;
        }
      }
    );

    // Check for existing session
    const initializeAuth = () => {
      console.log('Initializing auth...');
      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          if (error) {
            console.error('Session initialization error:', error);
            if (mounted) {
              dispatch({ type: 'SET_ERROR', payload: error.message });
            }
            return;
          }

          if (!mounted) return;

          console.log('Initial session:', session?.user?.id || 'none');
          dispatch({
            type: 'SET_SESSION',
            payload: { user: session?.user ?? null, session }
          });

          if (session?.user && !profileFetchInProgress) {
            console.log('Fetching initial profile for:', session.user.id);
            profileFetchInProgress = true;
            
            // Use setTimeout for initial profile fetch as well
            setTimeout(() => {
              if (!mounted) return;
              
              // Pass user data directly to avoid recursive auth calls
              fetchProfile(
                session.user.id, 
                session.user.email || '', 
                session.user.user_metadata || {}
              )
                .then(profile => {
                  if (mounted) {
                    dispatch({ type: 'SET_PROFILE', payload: profile });
                    console.log('Initial profile loaded:', profile);
                  }
                })
                .catch(error => {
                  console.error('Initial profile fetch error - continuing gracefully:', error);
                  if (mounted) {
                    // Continue without profile rather than blocking auth
                    dispatch({ type: 'SET_PROFILE', payload: null });
                  }
                })
                .finally(() => {
                  profileFetchInProgress = false;
                });
            }, 100);
          }
        })
        .catch(error => {
          console.error('Auth initialization error:', error);
          if (mounted) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
          }
        })
        .finally(() => {
          if (mounted) {
            console.log('Auth initialization complete');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        });
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, clearProfileCache, dispatch]);

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

    console.log('Initiating Google OAuth...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
      }
    });

    if (error) {
      console.error('Google OAuth error:', error);
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
