
import { resilientJsonParse } from './jsonParser';
import { parseTextBasedContent } from './textContentParser';
import { validatePlatformContent, processObjectContent, applyGenericFallback } from './contentValidator';
import { ParsedSocialContent, SocialPostData } from './types';

export { ParsedSocialContent, SocialPostData };

export function parseSocialContent(content: string): ParsedSocialContent {
  console.log('🔍 [Social Parser] Raw content received:', content);
  console.log('🔍 [Social Parser] Content type:', typeof content);
  console.log('🔍 [Social Parser] Content length:', content?.length);

  if (!content) {
    console.log('❌ [Social Parser] No content provided');
    return {};
  }

  // Ensure we're working with a string
  const contentString = typeof content === 'string' ? content : JSON.stringify(content);
  
  // Try resilient JSON parsing first
  if (contentString.trim().startsWith('{') && contentString.trim().endsWith('}')) {
    console.log('🔄 [Social Parser] Attempting resilient JSON parse...');
    
    const parsed = resilientJsonParse(contentString);
    
    if (parsed && (parsed.linkedin || parsed.x || parsed.twitter)) {
      const result: ParsedSocialContent = {};
      
      // Handle LinkedIn content with better validation
      if (parsed.linkedin) {
        if (typeof parsed.linkedin === 'string') {
          result.linkedin = parsed.linkedin;
          console.log('✅ [Social Parser] LinkedIn string content processed:', parsed.linkedin.length, 'chars');
        } else if (typeof parsed.linkedin === 'object' && parsed.linkedin.text) {
          result.linkedin = {
            text: parsed.linkedin.text,
            image_url: parsed.linkedin.image_url
          };
          console.log('✅ [Social Parser] LinkedIn object content processed:', {
            textLength: parsed.linkedin.text.length,
            hasImage: !!parsed.linkedin.image_url
          });
        } else {
          console.warn('⚠️ [Social Parser] LinkedIn content format invalid:', parsed.linkedin);
        }
      }
      
      // Handle X content (check both x and twitter keys) with better validation
      const xContent = parsed.x || parsed.twitter;
      if (xContent) {
        if (typeof xContent === 'string') {
          result.x = xContent;
          console.log('✅ [Social Parser] X string content processed:', xContent.length, 'chars');
        } else if (typeof xContent === 'object' && xContent.text) {
          result.x = {
            text: xContent.text,
            image_url: xContent.image_url
          };
          console.log('✅ [Social Parser] X object content processed:', {
            textLength: xContent.text.length,
            hasImage: !!xContent.image_url
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
        finalResult: result
      });
      return result;
    } else {
      console.log('⚠️ [Social Parser] Resilient JSON parsed but no platform keys found:', parsed);
    }
  }

  // Enhanced text-based content parsing for markdown-style content
  const textResult = parseTextBasedContent(contentString);

  // Only use generic fallback if no platform-specific content found AND it's not JSON-like
  if (!textResult.linkedin && !textResult.x && contentString.trim() && !contentString.trim().startsWith('{')) {
    const fallbackResult = applyGenericFallback(contentString);
    console.log('🔍 [Social Parser] Final result:', {
      hasLinkedIn: !!fallbackResult.linkedin,
      hasX: !!fallbackResult.x,
      linkedinType: typeof fallbackResult.linkedin,
      xType: typeof fallbackResult.x,
      finalResult: fallbackResult
    });
    return fallbackResult;
  }

  console.log('🔍 [Social Parser] Final result:', {
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
