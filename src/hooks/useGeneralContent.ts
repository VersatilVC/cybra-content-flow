
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useEffect } from 'react';
import { 
  fetchGeneralContent, 
  createGeneralContent, 
  updateGeneralContent, 
  deleteGeneralContent 
} from '@/services/generalContentApi';
import { CreateGeneralContentRequest, GeneralContentFilters } from '@/types/generalContent';
import { useToast } from '@/hooks/use-toast';

export const useGeneralContent = (filters: GeneralContentFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['general-content', filters],
    queryFn: () => fetchGeneralContent(filters),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: createGeneralContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-content'] });
      toast({
        title: "Content Submitted",
        description: "Content submitted for processing. You'll be notified when it's ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGeneralContentRequest> }) =>
      updateGeneralContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-content'] });
      toast({
        title: "Success",
        description: "General content updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGeneralContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-content'] });
      toast({
        title: "Success",
        description: "General content deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    const currentPage = filters.page ?? 1;
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      const nextFilters = { ...filters, page: nextPage };
      queryClient.prefetchQuery({
        queryKey: ['general-content', nextFilters],
        queryFn: () => fetchGeneralContent(nextFilters),
      });
    }
  }, [filters, totalPages, queryClient]);

  return {
    generalContent: items,
    total,
    totalPages,
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 12,
    isLoading,
    error,
    createGeneralContent: createMutation.mutate,
    updateGeneralContent: updateMutation.mutate,
    deleteGeneralContent: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
