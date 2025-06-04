
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentIdea } from '@/types/contentIdeas';
import ContentIdeaCard from '@/components/ContentIdeaCard';

interface ContentIdeasGridProps {
  ideas: ContentIdea[];
  onEdit: (idea: ContentIdea) => void;
  onDiscard: (id: string) => void;
  onCreateBrief: (id: string, type?: 'idea' | 'suggestion', ideaId?: string) => void;
  isCreatingBrief: (id: string) => boolean;
  expandIdeaId?: string | null;
  onNewIdea: () => void;
}

export default function ContentIdeasGrid({ 
  ideas, 
  onEdit, 
  onDiscard, 
  onCreateBrief, 
  isCreatingBrief, 
  expandIdeaId,
  onNewIdea 
}: ContentIdeasGridProps) {
  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content ideas yet</h3>
        <p className="text-gray-600 mb-4">Start by submitting your first content idea or auto-generating some ideas.</p>
        <Button
          onClick={onNewIdea}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Submit Your First Idea
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ideas.map((idea) => (
        <ContentIdeaCard
          key={idea.id}
          idea={idea}
          onEdit={onEdit}
          onDiscard={onDiscard}
          onCreateBrief={onCreateBrief}
          isCreatingBrief={isCreatingBrief}
          autoExpand={expandIdeaId === idea.id}
        />
      ))}
    </div>
  );
}
