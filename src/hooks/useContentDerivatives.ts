
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

export function useContentDerivatives(contentItemId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: derivatives = [], isLoading, error } = useQuery({
    queryKey: ['content-derivatives', contentItemId],
    queryFn: () => fetchContentDerivatives(contentItemId),
    enabled: !!contentItemId && !!user?.id,
    retry: (failureCount, error) => {
      if (failureCount < 2 && !error.message.includes('auth') && !error.message.includes('JWT')) {
        return true;
      }
      return false;
    },
  });

  const createMutation = useMutation({
    mutationFn: createContentDerivative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-derivatives', contentItemId] });
      toast({
        title: 'Content derivative created',
        description: 'Your content derivative has been created successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Create content derivative error:', error);
      toast({
        title: 'Failed to create content derivative',
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
        title: 'Content derivative updated',
        description: 'Your content derivative has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Update content derivative error:', error);
      toast({
        title: 'Failed to update content derivative',
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
        title: 'Content derivative deleted',
        description: 'Your content derivative has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Delete content derivative error:', error);
      toast({
        title: 'Failed to delete content derivative',
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
