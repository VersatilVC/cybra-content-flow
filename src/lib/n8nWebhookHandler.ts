import { supabase } from '@/integrations/supabase/client';
import { handleFileUpload } from '@/lib/fileUploadHandler';

export interface N8NReportUploadPayload {
  request_type: 'report_upload';
  file_url: string;
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  user_id: string;
  timestamp: string;
  category?: string;
  derivative_type?: string;
  status?: string;
}

export async function uploadReportToN8N(file: File, userId: string): Promise<void> {
  try {
    // First upload the file to Supabase storage
    const uploadResult = await handleFileUpload(file, userId, 'content-files');
    
    // Generate a signed URL for the file (valid for 24 hours)
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('content-files')
      .createSignedUrl(uploadResult.path, 86400); // 24 hours
    
    if (urlError) {
      console.error('Error generating signed URL:', urlError);
      throw new Error('Failed to generate file access URL');
    }
    
    // Prepare payload for N8N webhook
    const payload = {
      request_type: 'report_upload',
      file_url: signedUrl.signedUrl,
      file_path: uploadResult.path,
      original_filename: uploadResult.originalName,
      file_size: parseInt(uploadResult.size),
      mime_type: file.type,
      user_id: userId,
      timestamp: new Date().toISOString(),
      category: 'Reports',
      derivative_type: 'Report',
      status: 'ready'
    };
    
    // Use Supabase edge function to bypass CORS
    console.log('Calling upload-report-to-n8n edge function with payload:', payload);
    const { data, error: functionError } = await supabase.functions.invoke('upload-report-to-n8n', {
      body: payload
    });
    
    console.log('Edge function response:', { data, error: functionError });
    
    if (functionError) {
      throw new Error(`Failed to upload report to N8N: ${functionError.message}`);
    }
    
    console.log('Report successfully uploaded and sent to N8N');
  } catch (error) {
    console.error('Error uploading report to N8N:', error);
    throw error;
  }
}