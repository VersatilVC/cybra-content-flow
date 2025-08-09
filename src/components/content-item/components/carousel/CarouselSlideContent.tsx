
import React from 'react';
import { CarouselSlide } from './useCarouselData';

interface CarouselSlideContentProps {
  slide: CarouselSlide;
  index: number;
  totalSlides: number;
  isFullscreen: boolean;
}

const CarouselSlideContent: React.FC<CarouselSlideContentProps> = ({
  slide,
  index,
  totalSlides,
  isFullscreen
}) => {
  return (
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
        loading="lazy"
        decoding="async"
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
        {slide.slide_number} of {totalSlides}
      </div>
    </div>
  );
};

export default CarouselSlideContent;
