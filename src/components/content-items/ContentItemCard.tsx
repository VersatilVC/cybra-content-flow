
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Megaphone } from 'lucide-react';
import { GeneratePRPitchesModal } from './GeneratePRPitchesModal';
import { ContentItem } from '@/services/contentItemsApi';
import { getStatusInfo, formatDate } from '@/utils/contentItemStatusHelpers';
import InlineDerivativeIndicator from '@/components/content-item/InlineDerivativeIndicator';
import type { CategoryCounts } from '@/hooks/useDerivativeCounts';

interface ContentItemCardProps {
  item: ContentItem;
  onViewItem: (itemId: string) => void;
  onNavigateToDerivatives: (itemId: string) => void;
  categoryCounts?: CategoryCounts;
  isLoadingExternal?: boolean;
}

const ContentItemCard: React.FC<ContentItemCardProps> = ({
  item,
  onViewItem,
  onNavigateToDerivatives,
  categoryCounts,
  isLoadingExternal,
}) => {
  const [showPRModal, setShowPRModal] = useState(false);
  const statusInfo = getStatusInfo(item.status);
  const StatusIcon = statusInfo.icon;
  
  const isTopicalBlogPost = item.content_type === 'Blog Post' && 
    (item.status === 'completed' || item.status === 'published');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {item.title}
              </h3>
              {item.summary && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.summary}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>Type: {item.content_type}</span>
                <span>•</span>
                {item.word_count && (
                  <>
                    <span>{item.word_count} words</span>
                    <span>•</span>
                  </>
                )}
                <span>Modified {formatDate(item.updated_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon className="w-4 h-4" />
                <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </Badge>
<InlineDerivativeIndicator 
  contentItemId={item.id}
  onNavigate={() => onNavigateToDerivatives(item.id)}
  categoryCounts={categoryCounts}
  isLoadingExternal={isLoadingExternal}
/>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              onClick={() => onViewItem(item.id)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            {isTopicalBlogPost && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPRModal(true);
                }}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Megaphone className="w-4 h-4" />
                PR Pitches
              </Button>
            )}
          </div>
        </div>
        
        <GeneratePRPitchesModal
          open={showPRModal}
          onOpenChange={setShowPRModal}
          contentItem={item}
        />
      </CardContent>
    </Card>
  );
};

export default ContentItemCard;
