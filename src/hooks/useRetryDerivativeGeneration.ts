import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useRetryDerivativeGeneration() {
  const { user } = useOptimizedAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const retryDerivativeMutation = useMutation({
    mutationFn: async (derivativeId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Retrying derivative generation:', derivativeId);
      
      // Get current derivative data
      const { data: derivative, error: derivativeError } = await supabase
        .from('content_derivatives')
        .select('*')
        .eq('id', derivativeId)
        .single();

      if (derivativeError || !derivative) {
        throw new Error('Derivative not found or access denied');
      }

      if (derivative.status !== 'failed') {
        throw new Error('Only failed derivatives can be retried');
      }

      // Check retry limit
      if (derivative.retry_count >= 3) {
        throw new Error('Maximum retry attempts (3) reached for this derivative');
      }

      // Reset derivative to processing state
      const { error: updateError } = await supabase
        .from('content_derivatives')
        .update({
          status: 'processing',
          processing_started_at: new Date().toISOString(),
          processing_timeout_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          last_error_message: null,
          retry_count: derivative.retry_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', derivativeId);

      if (updateError) {
        console.error('Error updating derivative for retry:', updateError);
        throw updateError;
      }

      // Trigger derivative generation webhook or edge function
      try {
        // Get derivative generation webhooks
        const { data: webhooks } = await supabase
          .from('webhook_configurations')
          .select('*')
          .eq('webhook_type', 'derivative_generation')
          .eq('is_active', true);

        if (webhooks && webhooks.length > 0) {
          // Use webhook if available
          const webhook = webhooks[0];
          const payload = {
            user_id: user.id,
            derivative_id: derivativeId,
            content_item_id: derivative.content_item_id,
            derivative_type: derivative.derivative_type,
            category: derivative.category,
            title: derivative.title,
            content: derivative.content,
            metadata: derivative.metadata,
            callback_url: `https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/process-idea-callback`,
            retry_attempt: derivative.retry_count + 1
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
          // Fallback to edge function (if you have one for derivatives)
          console.log('No derivative generation webhook found, using direct processing');
          
          // For now, we'll just mark it as queued and let the system handle it
          // In a real implementation, you might have a dedicated edge function
          await supabase
            .from('content_derivatives')
            .update({
              status: 'draft', // Reset to draft for manual regeneration
              processing_started_at: null,
              processing_timeout_at: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', derivativeId);
            
          return { 
            derivativeId, 
            retryCount: derivative.retry_count + 1, 
            method: 'manual_reset' 
          };
        }

        console.log('Derivative retry processing triggered successfully');
      } catch (webhookError) {
        console.error('Error triggering derivative retry:', webhookError);
        // Revert derivative status if webhook fails
        await supabase
          .from('content_derivatives')
          .update({
            status: 'failed',
            processing_started_at: null,
            processing_timeout_at: null,
            last_error_message: 'Failed to trigger retry processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', derivativeId);
        
        throw new Error('Failed to trigger retry processing');
      }

      return { 
        derivativeId, 
        retryCount: derivative.retry_count + 1,
        method: 'webhook'
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content-derivatives'] });
      
      const message = result.method === 'manual_reset' 
        ? `Derivative has been reset to draft status for manual regeneration.`
        : `Derivative generation retry #${result.retryCount} has been started.`;
      
      toast({
        title: 'Retry initiated',
        description: message,
      });
      
      console.log('Derivative retry initiated successfully:', result);
    },
    onError: (error) => {
      console.error('Failed to retry derivative generation:', error);
      toast({
        title: 'Retry failed',
        description: error instanceof Error ? error.message : 'Failed to retry derivative generation',
        variant: 'destructive',
      });
    },
  });

  return {
    retryDerivativeGeneration: retryDerivativeMutation.mutate,
    isRetrying: retryDerivativeMutation.isPending,
  };
}