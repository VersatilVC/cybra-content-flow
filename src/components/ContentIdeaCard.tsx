
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ContentIdea } from '@/types/contentIdeas';
import IdeaCardHeader from '@/components/IdeaCardHeader';
import IdeaCardContent from '@/components/IdeaCardContent';
import IdeaCardActions from '@/components/IdeaCardActions';
import IdeaSuggestionsSection from '@/components/IdeaSuggestionsSection';
import IdeaCreateBriefButton from '@/components/IdeaCreateBriefButton';

interface ContentIdeaCardProps {
  idea: ContentIdea;
  onEdit: (idea: ContentIdea) => void;
  onDiscard: (id: string) => void;
  onCreateBrief: (id: string, type?: 'idea' | 'suggestion', ideaId?: string) => void;
  isCreatingBrief: (id: string) => boolean;
  autoExpand?: boolean;
}

export default function ContentIdeaCard({ 
  idea, 
  onEdit, 
  onDiscard, 
  onCreateBrief, 
  isCreatingBrief,
  autoExpand = false
}: ContentIdeaCardProps) {
  const [showSuggestions, setShowSuggestions] = useState(autoExpand);

  const handleToggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  return (
    <div className="space-y-2">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <IdeaCardHeader idea={idea} />
          <IdeaCardContent idea={idea} />
          
          {/* Brief Action Button for processed ideas */}
          {(idea.status === 'processed' || idea.status === 'brief_created') && (
            <div className="mt-4 pt-4 border-t">
              <IdeaCreateBriefButton
                idea={idea}
                onCreateBrief={onCreateBrief}
                isCreatingBrief={isCreatingBrief}
              />
            </div>
          )}
          
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
}
