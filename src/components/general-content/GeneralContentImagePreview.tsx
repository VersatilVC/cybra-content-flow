import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Image, Eye, Download, RefreshCw } from 'lucide-react';
import { GeneralContentItem } from '@/types/generalContent';
import { useToast } from '@/hooks/use-toast';

interface GeneralContentImagePreviewProps {
  item: GeneralContentItem;
}

const GeneralContentImagePreview: React.FC<GeneralContentImagePreviewProps> = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const handleImageView = () => {
    if (item.file_url) {
      window.open(item.file_url, '_blank');
    }
  };

  const handleDownload = async () => {
    if (!item.file_url) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(item.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.file_path?.split('/').pop() || `${item.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Download started',
        description: 'Your file download has started.',
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetryImage = () => {
    setImageError(false);
    setRetryCount(prev => prev + 1);
  };

  if (item.content_type !== 'image' || !item.file_url) {
    return null;
  }

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden">
        {!imageError ? (
          <img
            key={retryCount}
            src={item.file_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            onError={() => {
              console.error('Image load error for URL:', item.file_url);
              console.error('File path:', item.file_path);
              setImageError(true);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', item.file_url);
              setImageError(false);
            }}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <div className="text-center">
              <Image className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Image unavailable</p>
              <p className="text-xs text-muted-foreground mt-1 break-all px-2">URL: {item.file_url}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetryImage}
                className="mt-2 h-6 px-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}
      </AspectRatio>
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Image:</span>
          <span className="truncate max-w-[150px]">
            {item.file_path?.split('/').pop() || 'Image file'}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImageView}
            className="h-7 px-2 text-xs"
            title="View full size"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-7 px-2 text-xs"
            title="Download image"
          >
            <Download className="w-3 h-3 mr-1" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
          {item.file_size && (
            <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
              {item.file_size}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralContentImagePreview;