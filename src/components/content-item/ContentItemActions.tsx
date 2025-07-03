import React from 'react';
import { ContentItem } from '@/services/contentItemsApi';
import { ReviewActions } from './actions/ReviewActions';
import { PublishingActions } from './actions/PublishingActions';
import { ContentManagementActions } from './actions/ContentManagementActions';
import { DangerActions } from './actions/DangerActions';

interface ContentItemActionsProps {
  contentItem: ContentItem;
  isUpdating: boolean;
  userId: string;
  onStatusUpdate: (status: string) => void;
  onEditContent: () => void;
  onRequestAIFix: () => void;
  onRefetch: () => void;
}

const ContentItemActions: React.FC<ContentItemActionsProps> = ({
  contentItem,
  isUpdating,
  userId,
  onStatusUpdate,
  onEditContent,
  onRequestAIFix,
  onRefetch
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-8 p-4 bg-gray-50 rounded-lg">
      {contentItem.status === 'ready_for_review' && (
        <ReviewActions 
          isUpdating={isUpdating}
          onStatusUpdate={onStatusUpdate}
        />
      )}
      
      <PublishingActions 
        contentItem={contentItem}
        isUpdating={isUpdating}
        userId={userId}
        onStatusUpdate={onStatusUpdate}
        onRefetch={onRefetch}
        showPublish={contentItem.status === 'derivatives_created'}
      />
      
      <ContentManagementActions 
        contentItem={contentItem}
        isUpdating={isUpdating}
        onEditContent={onEditContent}
        onRequestAIFix={onRequestAIFix}
      />
      
      <DangerActions 
        isUpdating={isUpdating}
        onStatusUpdate={onStatusUpdate}
      />
    </div>
  );
};

export default ContentItemActions;