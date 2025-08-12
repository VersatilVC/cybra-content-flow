import React from 'react';
import { GeneralContentItem } from '@/types/generalContent';
import ExpandableText from '../content-item/components/ExpandableText';

interface GeneralContentTextPreviewProps {
  item: GeneralContentItem;
}

const GeneralContentTextPreview: React.FC<GeneralContentTextPreviewProps> = ({ item }) => {
  if (!item.content) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <ExpandableText 
        text={item.content}
        maxLength={350}
        className="text-sm text-gray-700 leading-relaxed"
      />
    </div>
  );
};

export default GeneralContentTextPreview;