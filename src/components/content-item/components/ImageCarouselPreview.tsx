
import React, { useState, useEffect } from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Expand, ChevronLeft, ChevronRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';
import { downloadImageCarouselZip } from '@/services/imageCarouselService';
import { useToast } from '@/hooks/use-toast';

interface ImageCarouselPreviewProps {
  derivative: ContentDerivative;
}

interface CarouselSlide {
  slide_number: string;
  image_url: string;
  title?: string;
  description?: string;
}

const ImageCarouselPreview: React.FC<ImageCarouselPreviewProps> = ({ derivative }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const { toast } = useToast();

  // Parse the JSON content to extract carousel data
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

  const slides = parseCarouselData();

  // Connect to carousel API and listen for slide changes
  useEffect(() => {
    if (!api) {
      return;
    }

    const updateCurrentSlide = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    // Set initial slide
    updateCurrentSlide();

    // Listen for slide changes
    api.on('select', updateCurrentSlide);

    // Cleanup
    return () => {
      api.off('select', updateCurrentSlide);
    };
  }, [api]);

  const handleDownloadZip = async () => {
    if (slides.length === 0) {
      toast({
        title: 'No images to download',
        description: 'This carousel contains no valid images.',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);
    try {
      await downloadImageCarouselZip(slides, derivative.title);
      toast({
        title: 'Download started',
        description: 'Your image carousel ZIP file is being downloaded.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download the image carousel. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const goToSlide = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  if (slides.length === 0) {
    return (
      <Card className="border-l-4 border-l-orange-400">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <p>No valid images found in carousel data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-black bg-opacity-90 p-8' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Image Carousel
          </Badge>
          <span className="text-sm text-gray-600">
            {slides.length} image{slides.length === 1 ? '' : 's'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Expand className="w-4 h-4" />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
          
          <Button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Downloading...' : 'Download ZIP'}
          </Button>
        </div>
      </div>

      <Card className={`${isFullscreen ? 'bg-transparent border-none' : ''}`}>
        <CardContent className={`${isFullscreen ? 'p-0' : 'p-4'}`}>
          <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={`slide-${slide.slide_number}-${index}`}>
                  <div className="relative group">
                    <img
                      src={slide.image_url}
                      alt={slide.title || `Slide ${slide.slide_number}`}
                      className={`w-full object-contain rounded-lg ${
                        isFullscreen ? 'max-h-screen' : 'max-h-96'
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    
                    {/* Slide overlay with info */}
                    {(slide.title || slide.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                        {slide.title && (
                          <h4 className="text-white font-medium mb-1">{slide.title}</h4>
                        )}
                        {slide.description && (
                          <p className="text-white/90 text-sm">{slide.description}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Slide counter */}
                    <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
                      {slide.slide_number} of {slides.length}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
          
          {/* Slide indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-purple-600' : 'bg-gray-300'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {isFullscreen && (
        <Button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10"
          variant="secondary"
        >
          ✕
        </Button>
      )}
    </div>
  );
};

export default ImageCarouselPreview;
