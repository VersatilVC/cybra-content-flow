
import { corsHeaders } from './cors.ts';

export function createErrorResponse(message: string, details?: string) {
  return new Response(
    JSON.stringify({ 
      error: message,
      details: details
    }), 
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify({ 
      success: true,
      ...data
    }), 
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
