
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, LinkIcon, Edit, Trash2, Briefcase } from 'lucide-react';
import { ContentSuggestion } from '@/types/contentIdeas';

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

  return (
    <Card className="ml-8 border-l-4 border-l-purple-300 bg-purple-50/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
              {suggestion.source_url ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-md font-medium text-gray-900 mb-1 line-clamp-2">
                {suggestion.title}
              </h4>
              {suggestion.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                  {suggestion.description}
                </p>
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
            <Button
              onClick={onCreateBrief}
              disabled={isCreatingBrief}
              size="sm"
              className="text-purple-600 hover:text-purple-700"
              variant="ghost"
            >
              <Briefcase className="w-3 h-3 mr-1" />
              {isCreatingBrief ? 'Creating...' : 'Create Brief'}
            </Button>
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
