
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { derivativeTypes } from '@/components/content-item/derivativeTypes';
import { GeneralContentFilters } from '@/types/generalContent';

interface GeneralContentFiltersProps {
  filters: GeneralContentFilters;
  onFilterChange: (key: keyof GeneralContentFilters, value: string) => void;
}

const GeneralContentFiltersComponent: React.FC<GeneralContentFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  // Get all unique derivative types for the filter
  const allDerivativeTypes = [
    ...derivativeTypes.General,
    ...derivativeTypes.Social,
    ...derivativeTypes.Ads
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search general content..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-3">
        <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="Social">Social</SelectItem>
            <SelectItem value="Ads">Ads</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.derivativeType} onValueChange={(value) => onFilterChange('derivativeType', value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {allDerivativeTypes.map((type) => (
              <SelectItem key={type.type} value={type.type}>
                {type.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready_for_review">Ready for Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default GeneralContentFiltersComponent;
