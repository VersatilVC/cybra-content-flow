
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useContentItems } from '@/hooks/useContentItems';
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/services/contentItemsApi';

export const useContentItemView = () => {
  const { id } = useParams<{ id: string }>();
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
      updates: { status: newStatus as ContentItem['status'] } 
    });
    
    toast({
      title: 'Status updated',
      description: `Content item has been ${newStatus === 'derivatives_created' ? 'approved' : newStatus === 'discarded' ? 'discarded' : 'updated'}.`,
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

  return {
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
  };
};
