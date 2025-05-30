
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, FileText, Link as LinkIcon, Edit, Trash2, Briefcase, Eye } from 'lucide-react';
import { ContentIdea } from '@/types/contentIdeas';
import ViewSuggestionsModal from '@/components/ViewSuggestionsModal';

interface ContentIdeaCardProps {
  idea: ContentIdea;
  onEdit: (idea: ContentIdea) => void;
  onDiscard: (id: string) => void;
  onCreateBrief: (id: string) => void;
  isCreatingBrief: boolean;
}

export default function ContentIdeaCard({ 
  idea, 
  onEdit, 
  onDiscard, 
  onCreateBrief, 
  isCreatingBrief 
}: ContentIdeaCardProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const MAX_DESCRIPTION_LENGTH = 150;
  const needsTruncation = idea.description && idea.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = needsTruncation && !isExpanded 
    ? idea.description?.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
    : idea.description;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'brief_created': return 'bg-purple-100 text-purple-800';
      case 'discarded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'file': return <FileText className="w-4 h-4" />;
      case 'url': return <LinkIcon className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {getSourceIcon(idea.source_type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {idea.title}
                </h3>
                {idea.description && (
                  <div className="mb-3">
                    <p className="text-gray-600">{displayDescription}</p>
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
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <span>Type: {idea.content_type}</span>
                  <span>•</span>
                  <span>Audience: {idea.target_audience}</span>
                  <span>•</span>
                  <span>{formatDate(idea.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                {idea.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {getSourceIcon(idea.source_type)}
              <span className="capitalize">{idea.source_type} submission</span>
            </div>
            
            <div className="flex gap-2">
              {idea.status === 'processed' && (
                <>
                  <Button
                    onClick={() => setShowSuggestions(true)}
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                    variant="ghost"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Suggestions
                  </Button>
                  <Button
                    onClick={() => onCreateBrief(idea.id)}
                    disabled={isCreatingBrief}
                    size="sm"
                    className="text-purple-600 hover:text-purple-700"
                    variant="ghost"
                  >
                    <Briefcase className="w-4 h-4 mr-1" />
                    {isCreatingBrief ? 'Creating...' : 'Create Brief'}
                  </Button>
                </>
              )}
              <Button
                onClick={() => onEdit(idea)}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-gray-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
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
        </CardContent>
      </Card>

      <ViewSuggestionsModal
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        ideaId={idea.id}
        ideaTitle={idea.title}
      />
    </>
  );
}
