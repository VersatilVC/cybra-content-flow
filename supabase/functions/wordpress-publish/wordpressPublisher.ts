import { WordPressApiService } from './wordpressApi.ts'
import { convertMarkdownToHtml } from './markdownConverter.ts'
import { ContentItem, ContentDerivative } from './types.ts'

export interface WordPressPublishResult {
  success: boolean;
  postId?: number;
  postUrl?: string;
  error?: string;
}

export class WordPressPublisher {
  private wordpressApi: WordPressApiService;

  constructor() {
    this.wordpressApi = new WordPressApiService();
  }

  async publishContent(
    contentItem: ContentItem,
    blogImage: ContentDerivative,
    excerpt: ContentDerivative
  ): Promise<WordPressPublishResult> {
    try {
      // Get author ID from WordPress
      const authorId = await this.wordpressApi.getAuthorId();
      console.log('WordPress author ID:', authorId);

      // Get category ID for "Blog" category
      const categoryId = await this.wordpressApi.getCategoryId('Blog');
      console.log('WordPress category ID:', categoryId);

      // Process tags from content item
      let tagIds: number[] = [];
      if (contentItem.tags && Array.isArray(contentItem.tags) && contentItem.tags.length > 0) {
        console.log('Processing tags:', contentItem.tags);
        tagIds = await this.wordpressApi.getTagIds(contentItem.tags);
        console.log('WordPress tag IDs:', tagIds);
      } else {
        console.log('No tags found in content item');
      }

      // Upload blog image to WordPress
      console.log('Uploading blog image to WordPress...');
      const uploadedImage = await this.wordpressApi.uploadMedia(
        blogImage.file_url!, 
        `${contentItem.title}-featured-image.jpg`
      );

      // Create draft post with all the required settings
      console.log('Creating WordPress draft post...');
      
      // Convert markdown content to HTML
      const htmlContent = convertMarkdownToHtml(contentItem.content || '');
      console.log('Converted markdown to HTML for WordPress');
      
      const post = await this.wordpressApi.createDraftPost(
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
      await this.wordpressApi.updatePostMeta(post.id, excerpt.content!);

      return {
        success: true,
        postId: post.id,
        postUrl: post.link
      };

    } catch (error) {
      console.error('WordPress publishing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}