
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContentBrief } from '@/types/contentBriefs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { triggerContentRoutingWebhook } from '@/services/webhookService';

interface CreateContentCTAProps {
  brief: ContentBrief;
  onCreateContentItem?: (briefId: string) => void;
}

export default function CreateContentCTA({ brief, onCreateContentItem }: CreateContentCTAProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const canCreateContent = brief.status === 'ready' || brief.status === 'approved';

  if (!canCreateContent) return null;

  const handleCreateContent = async () => {
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create content items.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating content item for brief:', brief.id);
      
      // Trigger the content routing webhook
      await triggerContentRoutingWebhook(brief.id, user.id);
      
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
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Create Content?</h3>
        <p className="text-gray-600 mb-4">
          Transform this brief into a content item and start writing your {brief.brief_type.toLowerCase()}.
        </p>
        <Button
          onClick={handleCreateContent}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Content Item
        </Button>
      </div>
    </div>
  );
}
