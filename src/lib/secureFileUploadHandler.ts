
import { supabase } from '@/integrations/supabase/client';
import { sanitizeFilename } from '@/lib/fileUtils';
import { validateFileType, validateFileSize, logSecurityEvent, globalRateLimiter } from '@/lib/security';

interface SecureUploadOptions {
  allowedTypes?: string[];
  maxSizeInMB?: number;
  requireAuth?: boolean;
}

export async function secureFileUpload(
  file: File, 
  userId: string, 
  bucketName: string = 'content-files',
  options: SecureUploadOptions = {}
) {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    maxSizeInMB = 10,
    requireAuth = true
  } = options;

  // Rate limiting check
  if (!globalRateLimiter.isAllowed(`upload_${userId}`)) {
    logSecurityEvent('rate_limit_exceeded', { userId, action: 'file_upload' }, userId);
    throw new Error('Too many upload attempts. Please try again later.');
  }

  // Authentication check
  if (requireAuth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      logSecurityEvent('unauthorized_upload_attempt', { userId }, userId);
      throw new Error('Authentication required for file upload');
    }
  }

  // File size validation
  if (!validateFileSize(file, maxSizeInMB)) {
    logSecurityEvent('file_size_exceeded', { 
      userId, 
      fileName: file.name, 
      fileSize: file.size, 
      maxSize: maxSizeInMB * 1024 * 1024 
    }, userId);
    throw new Error(`File size exceeds ${maxSizeInMB}MB limit`);
  }

  // File type validation
  if (!validateFileType(file, allowedTypes)) {
    logSecurityEvent('invalid_file_type', { 
      userId, 
      fileName: file.name, 
      fileType: file.type, 
      allowedTypes 
    }, userId);
    throw new Error('File type not allowed');
  }

  // Enhanced filename sanitization
  const originalFilename = file.name;
  const sanitizedFilename = sanitizeFilename(originalFilename);
  
  // Additional security: remove any remaining special characters
  const secureFilename = sanitizedFilename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
  
  const fileName = `${Date.now()}-${secureFilename}`;
  const filePath = `${userId}/${fileName}`;
  
  console.log('Secure file upload:', {
    originalFilename,
    sanitizedFilename,
    secureFilename,
    filePath,
    bucketName,
    fileSize: file.size,
    fileType: file.type
  });
  
  try {
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // Prevent overwriting existing files
      });
      
    if (uploadError) {
      logSecurityEvent('file_upload_failed', { 
        userId, 
        fileName: originalFilename, 
        error: uploadError.message 
      }, userId);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }
    
    console.log('File uploaded successfully');
    
    // Generate the correct public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    logSecurityEvent('file_upload_success', { 
      userId, 
      fileName: originalFilename, 
      filePath,
      fileSize: file.size 
    }, userId);
    
    return {
      filename: fileName,
      originalName: originalFilename,
      sanitizedName: secureFilename,
      size: file.size.toString(),
      type: file.type,
      path: filePath,
      url: publicUrlData.publicUrl
    };
  } catch (error) {
    logSecurityEvent('file_upload_error', { 
      userId, 
      fileName: originalFilename, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, userId);
    throw error;
  }
}

export async function secureDerivativeFileUpload(file: File, userId: string) {
  return secureFileUpload(file, userId, 'content-derivatives', {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg'],
    maxSizeInMB: 50 // Larger limit for derivatives
  });
}
