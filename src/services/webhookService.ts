
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
  }
};

// Helper function to get the callback URL for idea processing
export const getIdeaCallbackUrl = () => {
  const supabaseUrl = 'https://uejgjytmqpcilwfrlpai.supabase.co';
  return `${supabaseUrl}/functions/v1/process-idea-callback`;
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
        knowledge_base: 'content_creation', // Special knowledge base for content creation
        content_type: brief.brief_type,
        processing_status: 'queued',
        file_url: null, // No file for content creation
        original_filename: `${brief.title} - Content Creation`,
      })
      .select()
      .single();

    if (submissionError || !submission) {
      throw new Error(`Failed to create submission record: ${submissionError?.message}`);
    }

    console.log('Content submission created:', submission.id);

    // Get the process-content function URL with proper action parameter
    const supabaseUrl = 'https://uejgjytmqpcilwfrlpai.supabase.co';
    const triggerUrl = `${supabaseUrl}/functions/v1/process-content?action=trigger`;

    // Prepare webhook payload for the process-content function
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

    console.log('Triggering process-content function with payload:', payload);
    
    // Call the process-content function directly
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

    console.log('Content processing triggered successfully');
    return submission.id;
  } catch (error) {
    console.error('Content processing failed:', error);
    throw error;
  }
};
