
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Profile not found, this is normal for new users');
        return null;
      }

      return {
        ...data,
        role: data.role as 'super_admin' | 'admin' | 'creator',
        status: data.status as 'active' | 'inactive'
      };
    },
    enabled: !!user?.id,
    retry: false,
  });

  return {
    profile,
    loading: isLoading,
    error,
  };
}
