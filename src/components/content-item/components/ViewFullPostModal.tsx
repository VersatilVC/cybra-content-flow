
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PlatformBadge from './PlatformBadge';

interface ViewFullPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'linkedin' | 'x';
  content: string;
  platformName: string;
}

const ViewFullPostModal: React.FC<ViewFullPostModalProps> = ({
  isOpen,
  onClose,
  platform,
  content,
  platformName,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: `${platformName} post copied successfully.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy content to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlatformBadge platform={platform} />
            <span>Full Post View</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {content}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-gray-500">
              {content.length} characters
            </div>
            <Button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-white" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied!' : `Copy ${platformName} Post`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFullPostModal;
