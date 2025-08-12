import React from 'react';
import { Badge } from '@/components/ui/badge';
import { generalContentTypes } from './generalContentTypes';

interface GeneralContentSelectedSummaryProps {
  selectedTypes: string[];
  category: 'General' | 'Social' | 'Ads';
}

const GeneralContentSelectedSummary: React.FC<GeneralContentSelectedSummaryProps> = ({
  selectedTypes,
  category
}) => {
  if (selectedTypes.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">
          Select content types to generate and see a summary here
        </p>
      </div>
    );
  }

  const types = generalContentTypes[category];
  const selectedTypeDetails = selectedTypes.map(type => 
    types.find(t => t.type === type)
  ).filter(Boolean);

  return (
    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-purple-900">
          Selected for Generation ({selectedTypes.length})
        </h3>
        <Badge className="bg-purple-600 text-white">
          {category}
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedTypeDetails.map((type) => (
          <Badge
            key={type?.type}
            variant="outline"
            className="bg-white text-purple-700 border-purple-300"
          >
            {type?.title}
          </Badge>
        ))}
      </div>
      
      <p className="text-sm text-purple-700 mt-3">
        These content items will be generated using AI based on your specifications.
      </p>
    </div>
  );
};

export default GeneralContentSelectedSummary;