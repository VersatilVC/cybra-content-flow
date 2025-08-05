
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { ContentIdeaFilters } from '@/types/contentIdeas';
import { fetchContentIdeas } from '@/services/contentIdeasApi';
import { useIdeaMutations } from '@/hooks/useIdeaMutations';
import { useBriefCreation } from '@/hooks/useBriefCreation';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export function useContentIdeas(filters?: ContentIdeaFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['content-ideas', user?.id, filters],
    queryFn: () => fetchContentIdeas(user?.id || '', filters),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds to catch status updates
    refetchIntervalInBackground: true,
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
