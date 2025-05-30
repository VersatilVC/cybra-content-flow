
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  console.log('Idea callback function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log('Callback raw body:', body);
    
    const callbackData = JSON.parse(body);
    console.log('Callback received:', callbackData);

    const { type, content_idea_id, status, suggestions_count } = callbackData;

    if (!content_idea_id) {
      console.error('Missing content_idea_id in callback');
      return new Response(
        JSON.stringify({ 
          error: 'Missing content_idea_id in callback',
          details: 'content_idea_id is required for idea callbacks'
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle different types of callbacks
    if (type === 'content_suggestions_ready') {
      console.log(`Processing content suggestions completion for idea: ${content_idea_id}`);
      
      // Update the content idea status to 'processed'
      const { data: updatedIdea, error: updateError } = await supabase
        .from('content_ideas')
        .update({ 
          status: 'processed',
          updated_at: new Date().toISOString()
        })
        .eq('id', content_idea_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating content idea:', updateError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update content idea',
            details: updateError.message 
          }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Content idea updated successfully:', updatedIdea);

      // Optionally create a notification for the user
      if (updatedIdea) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: updatedIdea.user_id,
              title: 'Content Suggestions Ready',
              message: `${suggestions_count || 'Several'} content suggestions have been generated for "${updatedIdea.title}"`,
              type: 'success'
            });
          console.log('Notification created for user');
        } catch (notifError) {
          console.error('Failed to create notification:', notifError);
          // Don't fail the whole operation for notification errors
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Content idea callback processed successfully',
          idea_id: content_idea_id,
          status: 'processed'
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle other callback types if needed
    console.log('Unknown callback type:', type);
    return new Response(
      JSON.stringify({ 
        error: 'Unknown callback type',
        details: `Callback type '${type}' is not supported`
      }), 
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Idea callback function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
