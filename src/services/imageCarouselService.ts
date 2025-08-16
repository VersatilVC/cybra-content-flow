
import { loadJSZip } from '@/lib/lazyImports';

interface CarouselSlide {
  slide_number: string;
  image_url: string;
  title?: string;
  description?: string;
}

export const downloadImageCarouselZip = async (slides: CarouselSlide[], carouselName: string) => {
  const JSZip = await loadJSZip();
  const zip = new JSZip();
  
  try {
    // Create a folder for the carousel
    const folder = zip.folder(carouselName || 'Image Carousel');
    
    // Download each image and add to ZIP
    const downloadPromises = slides.map(async (slide, index) => {
      try {
        const response = await fetch(slide.image_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Create a meaningful filename
        const extension = getImageExtension(slide.image_url, blob.type);
        const slideTitle = slide.title ? sanitizeFilename(slide.title) : '';
        const filename = slideTitle 
          ? `slide_${slide.slide_number}_${slideTitle}${extension}`
          : `slide_${slide.slide_number}${extension}`;
        
        folder?.file(filename, blob);
        
        // Add metadata if available
        if (slide.title || slide.description) {
          const metadata = {
            slide_number: slide.slide_number,
            title: slide.title || '',
            description: slide.description || '',
            original_url: slide.image_url
          };
          
          folder?.file(`slide_${slide.slide_number}_metadata.json`, JSON.stringify(metadata, null, 2));
        }
        
      } catch (error) {
        console.error(`Failed to download slide ${slide.slide_number}:`, error);
        // Add a text file indicating the failed download
        folder?.file(`slide_${slide.slide_number}_ERROR.txt`, 
          `Failed to download image from: ${slide.image_url}\nError: ${error}`);
      }
    });
    
    await Promise.all(downloadPromises);
    
    // Generate and download the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFilename(carouselName || 'image-carousel')}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw new Error('Failed to create ZIP file');
  }
};

const getImageExtension = (url: string, mimeType: string): string => {
  // First try to get extension from URL
  const urlExtension = url.split('.').pop()?.toLowerCase();
  if (urlExtension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(urlExtension)) {
    return `.${urlExtension}`;
  }
  
  // Fall back to MIME type
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/webp':
      return '.webp';
    case 'image/svg+xml':
      return '.svg';
    default:
      return '.jpg'; // Default fallback
  }
};

const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
};
