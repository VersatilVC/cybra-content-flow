
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface ContentItemsFiltersProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onClear: () => void;
}

const ContentItemsFilters: React.FC<ContentItemsFiltersProps> = ({
  searchTerm,
  statusFilter,
  typeFilter,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onClear
}) => {
  const isDefault = (
    (searchTerm ?? '') === '' &&
    statusFilter === 'all' &&
    typeFilter === 'all'
  );
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search content items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ready_for_review">Ready for Review</SelectItem>
            <SelectItem value="derivatives_created">Derivatives Created</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="discarded">Discarded</SelectItem>
            <SelectItem value="needs_revision">Needs Revision</SelectItem>
            <SelectItem value="needs_fix">Needs Fix</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Blog Post">Blog Post</SelectItem>
            <SelectItem value="Guide">Guide</SelectItem>
            <SelectItem value="Article">Article</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={onClear}
          disabled={isDefault}
          aria-label="Clear all filters"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Clear filters
        </Button>
      </div>
    </div>
  );
};

export default ContentItemsFilters;
