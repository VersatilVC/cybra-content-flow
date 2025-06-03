
import { supabase } from '@/integrations/supabase/client';
import { triggerWebhook } from '@/services/webhookService';

export interface ContentItemFixRequest {
  contentItemId: string;
  userId: string;
  feedback: string;
  currentContent: string;
  title: string;
  contentIdeaId?: string;
  submissionId?: string;
}

export const triggerContentItemFixWebhook = async (fixRequest: ContentItemFixRequest) => {
  try {
    console.log('Triggering content item fix webhook for:', fixRequest.contentItemId);

    // Check for active content_item_fix webhooks
    const { data: webhooks, error: webhookError } = await supabase
      .from('webhook_configurations')
      .select('*')
      .eq('webhook_type', 'content_item_fix')
      .eq('is_active', true);

    if (webhookError) {
      console.error('Error fetching webhook configurations:', webhookError);
      throw new Error(`Webhook configuration error: ${webhookError.message}`);
    }

    if (webhooks && webhooks.length > 0) {
      const payload = {
        type: 'content_item_fix',
        content_item_id: fixRequest.contentItemId,
        content_idea_id: fixRequest.contentIdeaId,
        submission_id: fixRequest.submissionId,
        user_id: fixRequest.userId,
        feedback: fixRequest.feedback,
        current_content: fixRequest.currentContent,
        title: fixRequest.title,
        timestamp: new Date().toISOString(),
        callback_url: `https://uejgjytmqpcilwfrlpai.supabase.co/functions/v1/process-idea-callback`,
        callback_data: {
          type: 'content_item_fix_complete',
          content_item_id: fixRequest.contentItemId,
          content_idea_id: fixRequest.contentIdeaId,
          submission_id: fixRequest.submissionId,
          user_id: fixRequest.userId,
          title: fixRequest.title
        }
      };

      console.log('Triggering content item fix webhook with payload:', payload);
      
      await triggerWebhook('content_item_fix', payload);
      
      console.log('Content item fix webhook triggered successfully');
      return true;
    } else {
      console.log('No content_item_fix webhooks configured');
      throw new Error('No content item fix webhook configured. Please set up a webhook in the Webhooks section.');
    }
  } catch (error) {
    console.error('Content item fix webhook failed:', error);
    throw error;
  }
};
