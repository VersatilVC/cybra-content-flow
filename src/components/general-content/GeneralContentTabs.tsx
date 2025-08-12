import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image, Video, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGeneralContentTabs } from '@/hooks/useGeneralContentTabs';
import GeneralContentModal from '@/components/GeneralContentModal';
import GeneralContentTabContent from './GeneralContentTabContent';
import LoadingSpinner from '@/components/LoadingSpinner';

const GeneralContentTabs: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const {
    activeTab,
    setActiveTab,
    selectedItems,
    setSelectedItems,
    categorizedContent,
    isLoading,
    deleteItem,
    deleteMultiple,
    isDeleting
  } = useGeneralContentTabs();

  const totalItems = categorizedContent.General.length + 
                    categorizedContent.Social.length + 
                    categorizedContent.Ads.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">General Content</h1>
          <p className="text-gray-600 mt-1">
            {totalItems} item{totalItems === 1 ? '' : 's'} created
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Search - Removed for now, can be added back later */}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'General' | 'Social' | 'Ads')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="General" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            General ({categorizedContent.General.length})
          </TabsTrigger>
          <TabsTrigger value="Social" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Social ({categorizedContent.Social.length})
          </TabsTrigger>
          <TabsTrigger value="Ads" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Ads ({categorizedContent.Ads.length})
          </TabsTrigger>
        </TabsList>

        {(['General', 'Social', 'Ads'] as const).map((category) => (
          <GeneralContentTabContent
            key={category}
            category={category}
            items={categorizedContent[category]}
            onDelete={deleteGeneralContent}
            isDeleting={isDeleting}
            onCreateContent={() => setShowCreateModal(true)}
          />
        ))}
      </Tabs>

      <GeneralContentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default GeneralContentTabs;