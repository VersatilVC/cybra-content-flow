import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useRetryContentSuggestion() {
  const { user } = useOptimizedAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const retrySuggestionMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Retrying content suggestion:', suggestionId);
      
      // Get current suggestion data
      const { data: suggestion, error: suggestionError } = await supabase
        .from('content_suggestions')
        .select('*')
        .eq('id', suggestionId)
        .single();

      if (suggestionError || !suggestion) {
        throw new Error('Content suggestion not found or access denied');
      }

      if (suggestion.status !== 'failed') {
        throw new Error('Only failed suggestions can be retried');
      }

      // Check retry limit
      if (suggestion.retry_count >= 3) {
        throw new Error('Maximum retry attempts (3) reached for this suggestion');
      }

      // Reset suggestion to processing state
      const { error: updateError } = await supabase
        .from('content_suggestions')
        .update({
          status: 'processing',
          processing_started_at: new Date().toISOString(),
          processing_timeout_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          last_error_message: null,
          retry_count: suggestion.retry_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (updateError) {
        console.error('Error updating suggestion for retry:', updateError);
        throw updateError;
      }

      // Trigger suggestion enrichment webhook or edge function
      try {
        // Get suggestion enrichment webhooks
        const { data: webhooks } = await supabase
          .from('webhook_configurations')
          .select('*')
          .eq('webhook_type', 'content_enrichment')
          .eq('is_active', true);

        if (webhooks && webhooks.length > 0) {
          // Use webhook if available
          const webhook = webhooks[0];
          const payload = {
            user_id: user.id,
            suggestion_id: suggestionId,
            content_idea_id: suggestion.content_idea_id,
            title: suggestion.title,
            description: suggestion.description,
            content_type: suggestion.content_type,
            source_title: suggestion.source_title,
            source_url: suggestion.source_url,
            callback_url: `https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/process-idea-callback`,
            retry_attempt: suggestion.retry_count + 1
          };

          const response = await fetch(webhook.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`Webhook failed with status: ${response.status}`);
          }
        } else {
          // Fallback - reset to ready for manual processing
          console.log('No content enrichment webhook found, resetting to ready');
          
          await supabase
            .from('content_suggestions')
            .update({
              status: 'ready',
              processing_started_at: null,
              processing_timeout_at: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', suggestionId);
            
          return { 
            suggestionId, 
            retryCount: suggestion.retry_count + 1, 
            method: 'manual_reset' 
          };
        }

        console.log('Suggestion retry processing triggered successfully');
      } catch (webhookError) {
        console.error('Error triggering suggestion retry:', webhookError);
        // Revert suggestion status if webhook fails
        await supabase
          .from('content_suggestions')
          .update({
            status: 'failed',
            processing_started_at: null,
            processing_timeout_at: null,
            last_error_message: 'Failed to trigger retry processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', suggestionId);
        
        throw new Error('Failed to trigger retry processing');
      }

      return { 
        suggestionId, 
        retryCount: suggestion.retry_count + 1,
        method: 'webhook'
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content-suggestions'] });
      
      const message = result.method === 'manual_reset' 
        ? `Suggestion has been reset to ready status for manual processing.`
        : `Content suggestion retry #${result.retryCount} has been started.`;
      
      toast({
        title: 'Retry initiated',
        description: message,
      });
      
      console.log('Suggestion retry initiated successfully:', result);
    },
    onError: (error) => {
      console.error('Failed to retry content suggestion:', error);
      toast({
        title: 'Retry failed',
        description: error instanceof Error ? error.message : 'Failed to retry content suggestion',
        variant: 'destructive',
      });
    },
  });

  return {
    retryContentSuggestion: retrySuggestionMutation.mutate,
    isRetrying: retrySuggestionMutation.isPending,
  };
}