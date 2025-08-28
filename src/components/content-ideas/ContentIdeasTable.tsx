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
import { ContentIdea } from '@/types/contentIdeas';
import ContentIdeasTableRow from './ContentIdeasTableRow';

interface ContentIdeasTableProps {
  ideas: ContentIdea[];
  onEdit: (idea: ContentIdea) => void;
  onDiscard: (id: string) => void;
  onCreateBrief: (id: string, type?: 'idea' | 'suggestion', ideaId?: string) => void;
  isCreatingBrief: (id: string) => boolean;
  expandIdeaId?: string | null;
  onNewIdea: () => void;
  selectedItems: ContentIdea[];
  onSelectionChange: (items: ContentIdea[]) => void;
}

export default function ContentIdeasTable({
  ideas,
  onEdit,
  onDiscard,
  onCreateBrief,
  isCreatingBrief,
  expandIdeaId,
  onNewIdea,
  selectedItems,
  onSelectionChange,
}: ContentIdeasTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set(expandIdeaId ? [expandIdeaId] : [])
  );

  const handleToggleRow = (ideaId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ideaId)) {
      newExpanded.delete(ideaId);
    } else {
      newExpanded.add(ideaId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(ideas);
    } else {
      onSelectionChange([]);
    }
  };

  const handleItemSelect = (idea: ContentIdea, isSelected: boolean) => {
    if (isSelected) {
      onSelectionChange([...selectedItems, idea]);
    } else {
      onSelectionChange(selectedItems.filter(selected => selected.id !== idea.id));
    }
  };

  const allSelected = ideas.length > 0 && selectedItems.length === ideas.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < ideas.length;

  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content ideas yet</h3>
        <p className="text-gray-600 mb-4">Start by submitting your first content idea or auto-generating some ideas.</p>
        <Button
          onClick={onNewIdea}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Submit Your First Idea
        </Button>
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
            ? `${selectedItems.length} of ${ideas.length} selected`
            : `Select all ${ideas.length} ideas`
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
              <TableHead className="w-8">
                <span className="sr-only">Expand</span>
              </TableHead>
              <TableHead>Title & Description</TableHead>
              <TableHead className="w-32">Type & Status</TableHead>
              <TableHead className="w-28">Audience</TableHead>
              <TableHead className="w-36">Internal Name</TableHead>
              <TableHead className="w-24">Source</TableHead>
              <TableHead className="w-28">Created</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ideas.map((idea) => (
              <ContentIdeasTableRow
                key={idea.id}
                idea={idea}
                isSelected={selectedItems.some(item => item.id === idea.id)}
                isExpanded={expandedRows.has(idea.id)}
                onToggleExpand={() => handleToggleRow(idea.id)}
                onToggleSelect={(isSelected) => handleItemSelect(idea, isSelected)}
                onEdit={onEdit}
                onDiscard={onDiscard}
                onCreateBrief={onCreateBrief}
                isCreatingBrief={isCreatingBrief}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}