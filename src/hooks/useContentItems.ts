
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchContentItems, 
  fetchContentItemsByBrief,
  createContentItem, 
  updateContentItem, 
  deleteContentItem,
  ContentItem,
  CreateContentItemData
} from '@/services/contentItemsApi';

export function useContentItems() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contentItems = [], isLoading, error } = useQuery({
    queryKey: ['content-items', user?.id],
    queryFn: () => fetchContentItems(user?.id || ''),
    enabled: !!user?.id,
    retry: (failureCount, error) => {
      if (failureCount < 2 && !error.message.includes('auth') && !error.message.includes('JWT')) {
        return true;
      }
      return false;
    },
  });

  const createMutation = useMutation({
    mutationFn: createContentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      toast({
        title: 'Content item created',
        description: 'Your content item has been created successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Create content item error:', error);
      toast({
        title: 'Failed to create content item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ContentItem> }) => 
      updateContentItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      toast({
        title: 'Content item updated',
        description: 'Your content item has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Update content item error:', error);
      toast({
        title: 'Failed to update content item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      toast({
        title: 'Content item deleted',
        description: 'Your content item has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Delete content item error:', error);
      toast({
        title: 'Failed to delete content item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    contentItems,
    isLoading,
    error,
    createContentItem: createMutation.mutate,
    updateContentItem: updateMutation.mutate,
    deleteContentItem: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useContentItemsByBrief(briefId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['content-items-by-brief', briefId],
    queryFn: () => fetchContentItemsByBrief(briefId),
    enabled: !!briefId && !!user?.id,
    retry: (failureCount, error) => {
      if (failureCount < 2 && !error.message.includes('auth') && !error.message.includes('JWT')) {
        return true;
      }
      return false;
    },
  });
}
