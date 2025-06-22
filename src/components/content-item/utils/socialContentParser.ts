
export interface ParsedSocialContent {
  linkedin?: string | SocialPostData;
  x?: string | SocialPostData;
}

export interface SocialPostData {
  text: string;
  image_url?: string;
}

// Enhanced JSON sanitization function
function sanitizeJsonString(jsonString: string): string {
  console.log('🧹 [JSON Sanitizer] Sanitizing JSON string');
  
  // Remove any BOM characters
  let cleaned = jsonString.replace(/^\uFEFF/, '');
  
  // Escape unescaped newlines, tabs, and carriage returns within string values
  // This regex finds string values and escapes control characters within them
  cleaned = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, content) => {
    const escaped = content
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/\b/g, '\\b');
    return `"${escaped}"`;
  });
  
  console.log('✅ [JSON Sanitizer] Sanitization complete');
  return cleaned;
}

// Fallback JSON parsing with multiple strategies
function resilientJsonParse(jsonString: string): any {
  console.log('🔄 [Resilient Parser] Attempting resilient JSON parse');
  
  const strategies = [
    // Strategy 1: Direct parse (for valid JSON)
    () => JSON.parse(jsonString),
    
    // Strategy 2: Sanitized parse
    () => JSON.parse(sanitizeJsonString(jsonString)),
    
    // Strategy 3: Manual content extraction for known structure
    () => {
      console.log('🔧 [Resilient Parser] Using manual extraction strategy');
      
      // Extract LinkedIn content
      const linkedinMatch = jsonString.match(/"linkedin"\s*:\s*{[^}]*"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)"[^}]*(?:"image_url"\s*:\s*"([^"]*)")?[^}]*}/s);
      const xMatch = jsonString.match(/"x"\s*:\s*{[^}]*"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)"[^}]*(?:"image_url"\s*:\s*"([^"]*)")?[^}]*}/s);
      
      const result: any = {};
      
      if (linkedinMatch) {
        result.linkedin = {
          text: linkedinMatch[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t'),
          ...(linkedinMatch[2] && { image_url: linkedinMatch[2] })
        };
      }
      
      if (xMatch) {
        result.x = {
          text: xMatch[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t'),
          ...(xMatch[2] && { image_url: xMatch[2] })
        };
      }
      
      return Object.keys(result).length > 0 ? result : null;
    },
    
    // Strategy 4: Simple key-value extraction
    () => {
      console.log('🔧 [Resilient Parser] Using simple key-value extraction');
      
      const linkedinTextMatch = jsonString.match(/"linkedin"[^:]*:[^{]*{[^}]*"text"[^:]*:[^"]+"([^"]+(?:\\.[^"]*)*)"/) || 
                                jsonString.match(/"linkedin"[^:]*:[^"]+"([^"]+(?:\\.[^"]*)*)"/) ;
      const xTextMatch = jsonString.match(/"x"[^:]*:[^{]*{[^}]*"text"[^:]*:[^"]+"([^"]+(?:\\.[^"]*)*)"/) || 
                         jsonString.match(/"x"[^:]*:[^"]+"([^"]+(?:\\.[^"]*)*)"/) ;
      
      const result: any = {};
      
      if (linkedinTextMatch) {
        result.linkedin = linkedinTextMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
      
      if (xTextMatch) {
        result.x = xTextMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
      
      return Object.keys(result).length > 0 ? result : null;
    }
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = strategies[i]();
      if (result) {
        console.log(`✅ [Resilient Parser] Strategy ${i + 1} succeeded`);
        return result;
      }
    } catch (error) {
      console.log(`❌ [Resilient Parser] Strategy ${i + 1} failed:`, error.message);
      continue;
    }
  }
  
  console.log('❌ [Resilient Parser] All strategies failed');
  return null;
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
    console.log('✅ [Social Parser] LinkedIn content extracted from text - length:', 
      typeof result.linkedin === 'string' ? result.linkedin.length : result.linkedin.text.length);
  }

  if (xMatch && xMatch[1]) {
    result.x = xMatch[1].trim();
    console.log('✅ [Social Parser] X content extracted from text - length:', 
      typeof result.x === 'string' ? result.x.length : result.x.text.length);
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
    xType: typeof result.x,
    finalResult: result
  });

  return result;
}

export function isSocialDerivative(derivativeType: string): boolean {
  return derivativeType.startsWith('social_');
}
