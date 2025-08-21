import React, { useState, useEffect } from 'react';
import { useContentIdeas } from '@/hooks/useContentIdeas';
import { ContentIdeaFilters, ContentIdea } from '@/types/contentIdeas';
import AddIdeaModal from '@/components/AddIdeaModal';
import EditIdeaModal from '@/components/EditIdeaModal';
import ViewSuggestionsModal from '@/components/ViewSuggestionsModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContentIdeasHeader from '@/components/content-ideas/ContentIdeasHeader';
import ContentIdeasFilters from '@/components/content-ideas/ContentIdeasFilters';
import ContentIdeasGrid from '@/components/content-ideas/ContentIdeasGrid';
import ReviewModeView from '@/components/content-ideas/ReviewModeView';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ContentIdeas = () => {
  console.log("🎯 ContentIdeas component rendering - start");
  
  try {
    const navigate = useNavigate();
    console.log("🎯 useNavigate hook loaded successfully");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ContentIdeaFilters>({
    contentType: 'All Content Types',
    targetAudience: 'All Audiences',
    status: 'All Statuses',
    search: '',
  });

    console.log("🎯 About to call useContentIdeas hook with filters:", filters);
    
    const { 
      ideas, 
      isLoading, 
      deleteIdea, 
      createBrief, 
      isDeleting, 
      isCreatingBrief 
    } = useContentIdeas(filters);
    
    console.log("🎯 useContentIdeas hook completed:", { 
      ideasCount: ideas?.length, 
      isLoading, 
      hasDeleteFunction: !!deleteIdea,
      hasCreateBriefFunction: !!createBrief 
    });

  const expandIdeaId = searchParams.get('expand');
  const suggestionsIdeaId = searchParams.get('suggestions');
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

  // Find the specific idea for review and suggestions
  const reviewIdea = expandIdeaId ? ideas.find(idea => idea.id === expandIdeaId) : null;
  const suggestionsIdea = suggestionsIdeaId ? ideas.find(idea => idea.id === suggestionsIdeaId) : null;

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

  // Handle suggestions parameter to show suggestions modal
  useEffect(() => {
    if (suggestionsIdeaId && suggestionsIdea) {
      setShowSuggestionsModal(true);
    }
  }, [suggestionsIdeaId, suggestionsIdea]);

  const handleCloseSuggestionsModal = () => {
    setShowSuggestionsModal(false);
    // Remove suggestions parameter from URL
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('suggestions');
      return newParams;
    });
  };

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

    console.log("🎯 About to render ContentIdeas main content");
    
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

        {suggestionsIdea && (
          <ViewSuggestionsModal
            isOpen={showSuggestionsModal}
            onClose={handleCloseSuggestionsModal}
            ideaId={suggestionsIdea.id}
            ideaTitle={suggestionsIdea.title}
            parentIdea={suggestionsIdea}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error("🚨 ContentIdeas component error:", error);
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-red-600">
          <h1 className="text-xl font-bold mb-2">ContentIdeas Error</h1>
          <p>Component failed to render: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
};

export default ContentIdeas;
