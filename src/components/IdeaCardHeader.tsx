
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, FileText, Link as LinkIcon } from 'lucide-react';
import { ContentIdea } from '@/types/contentIdeas';

interface IdeaCardHeaderProps {
  idea: ContentIdea;
}

export default function IdeaCardHeader({ idea }: IdeaCardHeaderProps) {
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

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {getSourceIcon(idea.source_type)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {idea.title}
          </h3>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
          {idea.status.replace('_', ' ')}
        </Badge>
      </div>
    </div>
  );
}
