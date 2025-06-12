
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Layers, Settings } from 'lucide-react';
import { ContentItem } from '@/services/contentItemsApi';
import { useToast } from '@/hooks/use-toast';
import ContentDerivativesSection from './ContentDerivativesSection';

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
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Overview</h3>
          {contentItem.content ? (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {contentItem.content}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No content available</p>
          )}
          
          {contentItem.summary && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
              <p className="text-gray-700">{contentItem.summary}</p>
            </div>
          )}
          
          {contentItem.tags && contentItem.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {contentItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
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
                {contentItem.content_brief_id && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Brief ID:</span>
                    <p className="text-gray-900 font-mono text-sm">{contentItem.content_brief_id}</p>
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
                <div>
                  <span className="text-sm font-medium text-gray-600">Content Type:</span>
                  <p className="text-gray-900">{contentItem.content_type}</p>
                </div>
                {contentItem.word_count && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Word Count:</span>
                    <p className="text-gray-900">{contentItem.word_count} words</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ContentItemTabs;
