
import React, { useState } from 'react';
import { Search, Filter, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContentBriefs } from '@/hooks/useContentBriefs';
import { ContentBriefFilters, ContentBrief } from '@/types/contentBriefs';
import ContentBriefCard from '@/components/ContentBriefCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ViewBriefModal from '@/components/ViewBriefModal';
import EditBriefModal from '@/components/EditBriefModal';

const ContentBriefs = () => {
  const [filters, setFilters] = useState<ContentBriefFilters>({
    briefType: 'All Brief Types',
    targetAudience: 'All Audiences',
    status: 'All Statuses',
    search: '',
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState<ContentBrief | null>(null);

  const { 
    briefs, 
    isLoading, 
    deleteBrief,
    updateBrief,
    isUpdating 
  } = useContentBriefs(filters);

  const handleFilterChange = (key: keyof ContentBriefFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEdit = (brief: ContentBrief) => {
    setSelectedBrief(brief);
    setEditModalOpen(true);
  };

  const handleView = (brief: ContentBrief) => {
    setSelectedBrief(brief);
    setViewModalOpen(true);
  };

  const handleSaveBrief = (id: string, updates: Partial<ContentBrief>) => {
    updateBrief({ id, updates });
    setEditModalOpen(false);
    setSelectedBrief(null);
  };

  const handleCreateContentItem = (briefId: string) => {
    console.log('Create content item for brief:', briefId);
    // TODO: Implement content item creation
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Briefs</h1>
          <p className="text-gray-600">Manage and review your content briefs</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search briefs..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={filters.briefType} 
            onValueChange={(value) => handleFilterChange('briefType', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Brief Types">All Brief Types</SelectItem>
              <SelectItem value="Blog Post">Blog Post</SelectItem>
              <SelectItem value="Guide">Guide</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.targetAudience} 
            onValueChange={(value) => handleFilterChange('targetAudience', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Audiences">All Audiences</SelectItem>
              <SelectItem value="Private Sector">Private Sector</SelectItem>
              <SelectItem value="Government Sector">Government Sector</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.status} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="discarded">Discarded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Briefs Grid */}
      <div className="space-y-4">
        {briefs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content briefs yet</h3>
            <p className="text-gray-600 mb-4">Start by creating briefs from your content ideas and suggestions.</p>
            <Button
              onClick={() => window.location.href = '/ideas'}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Go to Content Ideas
            </Button>
          </div>
        ) : (
          briefs.map((brief) => (
            <ContentBriefCard
              key={brief.id}
              brief={brief}
              onEdit={handleEdit}
              onDiscard={deleteBrief}
              onCreateContentItem={handleCreateContentItem}
              onView={handleView}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <ViewBriefModal
        brief={selectedBrief}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedBrief(null);
        }}
      />
      
      <EditBriefModal
        brief={selectedBrief}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBrief(null);
        }}
        onSave={handleSaveBrief}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default ContentBriefs;
