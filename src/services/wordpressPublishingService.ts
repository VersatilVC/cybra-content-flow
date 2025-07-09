
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/services/contentItemsApi';

interface WordPressPublishResult {
  success: boolean;
  postId?: number;
  postUrl?: string;
  error?: string;
}

export async function publishToWordPress(contentItem: ContentItem, userId: string): Promise<WordPressPublishResult> {
  console.log('Publishing content item to WordPress:', contentItem.id);
  
  try {
    // Call the Supabase Edge Function for WordPress publishing
    const { data, error } = await supabase.functions.invoke('wordpress-publish', {
      body: {
        contentItemId: contentItem.id,
        userId: userId
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      console.error('Error details:', { message: error.message, context: error.context });
      throw new Error(error.message || 'Failed to call WordPress publishing function');
    }

    console.log('Edge function response:', data);

    if (!data.success) {
      console.error('WordPress publishing failed with error:', data.error);
      throw new Error(data.error || 'WordPress publishing failed');
    }

    return {
      success: true,
      postId: data.postId,
      postUrl: data.postUrl
    };

  } catch (error) {
    console.error('WordPress publishing failed:', error);
    
    // Update content item status to indicate publishing failed
    await supabase
      .from('content_items')
      .update({ 
        status: 'needs_fix',
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItem.id);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
