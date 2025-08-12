import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GeneralContentItem } from '@/types/generalContent';
import GeneralContentCardHeader from './GeneralContentCardHeader';
import GeneralContentCardContent from './GeneralContentCardContent';
import GeneralContentCardFooter from './GeneralContentCardFooter';

interface EnhancedGeneralContentCardProps {
  item: GeneralContentItem;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onEdit?: (item: GeneralContentItem) => void;
  onView?: (item: GeneralContentItem) => void;
  onRetry?: (item: GeneralContentItem) => void;
  viewMode?: 'grid' | 'list';
  viewDensity?: 'compact' | 'comfortable' | 'spacious';
}

const EnhancedGeneralContentCard: React.FC<EnhancedGeneralContentCardProps> = ({
  item,
  onDelete,
  isDeleting,
  onEdit,
  onView,
  onRetry,
  viewMode = 'grid',
  viewDensity = 'comfortable'
}) => {
  const isListView = viewMode === 'list';
  const cardClass = isListView 
    ? 'flex flex-row' 
    : viewDensity === 'compact' 
    ? 'h-48' 
    : viewDensity === 'comfortable' 
    ? 'h-64' 
    : 'h-80';

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-200 ${cardClass} ${isListView ? 'w-full' : ''}`}>
      <div className={`${isListView ? 'flex flex-1' : 'flex flex-col h-full'}`}>
        <GeneralContentCardHeader item={item} />
        
        <div className={isListView ? 'flex-1' : ''}>
          <CardContent className={viewDensity === 'compact' ? 'p-3' : 'p-4'}>
            <div className="space-y-4">
              <GeneralContentCardContent item={item} />
              
              <GeneralContentCardFooter
                item={item}
                onEdit={onEdit ? () => onEdit(item) : undefined}
                onDelete={() => onDelete(item.id)}
                onView={onView ? () => onView(item) : undefined}
                onRetry={onRetry ? () => onRetry(item) : undefined}
              />
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedGeneralContentCard;