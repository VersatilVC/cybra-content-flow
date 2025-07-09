import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ContentItem, ContentDerivative } from './types.ts'

export class DatabaseOperations {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('PROJECT_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async getContentItem(contentItemId: string): Promise<{ contentItem: ContentItem | null; error?: any }> {
    const { data: contentItem, error: itemError } = await this.supabase
      .from('content_items')
      .select('*')
      .eq('id', contentItemId)
      .single();

    if (itemError || !contentItem) {
      console.error('Content item not found:', itemError);
      return { contentItem: null, error: itemError };
    }

    return { contentItem };
  }

  async getContentDerivatives(contentItemId: string): Promise<ContentDerivative[]> {
    const { data: derivatives } = await this.supabase
      .from('content_derivatives')
      .select('*')
      .eq('content_item_id', contentItemId);

    return derivatives || [];
  }

  async updateContentItemProgress(contentItemId: string): Promise<void> {
    await this.supabase
      .from('content_items')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);
  }

  async updateContentItemWithWordPressInfo(
    contentItemId: string,
    wordpressUrl: string
  ): Promise<void> {
    await this.supabase
      .from('content_items')
      .update({ 
        status: 'published',
        wordpress_url: wordpressUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);
  }
}