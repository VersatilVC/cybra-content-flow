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
  content_item_id?: string;
  pr_campaign_id?: string;
  general_content_id?: string;
}

export async function uploadReportToN8N(file: File, userId: string): Promise<void> {
  try {
    console.log('Starting report upload process for user:', userId);
    
    // First upload the file to Supabase storage
    const uploadResult = await handleFileUpload(file, userId, 'content-files');
    console.log('File uploaded successfully:', uploadResult);
    
    // Generate a signed URL for the file (valid for 24 hours)
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('content-files')
      .createSignedUrl(uploadResult.path, 86400); // 24 hours
    
    if (urlError) {
      console.error('Error generating signed URL:', urlError);
      throw new Error('Failed to generate file access URL');
    }
    console.log('Signed URL generated successfully');

    // Create general content item first
    const title = uploadResult.originalName.replace(/\.[^/.]+$/, ""); // Remove file extension
    console.log('Creating general content item with title:', title);
    
    const contentItemData = {
      user_id: userId,
      title,
      category: 'Reports',
      derivative_type: 'Report',
      content_type: 'file',
      source_type: 'file',
      source_data: {
        original_filename: uploadResult.originalName,
        file_path: uploadResult.path
      },
      target_audience: 'Business Professionals',
      file_path: uploadResult.path,
      file_url: signedUrl.signedUrl,
      file_size: uploadResult.size,
      mime_type: file.type,
      status: 'ready',
      internal_name: title.replace(/[^A-Za-z0-9\s]/g, '').trim().substring(0, 100) || 'Untitled Report'
    };
    
    console.log('About to insert general content item:', contentItemData);
    
    const { data: contentItem, error: contentError } = await supabase
      .from('general_content_items')
      .insert(contentItemData)
      .select()
      .single();

    if (contentError) {
      console.error('Error creating general content item:', contentError);
      console.error('Content item data that failed:', contentItemData);
      throw new Error(`Failed to create content item record: ${contentError.message}`);
    }
    
    console.log('General content item created successfully:', contentItem);

    // Create PR campaign linked to the content item
    const campaignData = {
      user_id: userId,
      title: `PR Campaign: ${title}`,
      content_item_id: contentItem.id,
      source_type: 'general_content',
      source_id: contentItem.id,
      status: 'draft'
    };
    
    console.log('About to insert PR campaign:', campaignData);
    
    const { data: campaign, error: campaignError } = await supabase
      .from('pr_campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (campaignError) {
      console.error('Error creating PR campaign:', campaignError);
      console.error('Campaign data that failed:', campaignData);
      throw new Error(`Failed to create PR campaign record: ${campaignError.message}`);
    }
    
    console.log('PR campaign created successfully:', campaign);
    
    // Prepare payload for N8N webhook with database IDs
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
      status: 'ready',
      content_item_id: contentItem.id,
      pr_campaign_id: campaign.id,
      general_content_id: contentItem.id
    };
    
    console.log('Final payload being sent to N8N:', payload);
    
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