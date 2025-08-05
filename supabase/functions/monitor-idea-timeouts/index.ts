import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createNotification({
  user_id,
  title,
  message,
  type,
  related_entity_id,
  related_entity_type,
}: {
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_entity_id?: string | null;
  related_entity_type?: 'submission' | 'idea' | 'brief' | 'content_item' | null;
}) {
  try {
    const notificationData = {
      user_id: user_id,
      title: title,
      message: message,
      type: type,
      related_entity_id: related_entity_id,
      related_entity_type: related_entity_type || 'idea',
    };

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationData);

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
    } else {
      console.log('Notification created successfully:', title);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestBody = req.method === 'POST' ? await req.json() : {};
  const isAutomatedCheck = requestBody.automated_check === true;
  
  console.log(`Starting timeout monitoring for content ideas... ${isAutomatedCheck ? '(Automated)' : '(Manual)'}`);

  try {
    // Query for ideas that have timed out
    const { data: timedOutIdeas, error: queryError } = await supabase
      .from('content_ideas')
      .select('id, user_id, title, retry_count, processing_started_at, processing_timeout_at')
      .eq('status', 'processing')
      .lt('processing_timeout_at', new Date().toISOString());

    console.log(`Checking for timed out ideas. Current time: ${new Date().toISOString()}`);

    if (queryError) {
      console.error('Error querying timed out ideas:', queryError);
      return new Response(JSON.stringify({ error: 'Database query failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!timedOutIdeas || timedOutIdeas.length === 0) {
      console.log('No timed out ideas found');
      return new Response(JSON.stringify({ 
        message: 'No timed out ideas found',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${timedOutIdeas.length} timed out ideas`);

    if (timedOutIdeas.length > 0) {
      // Log detailed information about timed out ideas
      timedOutIdeas.forEach(idea => {
        const processingDuration = idea.processing_started_at 
          ? Math.round((new Date().getTime() - new Date(idea.processing_started_at).getTime()) / (1000 * 60))
          : 'unknown';
        console.log(`Timed out idea: ${idea.id} - "${idea.title}" (retry: ${idea.retry_count || 0}, processing for: ${processingDuration} minutes)`);
      });
    }

    // Update timed out ideas to failed status
    const ideaIds = timedOutIdeas.map(idea => idea.id);
    
    const { error: updateError } = await supabase
      .from('content_ideas')
      .update({
        status: 'failed',
        last_error_message: 'Processing timed out after 30 minutes - please try again',
        processing_timeout_at: null,
        processing_started_at: null,
        updated_at: new Date().toISOString()
      })
      .in('id', ideaIds);

    if (updateError) {
      console.error('Error updating timed out ideas:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update timed out ideas' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create failure notifications for users
    for (const idea of timedOutIdeas) {
      try {
        await createNotification({
          user_id: idea.user_id,
          title: 'Idea Processing Failed',
          message: `Your idea "${idea.title}" failed to process within 30 minutes. Please try again.`,
          type: 'error',
          related_entity_id: idea.id,
          related_entity_type: 'idea'
        });
      } catch (notificationError) {
        console.error(`Failed to create notification for idea ${idea.id}:`, notificationError);
      }
    }

    console.log(`Successfully processed ${timedOutIdeas.length} timed out ideas`);

    return new Response(JSON.stringify({ 
      message: 'Timeout monitoring completed',
      processed: timedOutIdeas.length,
      failed_ideas: timedOutIdeas.map(idea => ({
        id: idea.id,
        title: idea.title,
        retry_count: idea.retry_count
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in timeout monitoring:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});