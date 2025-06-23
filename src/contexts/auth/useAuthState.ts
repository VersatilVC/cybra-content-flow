
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const getInitialSession = async () => {
      try {
        console.log('AuthState: Getting initial session (attempt', retryCount + 1, ')');
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthState: Error getting initial session:', error);
          
          // Retry on network errors
          if (retryCount < maxRetries && (error.message.includes('network') || error.message.includes('fetch'))) {
            retryCount++;
            console.log('AuthState: Retrying session retrieval in 1 second...');
            setTimeout(getInitialSession, 1000);
            return;
          }
        } else {
          console.log('AuthState: Initial session result:', {
            hasSession: !!initialSession,
            userId: initialSession?.user?.id,
            email: initialSession?.user?.email,
            expiresAt: initialSession?.expires_at,
            accessToken: initialSession?.access_token ? 'present' : 'missing'
          });
          
          if (mounted) {
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
          }
        }
      } catch (error) {
        console.error('AuthState: Unexpected error getting initial session:', error);
        
        // Retry on unexpected errors
        if (retryCount < maxRetries) {
          retryCount++;
          console.log('AuthState: Retrying session retrieval after unexpected error...');
          setTimeout(getInitialSession, 1000);
          return;
        }
      } finally {
        if (mounted && retryCount >= maxRetries) {
          console.log('AuthState: Setting loading to false after', retryCount + 1, 'attempts');
          setLoading(false);
        } else if (mounted && retryCount === 0) {
          console.log('AuthState: Setting loading to false after successful session check');
          setLoading(false);
        }
      }
    };

    // Get initial session first
    getInitialSession();

    // Then set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthState: Auth state change event:', event, {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          eventTimestamp: new Date().toISOString()
        });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Always ensure loading is false when auth state changes
          setLoading(false);
        }

        // Handle specific auth events with enhanced logging
        switch (event) {
          case 'INITIAL_SESSION':
            console.log('AuthState: Initial session processed');
            break;
          case 'SIGNED_IN':
            console.log('AuthState: User signed in successfully');
            if (session) {
              console.log('AuthState: Session details:', {
                accessToken: session.access_token ? 'present' : 'missing',
                refreshToken: session.refresh_token ? 'present' : 'missing',
                expiresAt: session.expires_at,
                provider: session.user?.app_metadata?.provider
              });
            }
            break;
          case 'SIGNED_OUT':
            console.log('AuthState: User signed out');
            if (mounted) {
              setUser(null);
              setSession(null);
            }
            // Only redirect if not already on auth page
            if (window.location.pathname !== '/auth') {
              console.log('AuthState: Redirecting to auth page after sign out');
              window.location.href = '/auth';
            }
            break;
          case 'TOKEN_REFRESHED':
            console.log('AuthState: Token refreshed successfully');
            if (session) {
              console.log('AuthState: New token expires at:', session.expires_at);
            }
            break;
          case 'USER_UPDATED':
            console.log('AuthState: User data updated');
            break;
          default:
            console.log('AuthState: Unhandled auth event:', event);
        }
      }
    );

    return () => {
      console.log('AuthState: Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
}
