
import React from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { isSocialDerivative } from '../utils/socialContentParser';
import ImagePreview from './ImagePreview';
import FilePreview from './FilePreview';
import TextContentPreview from './TextContentPreview';
import SocialContentPreview from './SocialContentPreview';

interface DerivativeCardContentProps {
  derivative: ContentDerivative;
}

const DerivativeCardContent: React.FC<DerivativeCardContentProps> = ({ derivative }) => {
  const renderContent = () => {
    // Handle image content
    if (derivative.content_type === 'image') {
      return <ImagePreview derivative={derivative} />;
    }

    // Handle social content with platform tagging
    if (isSocialDerivative(derivative.derivative_type)) {
      return <SocialContentPreview derivative={derivative} />;
    }

    // Handle text content
    if (derivative.content_type === 'text' && derivative.content) {
      return <TextContentPreview derivative={derivative} />;
    }

    // Handle file content
    if (derivative.file_url) {
      return <FilePreview derivative={derivative} />;
    }

    return null;
  };

  return <div className="space-y-4">{renderContent()}</div>;
};

export default DerivativeCardContent;
