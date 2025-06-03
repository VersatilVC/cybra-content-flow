
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id || !session) {
        console.log('useProfile: No user ID or session available');
        return null;
      }
      
      console.log('useProfile: Fetching profile for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('useProfile: Profile query error:', error);
          
          // If it's a recursion error, try using the security definer function directly
          if (error.message?.includes('infinite recursion')) {
            console.log('useProfile: Recursion detected, attempting direct profile fetch');
            
            // Try a direct approach without RLS
            const { data: directData, error: directError } = await supabase.rpc('get_current_user_role');
            
            if (directError) {
              console.error('useProfile: Direct role fetch failed:', directError);
              return null;
            }
            
            console.log('useProfile: Direct role fetch result:', directData);
            
            // Return a minimal profile with just the role for now
            return {
              id: user.id,
              email: user.email || '',
              role: directData as 'super_admin' | 'admin' | 'creator',
              status: 'active' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
          
          if (error.code === 'PGRST116') {
            console.log('useProfile: Profile not found, this is normal for new users');
            return null;
          }
          
          throw error;
        }

        if (!data) {
          console.log('useProfile: No profile data found for user');
          return null;
        }

        console.log('useProfile: Profile data retrieved:', data);

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
      console.log('useProfile: Retry attempt', failureCount, 'for error:', error?.message);
      
      // Don't retry on recursion errors
      if (error?.message?.includes('infinite recursion')) {
        return false;
      }
      
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Refetch profile when user changes
  useEffect(() => {
    if (user?.id && session) {
      console.log('useProfile: User/session changed, invalidating profile query');
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
