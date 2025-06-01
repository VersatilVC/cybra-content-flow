
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentBriefFilters } from '@/types/contentBriefs';
import { 
  fetchContentBriefs, 
  createContentBrief, 
  updateContentBrief, 
  deleteContentBrief,
  getBriefBySourceId
} from '@/services/contentBriefsApi';

export function useContentBriefs(filters?: ContentBriefFilters) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: briefs = [], isLoading, error } = useQuery({
    queryKey: ['content-briefs', user?.id, filters],
    queryFn: () => fetchContentBriefs(user?.id || '', filters),
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: createContentBrief,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-briefs'] });
      toast({
        title: 'Brief created successfully',
        description: 'Your content brief has been created.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create brief',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateContentBrief(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-briefs'] });
      toast({
        title: 'Brief updated successfully',
        description: 'Your content brief has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update brief',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContentBrief,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-briefs'] });
      toast({
        title: 'Brief deleted successfully',
        description: 'Your content brief has been deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete brief',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    briefs,
    isLoading,
    error,
    createBrief: createMutation.mutate,
    updateBrief: updateMutation.mutate,
    deleteBrief: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useBriefBySource(sourceId: string, sourceType: 'idea' | 'suggestion') {
  return useQuery({
    queryKey: ['content-brief', sourceId, sourceType],
    queryFn: () => getBriefBySourceId(sourceId, sourceType),
    enabled: !!sourceId,
  });
}
