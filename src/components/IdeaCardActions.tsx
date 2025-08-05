
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, FileText, Link as LinkIcon, Trash2, Eye, ChevronUp, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { ContentIdea } from '@/types/contentIdeas';
import { useRetryIdea } from '@/hooks/useRetryIdea';

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
  const { retryIdea, isRetrying } = useRetryIdea();
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'file': return <FileText className="w-4 h-4" />;
      case 'url': return <LinkIcon className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  // Show suggestions button for ready and brief_created statuses
  const showSuggestionsButton = idea.status === 'ready' || idea.status === 'brief_created';
  
  // Calculate time remaining for processing ideas
  const getTimeRemaining = () => {
    if (idea.status !== 'processing' || !idea.processing_timeout_at) return null;
    const timeout = new Date(idea.processing_timeout_at);
    const now = new Date();
    const remaining = timeout.getTime() - now.getTime();
    if (remaining <= 0) return null;
    
    const minutes = Math.floor(remaining / (1000 * 60));
    return `${minutes}min remaining`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="space-y-3">
      {/* Status and error information */}
      {idea.status === 'failed' && idea.last_error_message && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-medium">Processing Failed</p>
            <p>{idea.last_error_message}</p>
            {idea.retry_count && idea.retry_count > 0 && (
              <p className="text-xs mt-1">Retry count: {idea.retry_count}</p>
            )}
          </div>
        </div>
      )}
      
      {idea.status === 'processing' && timeRemaining && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-700">Processing - {timeRemaining}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {getSourceIcon(idea.source_type)}
          <span className="capitalize">{idea.source_type} submission</span>
        </div>
        
        <div className="flex gap-2">
          {idea.status === 'failed' && (
            <Button
              onClick={() => retryIdea(idea)}
              size="sm"
              variant="ghost"
              disabled={isRetrying}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          )}
          
          {showSuggestionsButton && (
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
    </div>
  );
}
