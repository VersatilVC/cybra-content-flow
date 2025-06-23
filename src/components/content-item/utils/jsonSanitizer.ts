
// Simplified JSON sanitization function - minimal processing to preserve structure
export function sanitizeJsonString(jsonString: string): string {
  // Type guard - only sanitize strings
  if (typeof jsonString !== 'string') {
    console.log('🧹 [JSON Sanitizer] Input is not a string, skipping sanitization');
    return jsonString;
  }
  
  console.log('🧹 [JSON Sanitizer] Starting sanitization for:', jsonString.substring(0, 200) + '...');
  
  // Remove any BOM characters
  let cleaned = jsonString.replace(/^\uFEFF/, '');
  
  // Test if the JSON is already valid
  try {
    JSON.parse(cleaned);
    console.log('✅ [JSON Sanitizer] JSON is already valid, returning as-is');
    return cleaned;
  } catch (error) {
    console.log('⚠️ [JSON Sanitizer] JSON parsing failed, applying minimal fixes:', error.message);
  }
  
  // Only apply the most basic fixes that won't corrupt the structure
  // Remove null bytes and other problematic control characters
  cleaned = cleaned.replace(/\0/g, '');
  
  // Try parsing again after minimal cleanup
  try {
    JSON.parse(cleaned);
    console.log('✅ [JSON Sanitizer] JSON valid after minimal cleanup');
    return cleaned;
  } catch (error) {
    console.log('❌ [JSON Sanitizer] Still invalid after cleanup, returning original:', error.message);
    return jsonString; // Return original if we can't fix it safely
  }
}
