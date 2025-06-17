
import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { derivativeTypes, getContentTypeIcon } from '@/components/content-item/derivativeTypes';

interface ContentTypeSelectionProps {
  selectedType: string;
  onTypeSelect: (type: string, category: string) => void;
}

export const ContentTypeSelection: React.FC<ContentTypeSelectionProps> = ({
  selectedType,
  onTypeSelect
}) => {
  const allDerivativeTypes = [
    ...derivativeTypes.General,
    ...derivativeTypes.Social,
    ...derivativeTypes.Ads
  ];

  return (
    <div>
      <Label>Content Type *</Label>
      <div className="mt-2 space-y-4">
        {Object.entries(derivativeTypes).map(([category, types]) => (
          <div key={category}>
            <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {types.map((typeInfo) => (
                <Card 
                  key={typeInfo.type}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedType === typeInfo.type 
                      ? 'ring-2 ring-purple-500 bg-purple-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onTypeSelect(typeInfo.type, category)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{getContentTypeIcon(typeInfo.content_type)}</span>
                          <h5 className="font-medium text-sm text-gray-900">
                            {typeInfo.title}
                          </h5>
                          <Badge variant="secondary" className="text-xs">
                            {typeInfo.content_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {typeInfo.description}
                        </p>
                      </div>
                      {selectedType === typeInfo.type && (
                        <Badge className="ml-2 bg-purple-600 text-white">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
