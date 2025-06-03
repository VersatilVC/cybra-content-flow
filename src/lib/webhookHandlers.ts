import { supabase } from '@/integrations/supabase/client';
import { triggerWebhook } from '@/services/webhookService';
import { ContentIdea } from '@/types/contentIdeas';

export async function triggerIdeaWebhooks(idea: ContentIdea, userId: string) {
  // Prepare webhook payload with flexible typing
  let webhookPayload: Record<string, any> = {
    type: 'idea_submission',
    idea: idea,
    user_id: userId,
    timestamp: new Date().toISOString(),
    // Add callback URL for N8N to call when processing is complete
    callback_url: `${getCallbackBaseUrl()}/functions/v1/process-idea-callback`,
    callback_data: {
      type: 'idea_processing_complete',
      content_idea_id: idea.id,
      user_id: userId,
      title: idea.title
    }
  };

  // Add file download URL for file submissions
  if (idea.source_type === 'file' && idea.source_data && typeof idea.source_data === 'object' && idea.source_data !== null) {
    const sourceData = idea.source_data as Record<string, any>;
    if (sourceData.filename && typeof sourceData.filename === 'string') {
      try {
        const { data: signedUrlData } = await supabase.storage
          .from('content-files')
          .createSignedUrl(`${userId}/${sourceData.filename}`, 3600); // 1 hour expiry
        
        if (signedUrlData?.signedUrl) {
          webhookPayload.file_download_url = signedUrlData.signedUrl;
          console.log('Added file download URL to webhook payload');
        }
      } catch (error) {
        console.error('Failed to generate file download URL:', error);
        // Continue without the URL rather than failing the whole operation
      }
    }
  }
  
  // Trigger webhook for idea engine
  try {
    console.log('Triggering idea_engine webhook with callback info');
    await triggerWebhook('idea_engine', webhookPayload);
    console.log('Webhook triggered successfully');
  } catch (webhookError) {
    console.error('Webhook trigger failed:', webhookError);
    // Don't fail the whole operation if webhook fails
  }
}

export async function triggerBriefWebhooks(briefId: string, userId: string, ideaId?: string) {
  // Get brief details
  const { data: brief } = await supabase
    .from('content_briefs')
    .select('*')
    .eq('id', briefId)
    .single();

  if (!brief) {
    console.error('Brief not found for webhook trigger');
    return;
  }

  const webhookPayload = {
    type: 'brief_creation',
    brief_id: briefId,
    user_id: userId,
    idea_id: ideaId,
    brief: brief,
    timestamp: new Date().toISOString(),
    callback_url: `${getCallbackBaseUrl()}/functions/v1/process-idea-callback`,
    callback_data: {
      type: 'brief_completion',
      brief_id: briefId,
      content_idea_id: ideaId,
      user_id: userId,
      title: brief.title
    }
  };

  try {
    console.log('Triggering brief_creation webhook with callback info');
    await triggerWebhook('brief_creation', webhookPayload);
    console.log('Brief webhook triggered successfully');
  } catch (webhookError) {
    console.error('Brief webhook trigger failed:', webhookError);
  }
}

export async function triggerAutoGenerationWebhooks(userId: string, requestData: any) {
  const webhookPayload = {
    type: 'auto_generation',
    user_id: userId,
    content_idea_id: requestData.content_idea_id,
    content_idea_title: requestData.title,
    content_type: requestData.content_type,
    target_audience: requestData.target_audience,
    request_data: requestData,
    timestamp: new Date().toISOString(),
    callback_url: `${getCallbackBaseUrl()}/functions/v1/process-idea-callback`,
    callback_data: {
      type: 'auto_generation_complete',
      content_idea_id: requestData.content_idea_id,
      user_id: userId,
      title: requestData.title
    }
  };

  try {
    console.log('Triggering idea_auto_generator webhook with idea data:', webhookPayload);
    await triggerWebhook('idea_auto_generator', webhookPayload);
    console.log('Auto-generation webhook triggered successfully');
  } catch (webhookError) {
    console.error('Auto-generation webhook trigger failed:', webhookError);
    throw webhookError;
  }
}

function getCallbackBaseUrl(): string {
  return 'https://uejgjytmqpcilwfrlpai.supabase.co';
}
