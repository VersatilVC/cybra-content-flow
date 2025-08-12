import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Calendar as CalendarIcon, SortAsc, SortDesc, Grid, List, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { generalContentTypes } from './generalContentTypes';

interface GeneralContentAdvancedFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  viewDensity: 'compact' | 'comfortable' | 'spacious';
  onViewDensityChange: (density: 'compact' | 'comfortable' | 'spacious') => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'published', label: 'Published', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
];

const sortOptions = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
  { value: 'category', label: 'Category' },
  { value: 'derivative_type', label: 'Type' },
];

const GeneralContentAdvancedFilters: React.FC<GeneralContentAdvancedFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  selectedTypes,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  viewDensity,
  onViewDensityChange,
  onClearFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = selectedStatuses.length > 0 || selectedTypes.length > 0 || 
                          dateRange.start || dateRange.end || searchTerm;

  const handleStatusToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      {/* Main search and controls row */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sort controls */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          {/* View mode controls */}
          <div className="flex border rounded">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="border-r rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* View density */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <div className="font-medium text-sm">View Density</div>
                {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                  <Button
                    key={density}
                    variant={viewDensity === density ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onViewDensityChange(density)}
                  >
                    {density.charAt(0).toUpperCase() + density.slice(1)}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      {/* Active filters row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {selectedStatuses.map((status) => {
            const statusOption = statusOptions.find(s => s.value === status);
            return (
              <Badge
                key={status}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {statusOption?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleStatusToggle(status)}
                />
              </Badge>
            );
          })}
          
          {selectedTypes.map((type) => {
            const typeOption = Object.values(generalContentTypes).flat().find(t => t.type === type);
            return (
              <Badge
                key={type}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {typeOption?.title}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleTypeToggle(type)}
                />
              </Badge>
            );
          })}
          
          {(dateRange.start || dateRange.end) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {dateRange.start && format(dateRange.start, 'MMM dd')}
              {dateRange.start && dateRange.end && ' - '}
              {dateRange.end && format(dateRange.end, 'MMM dd')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onDateRangeChange({ start: null, end: null })}
              />
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          {/* Status filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex flex-wrap gap-1">
              {statusOptions.map((status) => (
                <Button
                  key={status.value}
                  variant={selectedStatuses.includes(status.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusToggle(status.value)}
                  className="h-6 px-2 text-xs"
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Type filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Type</label>
            <div className="flex flex-wrap gap-1">
              {Object.values(generalContentTypes).flat().slice(0, 6).map((type) => (
                <Button
                  key={type.type}
                  variant={selectedTypes.includes(type.type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeToggle(type.type)}
                  className="h-6 px-2 text-xs"
                >
                  {type.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {dateRange.start ? format(dateRange.start, 'MMM dd') : 'Start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.start || undefined}
                    onSelect={(date) => onDateRangeChange({ ...dateRange, start: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {dateRange.end ? format(dateRange.end, 'MMM dd') : 'End'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.end || undefined}
                    onSelect={(date) => onDateRangeChange({ ...dateRange, end: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralContentAdvancedFilters;