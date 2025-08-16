
import React, { memo, useCallback } from 'react';
import { GeneralContentItem } from '@/types/generalContent';
import GeneralContentCard from './GeneralContentCard';
import EmptyGeneralContentState from './EmptyGeneralContentState';
import { useGeneralContentRetry } from '@/hooks/useGeneralContentRetry';
import VirtualizedList from '@/components/performance/VirtualizedList';

interface GeneralContentGridProps {
  items: GeneralContentItem[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onCreateContent: () => void;
}

const GeneralContentGrid: React.FC<GeneralContentGridProps> = memo(({
  items,
  onDelete,
  isDeleting,
  onCreateContent
}) => {
  const { retryGeneralContent } = useGeneralContentRetry();

  const renderVirtualizedItem = useCallback(({ index, item, style }: { 
    index: number; 
    item: GeneralContentItem; 
    style: React.CSSProperties 
  }) => (
    <div style={style} className="p-3">
      <GeneralContentCard
        key={item.id}
        item={item}
        onDelete={onDelete}
        isDeleting={isDeleting}
        onRetry={retryGeneralContent}
      />
    </div>
  ), [onDelete, isDeleting, retryGeneralContent]);

  if (items.length === 0) {
    return <EmptyGeneralContentState onCreateContent={onCreateContent} />;
  }

  // Use virtualization for large lists (50+ items)
  if (items.length > 50) {
    return (
      <VirtualizedList
        items={items}
        itemHeight={280}
        height={600}
        renderItem={renderVirtualizedItem}
        className="w-full"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <GeneralContentCard
          key={item.id}
          item={item}
          onDelete={onDelete}
          isDeleting={isDeleting}
          onRetry={retryGeneralContent}
        />
      ))}
    </div>
  );
});

GeneralContentGrid.displayName = 'GeneralContentGrid';

export default GeneralContentGrid;
