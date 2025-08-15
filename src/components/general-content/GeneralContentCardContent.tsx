import React from 'react';
import { GeneralContentItem } from '@/types/generalContent';
import GeneralContentTextPreview from './GeneralContentTextPreview';
import GeneralContentFilePreview from './GeneralContentFilePreview';
import GeneralContentUrlPreview from './GeneralContentUrlPreview';
import { isGeneralSocialContent, isGeneralCarouselContent, isGeneralLinkedInAdContent } from './utils/generalContentHelpers';
import { adaptGeneralContentToDerivative } from './adapters/contentDerivativeAdapter';
import SocialContentPreview from '../content-item/components/SocialContentPreview';
import ImageCarouselPreview from '../content-item/components/ImageCarouselPreview';
import LinkedInAdPreview from '../content-item/components/LinkedInAdPreview';

interface GeneralContentCardContentProps {
  item: GeneralContentItem;
}

const GeneralContentCardContent: React.FC<GeneralContentCardContentProps> = ({ item }) => {
  const renderContent = () => {
    // Handle image carousel with intelligent detection
    if (isGeneralCarouselContent(item)) {
      const adaptedItem = adaptGeneralContentToDerivative(item);
      return <ImageCarouselPreview derivative={adaptedItem} />;
    }

    // Handle LinkedIn ads specifically
    if (isGeneralLinkedInAdContent(item)) {
      const adaptedItem = adaptGeneralContentToDerivative(item);
      return <LinkedInAdPreview derivative={adaptedItem} />;
    }

    // Handle social content with platform parsing
    if (isGeneralSocialContent(item)) {
      const adaptedItem = adaptGeneralContentToDerivative(item);
      return <SocialContentPreview derivative={adaptedItem} />;
    }

    // Handle file content
    if (item.file_url) {
      return <GeneralContentFilePreview item={item} />;
    }

    // Handle URL source content
    if (item.source_type === 'url' && item.source_data?.url) {
      return <GeneralContentUrlPreview item={item} />;
    }

    // Handle text content (manual or processed)
    if (item.content) {
      return <GeneralContentTextPreview item={item} />;
    }

    // Fallback for no content
    return (
      <div className="text-sm text-muted-foreground italic p-3 bg-muted rounded-lg">
        No content preview available
      </div>
    );
  };

  return <div className="space-y-4">{renderContent()}</div>;
};

export default GeneralContentCardContent;