
import React, { useState } from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye, RotateCcw } from 'lucide-react';

interface LinkedInAdPreviewProps {
  derivative: ContentDerivative;
}

interface LinkedInAdContent {
  headline?: string;
  intro_text?: string;
  image_url?: string;
}

const LinkedInAdPreview: React.FC<LinkedInAdPreviewProps> = ({ derivative }) => {
  const [imageError, setImageError] = useState(false);
  
  // Parse the LinkedIn ad content with fallback handling
  let adContent: LinkedInAdContent = {};
  
  if (derivative.content) {
    try {
      // Try to parse as JSON first
      adContent = JSON.parse(derivative.content);
    } catch (error) {
      // If JSON parsing fails, treat content as headline
      console.log('Content is not JSON, treating as headline:', derivative.content);
      adContent = { headline: derivative.content };
    }
  }

  // Use file_url as image source if no image_url in parsed content
  const imageUrl = adContent.image_url || derivative.file_url;
  
  // Ensure we have at least a headline
  const headline = adContent.headline || 'LinkedIn Ad';
  const introText = adContent.intro_text;

  const handleViewFullSize = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  const handleRetryImage = () => {
    setImageError(false);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      {/* LinkedIn Ad Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
          in
        </div>
        <span className="text-sm text-gray-600">Sponsored</span>
        <Badge variant="outline" className="text-xs">
          LinkedIn Ad
        </Badge>
      </div>

      {/* Ad Content */}
      <div className="space-y-3">
        {/* Headline */}
        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
          {headline}
        </h3>

        {/* Intro Text */}
        {introText && (
          <p className="text-gray-700 text-sm leading-relaxed">
            {introText}
          </p>
        )}

        {/* Image */}
        {imageUrl && (
          <div className="relative mt-3 group">
            {!imageError ? (
              <>
                <img
                  src={imageUrl}
                  alt="LinkedIn Ad Creative"
                  className="w-full max-h-96 object-contain rounded-lg border bg-gray-50"
                  onError={() => setImageError(true)}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleViewFullSize}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center space-y-2">
                <p className="text-sm text-gray-500">Failed to load image</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryImage}
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Call to Action Area */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <ExternalLink className="w-4 h-4" />
            Learn more
          </div>
          <div className="flex gap-2">
            <button className="text-gray-500 hover:text-gray-700 text-sm">
              Like
            </button>
            <button className="text-gray-500 hover:text-gray-700 text-sm">
              Comment
            </button>
            <button className="text-gray-500 hover:text-gray-700 text-sm">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInAdPreview;
