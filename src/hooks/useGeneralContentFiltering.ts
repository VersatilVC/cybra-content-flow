import { useState, useMemo } from 'react';
import { GeneralContentItem } from '@/types/generalContent';

interface FilterState {
  searchTerm: string;
  selectedStatuses: string[];
  selectedTypes: string[];
  dateRange: { start: Date | null; end: Date | null };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'table';
  viewDensity: 'compact' | 'comfortable' | 'spacious';
}

export function useGeneralContentFiltering(items: GeneralContentItem[]) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedStatuses: [],
    selectedTypes: [],
    dateRange: { start: null, end: null },
    sortBy: 'created_at',
    sortOrder: 'desc',
    viewMode: 'table',
    viewDensity: 'comfortable',
  });

  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        (item.content && item.content.toLowerCase().includes(searchLower)) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.derivative_type.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.selectedStatuses.length > 0) {
      filtered = filtered.filter(item => 
        filters.selectedStatuses.includes(item.status)
      );
    }

    // Type filter
    if (filters.selectedTypes.length > 0) {
      filtered = filtered.filter(item => 
        filters.selectedTypes.includes(item.derivative_type)
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at);
        const startCheck = !filters.dateRange.start || itemDate >= filters.dateRange.start;
        const endCheck = !filters.dateRange.end || itemDate <= filters.dateRange.end;
        return startCheck && endCheck;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'derivative_type':
          aValue = a.derivative_type;
          bValue = b.derivative_type;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedStatuses: [],
      selectedTypes: [],
      dateRange: { start: null, end: null },
      sortBy: 'created_at',
      sortOrder: 'desc',
      viewMode: filters.viewMode, // Keep view preferences
      viewDensity: filters.viewDensity,
    });
  };

  const hasActiveFilters = 
    filters.searchTerm ||
    filters.selectedStatuses.length > 0 ||
    filters.selectedTypes.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return {
    filters,
    filteredAndSortedItems,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    totalItems: items.length,
    filteredCount: filteredAndSortedItems.length,
  };
}