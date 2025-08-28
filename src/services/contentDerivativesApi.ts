
import { supabase } from '@/integrations/supabase/client';
import { getCallbackUrl, getStorageUrl } from '@/config/environment';
import { logger } from '@/utils/logger';

export interface ContentDerivative {
  id: string;
  content_item_id: string;
  user_id: string;
  title: string;
  content: string | null;
  derivative_type: string;
  category: 'General' | 'Social' | 'Ads';
  status: 'draft' | 'approved' | 'published' | 'discarded';
  metadata: Record<string, any>;
  word_count: number | null;
  content_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'composite';
  file_url: string | null;
  file_path: string | null;
  mime_type: string | null;
  file_size: string | null;
  internal_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContentDerivativeData {
  content_item_id: string;
  user_id: string;
  title: string;
  content?: string | null;
  derivative_type: string;
  category: 'General' | 'Social' | 'Ads';
  status?: 'draft' | 'approved' | 'published' | 'discarded';
  metadata?: Record<string, any>;
  word_count?: number;
  content_type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'composite';
  file_url?: string | null;
  file_path?: string | null;
  mime_type?: string | null;
  file_size?: string | null;
}

export async function fetchContentDerivatives(contentItemId: string): Promise<ContentDerivative[]> {
  logger.debug('Fetching content derivatives for item:', contentItemId);
  
  const { data, error } = await supabase
    .from('content_derivatives')
    .select('id,content_item_id,user_id,title,content,derivative_type,category,status,metadata,word_count,content_type,file_url,file_path,mime_type,file_size,internal_name,created_at,updated_at')
    .eq('content_item_id', contentItemId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching content derivatives:', error);
    throw new Error(`Failed to fetch content derivatives: ${error.message}`);
  }

  return data as ContentDerivative[];
}

export async function createContentDerivative(derivativeData: CreateContentDerivativeData): Promise<ContentDerivative> {
  logger.info('Creating content derivative:', derivativeData);
  
  const { data, error } = await supabase
    .from('content_derivatives')
    .insert([{
      ...derivativeData,
      content_type: derivativeData.content_type || 'text',
      internal_name: `DERIV_${derivativeData.title.replace(/[^A-Za-z0-9]/g, '_').toUpperCase()}_${Date.now()}`
    }])
.select('id,content_item_id,user_id,title,content,derivative_type,category,status,metadata,word_count,content_type,file_url,file_path,mime_type,file_size,internal_name,created_at,updated_at')
    .single();

  if (error) {
    logger.error('Error creating content derivative:', error);
    throw new Error(`Failed to create content derivative: ${error.message}`);
  }

  return data as ContentDerivative;
}

export async function updateContentDerivative(id: string, updates: Partial<ContentDerivative>): Promise<ContentDerivative> {
  logger.info('Updating content derivative:', id, updates);
  
  const { data, error } = await supabase
    .from('content_derivatives')
    .update(updates)
    .eq('id', id)
.select('id,content_item_id,user_id,title,content,derivative_type,category,status,metadata,word_count,content_type,file_url,file_path,mime_type,file_size,internal_name,created_at,updated_at')
    .single();

  if (error) {
    logger.error('Error updating content derivative:', error);
    throw new Error(`Failed to update content derivative: ${error.message}`);
  }

  return data as ContentDerivative;
}

export async function deleteContentDerivative(id: string): Promise<void> {
  logger.info('Deleting content derivative:', id);
  
  const { error } = await supabase
    .from('content_derivatives')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Error deleting content derivative:', error);
    throw new Error(`Failed to delete content derivative: ${error.message}`);
  }
}

export async function triggerDerivativeGeneration(
  contentItemId: string, 
  derivativeTypes: string[], 
  category: 'General' | 'Social' | 'Ads',
  userId: string
): Promise<void> {
  logger.info('Triggering derivative generation webhook');
  
  // Check if there's an active derivative_generation webhook
  const { data: webhook, error: webhookError } = await supabase
    .from('webhook_configurations')
    .select('webhook_url')
    .eq('webhook_type', 'derivative_generation')
    .eq('is_active', true)
    .maybeSingle();

  if (webhookError) {
    logger.error('Error fetching webhook configuration:', webhookError);
    throw new Error(`Webhook configuration error: ${webhookError.message}`);
  }

  if (!webhook?.webhook_url) {
    logger.info('No active derivative generation webhook configured, creating derivatives locally');
    return;
  }

  // Get the content item for context
  const { data: contentItem, error: contentError } = await supabase
    .from('content_items')
    .select('id,user_id,title,content,summary,content_type,status,created_at,updated_at')
    .eq('id', contentItemId)
    .single();

  if (contentError) {
    logger.error('Error fetching content item:', contentError);
    throw new Error(`Failed to fetch content item: ${contentError.message}`);
  }

  // Create a submission record first to align with other workflows
  const { data: submission, error: submissionError } = await supabase
    .from('content_submissions')
    .insert({
      user_id: userId,
      knowledge_base: 'derivative_generation',
      content_type: category,
      processing_status: 'queued',
      webhook_triggered_at: new Date().toISOString()
    })
    .select()
    .single();

  if (submissionError) {
    logger.error('Error creating submission record:', submissionError);
    throw new Error(`Failed to create submission record: ${submissionError.message}`);
  }

  // Prepare webhook payload with submission-based callback structure
  const payload = {
    type: 'derivative_generation',
    submission_id: submission.id,
    content_item_id: contentItemId,
    content_item: contentItem,
    derivative_types: derivativeTypes,
    category: category,
    user_id: userId,
    timestamp: new Date().toISOString(),
    callback_url: getCallbackUrl('process-idea-callback'),
    storage_config: {
      bucket_name: 'content-derivatives',
      base_url: getStorageUrl('content-derivatives')
    },
    special_instructions: {
      linkedin_ads: {
        output_format: 'composite',
        required_components: ['headline', 'intro_text', 'image_url'],
        content_structure: 'json',
        expected_format: {
          content: 'JSON string containing: {"headline": "...", "intro_text": "...", "image_url": "..."}',
          content_type: 'composite',
          file_url: 'URL to the generated image (same as image_url in content JSON)'
        },
        instructions: 'Generate headline, intro text, and image as a complete LinkedIn ad. Store structured JSON in content field with all three components.'
      }
    }
  };

  try {
    const response = await fetch(webhook.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Webhook failed with status ${response.status}: ${responseText}`);
    }

    // Update submission status to processing
    await supabase
      .from('content_submissions')
      .update({ processing_status: 'processing' })
      .eq('id', submission.id);

    logger.info('Derivative generation webhook triggered successfully');
  } catch (error) {
    logger.error('Error calling derivative generation webhook:', error);
    
    // Update submission status to failed
    await supabase
      .from('content_submissions')
      .update({ 
        processing_status: 'failed',
        error_message: error.message 
      })
      .eq('id', submission.id);
    
    throw new Error(`Failed to trigger derivative generation webhook: ${error.message}`);
  }
}

// Helper function to download a file from Supabase storage
export async function downloadDerivativeFile(derivative: ContentDerivative): Promise<void> {
  if (!derivative.file_path) {
    throw new Error('No file path available for download');
  }

  try {
    const { data, error } = await supabase.storage
      .from('content-derivatives')
      .download(derivative.file_path);

    if (error) {
      logger.error('Download error:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }

    // Create a blob URL and trigger download
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = derivative.file_path.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error('Error downloading file:', error);
    throw error;
  }
}
