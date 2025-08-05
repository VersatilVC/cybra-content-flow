import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentIdea } from '@/types/contentIdeas';
import { updateContentIdea } from '@/services/contentIdeasApi';
import { triggerIdeaWebhooks } from '@/lib/webhookHandlers';

export function useRetryIdea() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const retryIdeaMutation = useMutation({
    mutationFn: async (idea: ContentIdea) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if idea has exceeded maximum retry attempts
      const maxRetries = 3;
      const currentRetries = idea.retry_count || 0;
      
      if (currentRetries >= maxRetries) {
        throw new Error(`Maximum retry attempts (${maxRetries}) exceeded. Please create a new idea.`);
      }

      console.log(`Retrying content idea: ${idea.id} (attempt ${currentRetries + 1}/${maxRetries})`);
      
      // Set processing timestamps and increment retry count
      const now = new Date();
      const timeout = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
      
      const updatedIdea = await updateContentIdea(idea.id, {
        status: 'processing',
        processing_started_at: now.toISOString(),
        processing_timeout_at: timeout.toISOString(),
        retry_count: currentRetries + 1,
        last_error_message: null
      });

      // Type cast the updated idea for webhook
      const typedIdea: ContentIdea = {
        ...idea,
        status: 'processing',
        processing_started_at: now.toISOString(),
        processing_timeout_at: timeout.toISOString(),
        retry_count: (idea.retry_count || 0) + 1,
        last_error_message: null,
        updated_at: new Date().toISOString()
      };

      // Trigger webhooks for the retry
      await triggerIdeaWebhooks(typedIdea, user.id);

      return updatedIdea;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      toast({
        title: 'Retry initiated',
        description: 'Your content idea is being processed again.',
      });
    },
    onError: (error) => {
      console.error('Failed to retry idea:', error);
      toast({
        title: 'Failed to retry idea',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    retryIdea: retryIdeaMutation.mutate,
    isRetrying: retryIdeaMutation.isPending,
  };
}