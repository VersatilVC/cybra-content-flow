import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ContentBrief } from '@/types/contentBriefs';
import ContentBriefsTableRow from './ContentBriefsTableRow';

interface ContentBriefsTableProps {
  briefs: ContentBrief[];
  onEdit: (brief: ContentBrief) => void;
  onDiscard: (id: string) => void;
  onCreateContentItem: (briefId: string) => void;
  onView: (brief: ContentBrief) => void;
  selectedItems: ContentBrief[];
  onSelectionChange: (items: ContentBrief[]) => void;
}

export default function ContentBriefsTable({
  briefs,
  onEdit,
  onDiscard,
  onCreateContentItem,
  onView,
  selectedItems,
  onSelectionChange,
}: ContentBriefsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(briefs);
    } else {
      onSelectionChange([]);
    }
  };

  const handleItemSelect = (brief: ContentBrief, isSelected: boolean) => {
    if (isSelected) {
      onSelectionChange([...selectedItems, brief]);
    } else {
      onSelectionChange(selectedItems.filter(selected => selected.id !== brief.id));
    }
  };

  const allSelected = briefs.length > 0 && selectedItems.length === briefs.length;

  if (briefs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No content briefs yet</h3>
        <p className="text-muted-foreground mb-4">Content briefs will appear here once you create them from your content ideas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection summary */}
      <div className="flex items-center gap-2 py-2 border-b border-border">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm text-muted-foreground">
          {selectedItems.length > 0 
            ? `${selectedItems.length} of ${briefs.length} selected`
            : `Select all ${briefs.length} briefs`
          }
        </span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-36">Internal Name</TableHead>
              <TableHead className="w-32">Brief Type</TableHead>
              <TableHead className="w-32">Target Audience</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24">Source Type</TableHead>
              <TableHead className="w-28">Created</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {briefs.map((brief) => (
              <ContentBriefsTableRow
                key={brief.id}
                brief={brief}
                isSelected={selectedItems.some(item => item.id === brief.id)}
                onToggleSelect={(isSelected) => handleItemSelect(brief, isSelected)}
                onEdit={onEdit}
                onDiscard={onDiscard}
                onCreateContentItem={onCreateContentItem}
                onView={onView}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}