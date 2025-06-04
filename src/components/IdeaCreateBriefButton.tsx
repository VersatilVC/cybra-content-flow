
import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, Eye, Loader2 } from 'lucide-react';
import { ContentIdea } from '@/types/contentIdeas';
import { useBriefBySource } from '@/hooks/useBriefBySource';

interface IdeaCreateBriefButtonProps {
  idea: ContentIdea;
  onCreateBrief: (id: string, type?: 'idea' | 'suggestion', ideaId?: string) => void;
  isCreatingBrief: (id: string) => boolean;
}

export default function IdeaCreateBriefButton({ 
  idea, 
  onCreateBrief, 
  isCreatingBrief 
}: IdeaCreateBriefButtonProps) {
  const { data: existingBrief, isLoading: loadingBrief } = useBriefBySource(idea.id, 'idea');

  const handleViewBrief = () => {
    if (existingBrief) {
      // Navigate to the brief details page
      window.location.href = `/content-briefs?brief=${existingBrief.id}&action=view`;
    }
  };

  const handleCreateBrief = () => {
    onCreateBrief(idea.id, 'idea');
  };

  if (isCreatingBrief(idea.id)) {
    return (
      <Button
        disabled
        size="sm"
        className="text-purple-600"
        variant="ghost"
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Creating Brief...
      </Button>
    );
  }

  // Show loading state while checking for existing brief
  if (loadingBrief) {
    return (
      <Button
        disabled
        size="sm"
        className="text-gray-400"
        variant="ghost"
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (existingBrief) {
    return (
      <Button
        onClick={handleViewBrief}
        size="sm"
        className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100"
        variant="ghost"
      >
        <Eye className="w-4 h-4 mr-2" />
        View Brief
      </Button>
    );
  }

  return (
    <Button
      onClick={handleCreateBrief}
      size="sm"
      className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100"
      variant="ghost"
    >
      <Briefcase className="w-4 h-4 mr-2" />
      Create Brief
    </Button>
  );
}
