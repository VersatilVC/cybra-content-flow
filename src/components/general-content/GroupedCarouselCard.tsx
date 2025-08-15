import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Trash2 } from 'lucide-react';
import { GroupedCarouselItem } from '@/hooks/useGroupedCarouselContent';
import { useCarouselDataFromItems } from '@/components/content-item/components/carousel/useCarouselData';
import { useSimpleCarouselNavigation } from '@/hooks/useSimpleCarouselNavigation';
import { downloadImageCarouselZip } from '@/services/imageCarouselService';
import { toast } from 'sonner';

interface GroupedCarouselCardProps {
  carouselGroup: GroupedCarouselItem;
  onDelete: (ids: string[]) => void;
  onPreview: (group: GroupedCarouselItem) => void;
}

export const GroupedCarouselCard: React.FC<GroupedCarouselCardProps> = ({
  carouselGroup,
  onDelete,
  onPreview
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const slides = useCarouselDataFromItems(carouselGroup.items);
  const { currentIndex, next, previous } = useSimpleCarouselNavigation(slides.length);
  
  const currentSlide = slides[currentIndex];

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadImageCarouselZip(slides, carouselGroup.title);
      toast.success('Carousel images downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download carousel images');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    const itemIds = carouselGroup.items.map(item => item.id);
    onDelete(itemIds);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground truncate">
              {carouselGroup.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {carouselGroup.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {slides.length} slides
              </Badge>
              <Badge variant="outline" className="text-xs">
                {carouselGroup.target_audience}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview(carouselGroup)}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Carousel Preview */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
          {currentSlide && (
            <>
              <img
                src={currentSlide.image_url}
                alt={currentSlide.title || `Slide ${currentSlide.slide_number}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
              {/* Navigation overlay */}
              {slides.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-2 bg-black/0 hover:bg-black/20 transition-colors">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={previous}
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ←
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={next}
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    →
                  </Button>
                </div>
              )}
              
              {/* Slide indicator */}
              {slides.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    {slides.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Metadata */}
        <div className="text-sm text-muted-foreground">
          Created on {formatDate(carouselGroup.created_at)}
        </div>
      </CardContent>
    </Card>
  );
};