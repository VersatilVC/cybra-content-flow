
import { supabase } from '@/integrations/supabase/client';

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
  console.log('Fetching content derivatives for item:', contentItemId);
  
  const { data, error } = await supabase
    .from('content_derivatives')
    .select('*')
    .eq('content_item_id', contentItemId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content derivatives:', error);
    throw new Error(`Failed to fetch content derivatives: ${error.message}`);
  }

  return data as ContentDerivative[];
}

export async function createContentDerivative(derivativeData: CreateContentDerivativeData): Promise<ContentDerivative> {
  console.log('Creating content derivative:', derivativeData);
  
  const { data, error } = await supabase
    .from('content_derivatives')
    .insert([{
      ...derivativeData,
      content_type: derivativeData.content_type || 'text'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating content derivative:', error);
    throw new Error(`Failed to create content derivative: ${error.message}`);
  }

  return data as ContentDerivative;
}

export async function updateContentDerivative(id: string, updates: Partial<ContentDerivative>): Promise<ContentDerivative> {
  console.log('Updating content derivative:', id, updates);
  
  const { data, error } = await supabase
    .from('content_derivatives')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating content derivative:', error);
    throw new Error(`Failed to update content derivative: ${error.message}`);
  }

  return data as ContentDerivative;
}

export async function deleteContentDerivative(id: string): Promise<void> {
  console.log('Deleting content derivative:', id);
  
  const { error } = await supabase
    .from('content_derivatives')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting content derivative:', error);
    throw new Error(`Failed to delete content derivative: ${error.message}`);
  }
}

export async function triggerDerivativeGeneration(
  contentItemId: string, 
  derivativeTypes: string[], 
  category: 'General' | 'Social' | 'Ads',
  userId: string
): Promise<void> {
  console.log('Triggering derivative generation webhook');
  
  // Check if there's an active derivative_generation webhook
  const { data: webhook, error: webhookError } = await supabase
    .from('webhook_configurations')
    .select('webhook_url')
    .eq('webhook_type', 'derivative_generation')
    .eq('is_active', true)
    .maybeSingle();

  if (webhookError) {
    console.error('Error fetching webhook configuration:', webhookError);
    throw new Error(`Webhook configuration error: ${webhookError.message}`);
  }

  if (!webhook?.webhook_url) {
    console.log('No active derivative generation webhook configured, creating derivatives locally');
    return;
  }

  // Get the content item for context
  const { data: contentItem, error: contentError } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', contentItemId)
    .single();

  if (contentError) {
    console.error('Error fetching content item:', contentError);
    throw new Error(`Failed to fetch content item: ${contentError.message}`);
  }

  // Prepare webhook payload with correct callback structure
  const payload = {
    type: 'derivative_generation',
    content_item_id: contentItemId,
    content_item: contentItem,
    derivative_types: derivativeTypes,
    category: category,
    user_id: userId,
    timestamp: new Date().toISOString(),
    // Fixed callback URL to match the working notification system
    callback_url: `https://uejgjytmqpcilwfrlpai.supabase.co/functions/v1/process-idea-callback`,
    // Added proper callback_data structure for notifications
    callback_data: {
      type: 'derivative_generation_complete',
      content_item_id: contentItemId,
      user_id: userId,
      title: contentItem.title,
      category: category,
      derivative_types: derivativeTypes
    },
    storage_config: {
      bucket_name: 'content-derivatives',
      base_url: 'https://uejgjytmqpcilwfrlpai.supabase.co/storage/v1/object/public/content-derivatives'
    },
    // Enhanced instructions for LinkedIn ads with proper structure
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

    console.log('Derivative generation webhook triggered successfully');
  } catch (error) {
    console.error('Error calling derivative generation webhook:', error);
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
      console.error('Download error:', error);
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
    console.error('Error downloading file:', error);
    throw error;
  }
}
