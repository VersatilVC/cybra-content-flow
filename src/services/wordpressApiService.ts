import { supabase } from '@/integrations/supabase/client';

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

export class WordPressApiService {
  private baseUrl: string;
  private username: string;
  private appPassword: string;
  private authorEmail: string;

  constructor() {
    this.baseUrl = 'https://cyabra.com';
    this.username = 'ilan.hertz@versatil.vc';
    this.appPassword = 'm7WL YRJo kfnR 6nYj CMLJ MhQN';
    this.authorEmail = 'rotemb@cyabra.com';
  }

  private getAuthHeaders(): Record<string, string> {
    const credentials = btoa(`${this.username}:${this.appPassword}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async getAuthorId(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(this.authorEmail)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const users: WordPressUser[] = await response.json();
      const author = users.find(user => user.email === this.authorEmail);
      
      if (!author) {
        // Fallback to admin user (the one making the request)
        const adminResponse = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        });
        
        if (adminResponse.ok) {
          const adminUser: WordPressUser = await adminResponse.json();
          console.warn(`Author ${this.authorEmail} not found, using admin user: ${adminUser.email}`);
          return adminUser.id;
        }
        
        throw new Error(`Author with email ${this.authorEmail} not found`);
      }

      return author.id;
    } catch (error) {
      console.error('Error fetching author ID:', error);
      throw new Error(`Failed to get author ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadMedia(file: Blob, filename: string): Promise<WordPressMedia> {
    try {
      const formData = new FormData();
      formData.append('file', file, filename);

      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.username}:${this.appPassword}`)}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload media: ${response.status} ${response.statusText}`);
      }

      const media: WordPressMedia = await response.json();
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
        throw new Error(`Failed to create post: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const post: WordPressPost = await response.json();
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePostMeta(postId: number, metaDescription: string): Promise<void> {
    try {
      const updateData = {
        meta: {
          _yoast_wpseo_metadesc: metaDescription,
        },
      };

      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${postId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update post meta: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating post meta:', error);
      throw new Error(`Failed to update post meta: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('WordPress connection test failed:', error);
      return false;
    }
  }
}

export const wordpressApi = new WordPressApiService();