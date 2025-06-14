
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { ContentBrief } from '@/types/contentBriefs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { triggerContentProcessingWebhook } from '@/services/webhookService';
import { useContentItemByBrief } from '@/hooks/useContentItemByBrief';

interface CreateContentCTAProps {
  brief: ContentBrief;
  onCreateContentItem?: (briefId: string) => void;
}

export default function CreateContentCTA({ brief, onCreateContentItem }: CreateContentCTAProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { data: contentItem } = useContentItemByBrief(brief.id);
  
  const canCreateContent = brief.status === 'ready_for_review';
  const hasContentItem = brief.status === 'content_item_created' && contentItem;

  // Don't show anything if the brief is not ready and doesn't have content
  if (!canCreateContent && !hasContentItem) return null;

  const handleCreateContent = async () => {
    if (!user?.id || isCreating) {
      if (!user?.id) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to create content items.',
          variant: 'destructive',
        });
      }
      return;
    }

    setIsCreating(true);

    try {
      console.log('Creating content item for brief:', brief.id);
      
      // Trigger the content processing webhook
      await triggerContentProcessingWebhook(brief.id, user.id);
      
      // Show fun confirmation message
      toast({
        title: '🎉 Content magic is happening!',
        description: '✨ Your content item is being crafted by our digital elves. You\'ll be notified when it\'s ready to shine! 🚀',
      });

      // Also call the parent callback if provided
      onCreateContentItem?.(brief.id);
    } catch (error) {
      console.error('Failed to create content item:', error);
      toast({
        title: 'Oops! Something went wrong',
        description: 'Failed to start content creation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewContent = () => {
    if (contentItem) {
      window.location.href = `/content-items/${contentItem.id}`;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div className="text-center">
        {hasContentItem ? (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Item Ready!</h3>
            <p className="text-gray-600 mb-4">
              Your {brief.brief_type.toLowerCase()} content item has been created and is ready for review.
            </p>
            <Button
              onClick={handleViewContent}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Content Item
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Create Content?</h3>
            <p className="text-gray-600 mb-4">
              Transform this brief into a content item and start writing your {brief.brief_type.toLowerCase()}.
            </p>
            <Button
              onClick={handleCreateContent}
              disabled={isCreating}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Content Item'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
