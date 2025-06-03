
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { triggerContentItemFixWebhook } from '@/services/contentItemFixService';
import { ContentItem } from '@/services/contentItemsApi';

interface RequestAIFixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentItem: ContentItem;
  onFixRequested?: () => void;
}

export function RequestAIFixModal({ open, onOpenChange, contentItem, onFixRequested }: RequestAIFixModalProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide feedback on what needs to be fixed.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await triggerContentItemFixWebhook({
        contentItemId: contentItem.id,
        userId: contentItem.user_id,
        feedback: feedback.trim(),
        currentContent: contentItem.content || '',
        title: contentItem.title,
      });

      toast({
        title: 'AI Fix Requested',
        description: 'Your content will be reviewed and improved based on your feedback.',
      });

      onFixRequested?.();
      onOpenChange(false);
      setFeedback('');
    } catch (error) {
      console.error('Failed to request AI fix:', error);
      toast({
        title: 'Failed to Request Fix',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFeedback('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            Request AI Fix
          </DialogTitle>
          <DialogDescription>
            Describe what needs to be improved or fixed in your content. Our AI will analyze your feedback and enhance the content accordingly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">What would you like to improve?</Label>
            <Textarea
              id="feedback"
              placeholder="E.g., Make it more engaging, fix grammar issues, adjust tone for younger audience, add more technical details..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Be specific about what you'd like to change or improve in the content.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!feedback.trim() || isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting Fix...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Request AI Fix
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
