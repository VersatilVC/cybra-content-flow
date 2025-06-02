
export interface DerivativeTypeInfo {
  type: string;
  title: string;
  description: string;
  content_type: 'text' | 'image' | 'audio' | 'video' | 'document';
}

export const derivativeTypes: Record<'General' | 'Social' | 'Ads', DerivativeTypeInfo[]> = {
  General: [
    { type: 'excerpt_200', title: '200-Word Excerpt', description: 'Short summary for previews', content_type: 'text' },
    { type: 'newsletter_paragraph', title: 'Newsletter Paragraph', description: 'Email newsletter section', content_type: 'text' },
    { type: 'blog_banner_image', title: 'Blog Banner Image', description: 'Hero image for blog post', content_type: 'image' },
    { type: 'blog_internal_images', title: 'Blog Post Internal Images', description: 'Supporting images for blog content', content_type: 'image' },
    { type: 'nurture_email', title: 'Nurture Email', description: 'Educational email for lead nurturing', content_type: 'text' },
    { type: 'sales_email', title: 'Sales Email', description: 'Direct sales outreach email', content_type: 'text' },
    { type: 'content_transformation', title: 'Turn Content Item Into', description: 'Transform into different content format', content_type: 'text' },
    { type: 'webinar_outline', title: 'Webinar Outline', description: 'Structured webinar presentation outline', content_type: 'document' },
    { type: 'video_topic_points', title: 'Video Topic Points for CEO', description: 'Key talking points for executive video', content_type: 'text' },
    { type: 'conference_speaking', title: 'Conference Speaking Suggestions', description: 'Speaking topics and proposals for conferences', content_type: 'text' },
    { type: 'quiz_poll', title: 'Quiz/Poll', description: 'Interactive quiz or poll content', content_type: 'text' },
    { type: 'audio_version', title: 'Generate Audio Version', description: 'Audio narration of content', content_type: 'audio' }
  ],
  Social: [
    { type: 'linkedin_company', title: 'LinkedIn Post - Company', description: 'Company brand voice LinkedIn post', content_type: 'text' },
    { type: 'linkedin_ceo', title: 'LinkedIn Post - CEO', description: 'CEO thought leadership LinkedIn post', content_type: 'text' },
    { type: 'linkedin_marketing', title: 'LinkedIn Post - Marketing', description: 'Marketing-focused LinkedIn post', content_type: 'text' },
    { type: 'linkedin_sales', title: 'LinkedIn Post - Sales', description: 'Sales-oriented LinkedIn post', content_type: 'text' },
    { type: 'linkedin_product', title: 'LinkedIn Post - Product', description: 'Product-focused LinkedIn post', content_type: 'text' },
    { type: 'x_company', title: 'X Post - Company', description: 'Company brand voice X post', content_type: 'text' },
    { type: 'x_ceo', title: 'X Post - CEO', description: 'CEO thought leadership X post', content_type: 'text' },
    { type: 'x_marketing', title: 'X Post - Marketing', description: 'Marketing-focused X post', content_type: 'text' },
    { type: 'x_sales', title: 'X Post - Sales', description: 'Sales-oriented X post', content_type: 'text' },
    { type: 'x_product', title: 'X Post - Product', description: 'Product-focused X post', content_type: 'text' },
    { type: 'image_carousel', title: 'Image Carousel Slides', description: 'Multi-slide visual content for social media', content_type: 'image' }
  ],
  Ads: [
    { type: 'linkedin_text_ad', title: 'LinkedIn - Text Ad Copy', description: 'Professional LinkedIn advertising copy', content_type: 'text' },
    { type: 'linkedin_image_ads', title: 'LinkedIn - Image Ads', description: 'Visual LinkedIn advertising creatives', content_type: 'image' }
  ]
};

export const getContentTypeIcon = (contentType: string) => {
  switch (contentType) {
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'audio': return '🎵';
    case 'document': return '📄';
    default: return '📝';
  }
};
