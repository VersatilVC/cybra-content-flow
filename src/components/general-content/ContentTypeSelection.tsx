
import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { derivativeTypes, getContentTypeIcon } from '@/components/content-item/derivativeTypes';

interface ContentTypeSelectionProps {
  selectedTypes: string[];
  onTypesSelect: (types: string[], category: string) => void;
}

export const ContentTypeSelection: React.FC<ContentTypeSelectionProps> = ({
  selectedTypes,
  onTypesSelect
}) => {
  const handleTypeToggle = (type: string, category: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    onTypesSelect(newSelectedTypes, category);
  };

  const handleCardClick = (type: string, category: string) => {
    handleTypeToggle(type, category);
  };

  const handleCheckboxChange = (checked: boolean, type: string, category: string, event: React.MouseEvent) => {
    event.stopPropagation();
    handleTypeToggle(type, category);
  };

  const handleSelectAllInCategory = (category: string) => {
    const categoryTypes = derivativeTypes[category as keyof typeof derivativeTypes].map(t => t.type);
    const otherSelectedTypes = selectedTypes.filter(type => 
      !categoryTypes.includes(type)
    );
    const newSelectedTypes = [...otherSelectedTypes, ...categoryTypes];
    onTypesSelect(newSelectedTypes, category);
  };

  const handleClearCategory = (category: string) => {
    const categoryTypes = derivativeTypes[category as keyof typeof derivativeTypes].map(t => t.type);
    const newSelectedTypes = selectedTypes.filter(type => 
      !categoryTypes.includes(type)
    );
    onTypesSelect(newSelectedTypes, category);
  };

  const getCategorySelectedCount = (category: string) => {
    const categoryTypes = derivativeTypes[category as keyof typeof derivativeTypes].map(t => t.type);
    return selectedTypes.filter(type => categoryTypes.includes(type)).length;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Content Types * ({selectedTypes.length} selected)</Label>
        {selectedTypes.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onTypesSelect([], '')}
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="mt-2 space-y-4">
        {Object.entries(derivativeTypes).map(([category, types]) => {
          const selectedCount = getCategorySelectedCount(category);
          const totalCount = types.length;
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  {category}
                  {selectedCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedCount}/{totalCount}
                    </Badge>
                  )}
                </h4>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllInCategory(category)}
                    disabled={selectedCount === totalCount}
                  >
                    Select All
                  </Button>
                  {selectedCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearCategory(category)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {types.map((typeInfo) => {
                  const isSelected = selectedTypes.includes(typeInfo.type);
                  
                  return (
                    <Card 
                      key={typeInfo.type}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCardClick(typeInfo.type, category)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, typeInfo.type, category, e as any)}
                              className="mt-1"
                            />
                          </div>
                          
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
                          
                          {isSelected && (
                            <Badge className="bg-purple-600 text-white text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
