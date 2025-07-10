
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
      
      // The content is stored as a JSON array string
      const parsed = JSON.parse(derivative.content);
      console.log('✅ [Carousel Parser] Successfully parsed JSON:', parsed);
      console.log('🔍 [Carousel Parser] Parsed type:', typeof parsed);
      console.log('🔍 [Carousel Parser] Is array:', Array.isArray(parsed));
      
      // Handle different possible formats
      if (Array.isArray(parsed)) {
        console.log('🔄 [Carousel Parser] Processing array of slides');
        const slides = parsed.map((item, index) => {
          console.log(`🔍 [Carousel Parser] Processing slide ${index}:`, item);
          // Handle nested json property
          const slideData = item.json || item;
          console.log(`🔍 [Carousel Parser] Slide data for ${index}:`, slideData);
          
          const slide = {
            slide_number: slideData.slide_number || String(index + 1),
            image_url: slideData.image_url || '',
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
      }
      
      console.log('❌ [Carousel Parser] Content is not an array');
      return [];
    } catch (error) {
      console.error('❌ [Carousel Parser] Error parsing carousel data:', error);
      console.error('❌ [Carousel Parser] Raw content that failed:', derivative.content);
      return [];
    }
  };

  return parseCarouselData();
};
