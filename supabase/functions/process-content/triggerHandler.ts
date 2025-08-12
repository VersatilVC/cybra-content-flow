
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";
import { TriggerRequestBody, WebhookPayload } from "./types.ts";
import { getSubmission, updateSubmissionStatus } from "./submissionService.ts";
import { getWebhookConfiguration, triggerWebhook } from "./webhookService.ts";

export async function handleTriggerAction(
  supabase: SupabaseClient,
  body: TriggerRequestBody
): Promise<Response> {
  const { submissionId } = body;
  
  if (!submissionId) {
    throw new Error('Missing submissionId in request body');
  }

  console.log('Processing content submission:', submissionId);

  const submission = await getSubmission(supabase, submissionId);

  // For content creation submissions, just update status to processing
  // N8N will handle the actual content generation and storage
  if (submission.knowledge_base === 'content_creation') {
    console.log(`Processing ${submission.knowledge_base} submission - N8N will handle content storage`);
    
    await updateSubmissionStatus(supabase, submissionId, 'processing', {
      webhook_triggered_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${submission.knowledge_base} processing started - N8N will handle content generation and storage`,
        submission_id: submissionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // For other submission types, get webhook configuration
  const webhook = await getWebhookConfiguration(supabase, 'knowledge_base');

  console.log('Using webhook URL:', webhook.webhook_url);

  // Update submission status to processing
  await updateSubmissionStatus(supabase, submissionId, 'processing', {
    webhook_triggered_at: new Date().toISOString()
  });

  // Prepare webhook payload with correct bucket URL
  let fileUrl = submission.file_url;
  
  // Generate the correct file URL based on the submission type and bucket
  if (submission.file_path) {
    // For knowledge base submissions, files are stored in the public knowledge-base-files bucket
    if (submission.knowledge_base !== 'content_creation') {
      fileUrl = `https://agbcslwigqthrlxnqbmc.supabase.co/storage/v1/object/public/knowledge-base-files/${submission.file_path}`;
      console.log('Using public URL for knowledge-base-files bucket:', fileUrl);
    } else {
      // For content creation submissions, files might be in content-files bucket (private)
      // Generate signed URL for secure access
      try {
        const { data: signedUrlData } = await supabase.storage
          .from('content-files')
          .createSignedUrl(submission.file_path, 3600); // 1 hour expiry
        
        if (signedUrlData?.signedUrl) {
          fileUrl = signedUrlData.signedUrl;
          console.log('Generated signed URL for content-files bucket');
        }
      } catch (error) {
        console.error('Failed to generate signed URL for content-files:', error);
        // Fallback to the original file_url if available
      }
    }
  }

  // Add general_content_id if available from request body
  const payload: WebhookPayload = {
    submission_id: submission.id,
    user_id: submission.user_id,
    knowledge_base: submission.knowledge_base,
    content_type: submission.content_type,
    file_url: fileUrl,
    original_filename: submission.original_filename,
    file_size: submission.file_size,
    mime_type: submission.mime_type,
    timestamp: new Date().toISOString(),
    ...(body.general_content_id && { general_content_id: body.general_content_id })
  };

  try {
    await triggerWebhook(webhook.webhook_url, payload);
  } catch (webhookError) {
    // Update submission status to failed
    await updateSubmissionStatus(supabase, submissionId, 'failed', {
      error_message: `Webhook error: ${webhookError.message}`
    });
    throw webhookError;
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Webhook triggered successfully',
      submission_id: submissionId 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
