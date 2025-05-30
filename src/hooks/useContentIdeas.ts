
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentIdea, ContentIdeaFilters, CreateContentIdeaData } from '@/types/contentIdeas';
import { 
  fetchContentIdeas, 
  createContentIdea, 
  updateContentIdea, 
  deleteContentIdea 
} from '@/services/contentIdeasApi';
import { triggerWebhook } from '@/services/webhookService';

export function useContentIdeas(filters?: ContentIdeaFilters) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading, error } = useQuery({
    queryKey: ['content-ideas', user?.id, filters],
    queryFn: () => fetchContentIdeas(user?.id || '', filters),
    enabled: !!user?.id,
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (ideaData: CreateContentIdeaData) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Creating content idea:', ideaData);
      const data = await createContentIdea(user.id, ideaData);
      
      // Trigger webhook for idea engine
      try {
        console.log('Triggering idea_engine webhook');
        await triggerWebhook('idea_engine', {
          type: 'idea_submission',
          idea: data,
          user_id: user.id,
          timestamp: new Date().toISOString(),
        });
        console.log('Webhook triggered successfully');
      } catch (webhookError) {
        console.error('Webhook trigger failed:', webhookError);
        // Don't fail the whole operation if webhook fails
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

  const createBriefMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      // Update idea status
      await updateIdeaMutation.mutateAsync({
        id: ideaId,
        updates: { status: 'brief_created' }
      });

      // Trigger webhook for brief creator
      const idea = ideas.find(i => i.id === ideaId);
      await triggerWebhook('brief_creator', {
        type: 'brief_creation',
        idea: idea,
        user_id: user?.id,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      toast({
        title: 'Brief creation started',
        description: 'The content brief is being created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create brief',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    ideas,
    isLoading,
    error,
    createIdea: createIdeaMutation.mutate,
    updateIdea: updateIdeaMutation.mutate,
    deleteIdea: deleteIdeaMutation.mutate,
    createBrief: createBriefMutation.mutate,
    isCreating: createIdeaMutation.isPending,
    isUpdating: updateIdeaMutation.isPending,
    isDeleting: deleteIdeaMutation.isPending,
    isCreatingBrief: createBriefMutation.isPending,
  };
}

// Re-export types for backward compatibility
export type { ContentIdea, ContentIdeaFilters } from '@/types/contentIdeas';
