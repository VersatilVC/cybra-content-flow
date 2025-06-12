
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Layers, Settings } from 'lucide-react';
import { ContentItem } from '@/services/contentItemsApi';
import { useToast } from '@/hooks/use-toast';

interface ContentItemTabsProps {
  contentItem: ContentItem;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const ContentItemTabs: React.FC<ContentItemTabsProps> = ({ 
  contentItem, 
  activeTab = 'overview',
  onTabChange 
}) => {
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="derivatives" className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Derivatives
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Content Overview</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Title</h4>
                <p className="text-gray-700">{contentItem.title}</p>
              </div>
              {contentItem.content && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Content</h4>
                  <div className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border">
                    {contentItem.content}
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Status</h4>
                <p className="text-gray-700 capitalize">{contentItem.status}</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="derivatives" className="mt-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Derivatives</h3>
          <p className="text-gray-600">Derivative content generation and management coming soon.</p>
        </div>
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Settings</h3>
          <p className="text-gray-600">Content settings and metadata management coming soon.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ContentItemTabs;
