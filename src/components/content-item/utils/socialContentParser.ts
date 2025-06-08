
export interface ParsedSocialContent {
  linkedin?: string;
  x?: string;
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
  
  // Try to parse as JSON first (if N8N sends structured data)
  try {
    console.log('🔄 [Social Parser] Attempting JSON parse...');
    const parsed = JSON.parse(contentString);
    console.log('✅ [Social Parser] JSON parse successful:', parsed);
    console.log('🔍 [Social Parser] Parsed object keys:', Object.keys(parsed));
    
    if (parsed.linkedin || parsed.x || parsed.twitter) {
      const result = {
        linkedin: parsed.linkedin,
        x: parsed.x || parsed.twitter
      };
      console.log('✅ [Social Parser] Found platform content:', {
        hasLinkedIn: !!result.linkedin,
        hasX: !!result.x,
        linkedinLength: result.linkedin?.length || 0,
        xLength: result.x?.length || 0
      });
      return result;
    } else {
      console.log('⚠️ [Social Parser] JSON parsed but no platform keys found');
    }
  } catch (parseError) {
    console.log('❌ [Social Parser] JSON parse failed:', parseError);
    
    // Enhanced manual regex extraction for JSON-like content with better error handling
    if (contentString.includes('"linkedin"') || contentString.includes('"x"')) {
      console.log('🔄 [Social Parser] Attempting enhanced manual JSON extraction...');
      try {
        // More robust regex patterns that handle multiline content and escaped characters
        const linkedinMatch = contentString.match(/"linkedin"\s*:\s*"((?:[^"\\]|\\.|\\n|\\r|\\t)*?)"/s);
        const xMatch = contentString.match(/"x"\s*:\s*"((?:[^"\\]|\\.|\\n|\\r|\\t)*?)"/s);
        const twitterMatch = contentString.match(/"twitter"\s*:\s*"((?:[^"\\]|\\.|\\n|\\r|\\t)*?)"/s);
        
        console.log('🔍 [Social Parser] Regex matches:', {
          linkedinMatch: !!linkedinMatch,
          xMatch: !!xMatch,
          twitterMatch: !!twitterMatch
        });
        
        if (linkedinMatch || xMatch || twitterMatch) {
          const result: ParsedSocialContent = {};
          
          if (linkedinMatch && linkedinMatch[1]) {
            // Enhanced unescape function for the extracted content
            result.linkedin = linkedinMatch[1]
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\')
              .replace(/\\u([0-9a-fA-F]{4})/g, (match, unicode) => String.fromCharCode(parseInt(unicode, 16)));
            console.log('✅ [Social Parser] LinkedIn extracted manually - length:', result.linkedin.length);
            console.log('🔍 [Social Parser] LinkedIn content preview:', result.linkedin.substring(0, 200) + '...');
          }
          
          const xContent = xMatch || twitterMatch;
          if (xContent && xContent[1]) {
            // Enhanced unescape function for the extracted content
            result.x = xContent[1]
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\')
              .replace(/\\u([0-9a-fA-F]{4})/g, (match, unicode) => String.fromCharCode(parseInt(unicode, 16)));
            console.log('✅ [Social Parser] X extracted manually - length:', result.x.length);
            console.log('🔍 [Social Parser] X content preview:', result.x.substring(0, 200) + '...');
          }
          
          if (result.linkedin || result.x) {
            console.log('✅ [Social Parser] Enhanced manual extraction successful');
            return result;
          }
        }
      } catch (manualError) {
        console.log('❌ [Social Parser] Enhanced manual extraction failed:', manualError);
      }
    }
    
    console.log('🔄 [Social Parser] Falling back to text parsing...');
  }

  // Enhanced text-based content parsing with headers/separators
  console.log('🔄 [Social Parser] Attempting enhanced text-based parsing...');
  
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

  console.log('🔍 [Social Parser] Enhanced text parsing results:', {
    linkedinMatch: !!linkedinMatch,
    xMatch: !!xMatch
  });

  const result: ParsedSocialContent = {};

  if (linkedinMatch && linkedinMatch[1]) {
    result.linkedin = linkedinMatch[1].trim();
    console.log('✅ [Social Parser] LinkedIn content extracted from text - length:', result.linkedin.length);
    console.log('🔍 [Social Parser] LinkedIn text preview:', result.linkedin.substring(0, 200) + '...');
  }

  if (xMatch && xMatch[1]) {
    result.x = xMatch[1].trim();
    console.log('✅ [Social Parser] X content extracted from text - length:', result.x.length);
    console.log('🔍 [Social Parser] X text preview:', result.x.substring(0, 200) + '...');
  }

  // If no specific platform content found, treat as generic social content for both platforms
  if (!result.linkedin && !result.x && contentString.trim()) {
    console.log('⚠️ [Social Parser] No platform-specific content found, using as generic for both platforms');
    const cleanContent = contentString.trim();
    result.linkedin = cleanContent;
    result.x = cleanContent;
  }

  console.log('🔍 [Social Parser] Final enhanced result:', {
    hasLinkedIn: !!result.linkedin,
    hasX: !!result.x,
    linkedinLength: result.linkedin?.length || 0,
    xLength: result.x?.length || 0
  });

  return result;
}

export function isSocialDerivative(derivativeType: string): boolean {
  return derivativeType.startsWith('social_');
}
