import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function createNotification(
  user_id: string,
  title: string,
  message: string,
  entity_type: string,
  entity_id: string
) {
  try {
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user_id,
        title: title,
        message: message,
        type: 'error',
        related_entity_id: entity_id,
        related_entity_type: entity_type
      });

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
    } else {
      console.log('Notification created successfully for user:', user_id);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking for timed-out general content items...');

    // Parse request body for manual trigger info
    const isManualTrigger = req.method === 'POST';
    let requestBody: any = {};
    
    if (isManualTrigger) {
      try {
        requestBody = await req.json();
        console.log('Manual timeout check triggered', requestBody.automated ? 'automatically' : 'manually');
      } catch {
        console.log('Manual timeout check triggered with no body');
      }
    }

    // Call the database function to check for timed out general content
    const { data: result, error: rpcError } = await supabase.rpc('force_check_timed_out_general_content');

    if (rpcError) {
      console.error('Error calling force_check_timed_out_general_content:', rpcError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: rpcError.message,
          timeoutItems: 0,
          failedItems: []
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let timeoutCount = 0;
    let failedItems: any[] = [];

    if (result && result.length > 0) {
      const { updated_count, failed_items } = result[0];
      timeoutCount = updated_count || 0;
      failedItems = failed_items || [];

      console.log(`Found ${timeoutCount} timed-out general content items`);

      // Create notifications for each failed item
      for (const item of failedItems) {
        await createNotification(
          item.user_id,
          'General Content Processing Timeout',
          `Your general content "${item.title}" has timed out after 2 minutes. Please try again.`,
          'general_content',
          item.id
        );
      }
    }

    const response = {
      success: true,
      message: `General content timeout check completed`,
      timeoutItems: timeoutCount,
      failedItems: failedItems.map((item: any) => ({
        id: item.id,
        title: item.title,
        user_id: item.user_id
      }))
    };

    console.log('General content timeout check completed:', response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('General content timeout monitor error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred',
        timeoutItems: 0,
        failedItems: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});