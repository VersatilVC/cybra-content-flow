
import { supabase } from '@/integrations/supabase/client';
import { secureWebhookTrigger } from '@/lib/secureWebhookHandler';
import { logSecurityEvent } from '@/lib/security';

// Re-export the secure webhook trigger as the main trigger function
export const triggerWebhook = secureWebhookTrigger;

import { getCallbackUrl, getEdgeFunctionUrl } from '@/config/environment';

// Helper function to get the callback URL for idea processing
export const getIdeaCallbackUrl = () => {
  return getCallbackUrl('process-idea-callback');
};

// Enhanced content processing webhook with security
export const triggerContentProcessingWebhook = async (briefId: string, userId: string) => {
  try {
    console.log('Creating secure content submission record for brief:', briefId);
    
    // First, get the brief details for context
    const { data: brief, error: briefError } = await supabase
      .from('content_briefs')
      .select('title, brief_type, target_audience')
      .eq('id', briefId)
      .single();

    if (briefError || !brief) {
      logSecurityEvent('brief_fetch_failed', { briefId, error: briefError?.message }, userId);
      throw new Error(`Failed to fetch brief details: ${briefError?.message}`);
    }

    // Create a content submission record
    const { data: submission, error: submissionError } = await supabase
      .from('content_submissions')
      .insert({
        user_id: userId,
        knowledge_base: 'content_creation',
        content_type: brief.brief_type,
        processing_status: 'queued',
        file_url: null,
        original_filename: `${brief.title} - Content Creation`,
      })
      .select()
      .single();

    if (submissionError || !submission) {
      logSecurityEvent('submission_creation_failed', { 
        briefId, 
        error: submissionError?.message 
      }, userId);
      throw new Error(`Failed to create submission record: ${submissionError?.message}`);
    }

    console.log('Content submission created:', submission.id);

    // Check for active content_processing webhooks (N8N)
    const { data: webhooks, error: webhookError } = await supabase
      .from('webhook_configurations')
      .select('*')
      .eq('webhook_type', 'content_processing')
      .eq('is_active', true);

    if (webhookError) {
      logSecurityEvent('webhook_config_fetch_failed', { 
        webhookType: 'content_processing',
        error: webhookError.message 
      }, userId);
      throw new Error(`Webhook configuration error: ${webhookError.message}`);
    }

    if (webhooks && webhooks.length > 0) {
      // Use N8N webhook for content processing
      console.log('Found content_processing webhooks, triggering secure N8N workflow');
      
      const payload = {
        type: 'content_creation',
        submission_id: submission.id,
        brief_id: briefId,
        user_id: userId,
        brief_title: brief.title,
        brief_type: brief.brief_type,
        target_audience: brief.target_audience,
        timestamp: new Date().toISOString(),
        callback_url: `${getIdeaCallbackUrl()}`,
        callback_data: {
          type: 'content_item_completion',
          submission_id: submission.id,
          user_id: userId,
          title: brief.title
        }
      };

      console.log('Triggering secure N8N webhook with payload:', payload);
      
      // Trigger the secure webhook
      await triggerWebhook('content_processing', payload, userId);
      
      // Update submission status to indicate webhook was triggered
      await supabase
        .from('content_submissions')
        .update({ 
          processing_status: 'processing',
          webhook_triggered_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      logSecurityEvent('content_processing_webhook_triggered', { 
        submissionId: submission.id,
        briefId 
      }, userId);

      console.log('Secure N8N webhook triggered successfully');
      return submission.id;
    } else {
      // Fallback to direct edge function call if no webhook is configured
      console.log('No content_processing webhooks found, falling back to edge function');
      
      const triggerUrl = getEdgeFunctionUrl('process-content', 'action=trigger');

      const payload = {
        submissionId: submission.id,
        type: 'content_creation',
        brief_id: briefId,
        user_id: userId,
        brief_title: brief.title,
        brief_type: brief.brief_type,
        target_audience: brief.target_audience,
        timestamp: new Date().toISOString(),
      };

      console.log('Triggering secure process-content function with payload:', payload);
      
      const response = await fetch(triggerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logSecurityEvent('edge_function_failed', { 
          submissionId: submission.id,
          status: response.status,
          error: errorText 
        }, userId);
        throw new Error(`Process-content function failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Process-content function result:', result);
      
      // Update submission status to indicate function was triggered
      await supabase
        .from('content_submissions')
        .update({ 
          processing_status: 'processing',
          webhook_triggered_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      logSecurityEvent('edge_function_triggered', { 
        submissionId: submission.id,
        briefId 
      }, userId);

      console.log('Edge function triggered successfully');
      return submission.id;
    }
  } catch (error) {
    logSecurityEvent('content_processing_failed', { 
      briefId,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, userId);
    console.error('Content processing failed:', error);
    throw error;
  }
};
