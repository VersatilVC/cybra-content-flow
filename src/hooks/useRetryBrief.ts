import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { triggerContentProcessingWebhook } from '@/services/secureWebhookService';

export function useRetryBrief() {
  const { user } = useOptimizedAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const retryBriefMutation = useMutation({
    mutationFn: async (briefId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Retrying content brief:', briefId);
      
      // Get current brief data
      const { data: brief, error: briefError } = await supabase
        .from('content_briefs')
        .select('*')
        .eq('id', briefId)
        .single();

      if (briefError || !brief) {
        throw new Error('Brief not found or access denied');
      }

      if (brief.status !== 'failed') {
        throw new Error('Only failed briefs can be retried');
      }

      // Check retry limit
      if (brief.retry_count >= 3) {
        throw new Error('Maximum retry attempts (3) reached for this brief');
      }

      // Reset brief to processing state
      const { error: updateError } = await supabase
        .from('content_briefs')
        .update({
          status: 'processing',
          processing_started_at: new Date().toISOString(),
          processing_timeout_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          last_error_message: null,
          retry_count: brief.retry_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', briefId);

      if (updateError) {
        console.error('Error updating brief for retry:', updateError);
        throw updateError;
      }

      // Trigger processing webhook
      try {
        await triggerContentProcessingWebhook(briefId, user.id);
        console.log('Brief retry processing triggered successfully');
      } catch (webhookError) {
        console.error('Error triggering retry webhook:', webhookError);
        // Revert brief status if webhook fails
        await supabase
          .from('content_briefs')
          .update({
            status: 'failed',
            processing_started_at: null,
            processing_timeout_at: null,
            last_error_message: 'Failed to trigger retry processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', briefId);
        
        throw new Error('Failed to trigger retry processing');
      }

      return { briefId, retryCount: brief.retry_count + 1 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content-briefs'] });
      
      toast({
        title: 'Retry initiated',
        description: `Brief processing retry #${result.retryCount} has been started.`,
      });
      
      console.log('Brief retry initiated successfully:', result);
    },
    onError: (error) => {
      console.error('Failed to retry brief:', error);
      toast({
        title: 'Retry failed',
        description: error instanceof Error ? error.message : 'Failed to retry brief processing',
        variant: 'destructive',
      });
    },
  });

  return {
    retryBrief: retryBriefMutation.mutate,
    isRetrying: retryBriefMutation.isPending,
  };
}