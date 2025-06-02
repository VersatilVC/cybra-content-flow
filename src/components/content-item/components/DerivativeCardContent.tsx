
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Image, Eye } from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { formatFileSize } from '../utils/derivativeCardHelpers';

interface DerivativeCardContentProps {
  derivative: ContentDerivative;
}

const DerivativeCardContent: React.FC<DerivativeCardContentProps> = ({ derivative }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageView = () => {
    if (derivative.file_url) {
      window.open(derivative.file_url, '_blank');
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
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
              <div className="text-center">
                <Image className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Image unavailable</p>
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
            {derivative.file_size && (
              <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded">
                {formatFileSize(derivative.file_size)}
              </span>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return <div className="space-y-4">{renderFilePreview()}</div>;
};

export default DerivativeCardContent;
