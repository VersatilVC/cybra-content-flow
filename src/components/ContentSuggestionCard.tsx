
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, LinkIcon, Edit, Trash2, Briefcase, Eye, Loader2 } from 'lucide-react';
import { ContentSuggestion } from '@/types/contentIdeas';
import { useBriefBySource } from '@/hooks/useBriefBySource';
import { ProcessingStatus } from '@/components/ProcessingStatus';

interface ContentSuggestionCardProps {
  suggestion: ContentSuggestion;
  onEdit: () => void;
  onDiscard: () => void;
  onCreateBrief: () => void;
  isCreatingBrief: boolean;
}

export default function ContentSuggestionCard({ 
  suggestion, 
  onEdit, 
  onDiscard, 
  onCreateBrief, 
  isCreatingBrief 
}: ContentSuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: existingBrief, isLoading: loadingBrief } = useBriefBySource(suggestion.id, 'suggestion');
  
  const MAX_DESCRIPTION_LENGTH = 120;
  const needsTruncation = suggestion.description && suggestion.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = needsTruncation && !isExpanded 
    ? suggestion.description?.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
    : suggestion.description;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getRelevanceColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleViewBrief = () => {
    if (existingBrief) {
      console.log('Navigating to brief:', existingBrief.id, 'for suggestion:', suggestion.id);
      // Navigate to the brief details page
      window.location.href = `/content-briefs?view=${existingBrief.id}`;
    }
  };

  const getBriefButton = () => {
    if (isCreatingBrief) {
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

    // Show loading state while checking for existing brief
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
        onClick={onCreateBrief}
        size="sm"
        className="text-purple-600 hover:text-purple-700"
        variant="ghost"
      >
        <Briefcase className="w-3 h-3 mr-1" />
        Create Brief
      </Button>
    );
  };

  const getBriefStatusBadge = () => {
    if (existingBrief) {
      return (
        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
          Brief Created
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="ml-8 border-l-4 border-l-purple-300 bg-purple-50/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
              {suggestion.source_url ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-md font-medium text-gray-900 line-clamp-2">
                  {suggestion.title}
                </h4>
                {getBriefStatusBadge()}
              </div>
              {suggestion.description && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">{displayDescription}</p>
                  {needsTruncation && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-1"
                    >
                      {isExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <span>Type: {suggestion.content_type}</span>
                {suggestion.source_title && (
                  <>
                    <span>•</span>
                    <span>Source: {suggestion.source_title}</span>
                  </>
                )}
                <span>•</span>
                <span>{formatDate(suggestion.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <ProcessingStatus 
              status={suggestion.status}
              entityType="suggestion"
              entityId={suggestion.id}
              retryCount={suggestion.retry_count || 0}
              errorMessage={suggestion.last_error_message || undefined}
              className="text-xs"
            />
            {suggestion.relevance_score && (
              <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(suggestion.relevance_score)}`}>
                {Math.round(suggestion.relevance_score * 100)}% match
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-purple-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {suggestion.source_url ? <LinkIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
            <span>{suggestion.source_url ? 'Web source' : 'Document source'}</span>
          </div>
          
          <div className="flex gap-2">
            {getBriefButton()}
            <Button
              onClick={onEdit}
              size="sm"
              variant="ghost"
              className="text-gray-600 hover:text-gray-700"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              onClick={onDiscard}
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
}
