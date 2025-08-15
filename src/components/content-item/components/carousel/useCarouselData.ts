
import { ContentDerivative } from '@/services/contentDerivativesApi';

export interface CarouselSlide {
  slide_number: string;
  image_url: string;
  title?: string;
  description?: string;
}

export const useCarouselData = (derivative: ContentDerivative): CarouselSlide[] => {
  const parseCarouselData = (): CarouselSlide[] => {
    try {
      if (!derivative.content) {
        return [];
      }
      
      let contentToParse = derivative.content;
      
      // If content is already an object, stringify it first to normalize parsing
      if (typeof contentToParse === 'object') {
        contentToParse = JSON.stringify(contentToParse);
      }

      // Check if content is a plain image URL (fallback for single image items)
      const contentStr = String(contentToParse).trim();
      if (contentStr.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
        console.log('✅ [Carousel Parser] Detected plain image URL, wrapping in slide structure');
        return [{
          slide_number: '1',
          image_url: contentStr,
          title: derivative.title || 'Slide 1',
          description: ''
        }];
      }
      
      // Parse the JSON content
      const parsed = JSON.parse(contentToParse);
      
      // Handle array format (n8n workflow format: [{"json": {...}, "pairedItem": {...}}])
      if (Array.isArray(parsed)) {
        const slides = parsed.map((item, index) => {
          // Extract slide data from nested json property or use item directly
          const slideData = (item && typeof item === 'object' && item.json) ? item.json : item;
          
          return {
            slide_number: slideData.slide_number || String(index + 1),
            image_url: slideData.image_url || slideData.imageUrl || '',
            title: slideData.title || '',
            description: slideData.description || ''
          };
        }).filter(slide => slide.image_url); // Only include slides with valid image URLs
        
        return slides;
      } else if (parsed && typeof parsed === 'object') {
        // Handle single slide object
        console.log('🔄 [Carousel Parser] Processing single slide object');
        const slideData = parsed.json || parsed;
        const slide = {
          slide_number: slideData.slide_number || '1',
          image_url: slideData.image_url || slideData.imageUrl || '',
          title: slideData.title || '',
          description: slideData.description || ''
        };
        
        return slide.image_url ? [slide] : [];
      }
      
      console.log('❌ [Carousel Parser] Content is neither array nor valid object');
      return [];
    } catch (error) {
      console.error('❌ [Carousel Parser] Error parsing carousel data:', error);
      console.error('❌ [Carousel Parser] Raw content that failed:', derivative.content);
      
      // Enhanced fallback parsing for various formats
      try {
        console.log('🔄 [Carousel Parser] Attempting enhanced fallback parsing');
        const contentStr = String(derivative.content);
        
        // Check if it's a plain image URL
        if (contentStr.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
          console.log('✅ [Carousel Parser] Fallback: Plain image URL detected');
          return [{
            slide_number: '1',
            image_url: contentStr,
            title: derivative.title || 'Slide 1',
            description: ''
          }];
        }
        
        // Look for image URLs in the content using regex
        const imageUrlMatches = contentStr.match(/"image_url"\s*:\s*"([^"]+)"/g);
        if (imageUrlMatches) {
          console.log('✅ [Carousel Parser] Found image URLs with regex fallback');
          const slides = imageUrlMatches.map((match, index) => {
            const urlMatch = match.match(/"image_url"\s*:\s*"([^"]+)"/);
            return {
              slide_number: String(index + 1),
              image_url: urlMatch ? urlMatch[1] : '',
              title: `Slide ${index + 1}`,
              description: ''
            };
          }).filter(slide => slide.image_url);
          
          console.log('✅ [Carousel Parser] Fallback parsing result:', slides);
          return slides;
        }
      } catch (fallbackError) {
        console.error('❌ [Carousel Parser] Fallback parsing also failed:', fallbackError);
      }
      
      return [];
    }
  };

  return parseCarouselData();
};

// New function to handle carousel data from grouped general content items
export const useCarouselDataFromItems = (items: any[]): CarouselSlide[] => {
  return items.map((item, index) => {
    // Each item is a GeneralContentItem with image URL in content field
    const contentStr = String(item.content || '').trim();
    
    return {
      slide_number: String(index + 1),
      image_url: contentStr,
      title: item.title || `Slide ${index + 1}`,
      description: item.description || ''
    };
  }).filter(slide => slide.image_url && slide.image_url.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i));
};
