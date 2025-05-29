
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

const PROFILE_CACHE_KEY = 'cyabra_user_profile';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useProfileManager() {
  const getCachedProfile = useCallback((userId: string): Profile | null => {
    try {
      const cached = localStorage.getItem(`${PROFILE_CACHE_KEY}_${userId}`);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(`${PROFILE_CACHE_KEY}_${userId}`);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  }, []);

  const setCachedProfile = useCallback((userId: string, profile: Profile) => {
    try {
      localStorage.setItem(`${PROFILE_CACHE_KEY}_${userId}`, JSON.stringify({
        data: profile,
        timestamp: Date.now(),
      }));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Check cache first
      const cached = getCachedProfile(userId);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }

      const profile: Profile = {
        ...data,
        role: data.role as 'admin' | 'user'
      };

      setCachedProfile(userId, profile);
      return profile;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  }, [getCachedProfile, setCachedProfile]);

  const clearProfileCache = useCallback((userId?: string) => {
    if (userId) {
      localStorage.removeItem(`${PROFILE_CACHE_KEY}_${userId}`);
    } else {
      // Clear all profile caches
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(PROFILE_CACHE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    }
  }, []);

  return {
    fetchProfile,
    clearProfileCache,
  };
}
