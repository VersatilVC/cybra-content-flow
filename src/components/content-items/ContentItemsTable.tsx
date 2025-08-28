import React, { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ContentItem } from '@/services/contentItemsApi';
import ContentItemsTableRow from './ContentItemsTableRow';
import type { CategoryCounts } from '@/hooks/useDerivativeCounts';

interface ContentItemsTableProps {
  items: ContentItem[];
  selectedItems: ContentItem[];
  onSelectionChange: (items: ContentItem[]) => void;
  onViewItem: (itemId: string) => void;
  onNavigateToDerivatives: (itemId: string) => void;
  derivativeCounts: Record<string, CategoryCounts>;
  isLoadingCounts: boolean;
}

const ContentItemsTable: React.FC<ContentItemsTableProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  onViewItem,
  onNavigateToDerivatives,
  derivativeCounts,
  isLoadingCounts,
}) => {
  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? items : []);
  };

  const handleItemSelect = (item: ContentItem, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, item]);
    } else {
      onSelectionChange(selectedItems.filter(selected => selected.id !== item.id));
    }
  };

  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < items.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                ref={(el) => {
                  if (el && 'indeterminate' in el) {
                    (el as any).indeterminate = isPartiallySelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
                aria-label="Select all items"
              />
            </TableHead>
            <TableHead>Title & Summary</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Internal Name</TableHead>
            <TableHead>Words</TableHead>
            <TableHead>Derivatives</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ContentItemsTableRow
              key={item.id}
              item={item}
              isSelected={selectedItems.some(selected => selected.id === item.id)}
              onSelect={(checked) => handleItemSelect(item, checked)}
              onViewItem={onViewItem}
              onNavigateToDerivatives={onNavigateToDerivatives}
              categoryCounts={derivativeCounts[item.id]}
              isLoadingCounts={isLoadingCounts}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContentItemsTable;