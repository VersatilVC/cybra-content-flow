
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
      if (!derivative.content) return [];
      
      // The content is stored as a JSON array string
      const parsed = JSON.parse(derivative.content);
      
      // Handle different possible formats
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          // Handle nested json property
          const slideData = item.json || item;
          return {
            slide_number: slideData.slide_number || '1',
            image_url: slideData.image_url || '',
            title: slideData.title || '',
            description: slideData.description || ''
          };
        }).filter(slide => slide.image_url);
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing carousel data:', error);
      return [];
    }
  };

  return parseCarouselData();
};
