
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

    const { type, content_idea_id, source_id, status, suggestions_count, brief_id, user_id, title, brief_type, target_audience } = callbackData;

    // Accept either content_idea_id or source_id for flexibility
    const ideaId = content_idea_id || source_id;

    if (!ideaId) {
      console.error('Missing content_idea_id or source_id in callback');
      return new Response(
        JSON.stringify({ 
          error: 'Missing content_idea_id or source_id in callback',
          details: 'Either content_idea_id or source_id is required for idea callbacks'
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle different types of callbacks
    if (type === 'content_suggestions_ready') {
      console.log(`Processing content suggestions completion for idea: ${ideaId}`);
      
      // Update the content idea status to 'processed'
      const { data: updatedIdea, error: updateError } = await supabase
        .from('content_ideas')
        .update({ 
          status: 'processed',
          updated_at: new Date().toISOString()
        })
        .eq('id', ideaId)
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

      // Create a notification for the user
      if (updatedIdea) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: updatedIdea.user_id,
              title: 'Content Suggestions Ready',
              message: `${suggestions_count || 'Several'} content suggestions have been generated for "${updatedIdea.title}"`,
              type: 'success',
              related_submission_id: ideaId
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
          idea_id: ideaId,
          status: 'processed'
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (type === 'brief_completion') {
      console.log(`Processing brief completion for idea: ${ideaId}, brief: ${brief_id}`);
      
      if (status === 'success') {
        // Update the content idea status to 'brief_created'
        const { data: updatedIdea, error: updateError } = await supabase
          .from('content_ideas')
          .update({ 
            status: 'brief_created',
            updated_at: new Date().toISOString()
          })
          .eq('id', ideaId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating content idea for brief completion:', updateError);
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

        console.log('Content idea updated for brief completion:', updatedIdea);

        // Create a notification for the user about brief completion
        if (user_id) {
          try {
            await supabase
              .from('notifications')
              .insert({
                user_id: user_id,
                title: 'Content Brief Ready',
                message: `Your content brief "${title}" has been created successfully and is ready for review.`,
                type: 'success',
                related_submission_id: ideaId
              });
            console.log('Brief completion notification created for user');
          } catch (notifError) {
            console.error('Failed to create brief completion notification:', notifError);
            // Don't fail the whole operation for notification errors
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Brief completion callback processed successfully',
            idea_id: ideaId,
            brief_id: brief_id,
            status: 'brief_created'
          }), 
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        // Handle failed brief creation
        console.error('Brief creation failed:', callbackData);
        
        if (user_id) {
          try {
            await supabase
              .from('notifications')
              .insert({
                user_id: user_id,
                title: 'Content Brief Creation Failed',
                message: `Failed to create content brief for "${title}". Please try again.`,
                type: 'error',
                related_submission_id: ideaId
              });
            console.log('Brief failure notification created for user');
          } catch (notifError) {
            console.error('Failed to create brief failure notification:', notifError);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Brief creation failed',
            idea_id: ideaId,
            error: callbackData.error || 'Unknown error'
          }), 
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
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
