import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function createNotification(userId: string, title: string, message: string, entityType: string, entityId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: 'error',
        related_entity_type: entityType,
        related_entity_id: entityId
      });

    if (error) {
      console.error('Error creating notification:', error);
    } else {
      console.log(`Created notification for user ${userId}: ${title}`);
    }
  } catch (err) {
    console.error('Exception creating notification:', err);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting submission timeout check...');
    
    let requestBody: any = {};
    if (req.method === 'POST') {
      try {
        requestBody = await req.json();
      } catch (e) {
        console.log('No JSON body or invalid JSON, proceeding with empty body');
      }
    }

    const isAutomatedCheck = requestBody.automated === true;
    console.log(`Timeout check initiated - Automated: ${isAutomatedCheck}`);

    // Call the database function to check for timed out submissions
    const { data, error } = await supabase.rpc('force_check_timed_out_submissions');
    
    if (error) {
      console.error('Error checking for timed out submissions:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to check timeouts', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Timeout check result:', data);

    let processedCount = 0;
    let failedSubmissions: any[] = [];

    if (data && data.length > 0) {
      const result = data[0];
      processedCount = result.updated_count || 0;
      failedSubmissions = result.failed_submissions || [];

      console.log(`Found ${processedCount} timed-out submissions`);

      // Create notifications for each failed submission
      for (const submission of failedSubmissions) {
        if (submission.user_id) {
          await createNotification(
            submission.user_id,
            'Content Processing Timeout',
            `Content processing for "${submission.knowledge_base || 'Unknown'}" has timed out after 30 minutes. Please try submitting again.`,
            'submission',
            submission.id
          );
        }
      }
    }

    const response = {
      success: true,
      message: processedCount > 0 
        ? `Found and updated ${processedCount} timed-out submission(s)`
        : 'No timed-out submissions found',
      processedCount,
      failedSubmissions,
      automated: isAutomatedCheck,
      timestamp: new Date().toISOString()
    };

    console.log('Submission timeout check completed:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in submission timeout monitor:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});