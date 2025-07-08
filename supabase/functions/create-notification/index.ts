
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
  console.log('Manual notification creator called');
  
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const { user_id, title, message, type, related_submission_id } = await req.json();
    
    if (!user_id || !title || !message) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: user_id, title, message'
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create the notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user_id,
        title: title,
        message: message,
        type: type || 'info',
        related_submission_id: related_submission_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating manual notification:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create notification',
          details: error.message 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Manual notification created successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true,
        notification: data
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Manual notification creation error:', error);
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
