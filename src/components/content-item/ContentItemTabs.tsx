
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Layers, Settings } from 'lucide-react';
import { ContentItem } from '@/services/contentItemsApi';
import { useToast } from '@/hooks/use-toast';
import ContentDerivativesSection from './ContentDerivativesSection';
import EditableContentSection from './EditableContentSection';

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
        <TabsTrigger value="metadata" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Metadata
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <EditableContentSection 
          contentItem={contentItem}
          onSave={() => {}}
          isEditing={false}
          onEdit={() => {}}
          onCancel={() => {}}
        />
      </TabsContent>

      <TabsContent value="derivatives" className="mt-6">
        <ContentDerivativesSection contentItemId={contentItem.id} />
      </TabsContent>

      <TabsContent value="metadata" className="mt-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Title:</span>
                  <p className="text-gray-900">{contentItem.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <p className="text-gray-900 capitalize">{contentItem.status}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Created:</span>
                  <p className="text-gray-900">
                    {new Date(contentItem.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Updated:</span>
                  <p className="text-gray-900">
                    {new Date(contentItem.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Content Details</h4>
              <div className="space-y-3">
                {contentItem.brief_id && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Brief ID:</span>
                    <p className="text-gray-900 font-mono text-sm">{contentItem.brief_id}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Content Length:</span>
                  <p className="text-gray-900">
                    {contentItem.content ? `${contentItem.content.length} characters` : 'No content'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">User ID:</span>
                  <p className="text-gray-900 font-mono text-sm">{contentItem.user_id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ContentItemTabs;
