import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { triggerContentProcessingWebhook } from '@/services/secureWebhookService';

export function useRetryContentItemCreation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const retryContentItemMutation = useMutation({
    mutationFn: async (contentItemId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Retrying content item creation:', contentItemId);
      
      // Get current content item data
      const { data: contentItem, error: itemError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentItemId)
        .single();

      if (itemError || !contentItem) {
        throw new Error('Content item not found or access denied');
      }

      if (contentItem.status !== 'failed') {
        throw new Error('Only failed content items can be retried');
      }

      // Check retry limit
      if (contentItem.retry_count >= 3) {
        throw new Error('Maximum retry attempts (3) reached for this content item');
      }

      // Find associated brief if exists
      let briefId = contentItem.content_brief_id;
      
      if (!briefId && contentItem.submission_id) {
        // Try to find brief through submission
        const { data: submission } = await supabase
          .from('content_submissions')
          .select('*')
          .eq('id', contentItem.submission_id)
          .single();
          
        if (submission) {
          // Find brief associated with this submission
          const { data: brief } = await supabase
            .from('content_briefs')
            .select('id')
            .eq('submission_id', submission.id)
            .single();
            
          if (brief) {
            briefId = brief.id;
          }
        }
      }

      if (!briefId) {
        throw new Error('No associated brief found for this content item');
      }

      // Reset content item to processing state
      const { error: updateError } = await supabase
        .from('content_items')
        .update({
          status: 'processing',
          processing_started_at: new Date().toISOString(),
          processing_timeout_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          last_error_message: null,
          retry_count: contentItem.retry_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentItemId);

      if (updateError) {
        console.error('Error updating content item for retry:', updateError);
        throw updateError;
      }

      // Also update associated brief to processing if it's in failed state
      const { data: brief } = await supabase
        .from('content_briefs')
        .select('status, retry_count')
        .eq('id', briefId)
        .single();

      if (brief && brief.status === 'failed') {
        await supabase
          .from('content_briefs')
          .update({
            status: 'processing',
            processing_started_at: new Date().toISOString(),
            processing_timeout_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            last_error_message: null,
            retry_count: brief.retry_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', briefId);
      }

      // Trigger processing webhook
      try {
        await triggerContentProcessingWebhook(briefId, user.id);
        console.log('Content item retry processing triggered successfully');
      } catch (webhookError) {
        console.error('Error triggering retry webhook:', webhookError);
        // Revert content item status if webhook fails
        await supabase
          .from('content_items')
          .update({
            status: 'failed',
            processing_started_at: null,
            processing_timeout_at: null,
            last_error_message: 'Failed to trigger retry processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', contentItemId);
        
        throw new Error('Failed to trigger retry processing');
      }

      return { contentItemId, retryCount: contentItem.retry_count + 1 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      queryClient.invalidateQueries({ queryKey: ['content-briefs'] });
      
      toast({
        title: 'Retry initiated',
        description: `Content creation retry #${result.retryCount} has been started.`,
      });
      
      console.log('Content item retry initiated successfully:', result);
    },
    onError: (error) => {
      console.error('Failed to retry content item creation:', error);
      toast({
        title: 'Retry failed',
        description: error instanceof Error ? error.message : 'Failed to retry content creation',
        variant: 'destructive',
      });
    },
  });

  return {
    retryContentItemCreation: retryContentItemMutation.mutate,
    isRetrying: retryContentItemMutation.isPending,
  };
}