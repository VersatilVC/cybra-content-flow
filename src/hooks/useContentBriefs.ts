
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
  const { user, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('useContentBriefs Debug:', {
    userId: user?.id,
    hasSession: !!session,
    sessionExpiry: session?.expires_at,
    filters
  });

  const { data: briefs = [], isLoading, error } = useQuery({
    queryKey: ['content-briefs', user?.id, filters],
    queryFn: async () => {
      console.log('Fetching content briefs...');
      try {
        const result = await fetchContentBriefs(user?.id || '', filters);
        console.log('Content briefs fetched successfully:', result.length);
        return result;
      } catch (err) {
        console.error('Error fetching content briefs:', err);
        throw err;
      }
    },
    enabled: !!user?.id && !!session,
    retry: (failureCount, error) => {
      console.log('Query retry attempt:', failureCount, error);
      // Retry up to 2 times for network errors, but not for auth errors
      if (failureCount < 2 && !error.message.includes('auth') && !error.message.includes('JWT')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
      console.error('Create brief error:', error);
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
      console.error('Update brief error:', error);
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
      console.error('Delete brief error:', error);
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
  const { user, session } = useAuth();
  
  return useQuery({
    queryKey: ['content-brief', sourceId, sourceType],
    queryFn: () => getBriefBySourceId(sourceId, sourceType),
    enabled: !!sourceId && !!user?.id && !!session,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors, but not for auth errors
      if (failureCount < 2 && !error.message.includes('auth') && !error.message.includes('JWT')) {
        return true;
      }
      return false;
    },
  });
}
