
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useContentItemView } from '@/hooks/useContentItemView';
import { RequestAIFixModal } from '@/components/content-item/RequestAIFixModal';
import { EditContentModal } from '@/components/content-item/EditContentModal';
import ContentItemActions from '@/components/content-item/ContentItemActions';
import ContentItemTabs from '@/components/content-item/ContentItemTabs';
import ContentItemHeader from '@/components/content-item/ContentItemHeader';
import ContentItemStatus from '@/components/content-item/ContentItemStatus';

const ContentItemView = () => {
  const navigate = useNavigate();
  const {
    contentItem,
    isLoading,
    error,
    refetch,
    isUpdating,
    user,
    isEditModalOpen,
    setIsEditModalOpen,
    isAIFixModalOpen,
    setIsAIFixModalOpen,
    handleStatusUpdate,
    handleEditContent,
    handleSaveContent,
    handleRequestAIFix,
    handleAIFixRequested,
  } = useContentItemView();

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (error || !contentItem) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Content item not found</h3>
          <p className="text-gray-600 mb-4">The content item you're looking for doesn't exist or may have been deleted.</p>
          <Button onClick={() => navigate('/content-items')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <ContentItemHeader title={contentItem.title} />
      
      <ContentItemStatus contentItem={contentItem} />

      <ContentItemActions
        contentItem={contentItem}
        isUpdating={isUpdating}
        userId={user?.id || ''}
        onStatusUpdate={handleStatusUpdate}
        onEditContent={handleEditContent}
        onRequestAIFix={handleRequestAIFix}
        onRefetch={refetch}
      />

      <ContentItemTabs contentItem={contentItem} />

      <EditContentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        contentItem={contentItem}
        onSave={handleSaveContent}
        isUpdating={isUpdating}
      />

      <RequestAIFixModal
        open={isAIFixModalOpen}
        onOpenChange={setIsAIFixModalOpen}
        contentItem={contentItem}
        onFixRequested={handleAIFixRequested}
      />
    </div>
  );
};

export default ContentItemView;
