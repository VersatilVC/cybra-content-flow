import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Globe, Loader2 } from 'lucide-react';
import { ContentItem } from '@/services/contentItemsApi';
import { publishToWordPress } from '@/services/wordpressPublishingService';
import { useToast } from '@/hooks/use-toast';

interface PublishingActionsProps {
  contentItem: ContentItem;
  isUpdating: boolean;
  userId: string;
  onStatusUpdate: (status: string) => void;
  onRefetch: () => void;
  showPublish?: boolean;
}

export const PublishingActions: React.FC<PublishingActionsProps> = ({
  contentItem,
  isUpdating,
  userId,
  onStatusUpdate,
  onRefetch,
  showPublish = false
}) => {
  const { toast } = useToast();
  const [isPublishingToWordPress, setIsPublishingToWordPress] = useState(false);

  const handlePublish = () => {
    onStatusUpdate('published');
    
    toast({
      title: 'Content Published',
      description: 'Your content item has been published successfully.',
    });
  };

  const handleWordPressPublish = async () => {
    setIsPublishingToWordPress(true);
    
    try {
      const result = await publishToWordPress(contentItem, userId);
      
      if (result.success) {
        toast({
          title: 'WordPress Publishing Successful',
          description: `Your content has been published to WordPress as a draft post and is ready for review. View post: ${result.postUrl}`,
        });
        
        onRefetch();
      } else {
        console.error('WordPress publishing failed with result:', result);
        toast({
          title: 'WordPress Publishing Failed',
          description: result.error || 'Failed to publish to WordPress.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('WordPress publishing failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : error);
      toast({
        title: 'WordPress Publishing Failed',
        description: error instanceof Error ? error.message : 'Failed to publish to WordPress.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishingToWordPress(false);
    }
  };

  return (
    <>
      {showPublish && (
        <Button 
          onClick={handlePublish}
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Share className="w-4 h-4 mr-2" />
          Publish
        </Button>
      )}
      
      <Button 
        onClick={handleWordPressPublish}
        disabled={isPublishingToWordPress || isUpdating}
        variant="outline"
        className="border-orange-300 text-orange-600 hover:bg-orange-50"
      >
        {isPublishingToWordPress ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Globe className="w-4 h-4 mr-2" />
        )}
        {isPublishingToWordPress ? 'Publishing...' : 'Publish to WordPress'}
      </Button>
    </>
  );
};