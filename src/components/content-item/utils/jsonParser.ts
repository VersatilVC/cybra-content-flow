
import { sanitizeJsonString } from './jsonSanitizer';

// Fallback JSON parsing with multiple strategies
export function resilientJsonParse(jsonString: string): any {
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
