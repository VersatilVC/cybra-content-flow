
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DerivativeTypeInfo, getContentTypeIcon } from './derivativeTypes';

interface DerivativeTypeGridProps {
  types: DerivativeTypeInfo[];
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
}

const DerivativeTypeGrid: React.FC<DerivativeTypeGridProps> = ({
  types,
  selectedTypes,
  onTypeToggle
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {types.map((typeInfo) => (
        <Card 
          key={typeInfo.type}
          className={`transition-all ${
            typeInfo.isActive === false 
              ? 'opacity-50 cursor-not-allowed bg-muted' 
              : `cursor-pointer hover:shadow-md ${
                  selectedTypes.includes(typeInfo.type) 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:bg-gray-50'
                }`
          }`}
          onClick={() => typeInfo.isActive !== false && onTypeToggle(typeInfo.type)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getContentTypeIcon(typeInfo.content_type)}</span>
                  <h4 className={`font-medium ${
                    typeInfo.isActive === false ? 'text-muted-foreground' : 'text-gray-900'
                  }`}>
                    {typeInfo.title}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {typeInfo.content_type}
                  </Badge>
                </div>
                <p className={`text-sm ${
                  typeInfo.isActive === false ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  {typeInfo.description}
                </p>
              </div>
              {selectedTypes.includes(typeInfo.type) && (
                <Badge className="ml-2 bg-purple-600 text-white">
                  Selected
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DerivativeTypeGrid;
