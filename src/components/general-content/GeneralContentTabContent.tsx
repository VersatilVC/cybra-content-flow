import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Image, Video } from 'lucide-react';
import { GeneralContentItem } from '@/types/generalContent';
import EnhancedGeneralContentCard from './EnhancedGeneralContentCard';
import RichEmptyState from './RichEmptyState';

interface GeneralContentTabContentProps {
  category: 'General' | 'Social' | 'Ads';
  items: GeneralContentItem[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onCreateContent: () => void;
}

const GeneralContentTabContent: React.FC<GeneralContentTabContentProps> = ({
  category,
  items,
  onDelete,
  isDeleting,
  onCreateContent
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'General': return FileText;
      case 'Social': return Image;
      case 'Ads': return Video;
      default: return FileText;
    }
  };

  const getCategoryDescription = (cat: string) => {
    switch (cat) {
      case 'General':
        return 'Blog posts, articles, summaries, and other general content';
      case 'Social':
        return 'Social media posts, captions, and platform-specific content';
      case 'Ads':
        return 'Advertisement copy, marketing materials, and promotional content';
      default:
        return 'Content items';
    }
  };

  const Icon = getCategoryIcon(category);
  
  // Calculate stats
  const stats = {
    total: items.length,
    approved: items.filter(item => item.status === 'approved').length,
    published: items.filter(item => item.status === 'published').length,
    failed: items.filter(item => item.status === 'failed').length
  };

  return (
    <TabsContent value={category} className="mt-6">
      <div className="space-y-6">
        {/* Category header with stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{category} Content</h3>
              <p className="text-sm text-gray-600">{getCategoryDescription(category)}</p>
            </div>
          </div>
          <Button 
            onClick={onCreateContent}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate {category}
          </Button>
        </div>

        {/* Stats summary */}
        {stats.total > 0 && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.published}</div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        )}

        {/* Content grid or empty state */}
        {items.length === 0 ? (
          <RichEmptyState 
            category={category} 
            onCreateContent={onCreateContent}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <EnhancedGeneralContentCard
                key={item.id}
                item={item}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default GeneralContentTabContent;