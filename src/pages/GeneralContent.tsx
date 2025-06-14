
import React, { useState } from 'react';
import { useGeneralContent } from '@/hooks/useGeneralContent';
import { GeneralContentFilters } from '@/types/generalContent';
import GeneralContentModal from '@/components/GeneralContentModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import GeneralContentHeader from '@/components/general-content/GeneralContentHeader';
import GeneralContentFiltersComponent from '@/components/general-content/GeneralContentFilters';
import GeneralContentGrid from '@/components/general-content/GeneralContentGrid';

const GeneralContent = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<GeneralContentFilters>({
    category: 'all',
    derivativeType: 'all',
    status: 'all',
    search: '',
  });

  const { 
    generalContent, 
    isLoading, 
    deleteGeneralContent, 
    isDeleting 
  } = useGeneralContent(filters);

  const handleFilterChange = (key: keyof GeneralContentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

      <GeneralContentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default GeneralContent;
