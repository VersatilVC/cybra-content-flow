import React, { useState, useEffect } from 'react';
import { useContentIdeas } from '@/hooks/useContentIdeas';
import { ContentIdeaFilters, ContentIdea } from '@/types/contentIdeas';
import AddIdeaModal from '@/components/AddIdeaModal';
import EditIdeaModal from '@/components/EditIdeaModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContentIdeasHeader from '@/components/content-ideas/ContentIdeasHeader';
import ContentIdeasFilters from '@/components/content-ideas/ContentIdeasFilters';
import ContentIdeasGrid from '@/components/content-ideas/ContentIdeasGrid';
import ReviewModeView from '@/components/content-ideas/ReviewModeView';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ContentIdeas = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
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
      <ReviewModeView
        idea={reviewIdea}
        onBackToDashboard={handleBackToDashboard}
        onEdit={handleEdit}
        onCreateBrief={createBrief}
        isCreatingBrief={isCreatingBrief}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <ContentIdeasHeader onNewIdea={() => setShowAddModal(true)} />

      <ContentIdeasFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <ContentIdeasGrid
        ideas={ideas}
        onEdit={handleEdit}
        onDiscard={deleteIdea}
        onCreateBrief={createBrief}
        isCreatingBrief={isCreatingBrief}
        expandIdeaId={expandIdeaId}
        onNewIdea={() => setShowAddModal(true)}
      />

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
