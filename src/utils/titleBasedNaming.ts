/**
 * Utility functions for title-based internal naming system
 */

/**
 * Sanitizes a title to create a clean internal name
 */
export function sanitizeTitle(title: string): string {
  if (!title || title.trim() === '') {
    return 'UNTITLED';
  }
  
  return title
    .trim()
    .replace(/[^A-Za-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toUpperCase()
    .substring(0, 30); // Limit length to 30 chars
}

/**
 * Creates internal name for content idea (base name)
 */
export function createIdeaInternalName(title: string): string {
  return sanitizeTitle(title);
}

/**
 * Creates internal name for content brief based on source
 */
export function createBriefInternalName(sourceInternalName: string, sourceType: 'idea' | 'suggestion'): string {
  if (sourceType === 'suggestion') {
    return `${sourceInternalName}_SUGG_BRIEF`;
  }
  return `${sourceInternalName}_BRIEF`;
}

/**
 * Creates internal name for content item based on brief
 */
export function createItemInternalName(briefInternalName: string): string {
  // Remove _BRIEF or _SUGG_BRIEF suffix and add _ITEM
  const baseName = briefInternalName.replace(/_BRIEF$|_SUGG_BRIEF$/, '');
  return `${baseName}_ITEM`;
}

/**
 * Creates internal name for derivative based on item and derivative type
 */
export function createDerivativeInternalName(itemInternalName: string, derivativeType: string): string {
  // Remove _ITEM suffix and add derivative type
  const baseName = itemInternalName.replace(/_ITEM$/, '');
  const derivativeTypeSanitized = derivativeType.replace(/[^A-Za-z0-9]/g, '_').toUpperCase();
  return `${baseName}_${derivativeTypeSanitized}`;
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