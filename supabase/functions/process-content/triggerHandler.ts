
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
    console.log('Processing content creation submission - N8N will handle content storage');
    
    await updateSubmissionStatus(supabase, submissionId, 'processing', {
      webhook_triggered_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Content creation processing started - N8N will handle content generation and storage',
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

  // Prepare webhook payload
  const payload: WebhookPayload = {
    submission_id: submission.id,
    user_id: submission.user_id,
    knowledge_base: submission.knowledge_base,
    content_type: submission.content_type,
    file_url: submission.file_path 
      ? `https://uejgjytmqpcilwfrlpai.supabase.co/storage/v1/object/public/knowledge-base-files/${submission.file_path}` 
      : submission.file_url,
    original_filename: submission.original_filename,
    file_size: submission.file_size,
    mime_type: submission.mime_type,
    timestamp: new Date().toISOString()
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
