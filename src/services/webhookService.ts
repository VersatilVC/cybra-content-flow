import { supabase } from '@/integrations/supabase/client';

export const triggerWebhook = async (webhookType: string, payload: any) => {
  console.log(`Triggering webhook type: ${webhookType}`);
  
  const webhooks = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('webhook_type', webhookType)
    .eq('is_active', true);

  if (webhooks.data && webhooks.data.length > 0) {
    for (const webhook of webhooks.data) {
      try {
        console.log(`Calling webhook: ${webhook.webhook_url}`);
        await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        console.log(`Webhook ${webhook.name} triggered successfully`);
      } catch (webhookError) {
        console.error(`Webhook ${webhook.name} error:`, webhookError);
      }
    }
  } else {
    console.log(`No active webhooks found for type: ${webhookType}`);
    throw new Error(`No active ${webhookType} webhook configured. Please set up a webhook in the Webhooks section.`);
  }
};

import { getCallbackUrl, getEdgeFunctionUrl } from '@/config/environment';

// Helper function to get the callback URL for idea processing
export const getIdeaCallbackUrl = () => {
  return getCallbackUrl('process-idea-callback');
};

// Trigger content processing webhook when creating content items
export const triggerContentProcessingWebhook = async (briefId: string, userId: string) => {
  try {
    console.log('Creating content submission record for brief:', briefId);
    
    // First, get the brief details for context
    const { data: brief, error: briefError } = await supabase
      .from('content_briefs')
      .select('title, brief_type, target_audience')
      .eq('id', briefId)
      .single();

    if (briefError || !brief) {
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
      console.error('Error fetching webhook configurations:', webhookError);
      throw new Error(`Webhook configuration error: ${webhookError.message}`);
    }

    if (webhooks && webhooks.length > 0) {
      // Use N8N webhook for content processing
      console.log('Found content_processing webhooks, triggering N8N workflow');
      
      const payload = {
        submission_id: submission.id,
        type: 'content_creation',
        brief_id: briefId, // Include brief ID in payload
        user_id: userId,
        brief_title: brief.title,
        brief_type: brief.brief_type,
        target_audience: brief.target_audience,
        timestamp: new Date().toISOString(),
        // Add callback information for N8N
        callback_url: `${getIdeaCallbackUrl()}`,
        callback_data: {
          type: 'content_item_completion',
          submission_id: submission.id,
          user_id: userId,
          title: brief.title
        }
      };

      console.log('Triggering N8N webhook with payload:', payload);
      
      // Trigger the N8N webhook using the existing triggerWebhook function
      await triggerWebhook('content_processing', payload);
      
      // Update submission status to indicate webhook was triggered
      await supabase
        .from('content_submissions')
        .update({ 
          processing_status: 'processing',
          webhook_triggered_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      console.log('N8N webhook triggered successfully');
      return submission.id;
    } else {
      // Fallback to direct edge function call if no webhook is configured
      console.log('No content_processing webhooks found, falling back to edge function');
      
      const triggerUrl = getEdgeFunctionUrl('process-content', 'action=trigger');

      const payload = {
        submissionId: submission.id,
        type: 'content_creation',
        brief_id: briefId, // Include brief ID in payload
        user_id: userId,
        brief_title: brief.title,
        brief_type: brief.brief_type,
        target_audience: brief.target_audience,
        timestamp: new Date().toISOString(),
      };

      console.log('Triggering process-content function with payload:', payload);
      
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

      console.log('Edge function triggered successfully');
      return submission.id;
    }
  } catch (error) {
    console.error('Content processing failed:', error);
    throw error;
  }
};
