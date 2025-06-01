
import { supabase } from '@/integrations/supabase/client';
import { sanitizeFilename } from '@/lib/fileUtils';

export async function handleFileUpload(file: File, userId: string) {
  const originalFilename = file.name;
  const sanitizedFilename = sanitizeFilename(originalFilename);
  const fileName = `${Date.now()}-${sanitizedFilename}`;
  const filePath = `${userId}/${fileName}`;
  
  console.log('Uploading file to storage:', {
    originalFilename,
    sanitizedFilename,
    filePath
  });
  
  const { error: uploadError } = await supabase.storage
    .from('content-files')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error('File upload failed:', uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }
  
  console.log('File uploaded successfully');
  
  return {
    filename: fileName,
    originalName: originalFilename,
    sanitizedName: sanitizedFilename,
    size: file.size,
    type: file.type
  };
}
