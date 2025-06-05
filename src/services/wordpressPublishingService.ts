
import { supabase } from '@/integrations/supabase/client';
import { triggerWebhook } from '@/services/webhookService';
import { ContentItem } from '@/services/contentItemsApi';
import { buildWordPressPayload } from './wordpress/payloadBuilder';

// Re-export the interface for backward compatibility
export type { WordPressPublishPayload } from './wordpress/types';

export async function publishToWordPress(contentItem: ContentItem, userId: string): Promise<void> {
  console.log('Publishing content item to WordPress:', contentItem.id);
  
  // Fetch derivatives for this content item
  const { data: derivatives } = await supabase
    .from('content_derivatives')
    .select('*')
    .eq('content_item_id', contentItem.id);

  console.log('Found derivatives:', derivatives?.length || 0);

  // Build the WordPress publish payload - cast the derivatives to proper type
  const payload = buildWordPressPayload(contentItem, userId, derivatives as any);

  console.log('WordPress publish payload:', payload);

  try {
    // Trigger the WordPress publishing webhook
    await triggerWebhook('wordpress_publishing', payload);
    console.log('WordPress publishing webhook triggered successfully');
    
    // Update content item status to indicate WordPress publishing is in progress
    await supabase
      .from('content_items')
      .update({ 
        status: 'publishing',
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItem.id);

  } catch (error) {
    console.error('WordPress publishing failed:', error);
    
    // Update content item status to indicate publishing failed
    await supabase
      .from('content_items')
      .update({ 
        status: 'publish_failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItem.id);
    
    throw error;
  }
}
