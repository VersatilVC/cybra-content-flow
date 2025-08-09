
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        logger.info('AuthState: Getting initial session');
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthState: Error getting initial session:', error);
        } else {
logger.info('AuthState: Initial session result:', {
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
      } finally {
        if (mounted) {
          logger.info('AuthState: Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Get initial session first
    getInitialSession();

    // Then set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
logger.info('AuthState: Auth state change event:', event, {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          eventTimestamp: new Date().toISOString(),
          currentUrl: window.location.href,
          userAgent: navigator.userAgent
        });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // Handle specific auth events
        switch (event) {
case 'INITIAL_SESSION':
            logger.info('AuthState: Initial session processed');
            break;
case 'SIGNED_IN':
            logger.info('AuthState: User signed in successfully');
            if (session) {
              logger.info('AuthState: Session details:', {
                accessToken: session.access_token ? 'present' : 'missing',
                refreshToken: session.refresh_token ? 'present' : 'missing',
                expiresAt: session.expires_at,
                provider: session.user?.app_metadata?.provider
              });
            }
            break;
case 'SIGNED_OUT':
            logger.info('AuthState: User signed out');
            if (mounted) {
              setUser(null);
              setSession(null);
            }
            // Only redirect if not already on auth page
            if (window.location.pathname !== '/auth') {
              logger.info('AuthState: Redirecting to auth page after sign out');
              window.location.href = '/auth';
            }
            break;
case 'TOKEN_REFRESHED':
            logger.info('AuthState: Token refreshed successfully');
            if (session) {
              logger.info('AuthState: New token expires at:', session.expires_at);
            }
            break;
case 'USER_UPDATED':
            logger.info('AuthState: User data updated');
            break;
          default:
            logger.info('AuthState: Unhandled auth event:', event);
        }
      }
    );

    return () => {
logger.info('AuthState: Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
}
