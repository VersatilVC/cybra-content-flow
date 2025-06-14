
import React from 'react';
import { FileText } from 'lucide-react';

interface EmptyContentItemsStateProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
}

const EmptyContentItemsState: React.FC<EmptyContentItemsStateProps> = ({
  searchTerm,
  statusFilter,
  typeFilter
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || typeFilter !== 'all';

  return (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No content items found</h3>
      <p className="text-gray-600">
        {hasActiveFilters
          ? 'Try adjusting your filters'
          : 'Create content briefs to generate content items'
        }
      </p>
    </div>
  );
};

export default EmptyContentItemsState;
