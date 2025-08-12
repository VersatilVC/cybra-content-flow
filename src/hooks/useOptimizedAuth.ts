import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { logger } from '@/utils/logger';

interface OptimizedAuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  initialized: boolean;
}

export function useOptimizedAuth() {
  const [state, setState] = useState<OptimizedAuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    profileLoading: false,
    initialized: false,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      setState(prev => ({ ...prev, profileLoading: true }));
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, status, first_name, last_name, created_at, updated_at, last_active')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const profile = {
          ...data,
          role: data.role as 'super_admin' | 'admin' | 'creator',
          status: data.status as 'active' | 'inactive'
        };
        
        setState(prev => ({ ...prev, profile, profileLoading: false }));
        return profile;
      }
      
      setState(prev => ({ ...prev, profile: null, profileLoading: false }));
      return null;
    } catch (error) {
      logger.error('Failed to fetch profile:', error);
      setState(prev => ({ ...prev, profile: null, profileLoading: false }));
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }

        if (mounted) {
          setState(prev => ({
            ...prev,
            session: initialSession,
            user: initialSession?.user ?? null,
            loading: false,
            initialized: true,
          }));

          // Fetch profile immediately if user exists
          if (initialSession?.user) {
            fetchProfile(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setState(prev => ({ ...prev, loading: false, initialized: true }));
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          // Clear profile when user signs out
          profile: session?.user ? prev.profile : null,
        }));

        // Fetch profile for new user sessions
        if (event === 'SIGNED_IN' && session?.user) {
          fetchProfile(session.user.id);
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setState(prev => ({ ...prev, profile: null }));
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const isAdmin = state.profile?.role === 'admin' || state.profile?.role === 'super_admin';

  return {
    ...state,
    signOut,
    isAdmin,
    isReady: state.initialized && !state.loading,
  };
}