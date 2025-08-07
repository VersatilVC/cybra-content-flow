import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCallbackUrl } from '@/config/environment';
import { useToast } from '@/hooks/use-toast';

export const useGeneralContentRetry = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const retryMutation = useMutation({
    mutationFn: async (generalContentId: string) => {
      console.log('Retrying general content:', generalContentId);
      
      // Get the general content item
      const { data: item, error: fetchError } = await supabase
        .from('general_content_items')
        .select('*')
        .eq('id', generalContentId)
        .single();

      if (fetchError || !item) {
        throw new Error('Failed to fetch general content for retry');
      }

      // Reset status to draft to indicate processing
      const { error: updateError } = await supabase
        .from('general_content_items')
        .update({ 
          status: 'draft',
          metadata: {},
          updated_at: new Date().toISOString()
        })
        .eq('id', generalContentId);

      if (updateError) {
        throw new Error('Failed to update general content status');
      }

      // Get active webhook configuration
      const { data: webhooks, error: webhookError } = await supabase
        .from('webhook_configurations')
        .select('*')
        .eq('webhook_type', 'knowledge_base')
        .eq('is_active', true);

      if (webhookError || !webhooks?.length) {
        throw new Error('No active webhook configuration found');
      }

      const webhook = webhooks[0];

      // Prepare retry payload
      const payload = {
        type: 'general_content_submission',
        general_content_id: item.id,
        user_id: item.user_id,
        title: item.title,
        content: item.content,
        derivative_type: item.derivative_type,
        derivative_types: item.derivative_types || [item.derivative_type],
        category: item.category,
        source_type: item.source_type,
        source_data: item.source_data,
        target_audience: item.target_audience,
        content_type: item.content_type,
        file_url: item.file_url,
        file_path: item.file_path,
        timestamp: new Date().toISOString(),
        callback_url: getCallbackUrl('process-idea-callback'),
        callback_data: {
          type: 'general_content_processing_complete',
          general_content_id: item.id,
          user_id: item.user_id,
          title: item.title
        }
      };

      // Trigger webhook
      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Webhook failed with status ${response.status}: ${responseText}`);
      }

      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-content'] });
      toast({
        title: "Retry Initiated",
        description: "General content processing has been restarted. You will be notified when it's ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Retry Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    retryGeneralContent: retryMutation.mutate,
    isRetrying: retryMutation.isPending,
  };
};