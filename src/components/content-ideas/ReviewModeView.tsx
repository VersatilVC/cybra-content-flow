
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentIdea } from '@/types/contentIdeas';
import ContentIdeaReviewCard from '@/components/ContentIdeaReviewCard';

interface ReviewModeViewProps {
  idea: ContentIdea;
  onBackToDashboard: () => void;
  onEdit: (idea: ContentIdea) => void;
  onCreateBrief: (id: string, type?: 'idea' | 'suggestion', ideaId?: string) => void;
  isCreatingBrief: (id: string) => boolean;
}

export default function ReviewModeView({ 
  idea, 
  onBackToDashboard, 
  onEdit, 
  onCreateBrief, 
  isCreatingBrief 
}: ReviewModeViewProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={onBackToDashboard}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Content Idea</h1>
        <p className="text-gray-600">Review and take action on this processed content idea</p>
      </div>

      <ContentIdeaReviewCard
        idea={idea}
        onCreateBrief={onCreateBrief}
        isCreatingBrief={isCreatingBrief}
      />

      <div className="mt-6 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">Other Actions</h3>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onEdit(idea)}
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
