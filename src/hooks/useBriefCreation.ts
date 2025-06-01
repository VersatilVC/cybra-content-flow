
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentIdea } from '@/types/contentIdeas';
import { updateContentIdea } from '@/services/contentIdeasApi';
import { triggerWebhook } from '@/services/webhookService';

export function useBriefCreation(ideas: ContentIdea[]) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBriefMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      // Update idea status
      await updateContentIdea(ideaId, { status: 'brief_created' });

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
    createBrief: createBriefMutation.mutate,
    isCreatingBrief: createBriefMutation.isPending,
  };
}
