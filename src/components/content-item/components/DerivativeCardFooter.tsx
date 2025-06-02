
import React from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { formatDate } from '@/lib/utils';
import DerivativeCardActions from './DerivativeCardActions';

interface DerivativeCardFooterProps {
  derivative: ContentDerivative;
  onEdit: () => void;
  onDelete: () => void;
}

const DerivativeCardFooter: React.FC<DerivativeCardFooterProps> = ({
  derivative,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-1">
          <span className="font-medium">Created:</span>
          <span>{formatDate(derivative.created_at)}</span>
        </div>
        {derivative.word_count && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Words:</span>
            <span>{derivative.word_count.toLocaleString()}</span>
          </div>
        )}
      </div>
      
      <DerivativeCardActions
        derivative={derivative}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default DerivativeCardFooter;
