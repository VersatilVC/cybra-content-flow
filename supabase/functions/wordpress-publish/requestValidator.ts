import { corsHeaders } from './cors.ts'

export interface ValidationResult {
  isValid: boolean;
  response?: Response;
  contentItemId?: string;
  userId?: string;
}

export function validateRequest(body: any): ValidationResult {
  // Handle test connection requests
  if (body.test) {
    console.log('Test connection requested');
    
    // Initialize WordPress API service to test configuration
    try {
      // This will be handled by the calling function
      return { isValid: true };
    } catch (error) {
      console.error('WordPress API configuration error:', error);
      return {
        isValid: false,
        response: new Response(
          JSON.stringify({ 
            success: false, 
            error: 'WordPress API configuration is missing or invalid. Please check environment variables.' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      };
    }
  }
  
  const { contentItemId, userId } = body;
  
  if (!contentItemId || !userId) {
    console.error('Missing required parameters:', { contentItemId, userId });
    return {
      isValid: false,
      response: new Response(
        JSON.stringify({ success: false, error: 'Missing contentItemId or userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    };
  }

  return { isValid: true, contentItemId, userId };
}