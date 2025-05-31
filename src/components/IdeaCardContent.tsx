
import React, { useState } from 'react';
import { ContentIdea } from '@/types/contentIdeas';

interface IdeaCardContentProps {
  idea: ContentIdea;
}

export default function IdeaCardContent({ idea }: IdeaCardContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const MAX_DESCRIPTION_LENGTH = 150;
  const needsTruncation = idea.description && idea.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = needsTruncation && !isExpanded 
    ? idea.description?.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
    : idea.description;

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
    </>
  );
}
