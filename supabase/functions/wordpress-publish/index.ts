import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      
      const formData = new FormData();
      formData.append('file', fileBlob, filename);

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

  async createDraftPost(
    title: string,
    content: string,
    authorId: number,
    featuredMediaId?: number,
    metaDescription?: string
  ): Promise<WordPressPost> {
    try {
      const postData: any = {
        title,
        content,
        status: 'draft',
        author: authorId,
        comment_status: 'closed',
        ping_status: 'closed',
      };

      if (featuredMediaId) {
        postData.featured_media = featuredMediaId;
      }

      // Add Yoast SEO meta description if provided
      if (metaDescription) {
        postData.meta = {
          _yoast_wpseo_metadesc: metaDescription,
        };
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { contentItemId, userId } = await req.json()
    
    if (!contentItemId || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing contentItemId or userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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
        { status: 404, headers: { 'Content-Type': 'application/json' } }
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
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!excerpt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '200-word excerpt derivative not found. Please ensure a 200-word excerpt exists before publishing.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Validation passed - found blog image and excerpt');

    // Update status to publishing
    await supabase
      .from('content_items')
      .update({ 
        status: 'publishing',
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);

    // Initialize WordPress API service
    const wordpressApi = new WordPressApiService();

    // Get author ID from WordPress
    const authorId = await wordpressApi.getAuthorId();
    console.log('WordPress author ID:', authorId);

    // Upload blog image to WordPress
    console.log('Uploading blog image to WordPress...');
    const uploadedImage = await wordpressApi.uploadMedia(
      blogImage.file_url!, 
      `${contentItem.title}-featured-image.jpg`
    );

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
          'Access-Control-Allow-Origin': '*'
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
          'Access-Control-Allow-Origin': '*'
        } 
      }
    )
  }
})