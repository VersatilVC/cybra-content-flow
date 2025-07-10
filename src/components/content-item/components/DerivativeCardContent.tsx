
import React from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { isSocialDerivative } from '../utils/socialContentParser';
import ImagePreview from './ImagePreview';
import FilePreview from './FilePreview';
import TextContentPreview from './TextContentPreview';
import SocialContentPreview from './SocialContentPreview';
import LinkedInAdPreview from './LinkedInAdPreview';
import ImageCarouselPreview from './ImageCarouselPreview';

interface DerivativeCardContentProps {
  derivative: ContentDerivative;
}

const DerivativeCardContent: React.FC<DerivativeCardContentProps> = ({ derivative }) => {
  // Helper function to detect if content is carousel data
  const isCarouselContent = (derivative: ContentDerivative): boolean => {
    // Check derivative type first
    if (derivative.derivative_type === 'image_carousel') {
      return true;
    }
    
    // Check title for "Image Carousel" indicator
    if (derivative.title && derivative.title.toLowerCase().includes('image carousel')) {
      return true;
    }
    
    // Check content structure for carousel data patterns
    if (derivative.content) {
      try {
        let contentToParse = derivative.content;
        if (typeof contentToParse === 'object') {
          contentToParse = JSON.stringify(contentToParse);
        }
        
        const parsed = JSON.parse(contentToParse);
        
        // Check if it's an array with carousel-like structure
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0];
          const slideData = (firstItem && typeof firstItem === 'object' && firstItem.json) ? firstItem.json : firstItem;
          
          // Look for carousel indicators: slide_number and image_url
          if (slideData && (slideData.slide_number || slideData.image_url)) {
            return true;
          }
        }
      } catch (error) {
        // If parsing fails, it's not carousel content
        return false;
      }
    }
    
    return false;
  };

  const renderContent = () => {
    // Handle image carousel with intelligent detection
    if (isCarouselContent(derivative)) {
      return <ImageCarouselPreview derivative={derivative} />;
    }

    // Handle LinkedIn ads specifically
    if (derivative.derivative_type === 'linkedin_ads') {
      return <LinkedInAdPreview derivative={derivative} />;
    }

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
