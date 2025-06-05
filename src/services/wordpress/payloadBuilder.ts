
import { ContentItem } from '@/services/contentItemsApi';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { generateSlug } from '@/utils/slugGenerator';
import { convertMarkdownToHtml } from '@/utils/markdownToHtml';
import { WordPressPublishPayload } from './types';

function getCallbackBaseUrl(): string {
  return 'https://uejgjytmqpcilwfrlpai.supabase.co';
}

export function buildWordPressPayload(
  contentItem: ContentItem,
  userId: string,
  derivatives?: ContentDerivative[]
): WordPressPublishPayload {
  // Convert markdown content to HTML
  const contentHtml = contentItem.content ? convertMarkdownToHtml(contentItem.content) : '';

  // Generate slug from title
  const slug = generateSlug(contentItem.title);

  // Find potential featured image (look for blog images or general images)
  const imageDerivatives = derivatives?.filter(d => 
    d.derivative_type === 'blog_image' || 
    d.derivative_type === 'featured_image' ||
    (d.metadata && typeof d.metadata === 'object' && d.metadata !== null && 
     (d.metadata as any).type === 'image')
  ) || [];

  const featuredImage = imageDerivatives.length > 0 ? {
    url: imageDerivatives[0].file_url || '',
    alt: imageDerivatives[0].title || contentItem.title,
    caption: imageDerivatives[0].content || ''
  } : undefined;

  // Prepare media attachments from all image derivatives
  const mediaAttachments = imageDerivatives.map(derivative => ({
    url: derivative.file_url || '',
    type: 'image',
    filename: derivative.title || `${contentItem.title}-image`,
    alt: derivative.title || contentItem.title,
    caption: derivative.content || ''
  }));

  return {
    type: 'wordpress_publishing',
    content_item_id: contentItem.id,
    user_id: userId,
    title: contentItem.title,
    content: contentItem.content || '',
    slug: slug,
    status: 'draft',
    comment_status: 'closed',
    categories: ['Blog'],
    tags: contentItem.tags || [],
    content_html: contentHtml,
    excerpt: contentItem.summary || undefined,
    content_type: contentItem.content_type,
    word_count: contentItem.word_count || undefined,
    featured_image: featuredImage,
    media_attachments: mediaAttachments,
    metadata: {
      original_content_item_id: contentItem.id,
      created_at: contentItem.created_at,
      content_brief_id: contentItem.content_brief_id || undefined,
      resources: contentItem.resources || undefined,
    },
    callback_url: `${getCallbackBaseUrl()}/functions/v1/process-idea-callback`,
    callback_data: {
      type: 'wordpress_publishing_complete',
      content_item_id: contentItem.id,
      user_id: userId,
      title: contentItem.title
    },
    timestamp: new Date().toISOString(),
  };
}
