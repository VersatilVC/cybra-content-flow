
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Image, Eye, Download } from 'lucide-react';
import { ContentDerivative, downloadDerivativeFile } from '@/services/contentDerivativesApi';
import { formatFileSize } from '../utils/derivativeCardHelpers';
import { useToast } from '@/hooks/use-toast';

interface DerivativeCardContentProps {
  derivative: ContentDerivative;
}

const DerivativeCardContent: React.FC<DerivativeCardContentProps> = ({ derivative }) => {
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleImageView = () => {
    if (derivative.file_url) {
      window.open(derivative.file_url, '_blank');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadDerivativeFile(derivative);
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

  const renderImagePreview = () => {
    if (derivative.content_type !== 'image' || !derivative.file_url) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-3">
        <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden">
          {!imageError ? (
            <img
              src={derivative.file_url}
              alt={derivative.title}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              onError={() => {
                console.error('Image load error for URL:', derivative.file_url);
                setImageError(true);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', derivative.file_url);
                setImageError(false);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
              <div className="text-center">
                <Image className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Image unavailable</p>
                <p className="text-xs text-gray-400 mt-1">URL: {derivative.file_url}</p>
              </div>
            </div>
          )}
        </AspectRatio>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Image:</span>
            <span className="truncate max-w-[150px]">
              {derivative.file_path?.split('/').pop() || 'Image file'}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImageView}
              className="h-7 px-2 text-xs hover:bg-blue-50"
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
              className="h-7 px-2 text-xs hover:bg-green-50"
              title="Download image"
            >
              <Download className="w-3 h-3 mr-1" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            {derivative.file_size && (
              <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded">
                {formatFileSize(derivative.file_size)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFilePreview = () => {
    if (derivative.content_type === 'image') {
      return renderImagePreview();
    }

    if (derivative.content_type === 'text' && derivative.content) {
      return (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
            {derivative.content}
          </div>
        </div>
      );
    }

    if (derivative.file_url) {
      return (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">File:</span>
              <span className="truncate max-w-[200px]">
                {derivative.file_path?.split('/').pop() || 'Unnamed file'}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="h-7 px-2 text-xs hover:bg-green-50"
                title="Download file"
              >
                <Download className="w-3 h-3 mr-1" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
              {derivative.file_size && (
                <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded">
                  {formatFileSize(derivative.file_size)}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return <div className="space-y-4">{renderFilePreview()}</div>;
};

export default DerivativeCardContent;
