
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentIdea, CreateContentIdeaData } from '@/types/contentIdeas';
import { 
  createContentIdea, 
  updateContentIdea, 
  deleteContentIdea 
} from '@/services/contentIdeasApi';
import { handleFileUpload } from '@/lib/fileUploadHandler';
import { triggerIdeaWebhooks } from '@/lib/webhookHandlers';

export function useIdeaMutations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createIdeaMutation = useMutation({
    mutationFn: async (ideaData: CreateContentIdeaData & { file?: File }) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Creating content idea:', ideaData);
      
      // Handle file upload if present
      let finalIdeaData = { ...ideaData };
      delete finalIdeaData.file; // Remove file from idea data before saving to database
      
      if (ideaData.file && ideaData.source_type === 'file') {
        const uploadResult = await handleFileUpload(ideaData.file, user.id);
        finalIdeaData.source_data = uploadResult;
      }
      
      const rawData = await createContentIdea(user.id, finalIdeaData);
      
      // Type cast the response to ensure proper types for webhook
      const data: ContentIdea = {
        id: rawData.id,
        title: rawData.title,
        description: rawData.description,
        content_type: rawData.content_type as 'Blog Post' | 'Guide' | 'Blog Post (Topical)',
        target_audience: rawData.target_audience as 'Private Sector' | 'Government Sector',
        status: rawData.status as 'processing' | 'ready' | 'brief_created' | 'discarded',
        source_type: rawData.source_type as 'manual' | 'file' | 'url' | 'auto_generated',
        source_data: rawData.source_data,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at,
      };
      
      // Only trigger webhooks for non-auto-generated ideas (auto-generated ones handle their own webhooks)
      if (data.source_type !== 'auto_generated') {
        await triggerIdeaWebhooks(data, user.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      toast({
        title: 'Idea submitted successfully',
        description: 'Your content idea has been submitted and is being processed.',
      });
    },
    onError: (error) => {
      console.error('Failed to create idea:', error);
      toast({
        title: 'Failed to submit idea',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const updateIdeaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ContentIdea> }) => {
      console.log('Updating content idea:', id, updates);
      return await updateContentIdea(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      toast({
        title: 'Idea updated successfully',
        description: 'Your content idea has been updated.',
      });
    },
    onError: (error) => {
      console.error('Failed to update idea:', error);
      toast({
        title: 'Failed to update idea',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: deleteContentIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      toast({
        title: 'Idea discarded',
        description: 'The content idea has been discarded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to discard idea',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    createIdea: createIdeaMutation.mutate,
    updateIdea: updateIdeaMutation.mutate,
    deleteIdea: deleteIdeaMutation.mutate,
    isCreating: createIdeaMutation.isPending,
    isUpdating: updateIdeaMutation.isPending,
    isDeleting: deleteIdeaMutation.isPending,
  };
}
