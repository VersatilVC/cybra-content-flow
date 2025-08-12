import React from 'react';
import { GeneralContentItem } from '@/types/generalContent';

interface GeneralContentPreviewProps {
  item: GeneralContentItem;
}

const GeneralContentPreview: React.FC<GeneralContentPreviewProps> = ({ item }) => {
  if (!item.content) {
    return (
      <div className="text-sm text-gray-500 italic">
        No content preview available
      </div>
    );
  }

  // Simple text preview for now - can be enhanced later with rich previews
  const truncatedContent = item.content.length > 150 
    ? item.content.substring(0, 150) + '...'
    : item.content;

  return (
    <div className="text-sm text-gray-700 line-clamp-3">
      {truncatedContent}
    </div>
  );
};

export default GeneralContentPreview;