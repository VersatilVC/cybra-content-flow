import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { WordPressApiService } from './wordpressApi.ts'
import { convertMarkdownToHtml } from './markdownConverter.ts'
import { ContentItem, ContentDerivative } from './types.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting wordpress-publish function');
    const body = await req.json()
    console.log('Received request:', body);
    
    // Handle test connection requests
    if (body.test) {
      console.log('Test connection requested');
      
      // Initialize WordPress API service to test configuration
      try {
        const wordpressApi = new WordPressApiService();
        return new Response(
          JSON.stringify({ success: true, message: 'WordPress API configuration is valid' }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } catch (error) {
        console.error('WordPress API configuration error:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'WordPress API configuration is missing or invalid. Please check environment variables.' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }
    
    const { contentItemId, userId } = body;
    
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

    // Update status to indicate publishing in progress
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