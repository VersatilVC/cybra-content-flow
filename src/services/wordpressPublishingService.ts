import { supabase } from '@/integrations/supabase/client';
import { triggerWebhook } from '@/services/webhookService';
import { ContentItem } from '@/services/contentItemsApi';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { generateSlug } from '@/utils/slugGenerator';

export interface WordPressPublishPayload {
  type: 'wordpress_publishing';
  content_item_id: string;
  user_id: string;
  title: string;
  content: string;
  slug: string;
  status: 'draft';
  comment_status: 'closed';
  categories: string[];
  tags: string[];
  content_html: string;
  excerpt?: string;
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
  let html = markdown;
  
  // 1. Remove H1 titles completely (they are sent separately as title field)
  html = html.replace(/^# .*$/gm, '').trim();
  
  // 2. Process TL;DR sections with purple background
  html = html.replace(/(^|\n)(tl;?dr\??:?)\s*\n?((?:(?:\* .*|\- .*|\d+\. .*)\n?)*)/gim, (match, prefix, tldrHeader, bulletContent) => {
    // Extract bullet points from the content
    const bullets = bulletContent
      .split('\n')
      .filter(line => line.trim().match(/^(\*|\-|\d+\.)\s+/))
      .map(line => {
        const content = line.replace(/^(\*|\-|\d+\.)\s+/, '').trim();
        return `<li>${content}</li>`;
      })
      .join('\n        ');
    
    if (bullets) {
      return `${prefix}<div style="background-color: #6B46C1; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: white; margin-top: 0; margin-bottom: 15px;">TL;DR?</h3>
      <ul style="margin: 0; padding-left: 20px; color: white;">
        ${bullets}
      </ul>
    </div>`;
    }
    
    return match;
  });
  
  // 3. Convert headers (H2, H3 only - H1 already removed)
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  
  // 4. Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // 5. Italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // 6. Links
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2">$1</a>');
  
  // 7. Process remaining lists (not in TL;DR sections)
  html = html.replace(/^(\* .*$)/gm, '<li>$1</li>');
  html = html.replace(/^(- .*$)/gm, '<li>$1</li>');
  html = html.replace(/^(\d+\. .*$)/gm, '<li>$1</li>');
  
  // Clean up list item content (remove bullet markers)
  html = html.replace(/<li>\* (.*)<\/li>/g, '<li>$1</li>');
  html = html.replace(/<li>- (.*)<\/li>/g, '<li>$1</li>');
  html = html.replace(/<li>\d+\. (.*)<\/li>/g, '<li>$1</li>');
  
  // 8. Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    // Skip if this is inside a TL;DR div
    if (match.includes('background-color: #6B46C1')) {
      return match;
    }
    // Check if these are numbered lists
    if (match.includes('<li>\\d+\\.')) {
      return `<ol>${match}</ol>`;
    }
    return `<ul>${match}</ul>`;
  });
  
  // 9. Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
  
  // 10. Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]*)`/g, '<code>$1</code>');
  
  // 11. Convert paragraphs (split by double newlines)
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      // Don't wrap if already wrapped in HTML tags
      if (p.match(/^<(h[1-6]|ul|ol|blockquote|div|pre)/i)) {
        return p;
      }
      return `<p>${p}</p>`;
    })
    .join('\n\n');
  
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

  // Create the WordPress publish payload
  const payload: WordPressPublishPayload = {
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
