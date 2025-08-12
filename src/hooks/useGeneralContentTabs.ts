import { useState } from 'react';
import { useGeneralContent } from './useGeneralContent';
import { GeneralContentItem } from '@/types/generalContent';

export function useGeneralContentTabs() {
  const [activeTab, setActiveTab] = useState<'General' | 'Social' | 'Ads'>('General');
  const [selectedItems, setSelectedItems] = useState<GeneralContentItem[]>([]);

  // Fetch data for all categories
  const generalData = useGeneralContent({
    category: 'General',
    derivativeType: 'all',
    status: 'all',
    search: '',
    page: 1,
    pageSize: 50
  });

  const socialData = useGeneralContent({
    category: 'Social',
    derivativeType: 'all',
    status: 'all',
    search: '',
    page: 1,
    pageSize: 50
  });

  const adsData = useGeneralContent({
    category: 'Ads',
    derivativeType: 'all',
    status: 'all',
    search: '',
    page: 1,
    pageSize: 50
  });

  const categorizedContent = {
    General: generalData.generalContent || [],
    Social: socialData.generalContent || [],
    Ads: adsData.generalContent || []
  };

  const handleDeleteMultiple = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await generalData.deleteGeneralContent(id);
      }
      setSelectedItems([]);
    } catch (error) {
      console.error('Error deleting multiple items:', error);
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedItems,
    setSelectedItems,
    categorizedContent,
    isLoading: generalData.isLoading || socialData.isLoading || adsData.isLoading,
    deleteItem: generalData.deleteGeneralContent,
    deleteMultiple: handleDeleteMultiple,
    isDeleting: generalData.isDeleting
  };
}