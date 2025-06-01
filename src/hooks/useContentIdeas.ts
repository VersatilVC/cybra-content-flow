
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { ContentIdeaFilters } from '@/types/contentIdeas';
import { fetchContentIdeas } from '@/services/contentIdeasApi';
import { useIdeaMutations } from '@/hooks/useIdeaMutations';
import { useBriefCreation } from '@/hooks/useBriefCreation';

export function useContentIdeas(filters?: ContentIdeaFilters) {
  const { user } = useAuth();

  const { data: ideas = [], isLoading, error } = useQuery({
    queryKey: ['content-ideas', user?.id, filters],
    queryFn: () => fetchContentIdeas(user?.id || '', filters),
    enabled: !!user?.id,
  });

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
