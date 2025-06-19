
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthState: Getting initial session');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthState: Error getting initial session:', error);
        } else {
          console.log('AuthState: Initial session:', initialSession ? 'found' : 'not found');
          if (initialSession) {
            console.log('AuthState: Initial session user email:', initialSession.user?.email);
          }
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('AuthState: Unexpected error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthState: Auth state change:', event, session ? 'session exists' : 'no session');
        
        if (session) {
          console.log('AuthState: Session user email:', session.user?.email);
          console.log('AuthState: Session providers:', session.user?.app_metadata?.providers);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('AuthState: User signed in, checking for account linking...');
            // Account linking will be handled by useAccountLinking hook
            break;
          case 'SIGNED_OUT':
            console.log('AuthState: User signed out');
            // Clear local state first to prevent UI flickering
            setUser(null);
            setSession(null);
            // Only redirect after successful sign out
            if (window.location.pathname !== '/auth') {
              window.location.href = '/auth';
            }
            break;
          case 'TOKEN_REFRESHED':
            console.log('AuthState: Token refreshed');
            break;
          case 'USER_UPDATED':
            console.log('AuthState: User updated');
            break;
        }
      }
    );

    return () => {
      console.log('AuthState: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
}
