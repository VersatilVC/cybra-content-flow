
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Trash2, Plus, Eye, Calendar, User } from 'lucide-react';
import { ContentBrief } from '@/types/contentBriefs';
import { useContentItemByBrief } from '@/hooks/useContentItemByBrief';

interface ContentBriefCardProps {
  brief: ContentBrief;
  onEdit: (brief: ContentBrief) => void;
  onDiscard: (id: string) => void;
  onCreateContentItem: (briefId: string) => void;
  onView: (brief: ContentBrief) => void;
}

export default function ContentBriefCard({ 
  brief, 
  onEdit, 
  onDiscard, 
  onCreateContentItem,
  onView 
}: ContentBriefCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: contentItem } = useContentItemByBrief(brief.id);
  
  const MAX_DESCRIPTION_LENGTH = 150;
  const needsTruncation = brief.description && brief.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = needsTruncation && !isExpanded 
    ? brief.description?.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
    : brief.description;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'ready_for_review':
        return 'bg-green-100 text-green-800';
      case 'processing_content_item':
        return 'bg-yellow-100 text-yellow-800';
      case 'content_item_created':
        return 'bg-purple-100 text-purple-800';
      case 'discarded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'ready_for_review':
        return 'Ready for Review';
      case 'processing_content_item':
        return 'Processing Content Item';
      case 'content_item_created':
        return 'Content Item Created';
      case 'discarded':
        return 'Discarded';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const canCreateContent = (brief.status === 'ready_for_review' || brief.status === 'ready') && !contentItem;
  const hasContentCreated = (brief.status === 'content_item_created' || contentItem) && contentItem;

  const handleViewContent = () => {
    if (contentItem) {
      window.location.href = `/content-items/${contentItem.id}`;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {brief.title}
              </h3>
              {brief.description && (
                <div className="mb-3">
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
            </div>
          </div>
          <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(brief.status)}`}>
            {getStatusLabel(brief.status)}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{brief.brief_type}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{brief.target_audience}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(brief.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Source: {brief.source_type}</span>
          </div>
          
          <div className="flex gap-2">
            {hasContentCreated && (
              <Button
                onClick={handleViewContent}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Content
              </Button>
            )}
            {canCreateContent && (
              <Button
                onClick={() => onCreateContentItem(brief.id)}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create Content Item
              </Button>
            )}
            <Button
              onClick={() => onView(brief)}
              size="sm"
              variant="outline"
              className="text-gray-600 hover:text-gray-700"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              onClick={() => onEdit(brief)}
              size="sm"
              variant="ghost"
              className="text-gray-600 hover:text-gray-700"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              onClick={() => onDiscard(brief.id)}
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
