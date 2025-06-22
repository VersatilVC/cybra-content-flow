
import { sanitizeJsonString } from './jsonSanitizer';

// Fallback JSON parsing with multiple strategies
export function resilientJsonParse(jsonString: string): any {
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
    
    // Strategy 3: Simple fallback for malformed strings with valid structure
    () => {
      console.log('🔧 [Resilient Parser] Strategy 3 - Using simple eval fallback');
      // Clean the string more aggressively for eval
      let cleaned = jsonString
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\f/g, '\\f')
        .replace(/\b/g, '\\b');
      
      // Use eval as last resort (only for trusted content)
      const result = eval('(' + cleaned + ')');
      console.log('✅ [Resilient Parser] Strategy 3 - Eval result:', result);
      return result;
    },
    
    // Strategy 4: Manual content extraction for known structure
    () => {
      console.log('🔧 [Resilient Parser] Strategy 4 - Manual extraction strategy');
      
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
      
      console.log('✅ [Resilient Parser] Strategy 4 - Manual extraction result:', result);
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
