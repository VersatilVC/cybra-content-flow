
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
    const action = url.searchParams.get('action') || 'trigger'; // Default to 'trigger' for POST requests

    console.log('Process content function called with action:', action);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    if (action === 'trigger') {
      // Handle content submission webhook trigger
      let body;
      
      try {
        const bodyText = await req.text();
        console.log('Raw request body:', bodyText);
        console.log('Body text length:', bodyText.length);
        
        if (!bodyText || bodyText.trim() === '') {
          throw new Error('Request body is empty');
        }
        
        body = JSON.parse(bodyText);
        console.log('Parsed request body:', body);
      } catch (error) {
        console.error('Error parsing request body:', error);
        if (error.message === 'Request body is empty') {
          throw new Error('No request body provided. Please ensure the request includes a valid JSON body with submissionId.');
        }
        throw new Error(`Invalid JSON in request body: ${error.message}`);
      }

      const { submissionId } = body;
      
      if (!submissionId) {
        throw new Error('Missing submissionId in request body');
      }

      console.log('Processing content submission:', submissionId);

      // Get submission details
      const { data: submission, error: submissionError } = await supabase
        .from('content_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (submissionError) {
        console.error('Error fetching submission:', submissionError);
        throw new Error(`Submission not found: ${submissionError.message}`);
      }

      if (!submission) {
        throw new Error('Submission not found');
      }

      console.log('Found submission:', submission);

      // Get webhook configuration for knowledge base processing
      const { data: webhook, error: webhookError } = await supabase
        .from('webhook_configurations')
        .select('webhook_url')
        .eq('webhook_type', 'knowledge_base')
        .eq('is_active', true)
        .maybeSingle();

      if (webhookError) {
        console.error('Error fetching webhook configuration:', webhookError);
        throw new Error(`Webhook configuration error: ${webhookError.message}`);
      }

      if (!webhook?.webhook_url) {
        console.log('No active knowledge base webhook configured');
        throw new Error('No active knowledge base webhook configured. Please set up a webhook in the Webhooks section.');
      }

      console.log('Using webhook URL:', webhook.webhook_url);

      // Update submission status to processing
      const { error: updateError } = await supabase
        .from('content_submissions')
        .update({ 
          processing_status: 'processing',
          webhook_triggered_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (updateError) {
        console.error('Error updating submission status:', updateError);
        throw new Error(`Failed to update submission status: ${updateError.message}`);
      }

      // Prepare webhook payload
      const payload = {
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

      console.log('Triggering webhook with payload:', JSON.stringify(payload, null, 2));

      // Trigger the webhook
      try {
        const webhookResponse = await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('Webhook response status:', webhookResponse.status);
        
        if (!webhookResponse.ok) {
          const responseText = await webhookResponse.text();
          console.error('Webhook response error:', responseText);
          throw new Error(`Webhook failed with status ${webhookResponse.status}: ${responseText}`);
        }

        console.log('Webhook triggered successfully');
      } catch (webhookError) {
        console.error('Error calling webhook:', webhookError);
        
        // Update submission status to failed
        await supabase
          .from('content_submissions')
          .update({ 
            processing_status: 'failed',
            error_message: `Webhook error: ${webhookError.message}`
          })
          .eq('id', submissionId);

        throw new Error(`Failed to trigger webhook: ${webhookError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook triggered successfully',
          submission_id: submissionId 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'callback') {
      // Handle processing completion callback
      let body;
      try {
        const bodyText = await req.text();
        console.log('Callback raw body:', bodyText);
        
        if (!bodyText || bodyText.trim() === '') {
          throw new Error('Callback body is empty');
        }
        
        body = JSON.parse(bodyText);
        console.log('Callback received:', body);
      } catch (error) {
        console.error('Error parsing callback body:', error);
        throw new Error('Invalid JSON in callback body');
      }

      const { submission_id, status, error_message, content_data } = body;
      
      if (!submission_id) {
        throw new Error('Missing submission_id in callback');
      }

      console.log('Processing callback for submission:', submission_id, 'with status:', status);

      // Get submission details
      const { data: submission, error: submissionError } = await supabase
        .from('content_submissions')
        .select('*')
        .eq('id', submission_id)
        .single();

      if (submissionError || !submission) {
        throw new Error(`Submission not found: ${submissionError?.message}`);
      }

      // Update submission status
      const updateData: any = {
        processing_status: status || 'completed',
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
        console.error('Error updating submission:', updateError);
        throw new Error(`Failed to update submission: ${updateError.message}`);
      }

      // If this is a content creation submission and it's completed, create the content item
      if (status === 'completed' && submission.knowledge_base === 'content_creation' && content_data) {
        console.log('Creating content item from callback data:', content_data);
        
        try {
          // Find the associated content brief (if any)
          const { data: brief } = await supabase
            .from('content_briefs')
            .select('id')
            .eq('user_id', submission.user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Create the content item
          const contentItemData = {
            user_id: submission.user_id,
            content_brief_id: brief?.id || null,
            submission_id: submission_id,
            title: content_data.title || submission.original_filename || 'Generated Content',
            content: content_data.content || null,
            summary: content_data.summary || null,
            tags: content_data.tags || null,
            resources: content_data.resources || null,
            multimedia_suggestions: content_data.multimedia_suggestions || null,
            content_type: content_data.content_type || submission.content_type,
            status: 'draft',
            word_count: content_data.word_count || null,
          };

          const { data: contentItem, error: contentError } = await supabase
            .from('content_items')
            .insert(contentItemData)
            .select()
            .single();

          if (contentError) {
            console.error('Error creating content item:', contentError);
            throw new Error(`Failed to create content item: ${contentError.message}`);
          }

          console.log('Content item created successfully:', contentItem.id);

          // Update the associated brief status if we found one
          if (brief?.id) {
            await supabase
              .from('content_briefs')
              .update({ status: 'content_created' })
              .eq('id', brief.id);
          }

        } catch (contentError) {
          console.error('Error creating content item:', contentError);
          // Don't fail the callback if content item creation fails
        }
      }

      // Create notification with proper handling
      const contentName = submission.original_filename || submission.file_url || 'Content';
      
      const notificationTitle = status === 'completed' 
        ? 'Content Processing Complete'
        : 'Content Processing Failed';
      
      const notificationMessage = status === 'completed'
        ? submission.knowledge_base === 'content_creation'
          ? `Your content item "${contentName}" has been successfully generated and is ready for review.`
          : `"${contentName}" has been successfully processed and added to the ${submission.knowledge_base} knowledge base.`
        : `Failed to process "${contentName}". ${error_message || 'Please try again.'}`;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: submission.user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: status === 'completed' ? 'success' : 'error',
          related_submission_id: submission_id
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      } else {
        console.log('Notification created successfully');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Callback processed successfully',
          submission_id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action parameter. Use ?action=trigger or ?action=callback' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Process content function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
