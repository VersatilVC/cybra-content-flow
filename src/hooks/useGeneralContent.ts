
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    data: generalContent = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['general-content', filters],
    queryFn: () => fetchGeneralContent(filters),
  });

  const createMutation = useMutation({
    mutationFn: createGeneralContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-content'] });
      toast({
        title: "Success",
        description: "General content created successfully",
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

  return {
    generalContent,
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
