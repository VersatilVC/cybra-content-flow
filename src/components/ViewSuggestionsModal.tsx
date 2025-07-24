
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, FileText, Star, Edit, Trash2, Briefcase, Eye, Loader2 } from 'lucide-react';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import { useBriefCreation } from '@/hooks/useBriefCreation';
import { useBriefBySource } from '@/hooks/useBriefBySource';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import EditIdeaModal from '@/components/EditIdeaModal';
import { ContentIdea, ContentSuggestion } from '@/types/contentIdeas';

interface ViewSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  ideaTitle: string;
  parentIdea?: ContentIdea; // We'll need this for edit and brief creation context
}

export default function ViewSuggestionsModal({ 
  isOpen, 
  onClose, 
  ideaId, 
  ideaTitle,
  parentIdea 
}: ViewSuggestionsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentIdea | null>(null);
  
  const { data: suggestions, isLoading, error, refetch } = useContentSuggestions(ideaId);
  const { createBrief, isCreatingBrief } = useBriefCreation(parentIdea ? [parentIdea] : []);

  // Action handlers
  const handleSuggestionEdit = (suggestion: ContentSuggestion) => {
    // Convert suggestion to idea format for editing
    const suggestionAsIdea: ContentIdea = {
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      content_type: suggestion.content_type as 'Blog Post' | 'Guide' | 'Blog Post (Topical)',
      target_audience: parentIdea?.target_audience || 'Private Sector',
      status: 'ready' as const,
      source_type: suggestion.source_url ? 'url' : 'file',
      source_data: suggestion.source_url ? { url: suggestion.source_url } : {},
      created_at: suggestion.created_at,
      updated_at: suggestion.updated_at,
    };
    setSelectedSuggestion(suggestionAsIdea);
    setShowEditModal(true);
  };

  const handleSuggestionCreateBrief = (suggestion: ContentSuggestion) => {
    createBrief(suggestion.id, 'suggestion', ideaId);
  };

  const handleSuggestionDiscard = async (suggestion: ContentSuggestion) => {
    try {
      // Delete the suggestion from the database
      const { error } = await supabase
        .from('content_suggestions')
        .delete()
        .eq('id', suggestion.id);
      
      if (error) throw error;
      
      // Refresh suggestions
      refetch();
    } catch (error) {
      console.error('Error discarding suggestion:', error);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedSuggestion(null);
  };

  // Create a component for each suggestion card with actions
  const SuggestionCardWithActions = ({ suggestion }: { suggestion: ContentSuggestion }) => {
    const { data: existingBrief, isLoading: loadingBrief } = useBriefBySource(suggestion.id, 'suggestion');
    
    const handleViewBrief = () => {
      if (existingBrief) {
        window.location.href = `/content-briefs?view=${existingBrief.id}`;
      }
    };

    const getBriefButton = () => {
      if (isCreatingBrief(suggestion.id)) {
        return (
          <Button
            disabled
            size="sm"
            className="text-purple-600"
            variant="ghost"
          >
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Creating...
          </Button>
        );
      }

      if (loadingBrief) {
        return (
          <Button
            disabled
            size="sm"
            className="text-gray-400"
            variant="ghost"
          >
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Checking...
          </Button>
        );
      }

      if (existingBrief) {
        return (
          <Button
            onClick={handleViewBrief}
            size="sm"
            className="text-purple-600 hover:text-purple-700"
            variant="ghost"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Brief
          </Button>
        );
      }

      return (
        <Button
          onClick={() => handleSuggestionCreateBrief(suggestion)}
          size="sm"
          className="text-purple-600 hover:text-purple-700"
          variant="ghost"
        >
          <Briefcase className="w-3 h-3 mr-1" />
          Create Brief
        </Button>
      );
    };

    return (
      <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <FileText className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
              {existingBrief && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 ml-2">
                  Brief Created
                </Badge>
              )}
            </div>
            {suggestion.relevance_score && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-gray-600">
                  {Math.round(suggestion.relevance_score * 100)}%
                </span>
              </div>
            )}
          </div>
          
          {suggestion.description && (
            <p className="text-gray-600 mb-3">{suggestion.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {suggestion.content_type}
              </Badge>
              {suggestion.source_title && (
                <span className="text-xs text-gray-500">
                  Source: {suggestion.source_title}
                </span>
              )}
              {suggestion.source_url && (
                <a
                  href={suggestion.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Source
                </a>
              )}
            </div>
            
            <div className="flex gap-1">
              {getBriefButton()}
              <Button
                onClick={() => handleSuggestionEdit(suggestion)}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-gray-700"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => handleSuggestionDiscard(suggestion)}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Discard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Content Suggestions</DialogTitle>
          <DialogDescription>
            Generated suggestions for "{ideaTitle}"
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Failed to load suggestions
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <SuggestionCardWithActions key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No suggestions available yet
          </div>
        )}
        
        {/* Edit Modal */}
        <EditIdeaModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          idea={selectedSuggestion}
        />
      </DialogContent>
    </Dialog>
  );
}
