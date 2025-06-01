
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflightRequest } from "./cors.ts";
import { TriggerRequestBody, CallbackRequestBody } from "./types.ts";
import { handleTriggerAction } from "./triggerHandler.ts";
import { handleCallbackAction } from "./callbackHandler.ts";
import { parseRequestBody } from "./requestParser.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'trigger';

    console.log('Process content function called with action:', action);
    console.log('Request method:', req.method);

    if (action === 'trigger') {
      const body = await parseRequestBody<TriggerRequestBody>(req, 'Request');
      return await handleTriggerAction(supabase, body);
    } else if (action === 'callback') {
      const body = await parseRequestBody<CallbackRequestBody>(req, 'Callback');
      return await handleCallbackAction(supabase, body);
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
