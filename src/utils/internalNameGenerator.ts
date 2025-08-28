/**
 * Utility functions for generating unique internal names for content items
 */

export function generateInternalName(
  title: string,
  contentType?: string,
  targetAudience?: string,
  derivativeType?: string,
  category?: string,
  createdAt?: string
): string {
  // Clean title: remove special chars, take first 15 chars, uppercase
  const cleanTitle = title
    .replace(/[^A-Za-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toUpperCase()
    .substring(0, 15);

  // Add prefix based on content type
  let prefix = '';
  if (contentType === 'Blog Post') {
    prefix = 'BLOG_';
  } else if (contentType === 'Guide') {
    prefix = 'GUIDE_';
  } else if (contentType === 'Blog Post (Topical)') {
    prefix = 'TOPIC_';
  } else if (derivativeType) {
    prefix = derivativeType.substring(0, 4).toUpperCase() + '_';
  } else if (category) {
    prefix = category.substring(0, 4).toUpperCase() + '_';
  }

  // Add date suffix
  const date = createdAt ? new Date(createdAt) : new Date();
  const suffix = '_' + String(date.getMonth() + 1).padStart(2, '0') + String(date.getFullYear()).slice(-2);

  // Combine all parts
  const baseName = prefix + cleanTitle + suffix;

  // Ensure not too long
  return baseName.substring(0, 50);
}

export function generateDerivativeInternalName(
  parentInternalName: string,
  derivativeType: string
): string {
  // Take parent name and append derivative type
  const derivativePrefix = derivativeType.substring(0, 4).toUpperCase();
  const maxParentLength = 40; // Leave room for derivative suffix
  
  const truncatedParent = parentInternalName.substring(0, maxParentLength);
  return `${truncatedParent}_${derivativePrefix}`;
}

export function validateInternalName(name: string): boolean {
  // Basic validation: alphanumeric and underscores only, reasonable length
  return /^[A-Z0-9_]{1,50}$/.test(name);
}

export function sanitizeInternalName(name: string): string {
  return name
    .replace(/[^A-Za-z0-9_]/g, '_')
    .toUpperCase()
    .substring(0, 50);
}