
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

  // Try to parse as JSON first (if N8N sends structured data)
  try {
    console.log('🔄 [Social Parser] Attempting JSON parse...');
    const parsed = JSON.parse(content);
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
    console.log('🔄 [Social Parser] Attempting to fix JSON formatting...');
    
    // Try to fix common JSON issues with unescaped characters
    try {
      // Fix unescaped newlines and other control characters
      let fixedContent = content
        .replace(/\n/g, '\\n')        // Escape newlines
        .replace(/\r/g, '\\r')        // Escape carriage returns
        .replace(/\t/g, '\\t')        // Escape tabs
        .replace(/\f/g, '\\f')        // Escape form feeds
        .replace(/\b/g, '\\b')        // Escape backspaces
        .replace(/\v/g, '\\v')        // Escape vertical tabs
        .replace(/\0/g, '\\0')        // Escape null characters
        .replace(/[\x00-\x1f\x7f-\x9f]/g, ''); // Remove other control characters
      
      console.log('🔄 [Social Parser] Attempting parse with fixed formatting...');
      const parsed = JSON.parse(fixedContent);
      console.log('✅ [Social Parser] Fixed JSON parse successful:', parsed);
      
      if (parsed.linkedin || parsed.x || parsed.twitter) {
        const result = {
          linkedin: parsed.linkedin,
          x: parsed.x || parsed.twitter
        };
        console.log('✅ [Social Parser] Found platform content after fix:', result);
        return result;
      }
    } catch (secondParseError) {
      console.log('❌ [Social Parser] Fixed JSON parse also failed:', secondParseError);
      console.log('🔄 [Social Parser] Falling back to manual parsing...');
      
      // Try manual extraction if it looks like JSON structure
      if (content.includes('"linkedin"') && content.includes('"x"')) {
        console.log('🔄 [Social Parser] Attempting manual JSON extraction...');
        try {
          const linkedinMatch = content.match(/"linkedin"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          const xMatch = content.match(/"x"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          
          if (linkedinMatch || xMatch) {
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
            
            if (xMatch && xMatch[1]) {
              // Unescape the extracted content
              result.x = xMatch[1]
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
    }
    
    console.log('🔄 [Social Parser] Falling back to text parsing...');
  }

  // Parse text-based content with headers/separators
  console.log('🔄 [Social Parser] Attempting text-based parsing...');
  const linkedinMatch = content.match(/(?:LinkedIn:?\s*\n|### LinkedIn.*?\n)([\s\S]*?)(?=\n(?:X|Twitter|###)|$)/i);
  const xMatch = content.match(/(?:(?:X|Twitter):?\s*\n|### (?:X|Twitter).*?\n)([\s\S]*?)(?=\n(?:LinkedIn|###)|$)/i);

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
  if (!result.linkedin && !result.x && content.trim()) {
    console.log('⚠️ [Social Parser] No platform-specific content found, using as generic for both platforms');
    result.linkedin = content.trim();
    result.x = content.trim();
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
