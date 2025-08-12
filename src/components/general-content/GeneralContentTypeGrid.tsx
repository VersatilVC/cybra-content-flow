import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Image, Video } from 'lucide-react';
import { generalContentTypes } from './generalContentTypes';

interface GeneralContentTypeGridProps {
  category: 'General' | 'Social' | 'Ads';
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
}

const GeneralContentTypeGrid: React.FC<GeneralContentTypeGridProps> = ({
  category,
  selectedTypes,
  onTypeToggle
}) => {
  const iconComponents = {
    FileText,
    Image,
    Video
  };

  const types = generalContentTypes[category];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {types.map((type) => {
        const IconComponent = iconComponents[type.icon as keyof typeof iconComponents] || FileText;
        const isSelected = selectedTypes.includes(type.type);
        
        return (
          <Card
            key={type.type}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected ? 'ring-2 ring-purple-600 bg-purple-50' : 'hover:border-purple-300'
            }`}
            onClick={() => onTypeToggle(type.type)}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected}
                onChange={() => onTypeToggle(type.type)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {type.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {type.description}
                </p>
                <Badge 
                  variant="outline" 
                  className="text-xs bg-gray-50 text-gray-700"
                >
                  {type.content_type}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default GeneralContentTypeGrid;