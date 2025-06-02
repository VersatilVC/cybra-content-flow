
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentBriefFilters } from '@/types/contentBriefs';

interface ContentBriefsFiltersProps {
  filters: ContentBriefFilters;
  onFilterChange: (key: keyof ContentBriefFilters, value: string) => void;
}

export default function ContentBriefsFilters({ filters, onFilterChange }: ContentBriefsFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search briefs..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Select 
          value={filters.briefType} 
          onValueChange={(value) => onFilterChange('briefType', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Brief Types">All Brief Types</SelectItem>
            <SelectItem value="Blog Post">Blog Post</SelectItem>
            <SelectItem value="Guide">Guide</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.targetAudience} 
          onValueChange={(value) => onFilterChange('targetAudience', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Audiences">All Audiences</SelectItem>
            <SelectItem value="Private Sector">Private Sector</SelectItem>
            <SelectItem value="Government Sector">Government Sector</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.status} 
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Statuses">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="content_created">Content Created</SelectItem>
            <SelectItem value="discarded">Discarded</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
