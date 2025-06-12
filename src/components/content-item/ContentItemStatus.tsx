
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';
import { ContentItem } from '@/services/contentItemsApi';
import { getStatusInfo, formatDate } from '@/utils/contentItemStatus';
import DerivativeSummary from './DerivativeSummary';

interface ContentItemStatusProps {
  contentItem: ContentItem;
}

const ContentItemStatus: React.FC<ContentItemStatusProps> = ({ contentItem }) => {
  const statusInfo = getStatusInfo(contentItem.status);

  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{contentItem.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{contentItem.content_type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(contentItem.created_at)}</span>
          </div>
          {contentItem.word_count && (
            <div className="flex items-center gap-1">
              <span>{contentItem.word_count} words</span>
            </div>
          )}
        </div>
        
        {/* New derivative summary section */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <DerivativeSummary contentItemId={contentItem.id} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </Badge>
      </div>
    </div>
  );
};

export default ContentItemStatus;
