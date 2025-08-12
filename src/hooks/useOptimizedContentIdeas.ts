import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { ContentIdeaFilters } from '@/types/contentIdeas';
import { fetchContentIdeas } from '@/services/contentIdeasApi';
import { useIdeaMutations } from '@/hooks/useIdeaMutations';
import { useBriefCreation } from '@/hooks/useBriefCreation';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useOptimizedQueries } from './useOptimizedQueries';

export function useOptimizedContentIdeas(filters?: ContentIdeaFilters) {
  const { user } = useOptimizedAuth();
  const queryClient = useQueryClient();
  const { getOptimizedConfig } = useOptimizedQueries();

  const { data: ideas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['content-ideas', user?.id, filters],
    queryFn: () => fetchContentIdeas(user?.id || '', filters),
    enabled: !!user?.id,
    ...getOptimizedConfig('realtime', {
      staleTime: 60 * 1000, // 1 minute for ideas (they change frequently)
      refetchInterval: 45 * 1000, // 45 seconds
    }),
  });

  // Optimized real-time subscription with debouncing
  useEffect(() => {
    if (!user?.id) return;

    let debounceTimer: NodeJS.Timeout;

    const channel = supabase
      .channel('content-ideas-optimized')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_ideas',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Content idea real-time update:', payload);
          
          // Debounce rapid updates
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            queryClient.invalidateQueries({ 
              queryKey: ['content-ideas', user.id],
              exact: false 
            });
          }, 500);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const {
    createIdea,
    updateIdea,
    deleteIdea,
    isCreating,
    isUpdating,
    isDeleting,
  } = useIdeaMutations();

  const { createBrief, isCreatingBrief } = useBriefCreation(ideas);

  return {
    ideas,
    isLoading,
    error,
    createIdea,
    updateIdea,
    deleteIdea,
    createBrief,
    isCreating,
    isUpdating,
    isDeleting,
    isCreatingBrief,
    refetch,
  };
}

// Re-export types for backward compatibility
export type { ContentIdea, ContentIdeaFilters } from '@/types/contentIdeas';