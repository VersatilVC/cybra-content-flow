
export interface ParsedSocialContent {
  linkedin?: string | SocialPostData;
  x?: string | SocialPostData;
}

export interface SocialPostData {
  text: string;
  image_url?: string;
}

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
  
  // Try to parse as JSON first with enhanced extraction for both platforms
  try {
    console.log('🔄 [Social Parser] Attempting JSON parse...');
    
    // Clean the JSON string to handle special characters
    let cleanedContent = contentString;
    
    // If it looks like JSON, try to parse it
    if (cleanedContent.trim().startsWith('{') && cleanedContent.trim().endsWith('}')) {
      let parsed = null;
      
      try {
        parsed = JSON.parse(cleanedContent);
        console.log('✅ [Social Parser] Standard JSON parse successful');
      } catch (standardParseError) {
        console.log('❌ [Social Parser] Standard JSON parse failed, trying manual extraction');
        
        // Enhanced manual extraction patterns for both platforms with image support
        const multiPlatformTextMatch = cleanedContent.match(/\{"linkedin":"(.*?)"\s*,\s*"x":"(.*?)"\}/s);
        const multiPlatformObjectMatch = cleanedContent.match(/\{"linkedin":\{[^}]*\}\s*,\s*"x":\{[^}]*\}\}/s);
        const linkedinOnlyMatch = cleanedContent.match(/\{"linkedin":"(.*?)"\}/s);
        const xOnlyMatch = cleanedContent.match(/\{"(?:x|twitter)":"(.*?)"\}/s);
        
        if (multiPlatformObjectMatch) {
          console.log('✅ [Social Parser] Found multi-platform object content');
          // Try to parse the complex object structure
          try {
            parsed = JSON.parse(multiPlatformObjectMatch[0]);
          } catch (e) {
            console.log('❌ [Social Parser] Failed to parse complex object, using text fallback');
          }
        } else if (multiPlatformTextMatch) {
          console.log('✅ [Social Parser] Found multi-platform text content');
          parsed = { 
            linkedin: multiPlatformTextMatch[1], 
            x: multiPlatformTextMatch[2] 
          };
        } else if (linkedinOnlyMatch) {
          console.log('✅ [Social Parser] Found LinkedIn-only content');
          parsed = { 
            linkedin: linkedinOnlyMatch[1],
            x: undefined
          };
        } else if (xOnlyMatch) {
          console.log('✅ [Social Parser] Found X-only content');
          parsed = { 
            linkedin: undefined,
            x: xOnlyMatch[1] 
          };
        }
      }
      
      if (parsed && (parsed.linkedin || parsed.x || parsed.twitter)) {
        const result: ParsedSocialContent = {};
        
        // Handle LinkedIn content
        if (parsed.linkedin) {
          if (typeof parsed.linkedin === 'string') {
            result.linkedin = parsed.linkedin;
          } else if (typeof parsed.linkedin === 'object' && parsed.linkedin.text) {
            result.linkedin = {
              text: parsed.linkedin.text,
              image_url: parsed.linkedin.image_url
            };
          }
        }
        
        // Handle X content (check both x and twitter keys)
        const xContent = parsed.x || parsed.twitter;
        if (xContent) {
          if (typeof xContent === 'string') {
            result.x = xContent;
          } else if (typeof xContent === 'object' && xContent.text) {
            result.x = {
              text: xContent.text,
              image_url: xContent.image_url
            };
          }
        }
        
        console.log('✅ [Social Parser] Found platform content via JSON:', {
          hasLinkedIn: !!result.linkedin,
          hasX: !!result.x,
          linkedinType: typeof result.linkedin,
          xType: typeof result.x
        });
        return result;
      } else {
        console.log('⚠️ [Social Parser] JSON parsed but no platform keys found');
      }
    }
  } catch (parseError) {
    console.log('❌ [Social Parser] JSON parse failed, trying text-based parsing:', parseError);
  }

  // Enhanced text-based content parsing for markdown-style content
  console.log('🔄 [Social Parser] Attempting text-based parsing...');
  
  // More flexible regex patterns for text-based content
  const linkedinPatterns = [
    /(?:LinkedIn:?\s*\n|### LinkedIn.*?\n)([\s\S]*?)(?=\n(?:X|Twitter|###)|$)/i,
    /(?:^|\n)LinkedIn\s*:?\s*\n?([\s\S]*?)(?=\n(?:X|Twitter)|$)/im,
    /linkedin\s*post\s*:?\s*\n?([\s\S]*?)(?=\n(?:X|Twitter)|$)/im
  ];
  
  const xPatterns = [
    /(?:(?:X|Twitter):?\s*\n|### (?:X|Twitter).*?\n)([\s\S]*?)(?=\n(?:LinkedIn|###)|$)/i,
    /(?:^|\n)(?:X|Twitter)\s*:?\s*\n?([\s\S]*?)(?=\nLinkedIn|$)/im,
    /(?:x|twitter)\s*post\s*:?\s*\n?([\s\S]*?)(?=\nLinkedIn|$)/im
  ];

  let linkedinMatch = null;
  let xMatch = null;

  // Try multiple patterns for LinkedIn
  for (const pattern of linkedinPatterns) {
    linkedinMatch = contentString.match(pattern);
    if (linkedinMatch) break;
  }

  // Try multiple patterns for X/Twitter
  for (const pattern of xPatterns) {
    xMatch = contentString.match(pattern);
    if (xMatch) break;
  }

  console.log('🔍 [Social Parser] Text parsing results:', {
    linkedinMatch: !!linkedinMatch,
    xMatch: !!xMatch
  });

  const result: ParsedSocialContent = {};

  if (linkedinMatch && linkedinMatch[1]) {
    result.linkedin = linkedinMatch[1].trim();
    console.log('✅ [Social Parser] LinkedIn content extracted from text - length:', result.linkedin.length);
  }

  if (xMatch && xMatch[1]) {
    result.x = xMatch[1].trim();
    console.log('✅ [Social Parser] X content extracted from text - length:', result.x.length);
  }

  // Only use generic fallback if no platform-specific content found AND it's not JSON-like
  if (!result.linkedin && !result.x && contentString.trim() && !contentString.trim().startsWith('{')) {
    console.log('⚠️ [Social Parser] No platform-specific content found, using as generic for both platforms');
    const cleanContent = contentString.trim();
    result.linkedin = cleanContent;
    result.x = cleanContent;
  }

  console.log('🔍 [Social Parser] Final result:', {
    hasLinkedIn: !!result.linkedin,
    hasX: !!result.x,
    linkedinType: typeof result.linkedin,
    xType: typeof result.x
  });

  return result;
}

export function isSocialDerivative(derivativeType: string): boolean {
  return derivativeType.startsWith('social_');
}
