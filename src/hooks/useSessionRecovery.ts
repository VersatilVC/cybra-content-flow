
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSessionRecovery() {
  const validateSession = useCallback(async () => {
    try {
      console.log('SessionRecovery: Validating current session');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('SessionRecovery: Session validation error:', error);
        return false;
      }
      
      if (!session) {
        console.log('SessionRecovery: No session found');
        return false;
      }
      
      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      
      if (expiresAt && now >= expiresAt) {
        console.log('SessionRecovery: Session expired, attempting refresh');
        
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('SessionRecovery: Session refresh failed:', refreshError);
          return false;
        }
        
        console.log('SessionRecovery: Session refreshed successfully');
        return !!refreshedSession;
      }
      
      console.log('SessionRecovery: Session is valid');
      return true;
    } catch (error) {
      console.error('SessionRecovery: Unexpected error during session validation:', error);
      return false;
    }
  }, []);

  const recoverSession = useCallback(async () => {
    console.log('SessionRecovery: Attempting session recovery');
    
    try {
      // First try to get the session from storage
      const storedSession = localStorage.getItem('supabase.auth.token');
      
      if (!storedSession) {
        console.log('SessionRecovery: No stored session found');
        return false;
      }
      
      console.log('SessionRecovery: Found stored session, validating...');
      
      // Validate the session
      const isValid = await validateSession();
      
      if (!isValid) {
        console.log('SessionRecovery: Stored session is invalid, clearing storage');
        localStorage.removeItem('supabase.auth.token');
        return false;
      }
      
      console.log('SessionRecovery: Session recovery successful');
      return true;
    } catch (error) {
      console.error('SessionRecovery: Session recovery failed:', error);
      return false;
    }
  }, [validateSession]);

  // Monitor storage changes for session persistence
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.token') {
        console.log('SessionRecovery: Session storage changed externally');
        
        if (!e.newValue) {
          console.log('SessionRecovery: Session was cleared externally');
        } else {
          console.log('SessionRecovery: Session was updated externally');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for session on visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('SessionRecovery: Tab became visible, validating session');
        validateSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [validateSession]);

  return { validateSession, recoverSession };
}
