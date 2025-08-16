import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image, Video, Plus, BarChart3, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeneralContentTabs } from '@/hooks/useGeneralContentTabs';
import { useGeneralContentFiltering } from '@/hooks/useGeneralContentFiltering';
import GeneralContentModal from '@/components/GeneralContentModal';
import GeneralContentTabContent from './GeneralContentTabContent';
import GeneralContentAdvancedFilters from './GeneralContentAdvancedFilters';
import GeneralContentInsights from './GeneralContentInsights';
import GeneralContentExportOptions from './GeneralContentExportOptions';
import LoadingSpinner from '@/components/LoadingSpinner';

const GeneralContentTabs: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const {
    activeTab,
    setActiveTab,
    selectedItems,
    setSelectedItems,
    categorizedContent,
    isLoading,
    deleteItem,
    deleteMultiple,
    isDeleting
  } = useGeneralContentTabs();

  // Get filtering for current tab
  const {
    filters,
    filteredAndSortedItems,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    totalItems: currentTabTotal,
    filteredCount,
  } = useGeneralContentFiltering(categorizedContent[activeTab]);

  const allItemsTotal = categorizedContent.General.length + 
                        categorizedContent.Social.length + 
                        categorizedContent.Ads.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">General Content</h1>
          <p className="text-gray-600 mt-1">
            {allItemsTotal} item{allItemsTotal === 1 ? '' : 's'} total
            {hasActiveFilters && ` • ${filteredCount} filtered`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowInsights(!showInsights)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showInsights ? 'Hide' : 'Show'} Insights
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Insights */}
      {showInsights && (
        <GeneralContentInsights items={Object.values(categorizedContent).flat()} />
      )}

      {/* Advanced Filters */}
      <GeneralContentAdvancedFilters
        searchTerm={filters.searchTerm}
        onSearchChange={(term) => updateFilter('searchTerm', term)}
        selectedStatuses={filters.selectedStatuses}
        onStatusChange={(statuses) => updateFilter('selectedStatuses', statuses)}
        selectedTypes={filters.selectedTypes}
        onTypeChange={(types) => updateFilter('selectedTypes', types)}
        dateRange={filters.dateRange}
        onDateRangeChange={(range) => updateFilter('dateRange', range)}
        sortBy={filters.sortBy}
        onSortChange={(sort) => updateFilter('sortBy', sort)}
        sortOrder={filters.sortOrder}
        onSortOrderChange={(order) => updateFilter('sortOrder', order)}
        viewMode={filters.viewMode}
        onViewModeChange={(mode) => updateFilter('viewMode', mode)}
        viewDensity={filters.viewDensity}
        onViewDensityChange={(density) => updateFilter('viewDensity', density)}
        onClearFilters={clearFilters}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'General' | 'Social' | 'Ads')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="General" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            General ({categorizedContent.General.length})
          </TabsTrigger>
          <TabsTrigger value="Social" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Social ({categorizedContent.Social.length})
          </TabsTrigger>
          <TabsTrigger value="Ads" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Ads ({categorizedContent.Ads.length})
          </TabsTrigger>
        </TabsList>

        {(['General', 'Social', 'Ads'] as const).map((category) => (
          <div key={category} className={category !== activeTab ? 'hidden' : ''}>
            <GeneralContentTabContent
              category={category}
              items={category === activeTab ? filteredAndSortedItems : []}
              onDelete={deleteItem}
              onDeleteMultiple={deleteMultiple}
              isDeleting={isDeleting}
              onCreateContent={() => setShowCreateModal(true)}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              viewMode={filters.viewMode}
              viewDensity={filters.viewDensity}
              onViewModeChange={(mode) => updateFilter('viewMode', mode)}
            />
          </div>
        ))}
      </Tabs>

      <GeneralContentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        category={activeTab}
      />

      <GeneralContentExportOptions
        open={showExportModal}
        onOpenChange={setShowExportModal}
        items={Object.values(categorizedContent).flat()}
        selectedItems={selectedItems.length > 0 ? selectedItems : undefined}
      />
    </div>
  );
};

export default GeneralContentTabs;