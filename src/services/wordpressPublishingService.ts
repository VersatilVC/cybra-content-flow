
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/services/contentItemsApi';
import { wordpressApi } from './wordpressApiService';

interface ContentDerivative {
  id: string;
  derivative_type: string;
  content_type: string;
  content?: string;
  file_url?: string;
  word_count?: number;
  title: string;
}

interface WordPressPublishResult {
  success: boolean;
  postId?: number;
  postUrl?: string;
  error?: string;
}

export async function publishToWordPress(contentItem: ContentItem, userId: string): Promise<WordPressPublishResult> {
  console.log('Publishing content item to WordPress:', contentItem.id);
  
  try {
    // Fetch derivatives for this content item
    const { data: derivatives } = await supabase
      .from('content_derivatives')
      .select('*')
      .eq('content_item_id', contentItem.id);

    console.log('Found derivatives:', derivatives?.length || 0);

    // Validate required derivatives
    const blogImage = derivatives?.find(d => 
      d.derivative_type.toLowerCase().includes('blog') && 
      d.content_type === 'image' && 
      d.file_url
    );

    const excerpt = derivatives?.find(d => 
      d.derivative_type.toLowerCase().includes('excerpt') && 
      d.word_count && 
      d.word_count <= 200 &&
      d.content
    );

    if (!blogImage) {
      throw new Error('Blog image derivative not found. Please ensure a blog image exists before publishing.');
    }

    if (!excerpt) {
      throw new Error('200-word excerpt derivative not found. Please ensure a 200-word excerpt exists before publishing.');
    }

    console.log('Validation passed - found blog image and excerpt');

    // Update status to publishing
    await supabase
      .from('content_items')
      .update({ 
        status: 'publishing',
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItem.id);

    // Get author ID from WordPress
    const authorId = await wordpressApi.getAuthorId();
    console.log('WordPress author ID:', authorId);

    // Upload blog image to WordPress
    console.log('Uploading blog image to WordPress...');
    const imageResponse = await fetch(blogImage.file_url);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch blog image for upload');
    }
    const imageBlob = await imageResponse.blob();
    const uploadedImage = await wordpressApi.uploadMedia(imageBlob, `${contentItem.title}-featured-image.jpg`);
    console.log('Image uploaded successfully:', uploadedImage.id);

    // Create draft post with all the required settings
    console.log('Creating WordPress draft post...');
    const post = await wordpressApi.createDraftPost(
      contentItem.title,
      contentItem.content || '',
      authorId,
      uploadedImage.id,
      excerpt.content
    );

    console.log('WordPress post created successfully:', post.id);

    // Update content item with WordPress information
    await supabase
      .from('content_items')
      .update({ 
        status: 'published',
        wordpress_url: post.link,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItem.id);

    console.log('Content item updated with WordPress URL');

    return {
      success: true,
      postId: post.id,
      postUrl: post.link
    };

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
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
