
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";
import {
  handleIdeaProcessingCallback,
  handleBriefCreationCallback,
  handleContentCreationCallback,
  handleAutoGenerationCallback,
  handleWordPressPublishingCallback,
  handleDerivativeGenerationCallback,
  handleContentItemFixCallback,
  handleDerivativeGenerationSubmissionCallback,
  handleGeneralContentProcessingCallback
} from "./handlers.ts";

serve(async (req) => {
  console.log('Enhanced callback function called with method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate the request body
    const rawBody = await req.text();
    console.log('Callback raw body:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Callback received:', body);

    // Basic validation - check for required type field
    if (!body.type) {
      return new Response(
        JSON.stringify({ error: 'Missing type field in callback data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send immediate response to N8N to prevent timeout
    const immediateResponse = new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Callback received and processing started',
        type: body.type,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

    // Process the callback in the background
    EdgeRuntime.waitUntil(processCallbackInBackground(body));

    return immediateResponse;

  } catch (error) {
    console.error('Process idea callback error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processCallbackInBackground(body: any) {
  console.log('Starting background processing for callback type:', body.type);
  
  try {
    const supabase = createClient(
      Deno.env.get('PROJECT_URL')!,
      Deno.env.get('PROJECT_SERVICE_ROLE_KEY')!
    );

    // Route to appropriate handler based on callback type
    switch (body.type) {
      case 'idea_processing_complete':
        await handleIdeaProcessingCallback(supabase, body);
        break;
      
      case 'brief_completion':
        await handleBriefCreationCallback(supabase, body);
        break;
      
      case 'content_item_completion':
        await handleContentCreationCallback(supabase, body);
        break;
      
      case 'auto_generation_complete':
        await handleAutoGenerationCallback(supabase, body);
        break;
      
      case 'wordpress_publishing_complete':
      case 'wordpress_publishing_failed':
        await handleWordPressPublishingCallback(supabase, body);
        break;
      
      case 'derivative_generation_complete':
      case 'derivative_generation_failed':
        await handleDerivativeGenerationCallback(supabase, body);
        break;
      
      case 'content_item_fix_complete':
      case 'content_item_fix_failed':
        await handleContentItemFixCallback(supabase, body);
        break;
      
      case 'general_content_processing_complete':
        await handleGeneralContentProcessingCallback(supabase, body);
        break;
      
      default:
        // Check if this is a submission-based callback for derivative generation
        if (body.submission_id && body.content_item_id) {
          console.log('Processing submission-based derivative generation callback');
          await handleDerivativeGenerationSubmissionCallback(supabase, body);
        } else {
          console.warn('Unknown callback type received:', body.type);
        }
        break;
    }

    console.log('Background processing completed successfully for type:', body.type);
  } catch (error) {
    console.error('Background processing failed for type:', body.type, error);
    // Log the error but don't throw - we've already responded to the client
  }
}
