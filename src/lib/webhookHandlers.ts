import { supabase } from '@/integrations/supabase/client';
import { triggerWebhook } from '@/services/webhookService';
import { ContentIdea } from '@/types/contentIdeas';
import { getCallbackUrl } from '@/config/environment';

export async function triggerIdeaWebhooks(idea: ContentIdea, userId: string) {
  // Prepare webhook payload with flexible typing
  let webhookPayload: Record<string, any> = {
    type: 'idea_submission',
    idea: idea,
    user_id: userId,
    timestamp: new Date().toISOString(),
    // Add callback URL for N8N to call when processing is complete
    callback_url: getCallbackUrl('process-idea-callback'),
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
      const fileDownloadUrl = await generateSignedFileUrl(sourceData, userId);
      
      if (fileDownloadUrl) {
        webhookPayload.file_download_url = fileDownloadUrl;
        // Also replace any invalid URL in source_data with the working signed URL
        if (webhookPayload.idea && webhookPayload.idea.source_data) {
          webhookPayload.idea.source_data.url = fileDownloadUrl;
        }
        console.log('Added signed file download URL to webhook payload for content-files bucket');
      } else {
        console.warn('Could not generate signed URL for file:', sourceData.filename);
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

/**
 * Enhanced function to generate signed URLs with fallback logic for user ID extraction
 */
async function generateSignedFileUrl(sourceData: Record<string, any>, sessionUserId: string): Promise<string | null> {
  const filename = sourceData.filename as string;
  const filePath = sourceData.path as string;
  
  // Strategy 1: Use the path to extract the correct user ID
  let userIdForPath = sessionUserId;
  if (filePath && filePath.includes('/')) {
    const pathUserId = filePath.split('/')[0];
    if (pathUserId && pathUserId.length === 36) { // UUID length check
      userIdForPath = pathUserId;
      console.log('Extracted user ID from path:', pathUserId, 'for file:', filename);
    }
  }
  
  try {
    // Try with path-derived user ID first
    const { data: signedUrlData, error } = await supabase.storage
      .from('content-files')
      .createSignedUrl(`${userIdForPath}/${filename}`, 3600); // 1 hour expiry
    
    if (signedUrlData?.signedUrl && !error) {
      console.log('Successfully generated signed URL using path-derived user ID');
      
      // Validate the URL actually works
      if (await validateSignedUrl(signedUrlData.signedUrl)) {
        return signedUrlData.signedUrl;
      }
    }
    
    console.warn('Signed URL generation failed with path-derived user ID:', error?.message);
  } catch (error) {
    console.error('Error generating signed URL with path-derived user ID:', error);
  }
  
  // Strategy 2: Fallback to session user ID if path extraction failed
  if (userIdForPath !== sessionUserId) {
    try {
      const { data: signedUrlData, error } = await supabase.storage
        .from('content-files')
        .createSignedUrl(`${sessionUserId}/${filename}`, 3600);
      
      if (signedUrlData?.signedUrl && !error) {
        console.log('Successfully generated signed URL using session user ID as fallback');
        
        // Validate the URL actually works
        if (await validateSignedUrl(signedUrlData.signedUrl)) {
          return signedUrlData.signedUrl;
        }
      }
      
      console.warn('Fallback signed URL generation failed:', error?.message);
    } catch (error) {
      console.error('Error generating signed URL with session user ID:', error);
    }
  }
  
  // Strategy 3: Try using the full path directly if it's available
  if (filePath) {
    try {
      const { data: signedUrlData, error } = await supabase.storage
        .from('content-files')
        .createSignedUrl(filePath, 3600);
      
      if (signedUrlData?.signedUrl && !error) {
        console.log('Successfully generated signed URL using full path');
        
        // Validate the URL actually works
        if (await validateSignedUrl(signedUrlData.signedUrl)) {
          return signedUrlData.signedUrl;
        }
      }
      
      console.warn('Direct path signed URL generation failed:', error?.message);
    } catch (error) {
      console.error('Error generating signed URL with direct path:', error);
    }
  }
  
  console.error('All strategies failed to generate a valid signed URL for file:', filename);
  return null;
}

/**
 * Validate that a signed URL actually works by making a HEAD request
 */
async function validateSignedUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('URL validation failed:', error);
    return false;
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
    callback_url: getCallbackUrl('process-idea-callback'),
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
    callback_url: getCallbackUrl('process-idea-callback'),
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
