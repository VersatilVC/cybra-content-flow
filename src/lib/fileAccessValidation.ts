import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for validating and generating secure file access URLs
 */

export interface FileAccessResult {
  success: boolean;
  url?: string;
  error?: string;
  method?: 'path-derived' | 'session-fallback' | 'direct-path';
}

/**
 * Comprehensive file access validator that tries multiple strategies
 */
export async function generateValidatedSignedUrl(
  sourceData: Record<string, any>, 
  sessionUserId: string,
  bucketName: string = 'content-files',
  expirySeconds: number = 3600
): Promise<FileAccessResult> {
  const filename = sourceData.filename as string;
  const filePath = sourceData.path as string;
  
  if (!filename) {
    return { success: false, error: 'No filename provided' };
  }

  // Strategy 1: Extract user ID from path and use it
  if (filePath && filePath.includes('/')) {
    const result = await tryGenerateSignedUrl(
      bucketName, 
      filePath, 
      expirySeconds, 
      'direct-path'
    );
    if (result.success) return result;
  }

  // Strategy 2: Use path-derived user ID
  if (filePath) {
    const pathUserId = extractUserIdFromPath(filePath);
    if (pathUserId && pathUserId !== sessionUserId) {
      const result = await tryGenerateSignedUrl(
        bucketName, 
        `${pathUserId}/${filename}`, 
        expirySeconds, 
        'path-derived'
      );
      if (result.success) return result;
    }
  }

  // Strategy 3: Fallback to session user ID
  const result = await tryGenerateSignedUrl(
    bucketName, 
    `${sessionUserId}/${filename}`, 
    expirySeconds, 
    'session-fallback'
  );
  if (result.success) return result;

  return { 
    success: false, 
    error: 'All file access strategies failed' 
  };
}

/**
 * Try to generate a signed URL and validate it works
 */
async function tryGenerateSignedUrl(
  bucketName: string, 
  path: string, 
  expirySeconds: number,
  method: FileAccessResult['method']
): Promise<FileAccessResult> {
  try {
    console.log(`Attempting signed URL generation using ${method} for path:`, path);
    
    const { data: signedUrlData, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expirySeconds);
    
    if (error) {
      console.warn(`Signed URL generation failed (${method}):`, error.message);
      return { success: false, error: error.message, method };
    }
    
    if (!signedUrlData?.signedUrl) {
      console.warn(`No signed URL returned (${method})`);
      return { success: false, error: 'No signed URL returned', method };
    }

    // Validate the URL actually works
    const isValid = await validateSignedUrl(signedUrlData.signedUrl);
    if (!isValid) {
      console.warn(`Generated signed URL failed validation (${method})`);
      return { success: false, error: 'Generated URL failed validation', method };
    }

    console.log(`Successfully generated and validated signed URL using ${method}`);
    return { 
      success: true, 
      url: signedUrlData.signedUrl, 
      method 
    };
  } catch (error) {
    console.error(`Error in tryGenerateSignedUrl (${method}):`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      method 
    };
  }
}

/**
 * Extract user ID from file path
 */
export function extractUserIdFromPath(filePath: string): string | null {
  if (!filePath || !filePath.includes('/')) return null;
  
  const pathParts = filePath.split('/');
  const potentialUserId = pathParts[0];
  
  // Basic UUID validation (36 characters with hyphens)
  if (potentialUserId && potentialUserId.length === 36 && potentialUserId.includes('-')) {
    return potentialUserId;
  }
  
  return null;
}

/**
 * Validate that a signed URL actually works by making a HEAD request
 */
export async function validateSignedUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    console.error('URL validation failed:', error);
    return false;
  }
}

/**
 * Audit file access issues for a content idea
 */
export async function auditContentIdeaFileAccess(idea: any, sessionUserId: string): Promise<{
  hasFile: boolean;
  hasPath: boolean;
  pathUserId: string | null;
  userIdMismatch: boolean;
  canGenerateUrl: boolean;
  accessMethod?: string;
}> {
  const audit = {
    hasFile: false,
    hasPath: false,
    pathUserId: null as string | null,
    userIdMismatch: false,
    canGenerateUrl: false,
    accessMethod: undefined as string | undefined
  };

  if (idea.source_type !== 'file' || !idea.source_data) {
    return audit;
  }

  audit.hasFile = !!idea.source_data.filename;
  audit.hasPath = !!idea.source_data.path;
  
  if (audit.hasPath) {
    audit.pathUserId = extractUserIdFromPath(idea.source_data.path);
    audit.userIdMismatch = audit.pathUserId !== null && audit.pathUserId !== sessionUserId;
  }

  // Test if we can generate a valid URL
  const result = await generateValidatedSignedUrl(idea.source_data, sessionUserId);
  audit.canGenerateUrl = result.success;
  audit.accessMethod = result.method;

  return audit;
}