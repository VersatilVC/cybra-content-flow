/**
 * Utility functions for title-based internal naming system
 */

/**
 * Sanitizes a title to create a clean internal name
 * Preserves original casing and spaces, only removes dangerous characters
 */
export function sanitizeTitle(title: string): string {
  if (!title || title.trim() === '') {
    return 'Untitled';
  }
  
  return title
    .trim()
    .replace(/["'`\\;]/g, '') // Only remove potentially dangerous characters
    .substring(0, 100); // Reasonable length limit
}

/**
 * Creates internal name for content idea (base name)
 */
export function createIdeaInternalName(title: string): string {
  return sanitizeTitle(title);
}

/**
 * Creates internal name for content brief based on source
 * Now inherits the exact same internal name as the source
 */
export function createBriefInternalName(sourceInternalName: string, sourceType: 'idea' | 'suggestion'): string {
  return sourceInternalName;
}

/**
 * Creates internal name for content item based on brief
 * Now inherits the exact same internal name as the brief
 */
export function createItemInternalName(briefInternalName: string): string {
  return briefInternalName;
}

/**
 * Creates internal name for derivative based on item and derivative type
 * Now inherits the exact same internal name as the item
 */
export function createDerivativeInternalName(itemInternalName: string, derivativeType: string): string {
  return itemInternalName;
}

/**
 * Ensures uniqueness by appending a number if needed
 */
export function ensureUniqueName(baseName: string, existingNames: string[]): string {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }
  
  let counter = 2;
  let uniqueName = `${baseName}_${counter}`;
  
  while (existingNames.includes(uniqueName)) {
    counter++;
    uniqueName = `${baseName}_${counter}`;
  }
  
  return uniqueName;
}