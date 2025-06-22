
// Enhanced JSON sanitization function
export function sanitizeJsonString(jsonString: string): string {
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
