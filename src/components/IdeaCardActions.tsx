
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, FileText, Link as LinkIcon, Trash2, Eye, ChevronUp } from 'lucide-react';
import { ContentIdea } from '@/types/contentIdeas';

interface IdeaCardActionsProps {
  idea: ContentIdea;
  showSuggestions: boolean;
  onToggleSuggestions: () => void;
  onDiscard: (id: string) => void;
}

export default function IdeaCardActions({ 
  idea, 
  showSuggestions, 
  onToggleSuggestions, 
  onDiscard 
}: IdeaCardActionsProps) {
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'file': return <FileText className="w-4 h-4" />;
      case 'url': return <LinkIcon className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {getSourceIcon(idea.source_type)}
        <span className="capitalize">{idea.source_type} submission</span>
      </div>
      
      <div className="flex gap-2">
        {idea.status === 'processed' && (
          <Button
            onClick={onToggleSuggestions}
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            variant="ghost"
          >
            {showSuggestions ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Suggestions
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                View Suggestions
              </>
            )}
          </Button>
        )}
        <Button
          onClick={() => onDiscard(idea.id)}
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Discard
        </Button>
      </div>
    </div>
  );
}
