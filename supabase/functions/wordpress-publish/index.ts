import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WordPressUser {
  id: number;
  username: string;
  email: string;
  name: string;
}

interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  status: string;
  link: string;
  featured_media: number;
}

interface WordPressMedia {
  id: number;
  source_url: string;
  link: string;
}

interface ContentDerivative {
  id: string;
  derivative_type: string;
  content_type: string;
  content?: string;
  file_url?: string;
  word_count?: number;
  title: string;
}

interface ContentItem {
  id: string;
  title: string;
  content?: string;
  user_id: string;
}

class WordPressApiService {
  private baseUrl = 'https://cyabra.com';
  private username = 'ilan.hertz@versatil.vc';
  private appPassword = 'm7WL YRJo kfnR 6nYj CMLJ MhQN';
  private authorEmail = 'rotemb@cyabra.com';

  private getAuthHeaders(): Record<string, string> {
    const credentials = btoa(`${this.username}:${this.appPassword}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async getAuthorId(): Promise<number> {
    try {
      console.log('Fetching WordPress users for author:', this.authorEmail);
      
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(this.authorEmail)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WordPress API error:', errorText);
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const users: WordPressUser[] = await response.json();
      const author = users.find(user => user.email === this.authorEmail);
      
      if (!author) {
        // Fallback to admin user
        const adminResponse = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        });
        
        if (adminResponse.ok) {
          const adminUser: WordPressUser = await adminResponse.json();
          console.log(`Author ${this.authorEmail} not found, using admin user: ${adminUser.email}`);
          return adminUser.id;
        }
        
        throw new Error(`Author with email ${this.authorEmail} not found and fallback failed`);
      }

      console.log('Found author:', author.email, 'with ID:', author.id);
      return author.id;
    } catch (error) {
      console.error('Error fetching author ID:', error);
      throw new Error(`Failed to get author ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadMedia(fileUrl: string, filename: string): Promise<WordPressMedia> {
    try {
      console.log('Downloading file from:', fileUrl);
      
      // Download the file first
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error('Failed to download file from URL');
      }
      
      const fileBlob = await fileResponse.blob();
      console.log('File downloaded, size:', fileBlob.size, 'bytes');
      
      const formData = new FormData();
      formData.append('file', fileBlob, filename);

      console.log('Uploading to WordPress media library...');
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.username}:${this.appPassword}`)}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Media upload error:', errorText);
        throw new Error(`Failed to upload media: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const media: WordPressMedia = await response.json();
      console.log('Media uploaded successfully:', media.id);
      return media;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCategoryId(categoryName: string): Promise<number> {
    try {
      console.log('Fetching WordPress categories');
      
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/categories?search=${encodeURIComponent(categoryName)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WordPress API error:', errorText);
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const categories = await response.json();
      const category = categories.find((cat: any) => cat.name.toLowerCase() === categoryName.toLowerCase());
      
      if (!category) {
        // Create the category if it doesn't exist
        console.log(`Category "${categoryName}" not found, creating it`);
        return await this.createCategory(categoryName);
      }

      console.log('Found category:', category.name, 'with ID:', category.id);
      return category.id;
    } catch (error) {
      console.error('Error fetching category ID:', error);
      throw new Error(`Failed to get category ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCategory(categoryName: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/categories`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-')
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Category creation error:', errorText);
        throw new Error(`Failed to create category: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const category = await response.json();
      console.log('Category created successfully:', category.id);
      return category.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOrCreateTag(tagName: string): Promise<number> {
    try {
      console.log('Fetching WordPress tag:', tagName);
      
      // First, try to find existing tag
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(tagName)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WordPress API error:', errorText);
        throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tags = await response.json();
      const existingTag = tags.find((tag: any) => tag.name.toLowerCase() === tagName.toLowerCase());
      
      if (existingTag) {
        console.log('Found existing tag:', existingTag.name, 'with ID:', existingTag.id);
        return existingTag.id;
      }

      // Create new tag if it doesn't exist
      console.log(`Tag "${tagName}" not found, creating it`);
      const createResponse = await fetch(`${this.baseUrl}/wp-json/wp/v2/tags`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name: tagName,
          slug: tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Tag creation error:', errorText);
        throw new Error(`Failed to create tag: ${createResponse.status} ${createResponse.statusText} - ${errorText}`);
      }

      const newTag = await createResponse.json();
      console.log('Tag created successfully:', newTag.id);
      return newTag.id;
    } catch (error) {
      console.error('Error with tag operation:', error);
      throw new Error(`Failed to get/create tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTagIds(tagNames: string[]): Promise<number[]> {
    const tagIds: number[] = [];
    
    for (const tagName of tagNames) {
      if (tagName && tagName.trim()) {
        try {
          const tagId = await this.getOrCreateTag(tagName.trim());
          tagIds.push(tagId);
        } catch (error) {
          console.error(`Failed to process tag "${tagName}":`, error);
          // Continue with other tags even if one fails
        }
      }
    }
    
    return tagIds;
  }

  async createDraftPost(
    title: string,
    content: string,
    authorId: number,
    categoryId: number,
    featuredMediaId?: number,
    metaDescription?: string,
    tagIds?: number[]
  ): Promise<WordPressPost> {
    try {
      const postData: any = {
        title,
        content,
        status: 'draft',
        author: authorId,
        categories: [categoryId],
        comment_status: 'closed',
        ping_status: 'closed',
      };

      if (featuredMediaId) {
        postData.featured_media = featuredMediaId;
      }

      if (tagIds && tagIds.length > 0) {
        postData.tags = tagIds;
        console.log('Adding tags to post:', tagIds);
      }

      // Add Yoast SEO meta description if provided
      if (metaDescription) {
        postData.meta = {
          _yoast_wpseo_metadesc: metaDescription,
          _yoast_wpseo_metadesc_length: metaDescription.length.toString(),
        };
        postData.excerpt = metaDescription;
      }

      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Post creation error:', errorText);
        throw new Error(`Failed to create post: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const post: WordPressPost = await response.json();
      console.log('WordPress post created successfully:', post.id);
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePostMeta(postId: number, metaDescription: string): Promise<void> {
    try {
      console.log('Updating post meta for post ID:', postId);
      const updateData = {
        meta: {
          _yoast_wpseo_metadesc: metaDescription,
          _yoast_wpseo_metadesc_length: metaDescription.length.toString(),
        },
      };

      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${postId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Post meta update error:', errorText);
        throw new Error(`Failed to update post meta: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('Post meta updated successfully');
    } catch (error) {
      console.error('Error updating post meta:', error);
      throw new Error(`Failed to update post meta: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Advanced markdown to HTML converter with TL;DR styling
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;
  
  // 1. Remove H1 titles completely (they are sent separately as title field)
  html = html.replace(/^# .*$/gm, '').trim();
  
  // 2. Process TL;DR sections FIRST (before header processing) with purple background and white text
  html = html.replace(/(^|\n)(#{0,2}\s*tl;?dr\??:?\s*#{0,2})\s*\n?((?:(?:\n|\r\n)*(?:\* .*|\- .*|\d+\. .*|\+ .*)(?:\n|\r\n)*)*)/gim, (match, prefix, tldrHeader, content) => {
    console.log('TL;DR Match found:', { match, prefix, tldrHeader, content });
    
    // Extract bullet points from the content, handling various spacing
    const lines = content.split(/\n|\r\n/).filter(line => line.trim());
    const bullets = lines
      .filter(line => line.trim().match(/^(\*|\-|\+|\d+\.)\s+/))
      .map(line => {
        const cleanContent = line.replace(/^(\*|\-|\+|\d+\.)\s+/, '').trim();
        return `<li style="color: white; margin-bottom: 8px;">${cleanContent}</li>`;
      })
      .join('\n        ');
    
    console.log('Extracted bullets:', bullets);
    
    if (bullets) {
      return `${prefix}<div style="background-color: #8B5CF6; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: system-ui, -apple-system, sans-serif;">
      <h3 style="color: white !important; margin-top: 0; margin-bottom: 15px; font-weight: bold !important; font-size: 1.5rem !important; line-height: 1.4 !important;">TL;DR</h3>
      <ul style="margin: 0; padding-left: 20px; color: white; list-style-type: disc;">
        ${bullets}
      </ul>
    </div>

`;
    }
    
    return match;
  });
  
  // 3. Convert headers (H2, H3 only - H1 already removed, TL;DR already processed)
  // Updated regex to handle headers that might have leading/trailing whitespace
  html = html.replace(/^\s*### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^\s*## (.*)$/gm, '<h2>$1</h2>');
  
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
  html = html.replace(/^(\+ .*$)/gm, '<li>$1</li>');
  html = html.replace(/^(\d+\. .*$)/gm, '<li>$1</li>');
  
  // Clean up list item content (remove bullet markers)
  html = html.replace(/<li>\* (.*)<\/li>/g, '<li>$1</li>');
  html = html.replace(/<li>- (.*)<\/li>/g, '<li>$1</li>');
  html = html.replace(/<li>\+ (.*)<\/li>/g, '<li>$1</li>');
  html = html.replace(/<li>\d+\. (.*)<\/li>/g, '<li>$1</li>');
  
  // 8. Wrap consecutive list items in ul/ol tags with proper spacing
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    // Skip if this is inside a TL;DR div
    if (match.includes('background-color: #8B5CF6')) {
      return match;
    }
    // Check if these are numbered lists
    if (match.includes('<li>\\d+\\.')) {
      return `<ol style="margin-bottom: 24px !important;">${match}</ol>`;
    }
    return `<ul style="margin-bottom: 24px !important;">${match}</ul>`;
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting wordpress-publish function');
    const { contentItemId, userId } = await req.json()
    console.log('Received request:', { contentItemId, userId });
    
    if (!contentItemId || !userId) {
      console.error('Missing required parameters:', { contentItemId, userId });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing contentItemId or userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Publishing content item to WordPress:', contentItemId);

    // Fetch content item
    const { data: contentItem, error: itemError } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', contentItemId)
      .single()

    if (itemError || !contentItem) {
      console.error('Content item not found:', itemError);
      return new Response(
        JSON.stringify({ success: false, error: 'Content item not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Fetch derivatives for this content item
    const { data: derivatives } = await supabase
      .from('content_derivatives')
      .select('*')
      .eq('content_item_id', contentItemId);

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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Blog image derivative not found. Please ensure a blog image exists before publishing.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    if (!excerpt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '200-word excerpt derivative not found. Please ensure a 200-word excerpt exists before publishing.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    console.log('Validation passed - found blog image and excerpt');

    // Update status to indicate publishing in progress (using published since publishing is not allowed)
    await supabase
      .from('content_items')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);

    // Initialize WordPress API service
    const wordpressApi = new WordPressApiService();

    // Get author ID from WordPress
    const authorId = await wordpressApi.getAuthorId();
    console.log('WordPress author ID:', authorId);

    // Get category ID for "Blog" category
    const categoryId = await wordpressApi.getCategoryId('Blog');
    console.log('WordPress category ID:', categoryId);

    // Process tags from content item
    let tagIds: number[] = [];
    if (contentItem.tags && Array.isArray(contentItem.tags) && contentItem.tags.length > 0) {
      console.log('Processing tags:', contentItem.tags);
      tagIds = await wordpressApi.getTagIds(contentItem.tags);
      console.log('WordPress tag IDs:', tagIds);
    } else {
      console.log('No tags found in content item');
    }

    // Upload blog image to WordPress
    console.log('Uploading blog image to WordPress...');
    const uploadedImage = await wordpressApi.uploadMedia(
      blogImage.file_url!, 
      `${contentItem.title}-featured-image.jpg`
    );

    // Create draft post with all the required settings
    console.log('Creating WordPress draft post...');
    
    // Convert markdown content to HTML
    const htmlContent = convertMarkdownToHtml(contentItem.content || '');
    console.log('Converted markdown to HTML for WordPress');
    
    const post = await wordpressApi.createDraftPost(
      contentItem.title,
      htmlContent,
      authorId,
      categoryId,
      uploadedImage.id,
      excerpt.content,
      tagIds
    );

    console.log('WordPress post created successfully:', post.id);

    // Update the post with Yoast SEO meta description separately to ensure it's saved
    console.log('Updating post with Yoast SEO meta description...');
    await wordpressApi.updatePostMeta(post.id, excerpt.content!);

    // Update content item with WordPress information
    await supabase
      .from('content_items')
      .update({ 
        status: 'published',
        wordpress_url: post.link,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);

    console.log('Content item updated with WordPress URL');

    return new Response(
      JSON.stringify({
        success: true,
        postId: post.id,
        postUrl: post.link
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )

  } catch (error) {
    console.error('WordPress publishing failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})