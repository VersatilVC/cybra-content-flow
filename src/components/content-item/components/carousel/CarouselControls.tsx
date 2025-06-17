
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Expand } from 'lucide-react';
import { CarouselSlide } from './useCarouselData';
import { downloadImageCarouselZip } from '@/services/imageCarouselService';
import { useToast } from '@/hooks/use-toast';

interface CarouselControlsProps {
  slides: CarouselSlide[];
  derivativeTitle: string;
  isFullscreen: boolean;
  isDownloading: boolean;
  setIsDownloading: (downloading: boolean) => void;
  onToggleFullscreen: () => void;
}

const CarouselControls: React.FC<CarouselControlsProps> = ({
  slides,
  derivativeTitle,
  isFullscreen,
  isDownloading,
  setIsDownloading,
  onToggleFullscreen
}) => {
  const { toast } = useToast();

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
      await downloadImageCarouselZip(slides, derivativeTitle);
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

  return (
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
          onClick={onToggleFullscreen}
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
  );
};

export default CarouselControls;
