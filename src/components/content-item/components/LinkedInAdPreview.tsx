
import React from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface LinkedInAdPreviewProps {
  derivative: ContentDerivative;
}

interface LinkedInAdContent {
  headline?: string;
  intro_text?: string;
  image_url?: string;
}

const LinkedInAdPreview: React.FC<LinkedInAdPreviewProps> = ({ derivative }) => {
  // Parse the LinkedIn ad content
  let adContent: LinkedInAdContent = {};
  
  if (derivative.content) {
    try {
      adContent = JSON.parse(derivative.content);
    } catch (error) {
      console.error('Failed to parse LinkedIn ad content:', error);
      // Fallback to treating content as headline if JSON parsing fails
      adContent = { headline: derivative.content };
    }
  }

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
        {adContent.headline && (
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {adContent.headline}
          </h3>
        )}

        {/* Intro Text */}
        {adContent.intro_text && (
          <p className="text-gray-700 text-sm leading-relaxed">
            {adContent.intro_text}
          </p>
        )}

        {/* Image */}
        {(adContent.image_url || derivative.file_url) && (
          <div className="mt-3">
            <img
              src={adContent.image_url || derivative.file_url || ''}
              alt="LinkedIn Ad Creative"
              className="w-full h-48 object-cover rounded-lg border"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
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

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <strong>Content Structure:</strong>
          <pre className="mt-1 whitespace-pre-wrap">
            {JSON.stringify(adContent, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LinkedInAdPreview;
