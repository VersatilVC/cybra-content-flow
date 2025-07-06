import { WordPressUser, WordPressPost, WordPressMedia } from './types.ts';

export class WordPressApiService {
  private baseUrl: string;
  private username: string;
  private appPassword: string;
  private authorEmail: string;

  constructor() {
    this.baseUrl = Deno.env.get('WORDPRESS_BASE_URL') || '';
    this.username = Deno.env.get('WORDPRESS_USERNAME') || '';
    this.appPassword = Deno.env.get('WORDPRESS_APP_PASSWORD') || '';
    this.authorEmail = Deno.env.get('WORDPRESS_AUTHOR_EMAIL') || '';
    
    if (!this.baseUrl || !this.username || !this.appPassword || !this.authorEmail) {
      throw new Error('Missing required WordPress configuration. Please check environment variables.');
    }
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