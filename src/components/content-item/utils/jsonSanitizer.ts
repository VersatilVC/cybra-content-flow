
// Enhanced JSON sanitization function
export function sanitizeJsonString(jsonString: string): string {
  console.log('🧹 [JSON Sanitizer] Starting sanitization for:', jsonString.substring(0, 200) + '...');
  
  // Remove any BOM characters
  let cleaned = jsonString.replace(/^\uFEFF/, '');
  
  // More careful handling of control characters within string values
  // This preserves the JSON structure while fixing control character issues
  cleaned = cleaned.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, content) => {
    // Only escape unescaped control characters
    const escaped = content
      .replace(/(?<!\\)\n/g, '\\n')  // Only escape unescaped newlines
      .replace(/(?<!\\)\r/g, '\\r')  // Only escape unescaped carriage returns
      .replace(/(?<!\\)\t/g, '\\t')  // Only escape unescaped tabs
      .replace(/(?<!\\)\f/g, '\\f')  // Only escape unescaped form feeds
      .replace(/(?<!\\)\b/g, '\\b'); // Only escape unescaped backspaces
    return `"${escaped}"`;
  });
  
  console.log('✅ [JSON Sanitizer] Sanitization complete, result:', cleaned.substring(0, 200) + '...');
  return cleaned;
}
