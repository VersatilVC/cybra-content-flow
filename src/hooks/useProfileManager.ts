
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

  const createFallbackProfile = useCallback(async (userId: string, userEmail: string): Promise<Profile | null> => {
    try {
      console.log('Creating fallback profile for user:', userId);
      
      // Get user metadata to extract names
      const { data: { user } } = await supabase.auth.getUser();
      const metadata = user?.user_metadata || {};
      
      // Extract names from various possible metadata fields
      const firstName = metadata.first_name || metadata.given_name || 
                       (metadata.full_name ? metadata.full_name.split(' ')[0] : '') || '';
      const lastName = metadata.last_name || metadata.family_name || 
                      (metadata.full_name ? metadata.full_name.split(' ').slice(1).join(' ') : '') || '';

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
          role: 'user'
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create fallback profile:', error);
        // Return a minimal profile object to prevent auth issues
        return {
          id: userId,
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
          role: 'user' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const profile: Profile = {
        ...data,
        role: data.role as 'admin' | 'user'
      };

      console.log('Fallback profile created successfully:', profile);
      setCachedProfile(userId, profile);
      return profile;
    } catch (error) {
      console.error('Error creating fallback profile:', error);
      // Return minimal profile to prevent auth failure
      return {
        id: userId,
        email: userEmail,
        first_name: '',
        last_name: '',
        role: 'user' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }, [setCachedProfile]);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Checking cache for profile:', userId);
      // Check cache first
      const cached = getCachedProfile(userId);
      if (cached) {
        console.log('Profile found in cache:', cached);
        return cached;
      }

      console.log('Fetching profile from database:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        
        // If profile doesn't exist, create a fallback profile
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating fallback profile');
          
          // Get user email for fallback profile creation
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            return await createFallbackProfile(userId, user.email);
          }
        }
        
        // For other errors, return null and let the app continue gracefully
        console.log('Profile fetch failed, continuing without profile');
        return null;
      }

      const profile: Profile = {
        ...data,
        role: data.role as 'admin' | 'user'
      };

      console.log('Profile fetched from database:', profile);
      setCachedProfile(userId, profile);
      return profile;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      // Never throw error - allow auth flow to continue gracefully
      return null;
    }
  }, [getCachedProfile, setCachedProfile, createFallbackProfile]);

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
