
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";
import { CallbackRequestBody } from "./types.ts";
import { getSubmission, updateSubmissionStatus, updateBriefStatus } from "./submissionService.ts";
import { createNotification } from "./notificationService.ts";

export async function handleCallbackAction(
  supabase: SupabaseClient,
  body: CallbackRequestBody
): Promise<Response> {
  const { submission_id, status, error_message, brief_id, content_item_id, general_content_id } = body;
  
  if (!submission_id) {
    throw new Error('Missing submission_id in callback');
  }

  console.log('Processing callback for submission:', submission_id, 'with status:', status);

  const submission = await getSubmission(supabase, submission_id);

  // Update submission status
  const additionalData: Record<string, any> = {};
  
  if (error_message) {
    additionalData.error_message = error_message;
  }

  await updateSubmissionStatus(supabase, submission_id, status || 'completed', additionalData);

  // If content creation completed successfully, update the associated brief status
  if (status === 'completed' && submission.knowledge_base === 'content_creation' && brief_id) {
    console.log('Updating brief status for completed content creation:', brief_id);
    await updateBriefStatus(supabase, brief_id, 'completed');
  }

  // If general content completed successfully, update the general content item status
  if (status === 'completed' && submission.knowledge_base === 'general_content' && general_content_id) {
    console.log('Updating general content status for completed processing:', general_content_id);
    try {
      await supabase
        .from('general_content_items')
        .update({ status: 'ready' })
        .eq('id', general_content_id);
    } catch (updateError) {
      console.error('Error updating general content status:', updateError);
      // Don't fail the callback if general content update fails
    }
  }

  // If processing failed, update the general content item status to failed
  if (status === 'failed' && submission.knowledge_base === 'general_content' && general_content_id) {
    console.log('Updating general content status to failed:', general_content_id);
    try {
      await supabase
        .from('general_content_items')
        .update({ status: 'failed' })
        .eq('id', general_content_id);
    } catch (updateError) {
      console.error('Error updating general content status to failed:', updateError);
    }
  }

  // Create notification with content item ID for direct linking
  await createNotification(
    supabase,
    submission.user_id,
    submission,
    status || 'completed',
    error_message,
    content_item_id || general_content_id // Pass the content item ID or general content ID for direct linking
  );

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Callback processed successfully',
      submission_id 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
