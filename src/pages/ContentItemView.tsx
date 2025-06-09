import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  XCircle, 
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useContentItems } from '@/hooks/useContentItems';
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/services/contentItemsApi';
import { RequestAIFixModal } from '@/components/content-item/RequestAIFixModal';
import { EditContentModal } from '@/components/content-item/EditContentModal';
import ContentItemActions from '@/components/content-item/ContentItemActions';
import ContentItemTabs from '@/components/content-item/ContentItemTabs';
import { getStatusInfo, formatDate } from '@/utils/contentItemStatus';

const ContentItemView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateContentItem, isUpdating } = useContentItems();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIFixModalOpen, setIsAIFixModalOpen] = useState(false);

  const { data: contentItem, isLoading, error, refetch } = useQuery({
    queryKey: ['content-item', id],
    queryFn: async () => {
      if (!id) throw new Error('Content item ID is required');
      
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(`Failed to fetch content item: ${error.message}`);
      return data as ContentItem;
    },
    enabled: !!id && !!user?.id,
  });

  const handleStatusUpdate = (newStatus: string) => {
    if (!contentItem) return;
    
    updateContentItem({ 
      id: contentItem.id, 
      updates: { status: newStatus } 
    });
    
    toast({
      title: 'Status updated',
      description: `Content item has been ${newStatus === 'approved' ? 'approved' : newStatus === 'discarded' ? 'discarded' : 'updated'}.`,
    });
  };

  const handleEditContent = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveContent = (updates: Partial<ContentItem>) => {
    if (!contentItem) return;
    
    updateContentItem({ 
      id: contentItem.id, 
      updates 
    });
    
    setIsEditModalOpen(false);
    refetch();
  };

  const handleRequestAIFix = () => {
    setIsAIFixModalOpen(true);
  };

  const handleAIFixRequested = () => {
    if (contentItem) {
      updateContentItem({ 
        id: contentItem.id, 
        updates: { status: 'needs_revision' } 
      });
    }
  };

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

  const statusInfo = getStatusInfo(contentItem.status);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={() => navigate('/content-items')} 
          variant="ghost" 
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Content Items
        </Button>
        <div className="h-6 w-px bg-gray-300" />
        <nav className="text-sm text-gray-500">
          Content Items / {contentItem.title}
        </nav>
      </div>

      {/* Title and Status */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{contentItem.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
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
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <ContentItemActions
        contentItem={contentItem}
        isUpdating={isUpdating}
        userId={user?.id || ''}
        onStatusUpdate={handleStatusUpdate}
        onEditContent={handleEditContent}
        onRequestAIFix={handleRequestAIFix}
        onRefetch={refetch}
      />

      {/* Content Tabs */}
      <ContentItemTabs contentItem={contentItem} />

      {/* Modals */}
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
