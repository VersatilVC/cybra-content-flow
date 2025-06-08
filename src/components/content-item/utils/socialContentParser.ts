
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
  
  // Try to parse as JSON first with improved error handling
  try {
    console.log('🔄 [Social Parser] Attempting JSON parse...');
    const parsed = JSON.parse(contentString);
    console.log('✅ [Social Parser] JSON parse successful:', parsed);
    
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
    console.log('❌ [Social Parser] JSON parse failed, trying text-based parsing:', parseError);
  }

  // Enhanced text-based content parsing
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

  // If no specific platform content found, treat as generic social content for both platforms
  if (!result.linkedin && !result.x && contentString.trim()) {
    console.log('⚠️ [Social Parser] No platform-specific content found, using as generic for both platforms');
    const cleanContent = contentString.trim();
    result.linkedin = cleanContent;
    result.x = cleanContent;
  }

  console.log('🔍 [Social Parser] Final result:', {
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
