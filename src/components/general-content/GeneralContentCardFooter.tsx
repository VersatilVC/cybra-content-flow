import React from 'react';
import { GeneralContentItem } from '@/types/generalContent';
import { formatDate } from '@/lib/utils';
import GeneralContentCardActions from './GeneralContentCardActions';

interface GeneralContentCardFooterProps {
  item: GeneralContentItem;
  onEdit?: () => void;
  onDelete: () => void;
  onView?: () => void;
  onRetry?: () => void;
}

const GeneralContentCardFooter: React.FC<GeneralContentCardFooterProps> = ({
  item,
  onEdit,
  onDelete,
  onView,
  onRetry
}) => {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-1">
          <span className="font-medium">Created:</span>
          <span>{formatDate(item.created_at)}</span>
        </div>
        {item.word_count && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Words:</span>
            <span>{item.word_count.toLocaleString()}</span>
          </div>
        )}
        {item.target_audience && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Audience:</span>
            <span className="truncate max-w-24" title={item.target_audience}>
              {item.target_audience}
            </span>
          </div>
        )}
      </div>
      
      <GeneralContentCardActions
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onRetry={onRetry}
      />
    </div>
  );
};

export default GeneralContentCardFooter;