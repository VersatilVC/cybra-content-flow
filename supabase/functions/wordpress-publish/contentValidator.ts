import { corsHeaders } from './cors.ts'
import { ContentItem, ContentDerivative } from './types.ts'

export interface ContentValidationResult {
  isValid: boolean;
  response?: Response;
  blogImage?: ContentDerivative;
  excerpt?: ContentDerivative;
}

export function validateContentForWordPress(
  contentItem: ContentItem,
  derivatives: ContentDerivative[]
): ContentValidationResult {
  console.log('Found derivatives:', derivatives?.length || 0);

  // Validate required derivatives
  const blogImage = derivatives?.find(d => 
    d.derivative_type.toLowerCase().includes('blog') && 
    d.content_type === 'image' && 
    d.file_url
  );

  const excerpt = derivatives?.find(d => 
    d.derivative_type.toLowerCase().includes('excerpt') && 
    d.word_count && 
    d.word_count <= 200 &&
    d.content
  );

  if (!blogImage) {
    return {
      isValid: false,
      response: new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This blog post requires a blog image that can be generated through the derivative section. Please go to the Derivatives tab, generate a blog image derivative, and then try publishing to WordPress again.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    };
  }

  if (!excerpt) {
    return {
      isValid: false,
      response: new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This blog post requires a 200-word excerpt that can be generated through the derivative section. Please go to the Derivatives tab, generate a 200-word excerpt derivative, and then try publishing to WordPress again.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    };
  }

  console.log('Validation passed - found blog image and excerpt');
  return { isValid: true, blogImage, excerpt };
}