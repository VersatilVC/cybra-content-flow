import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { GroupedCarouselItem } from '@/hooks/useGroupedCarouselContent';
import { useCarouselDataFromItems } from '@/components/content-item/components/carousel/useCarouselData';
import { useSimpleCarouselNavigation } from '@/hooks/useSimpleCarouselNavigation';
import CarouselControls from '@/components/content-item/components/carousel/CarouselControls';
import CarouselIndicators from '@/components/content-item/components/carousel/CarouselIndicators';
import { downloadImageCarouselZip } from '@/services/imageCarouselService';
import { toast } from 'sonner';

interface GroupedCarouselPreviewModalProps {
  carouselGroup: GroupedCarouselItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GroupedCarouselPreviewModal: React.FC<GroupedCarouselPreviewModalProps> = ({
  carouselGroup,
  isOpen,
  onClose
}) => {
  const slides = carouselGroup ? useCarouselDataFromItems(carouselGroup.items) : [];
  const { currentIndex, next, previous, goToSlide } = useSimpleCarouselNavigation(slides.length);
  
  const currentSlide = slides[currentIndex];

  const handleDownload = async () => {
    if (!carouselGroup) return;
    
    try {
      await downloadImageCarouselZip(slides, carouselGroup.title);
      toast.success('Carousel images downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download carousel images');
    }
  };

  if (!carouselGroup || slides.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {carouselGroup.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download ZIP
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          {/* Main carousel display */}
          <div className="relative">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
              {currentSlide && (
                <img
                  src={currentSlide.image_url}
                  alt={currentSlide.title || `Slide ${currentSlide.slide_number}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>
            
            {/* Navigation overlay */}
            {slides.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={previous}
                  className="h-10 w-10 p-0 bg-white/90 hover:bg-white"
                >
                  ←
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={next}
                  className="h-10 w-10 p-0 bg-white/90 hover:bg-white"
                >
                  →
                </Button>
              </div>
            )}
          </div>
          
          {/* Slide info */}
          {currentSlide && (
            <div className="mb-4">
              <h3 className="font-medium text-lg mb-1">
                {currentSlide.title}
              </h3>
              {currentSlide.description && (
                <p className="text-muted-foreground">
                  {currentSlide.description}
                </p>
              )}
            </div>
          )}
          
          {/* Carousel indicators */}
          {slides.length > 1 && (
            <CarouselIndicators
              slideCount={slides.length}
              currentSlide={currentIndex}
              onSlideClick={goToSlide}
            />
          )}
          
          {/* Metadata */}
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Category:</span> {carouselGroup.category}
              </div>
              <div>
                <span className="font-medium">Target Audience:</span> {carouselGroup.target_audience}
              </div>
              <div>
                <span className="font-medium">Slides:</span> {slides.length}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(carouselGroup.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};