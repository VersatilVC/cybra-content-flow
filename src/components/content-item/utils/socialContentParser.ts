
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
      console.log('✅ [Social Parser] Found platform content:', result);
      return result;
    } else {
      console.log('⚠️ [Social Parser] JSON parsed but no platform keys found');
    }
  } catch (parseError) {
    console.log('❌ [Social Parser] JSON parse failed:', parseError);
    
    // Try manual regex extraction for JSON-like content
    if (contentString.includes('"linkedin"') || contentString.includes('"x"')) {
      console.log('🔄 [Social Parser] Attempting manual JSON extraction...');
      try {
        // More robust regex patterns that handle multiline content
        const linkedinMatch = contentString.match(/"linkedin"\s*:\s*"((?:[^"\\]|\\.|\\n)*?)"/s);
        const xMatch = contentString.match(/"x"\s*:\s*"((?:[^"\\]|\\.|\\n)*?)"/s);
        const twitterMatch = contentString.match(/"twitter"\s*:\s*"((?:[^"\\]|\\.|\\n)*?)"/s);
        
        if (linkedinMatch || xMatch || twitterMatch) {
          const result: ParsedSocialContent = {};
          
          if (linkedinMatch && linkedinMatch[1]) {
            // Unescape the extracted content
            result.linkedin = linkedinMatch[1]
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
            console.log('✅ [Social Parser] LinkedIn extracted manually:', result.linkedin.substring(0, 100) + '...');
          }
          
          const xContent = xMatch || twitterMatch;
          if (xContent && xContent[1]) {
            // Unescape the extracted content
            result.x = xContent[1]
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
            console.log('✅ [Social Parser] X extracted manually:', result.x.substring(0, 100) + '...');
          }
          
          if (result.linkedin || result.x) {
            console.log('✅ [Social Parser] Manual extraction successful');
            return result;
          }
        }
      } catch (manualError) {
        console.log('❌ [Social Parser] Manual extraction failed:', manualError);
      }
    }
    
    console.log('🔄 [Social Parser] Falling back to text parsing...');
  }

  // Parse text-based content with headers/separators
  console.log('🔄 [Social Parser] Attempting text-based parsing...');
  const linkedinMatch = contentString.match(/(?:LinkedIn:?\s*\n|### LinkedIn.*?\n)([\s\S]*?)(?=\n(?:X|Twitter|###)|$)/i);
  const xMatch = contentString.match(/(?:(?:X|Twitter):?\s*\n|### (?:X|Twitter).*?\n)([\s\S]*?)(?=\n(?:LinkedIn|###)|$)/i);

  console.log('🔍 [Social Parser] LinkedIn regex match:', linkedinMatch);
  console.log('🔍 [Social Parser] X regex match:', xMatch);

  const result: ParsedSocialContent = {};

  if (linkedinMatch && linkedinMatch[1]) {
    result.linkedin = linkedinMatch[1].trim();
    console.log('✅ [Social Parser] LinkedIn content extracted:', result.linkedin.substring(0, 100) + '...');
  }

  if (xMatch && xMatch[1]) {
    result.x = xMatch[1].trim();
    console.log('✅ [Social Parser] X content extracted:', result.x.substring(0, 100) + '...');
  }

  // If no specific platform content found, treat as generic social content for both platforms
  if (!result.linkedin && !result.x && contentString.trim()) {
    console.log('⚠️ [Social Parser] No platform-specific content found, using as generic for both platforms');
    result.linkedin = contentString.trim();
    result.x = contentString.trim();
  }

  console.log('🔍 [Social Parser] Final result:', {
    hasLinkedIn: !!result.linkedin,
    hasX: !!result.x,
    linkedinLength: result.linkedin?.length,
    xLength: result.x?.length
  });

  return result;
}

export function isSocialDerivative(derivativeType: string): boolean {
  return derivativeType.startsWith('social_');
}
