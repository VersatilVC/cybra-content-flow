
import { useState, useEffect } from 'react';
import { CarouselApi } from '@/components/ui/carousel';

export const useCarouselNavigation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

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

  const goToSlide = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  return {
    currentSlide,
    api,
    setApi,
    goToSlide
  };
};
