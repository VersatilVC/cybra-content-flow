
import { resilientJsonParse } from './jsonParser';
import { parseTextBasedContent } from './textContentParser';
import { validatePlatformContent, processObjectContent, applyGenericFallback } from './contentValidator';
import { ParsedSocialContent, SocialPostData } from './types';

export type { ParsedSocialContent, SocialPostData };

export function parseSocialContent(content: string | object, contentType?: string): ParsedSocialContent {
  console.log('🔍 [Social Parser] Raw content received:', content);
  console.log('🔍 [Social Parser] Content type:', typeof content);
  console.log('🔍 [Social Parser] Content type parameter:', contentType);
  console.log('🔍 [Social Parser] Content length:', typeof content === 'string' ? content?.length : 'N/A (object)');

  if (!content) {
    console.log('❌ [Social Parser] No content provided');
    return {};
  }

  // Handle composite content type - direct object pass-through
  if (contentType === 'composite' && typeof content === 'object' && content !== null) {
    console.log('✅ [Social Parser] Processing composite content as direct object');
    return processObjectContent(content);
  }

  // Handle object content directly (already parsed JSON)
  if (typeof content === 'object' && content !== null) {
    console.log('✅ [Social Parser] Content is already an object, processing directly');
    return processObjectContent(content);
  }

  // Ensure we're working with a string for further processing
  const contentString = typeof content === 'string' ? content : JSON.stringify(content);
  
  // Try resilient JSON parsing for string content - with better detection
  if (contentString.trim().startsWith('{') || contentString.includes('"linkedin"') || contentString.includes('"x"')) {
    console.log('🔄 [Social Parser] Attempting resilient JSON parse...');
    
    const parsed = resilientJsonParse(contentString);
    
    if (parsed) {
      console.log('🔍 [Social Parser] Parsed JSON result:', parsed);
      console.log('🔍 [Social Parser] Platform keys check:', {
        hasLinkedIn: !!parsed.linkedin,
        hasX: !!parsed.x,
        hasTwitter: !!parsed.twitter,
        allKeys: Object.keys(parsed)
      });
      
      if (parsed.linkedin || parsed.x || parsed.twitter) {
        const result: ParsedSocialContent = {};
        
        // Handle LinkedIn content with enhanced image URL preservation
        if (parsed.linkedin) {
          if (typeof parsed.linkedin === 'string') {
            result.linkedin = parsed.linkedin;
            console.log('✅ [Social Parser] LinkedIn string content processed:', parsed.linkedin.length, 'chars');
          } else if (typeof parsed.linkedin === 'object' && parsed.linkedin.text) {
            result.linkedin = {
              text: parsed.linkedin.text,
              ...(parsed.linkedin.image_url && { image_url: parsed.linkedin.image_url })
            };
            console.log('✅ [Social Parser] LinkedIn object content processed:', {
              textLength: parsed.linkedin.text.length,
              hasImage: !!parsed.linkedin.image_url,
              imageUrl: parsed.linkedin.image_url
            });
          } else {
            console.warn('⚠️ [Social Parser] LinkedIn content format invalid:', parsed.linkedin);
          }
        }
        
        // Handle X content (check both x and twitter keys) with enhanced image URL preservation
        const xContent = parsed.x || parsed.twitter;
        if (xContent) {
          if (typeof xContent === 'string') {
            result.x = xContent;
            console.log('✅ [Social Parser] X string content processed:', xContent.length, 'chars');
          } else if (typeof xContent === 'object' && xContent.text) {
            result.x = {
              text: xContent.text,
              ...(xContent.image_url && { image_url: xContent.image_url })
            };
            console.log('✅ [Social Parser] X object content processed:', {
              textLength: xContent.text.length,
              hasImage: !!xContent.image_url,
              imageUrl: xContent.image_url
            });
          } else {
            console.warn('⚠️ [Social Parser] X content format invalid:', xContent);
          }
        }
        
        console.log('✅ [Social Parser] Found platform content via resilient JSON:', {
          hasLinkedIn: !!result.linkedin,
          hasX: !!result.x,
          linkedinType: typeof result.linkedin,
          xType: typeof result.x,
          linkedinHasImage: typeof result.linkedin === 'object' && result.linkedin !== null && 'image_url' in result.linkedin ? !!result.linkedin.image_url : false,
          xHasImage: typeof result.x === 'object' && result.x !== null && 'image_url' in result.x ? !!result.x.image_url : false,
          finalResult: result
        });
        return result;
      } else {
        console.log('⚠️ [Social Parser] Resilient JSON parsed but no platform keys found:', parsed);
      }
    } else {
      console.log('❌ [Social Parser] Resilient JSON parsing failed completely');
    }
  }

  // Enhanced text-based content parsing for markdown-style content
  const textResult = parseTextBasedContent(contentString);

  // Only use generic fallback if no platform-specific content found AND it's not JSON-like
  if (!textResult.linkedin && !textResult.x && contentString.trim() && !contentString.trim().startsWith('{')) {
    const fallbackResult = applyGenericFallback(contentString);
    console.log('🔍 [Social Parser] Final result (fallback):', {
      hasLinkedIn: !!fallbackResult.linkedin,
      hasX: !!fallbackResult.x,
      linkedinType: typeof fallbackResult.linkedin,
      xType: typeof fallbackResult.x,
      finalResult: fallbackResult
    });
    return fallbackResult;
  }

  console.log('🔍 [Social Parser] Final result (text parse):', {
    hasLinkedIn: !!textResult.linkedin,
    hasX: !!textResult.x,
    linkedinType: typeof textResult.linkedin,
    xType: typeof textResult.x,
    finalResult: textResult
  });

  return textResult;
}

export function isSocialDerivative(derivativeType: string): boolean {
  return derivativeType.startsWith('social_');
}
