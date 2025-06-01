/**
 * Sanitizes a filename to be safe for use as a storage key
 * Removes or replaces special characters that could cause issues
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed-file';
  
  // Split filename and extension
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
  
  // Sanitize the name part
  const sanitizedName = name
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    // Remove or replace special characters, keeping only alphanumeric, hyphens, and underscores
    .replace(/[^a-zA-Z0-9\-_]/g, '')
    // Remove multiple consecutive underscores or hyphens
    .replace(/[-_]+/g, '_')
    // Trim underscores from start and end
    .replace(/^_+|_+$/g, '')
    // Ensure it's not empty
    || 'file';
  
  // Sanitize extension (keep the dot and alphanumeric characters)
  const sanitizedExtension = extension.replace(/[^a-zA-Z0-9.]/g, '');
  
  // Limit total length to avoid issues with very long filenames
  const maxLength = 100;
  const fullSanitized = sanitizedName + sanitizedExtension;
  
  if (fullSanitized.length > maxLength) {
    const availableNameLength = maxLength - sanitizedExtension.length;
    return sanitizedName.substring(0, availableNameLength) + sanitizedExtension;
  }
  
  return fullSanitized;
}
