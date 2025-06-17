
import React, { useState } from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCarouselData } from './carousel/useCarouselData';
import { useCarouselNavigation } from './carousel/useCarouselNavigation';
import CarouselControls from './carousel/CarouselControls';
import CarouselSlideContent from './carousel/CarouselSlideContent';
import CarouselIndicators from './carousel/CarouselIndicators';

interface ImageCarouselPreviewProps {
  derivative: ContentDerivative;
}

const ImageCarouselPreview: React.FC<ImageCarouselPreviewProps> = ({ derivative }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const slides = useCarouselData(derivative);
  const { currentSlide, setApi, goToSlide } = useCarouselNavigation();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
      <CarouselControls
        slides={slides}
        derivativeTitle={derivative.title}
        isFullscreen={isFullscreen}
        isDownloading={isDownloading}
        setIsDownloading={setIsDownloading}
        onToggleFullscreen={toggleFullscreen}
      />

      <Card className={`${isFullscreen ? 'bg-transparent border-none' : ''}`}>
        <CardContent className={`${isFullscreen ? 'p-0' : 'p-4'}`}>
          <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={`slide-${slide.slide_number}-${index}`}>
                  <CarouselSlideContent
                    slide={slide}
                    index={index}
                    totalSlides={slides.length}
                    isFullscreen={isFullscreen}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
          
          <CarouselIndicators
            slideCount={slides.length}
            currentSlide={currentSlide}
            onSlideClick={goToSlide}
          />
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
