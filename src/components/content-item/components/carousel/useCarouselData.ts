
import { ContentDerivative } from '@/services/contentDerivativesApi';

export interface CarouselSlide {
  slide_number: string;
  image_url: string;
  title?: string;
  description?: string;
}

export const useCarouselData = (derivative: ContentDerivative): CarouselSlide[] => {
  const parseCarouselData = (): CarouselSlide[] => {
    console.log('🔄 [Carousel Parser] Starting carousel data parsing');
    console.log('🔍 [Carousel Parser] Raw content:', derivative.content);
    console.log('🔍 [Carousel Parser] Content type:', typeof derivative.content);
    
    try {
      if (!derivative.content) {
        console.log('❌ [Carousel Parser] No content found');
        return [];
      }
      
      let contentToParse = derivative.content;
      
      // If content is already an object, stringify it first to normalize parsing
      if (typeof contentToParse === 'object') {
        console.log('🔄 [Carousel Parser] Content is object, stringifying for parsing');
        contentToParse = JSON.stringify(contentToParse);
      }
      
      // The content is stored as a JSON array string
      const parsed = JSON.parse(contentToParse);
      console.log('✅ [Carousel Parser] Successfully parsed JSON:', parsed);
      console.log('🔍 [Carousel Parser] Parsed type:', typeof parsed);
      console.log('🔍 [Carousel Parser] Is array:', Array.isArray(parsed));
      
      // Handle different possible formats
      if (Array.isArray(parsed)) {
        console.log('🔄 [Carousel Parser] Processing array of slides');
        const slides = parsed.map((item, index) => {
          console.log(`🔍 [Carousel Parser] Processing slide ${index}:`, item);
          
          // Handle nested json property (common format: [{"json": {...}}])
          let slideData = item;
          if (item && typeof item === 'object' && item.json) {
            console.log(`🔍 [Carousel Parser] Found nested json property for slide ${index}`);
            slideData = item.json;
          }
          
          console.log(`🔍 [Carousel Parser] Final slide data for ${index}:`, slideData);
          
          const slide = {
            slide_number: slideData.slide_number || String(index + 1),
            image_url: slideData.image_url || slideData.imageUrl || '', // Try both formats
            title: slideData.title || '',
            description: slideData.description || ''
          };
          
          console.log(`✅ [Carousel Parser] Processed slide ${index}:`, slide);
          return slide;
        }).filter(slide => {
          const hasUrl = !!slide.image_url;
          console.log(`🔍 [Carousel Parser] Slide has image URL: ${hasUrl}`, slide);
          return hasUrl;
        });
        
        console.log('✅ [Carousel Parser] Final slides array:', slides);
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
      
      // Try fallback parsing for malformed JSON
      try {
        console.log('🔄 [Carousel Parser] Attempting fallback parsing');
        const contentStr = String(derivative.content);
        
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
