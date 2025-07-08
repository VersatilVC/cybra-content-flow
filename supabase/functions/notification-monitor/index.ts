
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

const supabaseUrl = Deno.env.get('PROJECT_URL')!;
const supabaseKey = Deno.env.get('PROJECT_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  console.log('Notification monitor called');
  
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Check for completed content ideas without notifications
    await checkMissingIdeaNotifications();
    
    // Check for completed content items without notifications
    await checkMissingContentItemNotifications();
    
    // Check for completed submissions without notifications
    await checkMissingSubmissionNotifications();

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification monitor completed successfully'
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Notification monitor error:', error);
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

async function checkMissingIdeaNotifications() {
  console.log('Checking for missing idea notifications...');
  
  // Find processed ideas updated in last 24 hours without recent notifications
  const { data: ideas, error } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('status', 'processed')
    .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching ideas:', error);
    return;
  }

  for (const idea of ideas || []) {
    // Check if there's already a notification for this idea
    const { data: existingNotifications, error: notifError } = await supabase
      .from('notifications')
      .select('id')
      .eq('related_submission_id', idea.id)
      .eq('type', 'success')
      .gte('created_at', idea.updated_at);

    if (notifError) {
      console.error('Error checking notifications:', notifError);
      continue;
    }

    if (!existingNotifications || existingNotifications.length === 0) {
      console.log(`Creating missing notification for idea: ${idea.id}`);
      
      // Create the missing notification
      await supabase
        .from('notifications')
        .insert({
          user_id: idea.user_id,
          title: 'Content Suggestions Ready',
          message: `Your idea "${idea.title}" has been processed and content suggestions are ready for review.`,
          type: 'success',
          related_submission_id: idea.id
        });
    }
  }
}

async function checkMissingContentItemNotifications() {
  console.log('Checking for missing content item notifications...');
  
  // Find content items created in last 24 hours
  const { data: contentItems, error } = await supabase
    .from('content_items')
    .select('*')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching content items:', error);
    return;
  }

  for (const item of contentItems || []) {
    // Check if there's already a notification for this content item
    const { data: existingNotifications, error: notifError } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', item.user_id)
      .eq('type', 'success')
      .like('message', `%content item ${item.id}%`)
      .gte('created_at', item.created_at);

    if (notifError) {
      console.error('Error checking content item notifications:', notifError);
      continue;
    }

    if (!existingNotifications || existingNotifications.length === 0) {
      console.log(`Creating missing notification for content item: ${item.id}`);
      
      // Create the missing notification
      await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: 'Content Processing Complete',
          message: `Your content item "${item.title}" has been successfully generated (content item ${item.id}) and is ready for review.`,
          type: 'success'
        });
    }
  }
}

async function checkMissingSubmissionNotifications() {
  console.log('Checking for missing submission notifications...');
  
  // Find completed submissions in last 24 hours
  const { data: submissions, error } = await supabase
    .from('content_submissions')
    .select('*')
    .eq('processing_status', 'completed')
    .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching submissions:', error);
    return;
  }

  for (const submission of submissions || []) {
    // Check if there's already a notification for this submission
    const { data: existingNotifications, error: notifError } = await supabase
      .from('notifications')
      .select('id')
      .eq('related_submission_id', submission.id)
      .eq('type', 'success')
      .gte('created_at', submission.updated_at);

    if (notifError) {
      console.error('Error checking submission notifications:', notifError);
      continue;
    }

    if (!existingNotifications || existingNotifications.length === 0) {
      console.log(`Creating missing notification for submission: ${submission.id}`);
      
      let title, message;
      if (submission.knowledge_base === 'content_creation') {
        title = 'Content Processing Complete';
        message = `Your content "${submission.original_filename}" has been successfully processed and is ready for review.`;
      } else {
        title = 'Knowledge Base Processing Complete';
        message = `Your file "${submission.original_filename}" has been successfully processed and added to the ${submission.knowledge_base} knowledge base.`;
      }
      
      // Create the missing notification
      await supabase
        .from('notifications')
        .insert({
          user_id: submission.user_id,
          title: title,
          message: message,
          type: 'success',
          related_submission_id: submission.id
        });
    }
  }
}
