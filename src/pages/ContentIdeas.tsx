
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContentIdeas } from '@/hooks/useContentIdeas';
import { ContentIdeaFilters, ContentIdea } from '@/types/contentIdeas';
import AddIdeaModal from '@/components/AddIdeaModal';
import EditIdeaModal from '@/components/EditIdeaModal';
import AutoGenerationControls from '@/components/AutoGenerationControls';
import ContentIdeaCard from '@/components/ContentIdeaCard';
import ContentIdeaReviewCard from '@/components/ContentIdeaReviewCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ContentIdeas = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [showAutoGenControls, setShowAutoGenControls] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
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

  const expandIdeaId = searchParams.get('expand');
  const reviewAction = searchParams.get('action') === 'review';

  const handleFilterChange = (key: keyof ContentIdeaFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEdit = (idea: ContentIdea) => {
    setSelectedIdea(idea);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedIdea(null);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Find the specific idea for review
  const reviewIdea = expandIdeaId ? ideas.find(idea => idea.id === expandIdeaId) : null;

  // Clear expand parameter after component mounts
  useEffect(() => {
    if (expandIdeaId && !reviewAction) {
      const timer = setTimeout(() => {
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('expand');
          return newParams;
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [expandIdeaId, reviewAction, setSearchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // If we're in review mode and have a specific idea, show the review interface
  if (reviewAction && reviewIdea) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Content Idea</h1>
          <p className="text-gray-600">Review and take action on this processed content idea</p>
        </div>

        <ContentIdeaReviewCard
          idea={reviewIdea}
          onCreateBrief={createBrief}
          isCreatingBrief={isCreatingBrief}
        />

        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Other Actions</h3>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleEdit(reviewIdea)}
            >
              Edit Idea
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/content-ideas'}
            >
              View All Ideas
            </Button>
          </div>
        </div>
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
              autoExpand={expandIdeaId === idea.id}
            />
          ))
        )}
      </div>

      <AddIdeaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditIdeaModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        idea={selectedIdea}
      />
    </div>
  );
};

export default ContentIdeas;
