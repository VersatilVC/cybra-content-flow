
import React, { useState, memo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ContentIdea } from '@/types/contentIdeas';
import IdeaCardHeader from '@/components/IdeaCardHeader';
import IdeaCardContent from '@/components/IdeaCardContent';
import IdeaCardActions from '@/components/IdeaCardActions';
import IdeaSuggestionsSection from '@/components/IdeaSuggestionsSection';

interface ContentIdeaCardProps {
  idea: ContentIdea;
  onEdit: (idea: ContentIdea) => void;
  onDiscard: (id: string) => void;
  onCreateBrief: (id: string, type?: 'idea' | 'suggestion', ideaId?: string) => void;
  isCreatingBrief: (id: string) => boolean;
  autoExpand?: boolean;
}

const ContentIdeaCard = memo<ContentIdeaCardProps>(({ 
  idea, 
  onEdit, 
  onDiscard, 
  onCreateBrief, 
  isCreatingBrief,
  autoExpand = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(autoExpand);

  const handleToggleSuggestions = useCallback(() => {
    setShowSuggestions(!showSuggestions);
  }, [showSuggestions]);

  return (
    <div className="space-y-2">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <IdeaCardHeader idea={idea} />
          <IdeaCardContent idea={idea} />
          
          <IdeaCardActions
            idea={idea}
            showSuggestions={showSuggestions}
            onToggleSuggestions={handleToggleSuggestions}
            onDiscard={onDiscard}
          />
        </CardContent>
      </Card>

      <IdeaSuggestionsSection
        idea={idea}
        showSuggestions={showSuggestions}
        onEdit={onEdit}
        onDiscard={onDiscard}
        onCreateBrief={onCreateBrief}
        isCreatingBrief={isCreatingBrief}
      />
    </div>
  );
});

ContentIdeaCard.displayName = 'ContentIdeaCard';

export default ContentIdeaCard;
