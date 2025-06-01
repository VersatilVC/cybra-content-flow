
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
    console.log('Triggering idea_engine webhook');
    await triggerWebhook('idea_engine', webhookPayload);
    console.log('Webhook triggered successfully');
  } catch (webhookError) {
    console.error('Webhook trigger failed:', webhookError);
    // Don't fail the whole operation if webhook fails
  }
}
