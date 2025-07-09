import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './cors.ts'
import { WordPressApiService } from './wordpressApi.ts'
import { validateRequest } from './requestValidator.ts'
import { validateContentForWordPress } from './contentValidator.ts'
import { DatabaseOperations } from './databaseOperations.ts'
import { WordPressPublisher } from './wordpressPublisher.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting wordpress-publish function');
    const body = await req.json()
    console.log('Received request:', body);
    
    // Validate request
    const requestValidation = validateRequest(body);
    if (!requestValidation.isValid) {
      if (requestValidation.response) {
        return requestValidation.response;
      }
      // Handle test connection
      if (body.test) {
        try {
          const wordpressApi = new WordPressApiService();
          return new Response(
            JSON.stringify({ success: true, message: 'WordPress API configuration is valid' }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (error) {
          console.error('WordPress API configuration error:', error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'WordPress API configuration is missing or invalid. Please check environment variables.' 
            }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }
    }

    const { contentItemId, userId } = requestValidation;
    console.log('Publishing content item to WordPress:', contentItemId);

    // Initialize database operations
    const dbOps = new DatabaseOperations();

    // Fetch content item
    const { contentItem, error: itemError } = await dbOps.getContentItem(contentItemId!);
    if (itemError || !contentItem) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content item not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Fetch derivatives for this content item
    const derivatives = await dbOps.getContentDerivatives(contentItemId!);

    // Validate content for WordPress publishing
    const contentValidation = validateContentForWordPress(contentItem, derivatives);
    if (!contentValidation.isValid) {
      return contentValidation.response!;
    }

    const { blogImage, excerpt } = contentValidation;

    // Update status to indicate publishing in progress
    await dbOps.updateContentItemProgress(contentItemId!);

    // Publish to WordPress
    const publisher = new WordPressPublisher();
    const publishResult = await publisher.publishContent(contentItem, blogImage!, excerpt!);

    if (!publishResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: publishResult.error || 'WordPress publishing failed'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Update content item with WordPress information
    await dbOps.updateContentItemWithWordPressInfo(contentItemId!, publishResult.postUrl!);
    console.log('Content item updated with WordPress URL');

    return new Response(
      JSON.stringify({
        success: true,
        postId: publishResult.postId,
        postUrl: publishResult.postUrl
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    console.error('WordPress publishing failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});