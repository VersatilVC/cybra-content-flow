import React, { useState } from 'react';
import { useGeneralContent } from '@/hooks/useGeneralContent';
import { GeneralContentFilters } from '@/types/generalContent';
import GeneralContentModal from '@/components/GeneralContentModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import GeneralContentHeader from '@/components/general-content/GeneralContentHeader';
import GeneralContentFiltersComponent from '@/components/general-content/GeneralContentFilters';
import GeneralContentGrid from '@/components/general-content/GeneralContentGrid';
import { Button } from '@/components/ui/button';

const GeneralContent = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<GeneralContentFilters>({
    category: 'all',
    derivativeType: 'all',
    status: 'all',
    search: '',
    page: 1,
    pageSize: 12,
  });

  const { 
    generalContent, 
    isLoading, 
    deleteGeneralContent, 
    isDeleting 
  } = useGeneralContent(filters);

  const handleFilterChange = (key: keyof GeneralContentFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'search' ? 1 : prev.page }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <GeneralContentHeader onCreateContent={() => setShowCreateModal(true)} />

      <GeneralContentFiltersComponent 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <GeneralContentGrid
        items={generalContent}
        onDelete={deleteGeneralContent}
        isDeleting={isDeleting}
        onCreateContent={() => setShowCreateModal(true)}
      />

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
          disabled={(filters.page || 1) <= 1}
        >
          Previous
        </Button>
        <div className="text-sm opacity-70">Page {filters.page}</div>
        <Button
          variant="outline"
          onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
          disabled={(generalContent?.length || 0) < (filters.pageSize || 12)}
        >
          Next
        </Button>
      </div>

      <GeneralContentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default GeneralContent;
