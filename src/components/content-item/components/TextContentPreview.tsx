
import React from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import ExpandableText from './ExpandableText';

interface TextContentPreviewProps {
  derivative: ContentDerivative;
}

const TextContentPreview: React.FC<TextContentPreviewProps> = ({ derivative }) => {
  if (derivative.content_type !== 'text' || !derivative.content) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <ExpandableText 
        text={derivative.content}
        maxLength={350}
        className="text-sm text-gray-700 leading-relaxed"
      />
    </div>
  );
};

export default TextContentPreview;
