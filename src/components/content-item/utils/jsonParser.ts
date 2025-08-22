
import { sanitizeJsonString } from './jsonSanitizer';

/**
 * Represents the expected structure of parsed social media content
 * Used for content derivatives across LinkedIn, X (Twitter), and other platforms
 */
interface ParsedSocialContent {
  linkedin?: {
    text: string;
    image_url?: string;
  };
  x?: {
    text: string;
    image_url?: string;
  };
  twitter?: {
    text: string;
    image_url?: string;
  };
}

/**
 * Resilient JSON parsing with multiple fallback strategies
 * Attempts to parse potentially malformed JSON strings from AI-generated content
 * @param jsonString - The JSON string to parse
 * @returns Parsed social content object or null if parsing fails
 */
export function resilientJsonParse(jsonString: string): ParsedSocialContent | null {
  console.log('🔄 [Resilient Parser] Attempting resilient JSON parse');
  console.log('🔍 [Resilient Parser] Input preview:', jsonString.substring(0, 300) + '...');
  
  const strategies = [
    // Strategy 1: Direct parse (for valid JSON)
    () => {
      const result = JSON.parse(jsonString);
      console.log('✅ [Resilient Parser] Strategy 1 - Direct parse result:', result);
      return result;
    },
    
    // Strategy 2: Sanitized parse
    () => {
      const sanitized = sanitizeJsonString(jsonString);
      const result = JSON.parse(sanitized);
      console.log('✅ [Resilient Parser] Strategy 2 - Sanitized parse result:', result);
      return result;
    },
    
    // Strategy 3: Safe JSON repair for malformed strings
    () => {
      console.log('🔧 [Resilient Parser] Strategy 3 - Using safe JSON repair');
      
      // Clean and repair common JSON issues without using eval
      let cleaned = jsonString
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\f/g, '\\f')
        // Fix common JSON issues
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
        .replace(/:\s*'([^']*)'/g, ':"$1"') // Convert single quotes to double quotes
        .replace(/\\'/g, "'"); // Fix escaped single quotes
      
      // Try to parse the cleaned JSON
      const result = JSON.parse(cleaned);
      console.log('✅ [Resilient Parser] Strategy 3 - Safe JSON repair result:', result);
      return result;
    },
    
    // Strategy 4: Enhanced manual content extraction with proper image URL capture
    () => {
      console.log('🔧 [Resilient Parser] Strategy 4 - Enhanced manual extraction strategy');
      
      // Enhanced regex patterns to capture both text and image_url
      const linkedinMatch = jsonString.match(/"linkedin"\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);
      const xMatch = jsonString.match(/"x"\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);
      
      const result: ParsedSocialContent = {};
      
      if (linkedinMatch) {
        const linkedinContent = linkedinMatch[1];
        console.log('🔍 [Resilient Parser] LinkedIn content block:', linkedinContent);
        
        // Extract text
        const textMatch = linkedinContent.match(/"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s);
        // Extract image_url
        const imageMatch = linkedinContent.match(/"image_url"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s);
        
        if (textMatch) {
          result.linkedin = {
            text: textMatch[1]
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\')
          };
          
          if (imageMatch) {
            result.linkedin.image_url = imageMatch[1];
            console.log('✅ [Resilient Parser] LinkedIn image URL extracted:', imageMatch[1]);
          }
          
          console.log('✅ [Resilient Parser] LinkedIn content extracted:', {
            textLength: result.linkedin.text.length,
            hasImage: !!result.linkedin.image_url
          });
        }
      }
      
      if (xMatch) {
        const xContent = xMatch[1];
        console.log('🔍 [Resilient Parser] X content block:', xContent);
        
        // Extract text
        const textMatch = xContent.match(/"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s);
        // Extract image_url
        const imageMatch = xContent.match(/"image_url"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s);
        
        if (textMatch) {
          result.x = {
            text: textMatch[1]
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\')
          };
          
          if (imageMatch) {
            result.x.image_url = imageMatch[1];
            console.log('✅ [Resilient Parser] X image URL extracted:', imageMatch[1]);
          }
          
          console.log('✅ [Resilient Parser] X content extracted:', {
            textLength: result.x.text.length,
            hasImage: !!result.x.image_url
          });
        }
      }
      
      console.log('✅ [Resilient Parser] Strategy 4 - Enhanced manual extraction result:', result);
      return Object.keys(result).length > 0 ? result : null;
    }
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = strategies[i]();
      if (result) {
        console.log(`✅ [Resilient Parser] Strategy ${i + 1} succeeded with result:`, result);
        console.log(`🔍 [Resilient Parser] Strategy ${i + 1} - Platform keys found:`, {
          hasLinkedIn: !!result.linkedin,
          hasX: !!result.x,
          hasTwitter: !!result.twitter,
          linkedinHasImage: !!result.linkedin?.image_url,
          xHasImage: !!result.x?.image_url,
          keys: Object.keys(result)
        });
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
