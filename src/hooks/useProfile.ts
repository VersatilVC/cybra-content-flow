
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

export function useProfile() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
if (!user?.id || !session) {
        logger.info('useProfile: No user ID or session available');
        return null;
      }
      
      logger.info('useProfile: Fetching profile for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, status, first_name, last_name, created_at, updated_at, last_active')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('useProfile: Profile query error:', error);
          throw error;
        }

if (!data) {
          logger.info('useProfile: No profile data found for user');
          return null;
        }

        logger.info('useProfile: Profile data retrieved:', data);

        return {
          ...data,
          role: data.role as 'super_admin' | 'admin' | 'creator',
          status: data.status as 'active' | 'inactive'
        };
      } catch (err) {
        console.error('useProfile: Unexpected error:', err);
        throw err;
      }
    },
    enabled: !!user?.id && !!session,
retry: (failureCount, error: any) => {
      logger.info('useProfile: Retry attempt', failureCount, 'for error:', error?.message);
      // Retry up to 2 times for most errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Refetch profile when user changes
  useEffect(() => {
if (user?.id && session) {
      logger.info('useProfile: User/session changed, invalidating profile query');
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    }
  }, [user?.id, session, queryClient]);

  return {
    profile,
    loading: isLoading,
    error,
    refetch,
  };
}
