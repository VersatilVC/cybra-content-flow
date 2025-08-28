
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
  let webhook: { webhook_url: string };
  if (submission.knowledge_base === 'general_content') {
    try {
      webhook = await getWebhookConfiguration(supabase, 'general_content');
      console.log('Selected general_content webhook');
    } catch (e) {
      console.warn('No general_content webhook configured, falling back to knowledge_base', e?.message || e);
      webhook = await getWebhookConfiguration(supabase, 'knowledge_base');
    }
  } else {
    webhook = await getWebhookConfiguration(supabase, 'knowledge_base');
  }

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

  // Optionally enrich payload from general_content_items
  let generalContent: any = null;
  if (body.general_content_id) {
    try {
      const { data, error } = await supabase
        .from('general_content_items')
        .select('id, title, category, derivative_type, derivative_types, content_type, source_type, source_data, target_audience, content, file_url, file_path, file_size, mime_type, internal_name')
        .eq('id', body.general_content_id)
        .single();
      if (error) {
        console.warn('Failed to load general_content_items for enrichment:', error.message);
      } else {
        generalContent = data;
        console.log('Enriched general_content_items loaded for payload:', { id: data.id });
      }
    } catch (err) {
      console.warn('Error querying general_content_items:', err?.message || err);
    }
  }

  // Compute entry details based on generalContent
  let entryType: string | undefined = body.source_type || generalContent?.source_type;
  let entryValue: string | undefined = undefined;
  if (generalContent) {
    if (entryType === 'manual') {
      entryValue = generalContent.content || undefined;
    } else if (entryType === 'url') {
      entryValue = generalContent.source_data?.url || undefined;
    } else if (entryType === 'file') {
      entryValue = generalContent.file_url || generalContent.file_path || undefined;
    }
  }

  // Construct webhook payload with all available data
  const payload: WebhookPayload = {
    submission_id: submission.id,
    user_id: submission.user_id,
    knowledge_base: submission.knowledge_base,
    content_type: body.content_type || generalContent?.content_type || submission.content_type,
    file_url: fileUrl,
    original_filename: submission.original_filename,
    file_size: submission.file_size,
    mime_type: submission.mime_type,
    timestamp: new Date().toISOString(),
    ...(body.general_content_id && { general_content_id: body.general_content_id }),
    title: body.title || generalContent?.title,
    category: body.category || generalContent?.category,
    derivative_types: body.derivative_types || generalContent?.derivative_types || (generalContent?.derivative_type ? [generalContent.derivative_type] : undefined),
    source_type: entryType as any,
    source_data: body.source_data || generalContent?.source_data,
    target_audience: body.target_audience || generalContent?.target_audience,
    description: generalContent?.content || undefined,
    entry_type: entryType as any,
    entry_value: entryValue,
    internal_name: body.internal_name || generalContent?.internal_name,
  };

  console.log('Final webhook payload (sanitized preview):', {
    submission_id: payload.submission_id,
    user_id: payload.user_id,
    knowledge_base: payload.knowledge_base,
    general_content_id: payload.general_content_id,
    title: payload.title,
    category: payload.category,
    derivative_types: payload.derivative_types,
    content_type: payload.content_type,
    source_type: payload.source_type,
    internal_name: payload.internal_name,
  });

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
