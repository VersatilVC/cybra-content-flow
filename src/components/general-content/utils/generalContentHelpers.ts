import { GeneralContentItem } from '@/types/generalContent';

export const isGeneralSocialContent = (item: GeneralContentItem): boolean => {
  return item.derivative_type?.startsWith('social_') || false;
};

export const isGeneralCarouselContent = (item: GeneralContentItem): boolean => {
  // Check derivative type first
  if (item.derivative_type === 'image_carousel') {
    return true;
  }
  
  // Check title for "Image Carousel" indicator
  if (item.title && item.title.toLowerCase().includes('image carousel')) {
    return true;
  }
  
  // Check content structure for carousel data patterns
  if (item.content) {
    try {
      let contentToParse = item.content;
      if (typeof contentToParse === 'object') {
        contentToParse = JSON.stringify(contentToParse);
      }
      
      const parsed = JSON.parse(contentToParse);
      
      // Check if it's an array with carousel-like structure
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstItem = parsed[0];
        const slideData = (firstItem && typeof firstItem === 'object' && firstItem.json) ? firstItem.json : firstItem;
        
        // Look for carousel indicators: slide_number and image_url
        if (slideData && (slideData.slide_number || slideData.image_url)) {
          return true;
        }
      }
    } catch (error) {
      // If parsing fails, it's not carousel content
      return false;
    }
  }
  
  return false;
};

export const isGeneralLinkedInAdContent = (item: GeneralContentItem): boolean => {
  return item.derivative_type === 'linkedin_ads';
};