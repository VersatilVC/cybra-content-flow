import React from 'react';
import { GeneralContentItem } from '@/types/generalContent';
import GeneralContentTextPreview from './GeneralContentTextPreview';
import GeneralContentFilePreview from './GeneralContentFilePreview';
import GeneralContentUrlPreview from './GeneralContentUrlPreview';

interface GeneralContentCardContentProps {
  item: GeneralContentItem;
}

const GeneralContentCardContent: React.FC<GeneralContentCardContentProps> = ({ item }) => {
  const renderContent = () => {
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
      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
        No content preview available
      </div>
    );
  };

  return <div className="space-y-4">{renderContent()}</div>;
};

export default GeneralContentCardContent;