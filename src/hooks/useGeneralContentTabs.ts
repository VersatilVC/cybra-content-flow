import { useState, useMemo } from 'react';
import { useGeneralContent } from './useGeneralContent';
import { CategorizedGeneralContent, GeneralContentFilters } from '@/types/generalContent';

export function useGeneralContentTabs() {
  const [activeTab, setActiveTab] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all general content with search filter
  const filters: GeneralContentFilters = {
    category: 'all',
    derivativeType: 'all', 
    status: 'all',
    search: searchQuery,
    page: 1,
    pageSize: 1000 // Get all items for categorization
  };

  const { 
    generalContent, 
    isLoading, 
    deleteGeneralContent, 
    isDeleting,
    total
  } = useGeneralContent(filters);

  // Categorize content by category
  const categorizedContent: CategorizedGeneralContent = useMemo(() => {
    const categorized = {
      General: generalContent.filter(item => item.category === 'General'),
      Social: generalContent.filter(item => item.category === 'Social'),
      Ads: generalContent.filter(item => item.category === 'Ads')
    };
    
    return categorized;
  }, [generalContent]);

  const totalItems = categorizedContent.General.length + 
                    categorizedContent.Social.length + 
                    categorizedContent.Ads.length;

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    categorizedContent,
    totalItems,
    isLoading,
    deleteGeneralContent,
    isDeleting
  };
}