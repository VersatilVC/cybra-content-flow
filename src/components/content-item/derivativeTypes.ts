
export interface DerivativeTypeInfo {
  type: string;
  title: string;
  description: string;
  content_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'composite';
  isActive?: boolean;
}

export const derivativeTypes: Record<'General' | 'Social' | 'Ads', DerivativeTypeInfo[]> = {
  General: [
    { type: 'excerpt_200', title: '200-Word Excerpt', description: 'Short summary for previews', content_type: 'text', isActive: true },
    { type: 'newsletter_paragraph', title: 'Newsletter Paragraph', description: 'Email newsletter section', content_type: 'text', isActive: true },
    { type: 'blog_banner_image', title: 'Blog Banner Image', description: 'Hero image for blog post', content_type: 'image', isActive: true },
    { type: 'blog_internal_images', title: 'Blog Post Internal Images', description: 'Supporting images for blog content', content_type: 'image', isActive: false },
    { type: 'nurture_email', title: 'Nurture Email', description: 'Educational email for lead nurturing', content_type: 'text', isActive: true },
    { type: 'sales_email', title: 'Sales Email', description: 'Direct sales outreach email', content_type: 'text', isActive: true },
    { type: 'pr_pitch', title: 'PR Pitch', description: 'Media pitch for PR outreach and coverage', content_type: 'text', isActive: true },
    { type: 'content_transformation', title: 'Turn Content Item Into', description: 'Transform into different content format', content_type: 'text', isActive: false },
    { type: 'webinar_outline', title: 'Webinar Outline', description: 'Structured webinar presentation outline', content_type: 'document', isActive: false },
    { type: 'video_topic_points', title: 'Video Topic Points for CEO', description: 'Key talking points for executive video', content_type: 'text', isActive: false },
    { type: 'conference_speaking', title: 'Conference Speaking Suggestions', description: 'Speaking topics and proposals for conferences', content_type: 'text', isActive: false },
    { type: 'quiz_poll', title: 'Quiz/Poll', description: 'Interactive quiz or poll content', content_type: 'text', isActive: false },
    { type: 'audio_version', title: 'Generate Audio Version', description: 'Audio narration of content', content_type: 'audio', isActive: false }
  ],
  Social: [
    { type: 'social_company', title: 'Social Posts - Company', description: 'Company brand voice social media posts', content_type: 'text', isActive: true },
    { type: 'social_personal_ceo', title: 'Social Posts - Personal - CEO', description: 'CEO personal thought leadership posts', content_type: 'text', isActive: true },
    { type: 'social_department_marketing', title: 'Social Posts - Department - Marketing', description: 'Marketing department focused social posts', content_type: 'text', isActive: true },
    { type: 'social_department_sales', title: 'Social Posts - Department - Sales', description: 'Sales department focused social posts', content_type: 'text', isActive: true },
    { type: 'social_department_product', title: 'Social Posts - Department - Product', description: 'Product department focused social posts', content_type: 'text', isActive: true },
    { type: 'image_carousel', title: 'Image Carousel Slides', description: 'Multi-slide visual content for social media', content_type: 'image', isActive: true }
  ],
  Ads: [
    { type: 'linkedin_ads', title: 'LinkedIn Ads', description: 'Complete LinkedIn ad with headline, intro text, and image', content_type: 'composite', isActive: true }
  ]
};

export const getContentTypeIcon = (contentType: string) => {
  switch (contentType) {
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'audio': return '🎵';
    case 'document': return '📄';
    case 'composite': return '🎯';
    default: return '📝';
  }
};
