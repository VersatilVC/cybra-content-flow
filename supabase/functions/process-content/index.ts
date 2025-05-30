
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'trigger') {
      // Handle content submission webhook trigger
      const { submissionId } = await req.json();
      
      console.log('Processing content submission:', submissionId);

      // Get submission details
      const { data: submission, error: submissionError } = await supabase
        .from('content_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (submissionError || !submission) {
        throw new Error('Submission not found');
      }

      // Get webhook configuration
      const { data: webhook } = await supabase
        .from('webhook_configurations')
        .select('webhook_url')
        .eq('webhook_type', 'knowledge_base')
        .eq('is_active', true)
        .single();

      if (!webhook?.webhook_url) {
        throw new Error('No active webhook configured');
      }

      // Update submission status to processing
      await supabase
        .from('content_submissions')
        .update({ 
          processing_status: 'processing',
          webhook_triggered_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      // Prepare webhook payload
      const payload = {
        submission_id: submission.id,
        user_id: submission.user_id,
        knowledge_base: submission.knowledge_base,
        content_type: submission.content_type,
        file_url: submission.file_path ? `https://uejgjytmqpcilwfrlpai.supabase.co/storage/v1/object/public/knowledge-base-files/${submission.file_path}` : submission.file_url,
        original_filename: submission.original_filename,
        file_size: submission.file_size,
        mime_type: submission.mime_type,
        timestamp: new Date().toISOString()
      };

      console.log('Triggering webhook with payload:', payload);

      // Trigger the N8N webhook
      const webhookResponse = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.statusText}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Webhook triggered successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'callback') {
      // Handle processing completion callback from N8N
      const { submission_id, status, error_message } = await req.json();
      
      console.log('Processing callback:', { submission_id, status, error_message });

      // Update submission status
      const updateData: any = {
        processing_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (error_message) {
        updateData.error_message = error_message;
      }

      const { error: updateError } = await supabase
        .from('content_submissions')
        .update(updateData)
        .eq('id', submission_id);

      if (updateError) {
        throw updateError;
      }

      // Get submission details for notification
      const { data: submission } = await supabase
        .from('content_submissions')
        .select('user_id, original_filename, knowledge_base')
        .eq('id', submission_id)
        .single();

      if (submission) {
        // Create notification
        const notificationTitle = status === 'completed' 
          ? 'Content Processing Complete'
          : 'Content Processing Failed';
        
        const notificationMessage = status === 'completed'
          ? `"${submission.original_filename}" has been successfully processed and added to the ${submission.knowledge_base} knowledge base.`
          : `Failed to process "${submission.original_filename}". ${error_message || 'Please try again.'}`;

        await supabase
          .from('notifications')
          .insert({
            user_id: submission.user_id,
            title: notificationTitle,
            message: notificationMessage,
            type: status === 'completed' ? 'success' : 'error',
            related_submission_id: submission_id
          });
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Callback processed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
