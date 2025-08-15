
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
  console.log('🎠 [Carousel Items] Processing items:', items);
  
  const slides = items.map((item, index) => {
    console.log(`🎠 [Carousel Items] Processing item ${index}:`, {
      id: item.id,
      title: item.title,
      content_type: item.content_type,
      derivative_type: item.derivative_type,
      content: item.content
    });
    
    let slideData: any = {};
    let imageUrl = '';
    
    try {
      // Try to parse content as JSON first
      if (item.content) {
        let contentToParse = item.content;
        if (typeof contentToParse === 'object') {
          contentToParse = JSON.stringify(contentToParse);
        }
        
        const parsed = JSON.parse(contentToParse);
        console.log(`🎠 [Carousel Items] Parsed content for item ${index}:`, parsed);
        
        // Handle array format (n8n workflow format)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0];
          slideData = (firstItem && typeof firstItem === 'object' && firstItem.json) ? firstItem.json : firstItem;
        } else if (parsed && typeof parsed === 'object') {
          // Handle single object format
          slideData = parsed.json || parsed;
        }
        
        // Extract image URL from various possible fields
        imageUrl = slideData.image_url || slideData.imageUrl || slideData.url || '';
        console.log(`🎠 [Carousel Items] Extracted image URL for item ${index}:`, imageUrl);
      }
    } catch (error) {
      console.log(`🎠 [Carousel Items] JSON parsing failed for item ${index}, treating as plain string:`, error);
      // Fallback: treat content as plain image URL
      imageUrl = String(item.content || '').trim();
    }
    
    const slide = {
      slide_number: slideData.slide_number || String(index + 1),
      image_url: imageUrl,
      title: slideData.title || item.title || `Slide ${index + 1}`,
      description: slideData.description || item.description || ''
    };
    
    console.log(`🎠 [Carousel Items] Final slide ${index}:`, slide);
    return slide;
  }).filter(slide => {
    // More permissive URL validation
    const isValidUrl = slide.image_url && (
      slide.image_url.startsWith('http') || 
      slide.image_url.startsWith('data:image/') ||
      slide.image_url.includes('blob:') ||
      slide.image_url.includes('amazonaws.com') ||
      slide.image_url.includes('supabase') ||
      /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(slide.image_url)
    );
    
    console.log(`🎠 [Carousel Items] URL validation for "${slide.image_url}":`, isValidUrl);
    return isValidUrl;
  });
  
  // Sort slides by slide_number if available
  slides.sort((a, b) => {
    const aNum = parseInt(a.slide_number) || 0;
    const bNum = parseInt(b.slide_number) || 0;
    return aNum - bNum;
  });
  
  console.log('🎠 [Carousel Items] Final filtered and sorted slides:', slides);
  return slides;
};
