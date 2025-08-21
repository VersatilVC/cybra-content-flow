
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { ContentIdeaFilters } from '@/types/contentIdeas';
import { fetchContentIdeas } from '@/services/contentIdeasApi';
import { useIdeaMutations } from '@/hooks/useIdeaMutations';
import { useBriefCreation } from '@/hooks/useBriefCreation';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export function useContentIdeas(filters?: ContentIdeaFilters) {
  const { user } = useOptimizedAuthContext();
  const queryClient = useQueryClient();

  // DEBUGGING: Log hook initialization
  logger.info('🔍 useContentIdeas hook initialized:', {
    user: user ? { id: user.id, email: user.email } : null,
    filters,
    hasQueryClient: !!queryClient
  });

  const { data: ideas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['content-ideas', user?.id, filters],
    queryFn: async () => {
      logger.info('🔍 useContentIdeas: Fetching ideas for user:', user?.id);
      try {
        const result = await fetchContentIdeas(user?.id || '', filters);
        logger.info('🔍 useContentIdeas: Fetch successful, got ideas:', result?.length || 0);
        return result;
      } catch (err) {
        logger.error('🔍 useContentIdeas: Fetch failed:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds to catch status updates
    refetchIntervalInBackground: true,
  });

  // DEBUGGING: Log query state
  logger.info('🔍 useContentIdeas query state:', {
    ideasCount: ideas?.length || 0,
    isLoading,
    error: error?.message || null,
    enabled: !!user?.id
  });

  // Set up real-time subscription for content ideas updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('content-ideas-changes')
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
          // Invalidate and refetch the content ideas query
          queryClient.invalidateQueries({ queryKey: ['content-ideas', user.id] });
        }
      )
      .subscribe();

    return () => {
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
  };
}

// Re-export types for backward compatibility
export type { ContentIdea, ContentIdeaFilters } from '@/types/contentIdeas';
