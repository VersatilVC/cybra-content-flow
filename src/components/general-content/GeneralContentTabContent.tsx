import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, FileText, Image, Video, Grid3X3, List } from 'lucide-react';
import { GeneralContentItem } from '@/types/generalContent';
import EnhancedGeneralContentCard from './EnhancedGeneralContentCard';
import GeneralContentTable from './GeneralContentTable';
import RichEmptyState from './RichEmptyState';
import { GeneralContentAIFixModal } from './GeneralContentAIFixModal';
import GeneralContentBatchActions from './GeneralContentBatchActions';
import { useGroupedCarouselContent } from '@/hooks/useGroupedCarouselContent';
import { GroupedCarouselCard } from './GroupedCarouselCard';
import { GroupedCarouselPreviewModal } from './GroupedCarouselPreviewModal';
import { GroupedCarouselItem } from '@/hooks/useGroupedCarouselContent';

interface GeneralContentTabContentProps {
  category: 'General' | 'Social' | 'Ads';
  items: GeneralContentItem[];
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  isDeleting: boolean;
  onCreateContent: () => void;
  selectedItems: GeneralContentItem[];
  onSelectionChange: (items: GeneralContentItem[]) => void;
  viewMode: 'grid' | 'list' | 'table';
  viewDensity: 'compact' | 'comfortable' | 'spacious';
  onViewModeChange: (mode: 'grid' | 'list' | 'table') => void;
}

const GeneralContentTabContent: React.FC<GeneralContentTabContentProps> = ({
  category,
  items,
  onDelete,
  onDeleteMultiple,
  isDeleting,
  onCreateContent,
  selectedItems,
  onSelectionChange,
  viewMode,
  viewDensity,
  onViewModeChange
}) => {
  const [isAIFixModalOpen, setIsAIFixModalOpen] = useState(false);
  const [aiFixItem, setAIFixItem] = useState<GeneralContentItem | null>(null);
  const [previewCarousel, setPreviewCarousel] = useState<GroupedCarouselItem | null>(null);
  
  const { carouselGroups, nonCarouselItems } = useGroupedCarouselContent(items);
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'General': return FileText;
      case 'Social': return Image;
      case 'Ads': return Video;
      default: return FileText;
    }
  };

  const getCategoryDescription = (cat: string) => {
    switch (cat) {
      case 'General':
        return 'Blog posts, articles, summaries, and other general content';
      case 'Social':
        return 'Social media posts, captions, and platform-specific content';
      case 'Ads':
        return 'Advertisement copy, marketing materials, and promotional content';
      default:
        return 'Content items';
    }
  };

  const handleItemSelect = (item: GeneralContentItem, isSelected: boolean) => {
    if (isSelected) {
      onSelectionChange([...selectedItems, item]);
    } else {
      onSelectionChange(selectedItems.filter(selected => selected.id !== item.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(nonCarouselItems); // Only select non-carousel items for bulk operations
    } else {
      onSelectionChange([]);
    }
  };

  const handleCarouselDelete = (ids: string[]) => {
    ids.forEach(id => onDelete(id));
  };

  const handleBulkAIFix = (items: GeneralContentItem[]) => {
    // For simplicity, just open AI fix for the first item
    // In a real implementation, you might want to handle multiple items differently
    if (items.length > 0) {
      setAIFixItem(items[0]);
      setIsAIFixModalOpen(true);
    }
  };

  const allSelected = nonCarouselItems.length > 0 && selectedItems.length === nonCarouselItems.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < nonCarouselItems.length;

  const Icon = getCategoryIcon(category);
  
  // Calculate stats
  const stats = {
    total: items.length,
    approved: items.filter(item => item.status === 'approved').length,
    published: items.filter(item => item.status === 'published').length,
    failed: items.filter(item => item.status === 'failed').length
  };

  return (
    <TabsContent value={category} className="mt-6">
      <div className="space-y-6">
        {/* Category header with stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{category} Content</h3>
              <p className="text-sm text-gray-600">{getCategoryDescription(category)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('table')}
                className="h-8 px-2"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="h-8 px-2"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={onCreateContent}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create {category}
            </Button>
          </div>
        </div>

        {/* Stats summary */}
        {stats.total > 0 && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.published}</div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        )}

        {/* Carousel Groups */}
        {carouselGroups.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Image className="w-5 h-5" />
              Image Carousels ({carouselGroups.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {carouselGroups.map((group) => (
                <GroupedCarouselCard
                  key={group.submission_id}
                  carouselGroup={group}
                  onDelete={handleCarouselDelete}
                  onPreview={setPreviewCarousel}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bulk selection header - only show for grid/list views and non-carousel items */}
        {nonCarouselItems.length > 0 && viewMode !== 'table' && (
          <div className="flex items-center gap-2 py-2 border-b border-gray-200">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">
              {selectedItems.length > 0 
                ? `${selectedItems.length} of ${nonCarouselItems.length} selected`
                : `Select all ${nonCarouselItems.length} items`
              }
            </span>
          </div>
        )}

        {/* Content display */}
        {items.length === 0 ? (
          <RichEmptyState 
            category={category} 
            onCreateContent={onCreateContent}
          />
        ) : nonCarouselItems.length === 0 && carouselGroups.length > 0 ? null : viewMode === 'table' ? (
          <GeneralContentTable
            items={nonCarouselItems}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            onDelete={onDelete}
            onRetry={(item) => {
              setAIFixItem(item);
              setIsAIFixModalOpen(true);
            }}
            isDeleting={isDeleting}
          />
        ) : nonCarouselItems.length > 0 ? (
          <div className="space-y-4">
            {(carouselGroups.length > 0 || category !== 'Social') && (
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {category === 'Social' ? 'Other Social Content' : `${category} Content`} ({nonCarouselItems.length})
              </h3>
            )}
            <div className={`
              ${viewMode === 'grid' 
                ? viewDensity === 'compact' 
                  ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'
                  : viewDensity === 'comfortable'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'grid grid-cols-1 md:grid-cols-2 gap-8'
                : 'space-y-4'
              }
            `}>
              {nonCarouselItems.map((item) => (
                <div key={item.id} className={`relative ${viewMode === 'list' ? 'flex' : ''}`}>
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedItems.some(selected => selected.id === item.id)}
                      onCheckedChange={(checked) => handleItemSelect(item, checked as boolean)}
                      className="bg-white border-2 border-gray-300"
                    />
                  </div>
                  <EnhancedGeneralContentCard
                    item={item}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                    onRetry={(item) => {
                      setAIFixItem(item);
                      setIsAIFixModalOpen(true);
                    }}
                    viewMode={viewMode}
                    viewDensity={viewDensity}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Batch Actions */}
        <GeneralContentBatchActions
          selectedItems={selectedItems}
          onSelectionChange={onSelectionChange}
          onDeleteMultiple={onDeleteMultiple}
          onBulkAIFix={handleBulkAIFix}
          isDeleting={isDeleting}
        />


        {/* AI Fix Modal */}
        {aiFixItem && (
          <GeneralContentAIFixModal
            open={isAIFixModalOpen}
            onOpenChange={setIsAIFixModalOpen}
            item={aiFixItem}
            onFixRequested={() => {
              setAIFixItem(null);
              setIsAIFixModalOpen(false);
            }}
          />
        )}

        {/* Carousel Preview Modal */}
        <GroupedCarouselPreviewModal
          carouselGroup={previewCarousel}
          isOpen={!!previewCarousel}
          onClose={() => setPreviewCarousel(null)}
        />
      </div>
    </TabsContent>
  );
};

export default GeneralContentTabContent;