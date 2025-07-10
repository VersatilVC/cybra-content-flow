
// Enhanced JSON sanitization function - better handling of control characters and Unicode
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
    console.log('⚠️ [JSON Sanitizer] JSON parsing failed, applying enhanced fixes:', error.message);
  }
  
  // Enhanced sanitization to handle control characters and escape sequences
  cleaned = cleaned
    // Remove null bytes and other problematic control characters
    .replace(/\0/g, '')
    // Fix common escape sequence issues
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    // Handle unescaped quotes in text content
    .replace(/([^\\])"/g, '$1\\"')
    // Fix potential issues with Unicode characters
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
  
  // Try parsing again after enhanced cleanup
  try {
    JSON.parse(cleaned);
    console.log('✅ [JSON Sanitizer] JSON valid after enhanced cleanup');
    return cleaned;
  } catch (error) {
    console.log('❌ [JSON Sanitizer] Still invalid after cleanup, returning original:', error.message);
    return jsonString; // Return original if we can't fix it safely
  }
}
