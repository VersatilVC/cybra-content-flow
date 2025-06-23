
import { ParsedSocialContent, SocialPostData } from './types';

export function validatePlatformContent(content: any, platform: 'linkedin' | 'x'): boolean {
  if (!content) return false;
  
  if (typeof content === 'string') {
    return content.trim().length > 0;
  }
  
  if (typeof content === 'object' && content.text) {
    return content.text.trim().length > 0;
  }
  
  return false;
}

export function processObjectContent(rawContent: any): ParsedSocialContent {
  console.log('✅ [Content Validator] Content is already an object');
  console.log('🔍 [Content Validator] Object content structure:', rawContent);
  
  const contentObj = rawContent as any;
  const parsedContent = {
    linkedin: contentObj.linkedin || undefined,
    x: contentObj.x || contentObj.twitter || undefined
  };
  
  console.log('✅ [Content Validator] Direct object parsing result:', {
    hasLinkedIn: !!parsedContent.linkedin,
    hasX: !!parsedContent.x,
    linkedinType: typeof parsedContent.linkedin,
    xType: typeof parsedContent.x,
    linkedinHasText: parsedContent.linkedin?.text ? true : false,
    xHasText: parsedContent.x?.text ? true : false,
    linkedinHasImage: parsedContent.linkedin?.image_url ? true : false,
    xHasImage: parsedContent.x?.image_url ? true : false,
    linkedinImageUrl: parsedContent.linkedin?.image_url,
    xImageUrl: parsedContent.x?.image_url
  });
  
  return parsedContent;
}

export function applyGenericFallback(contentString: string): ParsedSocialContent {
  console.log('⚠️ [Content Validator] No platform-specific content found, using as generic for both platforms');
  const cleanContent = contentString.trim();
  return {
    linkedin: cleanContent,
    x: cleanContent
  };
}
