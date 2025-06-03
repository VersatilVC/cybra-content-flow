
import React from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';

interface TextContentPreviewProps {
  derivative: ContentDerivative;
}

const TextContentPreview: React.FC<TextContentPreviewProps> = ({ derivative }) => {
  if (derivative.content_type !== 'text' || !derivative.content) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
        {derivative.content}
      </div>
    </div>
  );
};

export default TextContentPreview;
