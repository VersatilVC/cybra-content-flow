
import { supabase } from '@/integrations/supabase/client';
import { sanitizeFilename } from '@/lib/fileUtils';

export async function handleFileUpload(file: File, userId: string, bucketName: string = 'content-files') {
  const originalFilename = file.name;
  const sanitizedFilename = sanitizeFilename(originalFilename);
  const fileName = `${Date.now()}-${sanitizedFilename}`;
  const filePath = `${userId}/${fileName}`;
  
  console.log('Uploading file to storage:', {
    originalFilename,
    sanitizedFilename,
    filePath,
    bucketName
  });
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);
    
  if (uploadError) {
    console.error('File upload failed:', uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }
  
  console.log('File uploaded successfully');
  
  // Generate the correct public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return {
    filename: fileName,
    originalName: originalFilename,
    sanitizedName: sanitizedFilename,
    size: file.size.toString(),
    type: file.type,
    path: filePath,
    url: publicUrlData.publicUrl
  };
}

export async function handleDerivativeFileUpload(file: File, userId: string) {
  return handleFileUpload(file, userId, 'content-derivatives');
}
