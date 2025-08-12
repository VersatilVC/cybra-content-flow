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
}

const EnhancedGeneralContentCard: React.FC<EnhancedGeneralContentCardProps> = ({
  item,
  onDelete,
  isDeleting,
  onEdit,
  onView,
  onRetry
}) => {

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-200">
      <GeneralContentCardHeader item={item} />
      
      <CardContent>
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
    </Card>
  );
};

export default EnhancedGeneralContentCard;