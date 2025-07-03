
import { useEffect } from 'react';
import { ContentBrief } from '@/types/contentBriefs';
import { useAuth } from '@/contexts/AuthContext';
import { triggerContentProcessingWebhook } from '@/services/webhookService';

interface UseContentBriefsActionsProps {
  briefs: ContentBrief[];
  isLoading: boolean;
  pendingBriefId: string | null;
  setPendingBriefId: (id: string | null) => void;
  setSelectedBrief: (brief: ContentBrief | null) => void;
  setViewModalOpen: (open: boolean) => void;
  isCreatingContent: boolean;
  setIsCreatingContent: (creating: boolean) => void;
  toast: any;
  updateBrief: any;
  setEditModalOpen: (open: boolean) => void;
}

export function useContentBriefsActions({
  briefs,
  isLoading,
  pendingBriefId,
  setPendingBriefId,
  setSelectedBrief,
  setViewModalOpen,
  isCreatingContent,
  setIsCreatingContent,
  toast,
  updateBrief,
  setEditModalOpen,
}: UseContentBriefsActionsProps) {
  const { user } = useAuth();

  // Handle opening brief when briefs are loaded and we have a pending brief ID
  useEffect(() => {
    if (pendingBriefId && briefs.length > 0 && !isLoading) {
      console.log('Looking for brief:', pendingBriefId, 'in', briefs.length, 'available briefs');
      const briefToView = briefs.find(brief => brief.id === pendingBriefId);
      if (briefToView) {
        console.log('Found brief:', briefToView);
        setSelectedBrief(briefToView);
        setViewModalOpen(true);
        setPendingBriefId(null);
      } else {
        // Brief not found, clear pending ID
        console.log('Brief not found in available briefs');
        setPendingBriefId(null);
        toast({
          title: 'Brief not found',
          description: 'The requested brief could not be found.',
          variant: 'destructive',
        });
      }
    }
  }, [briefs, isLoading, pendingBriefId, toast, setSelectedBrief, setViewModalOpen, setPendingBriefId]);

  const handleSaveBrief = (id: string, updates: Partial<ContentBrief>) => {
    updateBrief({ id, updates });
    setEditModalOpen(false);
    setSelectedBrief(null);
  };

  const handleCreateContentItem = async (briefId: string) => {
    if (!user?.id || isCreatingContent) {
      if (!user?.id) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to create content items.',
          variant: 'destructive',
        });
      }
      return;
    }

    setIsCreatingContent(true);
    
    try {
      console.log('Creating content item for brief:', briefId);
      
      // Trigger the content processing webhook
      await triggerContentProcessingWebhook(briefId, user.id);
      
      // Show fun confirmation message
      toast({
        title: '🎉 Content magic is happening!',
        description: '✨ Your content item is being crafted by our digital elves. You\'ll be notified when it\'s ready to shine! 🚀',
      });
    } catch (error) {
      console.error('Failed to create content item:', error);
      toast({
        title: 'Oops! Something went wrong',
        description: 'Failed to start content creation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingContent(false);
    }
  };

  return {
    handleSaveBrief,
    handleCreateContentItem,
  };
}
