
import { supabase } from '@/integrations/supabase/client';
import { triggerWebhook } from '@/services/webhookService';
import { ContentItem } from '@/services/contentItemsApi';
import { ContentDerivative } from '@/services/contentDerivativesApi';

export interface WordPressPublishPayload {
  type: 'wordpress_publishing';
  content_item_id: string;
  user_id: string;
  title: string;
  content_html: string;
  excerpt?: string;
  tags?: string[];
  content_type: string;
  word_count?: number;
  featured_image?: {
    url: string;
    alt?: string;
    caption?: string;
  };
  media_attachments: Array<{
    url: string;
    type: string;
    filename: string;
    alt?: string;
    caption?: string;
  }>;
  metadata: {
    original_content_item_id: string;
    created_at: string;
    content_brief_id?: string;
    resources?: string[];
  };
  callback_url: string;
  callback_data: {
    type: 'wordpress_publishing_complete';
    content_item_id: string;
    user_id: string;
    title: string;
  };
  timestamp: string;
}

function convertMarkdownToHtml(markdown: string): string {
  // Basic markdown to HTML conversion
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>');
  
  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>');
  html = html.replace(/<ul>(<li>\d+\..*<\/li>\n?)+<\/ul>/gim, (match) => {
    return match.replace('<ul>', '<ol>').replace('</ul>', '</ol>');
  });
  
  // Paragraphs (split by double newlines)
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      // Don't wrap if already wrapped in HTML tags
      if (p.match(/^<(h[1-6]|ul|ol|blockquote|div)/i)) {
        return p;
      }
      return `<p>${p}</p>`;
    })
    .join('\n');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]*)`/gim, '<code>$1</code>');
  
  return html.trim();
}

function getCallbackBaseUrl(): string {
  return 'https://uejgjytmqpcilwfrlpai.supabase.co';
}

export async function publishToWordPress(contentItem: ContentItem, userId: string): Promise<void> {
  console.log('Publishing content item to WordPress:', contentItem.id);
  
  // Fetch derivatives for this content item
  const { data: derivatives } = await supabase
    .from('content_derivatives')
    .select('*')
    .eq('content_item_id', contentItem.id);

  console.log('Found derivatives:', derivatives?.length || 0);

  // Convert markdown content to HTML
  const contentHtml = contentItem.content ? convertMarkdownToHtml(contentItem.content) : '';

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
    caption: imageDerivatives[0].description || ''
  } : undefined;

  // Prepare media attachments from all image derivatives
  const mediaAttachments = imageDerivatives.map(derivative => ({
    url: derivative.file_url || '',
    type: 'image',
    filename: derivative.title || `${contentItem.title}-image`,
    alt: derivative.title || contentItem.title,
    caption: derivative.description || ''
  }));

  // Create the WordPress publish payload
  const payload: WordPressPublishPayload = {
    type: 'wordpress_publishing',
    content_item_id: contentItem.id,
    user_id: userId,
    title: contentItem.title,
    content_html: contentHtml,
    excerpt: contentItem.summary || undefined,
    tags: contentItem.tags || undefined,
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
