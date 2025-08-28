
import React from 'react';
import { ContentIdea } from '@/types/contentIdeas';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import ContentSuggestionCard from '@/components/ContentSuggestionCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface IdeaSuggestionsSectionProps {
  idea: ContentIdea;
  showSuggestions: boolean;
  onEdit: (idea: ContentIdea) => void;
  onDiscard: (id: string) => void;
  onCreateBrief: (id: string, type?: 'idea' | 'suggestion', ideaId?: string) => void;
  isCreatingBrief: (id: string) => boolean;
}

export default function IdeaSuggestionsSection({ 
  idea, 
  showSuggestions, 
  onEdit, 
  onDiscard, 
  onCreateBrief, 
  isCreatingBrief 
}: IdeaSuggestionsSectionProps) {
  // Always fetch suggestions when the section should be shown
  const { data: suggestions, isLoading: loadingSuggestions } = useContentSuggestions(
    showSuggestions ? idea.id : ''
  );

  const handleSuggestionEdit = (suggestion: any) => {
    // Convert suggestion to idea format for editing
    const suggestionAsIdea: ContentIdea = {
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      content_type: suggestion.content_type as 'Blog Post' | 'Guide',
      target_audience: idea.target_audience, // Use parent's target audience
      status: 'ready' as const,
      source_type: suggestion.source_url ? 'url' : 'file',
      source_data: suggestion.source_url ? { url: suggestion.source_url } : {},
      internal_name: `SUGG_${suggestion.id.slice(0, 8)}`,
      created_at: suggestion.created_at,
      updated_at: suggestion.updated_at,
    };
    onEdit(suggestionAsIdea);
  };

  const handleSuggestionCreateBrief = (suggestion: any) => {
    onCreateBrief(suggestion.id, 'suggestion', idea.id);
  };

  const handleSuggestionDiscard = (suggestion: any) => {
    onDiscard(suggestion.id);
  };

  if (!showSuggestions) return null;

  return (
    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
      {loadingSuggestions ? (
        <div className="ml-8 flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : suggestions && suggestions.length > 0 ? (
        <div className="space-y-2">
          <div className="ml-8 text-sm font-medium text-gray-700 mb-2">
            Content Suggestions ({suggestions.length})
          </div>
          {suggestions.map((suggestion) => (
            <ContentSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onEdit={() => handleSuggestionEdit(suggestion)}
              onDiscard={() => handleSuggestionDiscard(suggestion)}
              onCreateBrief={() => handleSuggestionCreateBrief(suggestion)}
              isCreatingBrief={isCreatingBrief(suggestion.id)}
            />
          ))}
        </div>
      ) : (
        <div className="ml-8 p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
          No suggestions available for this idea.
        </div>
      )}
    </div>
  );
}
