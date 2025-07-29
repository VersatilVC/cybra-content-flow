
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useContentItems } from '@/hooks/useContentItems';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/services/contentItemsApi';

export const useContentItemView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateContentItem, deleteContentItem, isUpdating } = useContentItems();
  const { derivatives, deleteDerivative } = useContentDerivatives(id || '');
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

  const handleStatusUpdate = async (newStatus: string) => {
    if (!contentItem) return;
    
    if (newStatus === 'discarded') {
      // Delete all derivatives first
      try {
        for (const derivative of derivatives) {
          await deleteDerivative(derivative.id);
        }
        
        // Then delete the content item
        await deleteContentItem(contentItem.id);
        
        toast({
          title: 'Content deleted',
          description: 'Content item and all its derivatives have been permanently deleted.',
        });
        
        // Navigate back to content items list
        navigate('/content-items');
      } catch (error) {
        console.error('Error deleting content item:', error);
        toast({
          title: 'Delete failed',
          description: 'Failed to delete the content item. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      updateContentItem({ 
        id: contentItem.id, 
        updates: { status: newStatus as ContentItem['status'] } 
      });
      
      toast({
        title: 'Status updated',
        description: `Content item has been ${newStatus === 'derivatives_created' ? 'approved' : 'updated'}.`,
      });
    }
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
