
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchContentDerivatives, 
  createContentDerivative, 
  updateContentDerivative, 
  deleteContentDerivative,
  ContentDerivative,
  CreateContentDerivativeData 
} from '@/services/contentDerivativesApi';
import { updateContentItem } from '@/services/contentItemsApi';
import { logger } from '@/utils/logger';

export function useContentDerivatives(contentItemId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: derivatives = [], isLoading, error } = useQuery({
    queryKey: ['content-derivatives', contentItemId],
    queryFn: () => fetchContentDerivatives(contentItemId),
    enabled: !!contentItemId && !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: createContentDerivative,
    onSuccess: async (newDerivative) => {
      // Update the content item status to derivatives_created if it's not already
      try {
        const contentItemResponse = await queryClient.fetchQuery({
          queryKey: ['content-item', contentItemId],
          queryFn: async () => {
            const { data } = await import('@/integrations/supabase/client').then(mod => 
              mod.supabase.from('content_items').select('*').eq('id', contentItemId).single()
            );
            return data;
          }
        });

        if (contentItemResponse && contentItemResponse.status === 'ready_for_review') {
          await updateContentItem(contentItemId, { status: 'derivatives_created' });
          // Invalidate content item queries to reflect the status change
          queryClient.invalidateQueries({ queryKey: ['content-item', contentItemId] });
          queryClient.invalidateQueries({ queryKey: ['content-items'] });
        }
      } catch (error) {
        logger.error('Failed to update content item status:', error);
      }

      queryClient.invalidateQueries({ queryKey: ['content-derivatives', contentItemId] });
      toast({
        title: 'Derivative created',
        description: 'Your content derivative has been created successfully.',
      });
    },
    onError: (error: Error) => {
      logger.error('Create derivative error:', error);
      toast({
        title: 'Failed to create derivative',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ContentDerivative> }) => 
      updateContentDerivative(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-derivatives', contentItemId] });
      toast({
        title: 'Derivative updated',
        description: 'Your content derivative has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      logger.error('Update derivative error:', error);
      toast({
        title: 'Failed to update derivative',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContentDerivative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-derivatives', contentItemId] });
      toast({
        title: 'Derivative deleted',
        description: 'Your content derivative has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      logger.error('Delete derivative error:', error);
      toast({
        title: 'Failed to delete derivative',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    derivatives,
    isLoading,
    error,
    createDerivative: createMutation.mutate,
    updateDerivative: updateMutation.mutate,
    deleteDerivative: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
