
import React from 'react';
import { GeneralContentItem } from '@/types/generalContent';
import GeneralContentCard from './GeneralContentCard';
import EmptyGeneralContentState from './EmptyGeneralContentState';
import { useGeneralContentRetry } from '@/hooks/useGeneralContentRetry';

interface GeneralContentGridProps {
  items: GeneralContentItem[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onCreateContent: () => void;
}

const GeneralContentGrid: React.FC<GeneralContentGridProps> = ({
  items,
  onDelete,
  isDeleting,
  onCreateContent
}) => {
  const { retryGeneralContent, isRetrying } = useGeneralContentRetry();

  if (items.length === 0) {
    return <EmptyGeneralContentState onCreateContent={onCreateContent} />;
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
};

export default GeneralContentGrid;
