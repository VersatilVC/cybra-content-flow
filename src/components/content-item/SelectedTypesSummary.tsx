
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { derivativeTypes, getContentTypeIcon } from './derivativeTypes';

interface SelectedTypesSummaryProps {
  selectedTypes: string[];
  category: 'General' | 'Social' | 'Ads';
}

const SelectedTypesSummary: React.FC<SelectedTypesSummaryProps> = ({
  selectedTypes,
  category
}) => {
  if (selectedTypes.length === 0) return null;

  return (
    <div className="p-4 bg-purple-50 rounded-lg">
      <h4 className="font-medium text-purple-900 mb-2">
        Selected for Generation ({selectedTypes.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedTypes.map(type => {
          const typeInfo = derivativeTypes[category].find(t => t.type === type);
          return (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              <span>{getContentTypeIcon(typeInfo?.content_type || 'text')}</span>
              {typeInfo?.title}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedTypesSummary;
