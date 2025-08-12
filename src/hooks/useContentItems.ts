
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchContentItems, 
  fetchContentItemsByBrief,
  createContentItem, 
  updateContentItem, 
  deleteContentItem,
  ContentItem,
  CreateContentItemData,
  ContentItemFilters,
} from '@/services/contentItemsApi';
import { logger } from '@/utils/logger';

export function useContentItems(
  filters?: ContentItemFilters,
  options?: { page?: number; pageSize?: number }
) {
  const { user } = useOptimizedAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['content-items', user?.id, filters, options],
    queryFn: () => fetchContentItems(user?.id || '', filters, options),
    enabled: !!user?.id,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (failureCount < 2 && !error.message.includes('auth') && !error.message.includes('JWT')) {
        return true;
      }
      return false;
    },
  });

  // Prefetch next page if pagination options provided
  useEffect(() => {
    if (user?.id && options?.page && options?.pageSize) {
      const nextOptions = { ...options, page: options.page + 1 };
      queryClient.prefetchQuery({
        queryKey: ['content-items', user.id, filters, nextOptions],
        queryFn: () => fetchContentItems(user.id, filters, nextOptions),
      });
    }
  }, [user?.id, options?.page, options?.pageSize, queryClient, JSON.stringify(filters)]);

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
      logger.error('Create content item error:', error);
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
      logger.error('Update content item error:', error);
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
      logger.error('Delete content item error:', error);
      toast({
        title: 'Failed to delete content item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    contentItems: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
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
  const { user } = useOptimizedAuthContext();

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
