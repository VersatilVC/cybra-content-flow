
import React, { useState } from 'react';
import { Plus, Search, Filter, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContentIdeas, ContentIdeaFilters } from '@/hooks/useContentIdeas';
import AddIdeaModal from '@/components/AddIdeaModal';
import AutoGenerationControls from '@/components/AutoGenerationControls';
import ContentIdeaCard from '@/components/ContentIdeaCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const ContentIdeas = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAutoGenControls, setShowAutoGenControls] = useState(false);
  const [filters, setFilters] = useState<ContentIdeaFilters>({
    contentType: 'All Content Types',
    targetAudience: 'All Audiences',
    status: 'All Statuses',
    search: '',
  });

  const { 
    ideas, 
    isLoading, 
    deleteIdea, 
    createBrief, 
    isDeleting, 
    isCreatingBrief 
  } = useContentIdeas(filters);

  const handleFilterChange = (key: keyof ContentIdeaFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEdit = (idea: any) => {
    // TODO: Implement edit functionality
    console.log('Edit idea:', idea);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Ideas</h1>
          <p className="text-gray-600">Generate and manage content ideas for your marketing campaigns</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAutoGenControls(!showAutoGenControls)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Auto Generate
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Idea
          </Button>
        </div>
      </div>

      {showAutoGenControls && (
        <div className="mb-8">
          <AutoGenerationControls />
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search ideas..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={filters.contentType} 
            onValueChange={(value) => handleFilterChange('contentType', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Content Types">All Content Types</SelectItem>
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
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="brief_created">Brief Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="space-y-4">
        {ideas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content ideas yet</h3>
            <p className="text-gray-600 mb-4">Start by submitting your first content idea or auto-generating some ideas.</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Your First Idea
            </Button>
          </div>
        ) : (
          ideas.map((idea) => (
            <ContentIdeaCard
              key={idea.id}
              idea={idea}
              onEdit={handleEdit}
              onDiscard={deleteIdea}
              onCreateBrief={createBrief}
              isCreatingBrief={isCreatingBrief}
            />
          ))
        )}
      </div>

      <AddIdeaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default ContentIdeas;
