import { GeneralContentItem } from './generalContent';
import { GroupedCarouselItem } from '@/hooks/useGroupedCarouselContent';

export interface TableDisplayItem {
  type: 'individual' | 'carousel_group';
  id: string;
  data: GeneralContentItem | GroupedCarouselItem;
}

export interface EnhancedTableProps {
  displayItems: TableDisplayItem[];
  selectedItems: GeneralContentItem[];
  onSelectionChange: (items: GeneralContentItem[]) => void;
  onDelete: (id: string) => void;
  onCarouselDelete: (ids: string[]) => void;
  onRetry: (item: GeneralContentItem) => void;
  onCarouselPreview: (group: GroupedCarouselItem) => void;
  isDeleting: boolean;
}