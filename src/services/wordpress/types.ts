
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
