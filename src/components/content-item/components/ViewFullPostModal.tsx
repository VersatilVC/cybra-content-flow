
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PlatformBadge from './PlatformBadge';
import { renderTextWithLinks } from '@/utils/linkRenderer';

interface ViewFullPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'linkedin' | 'x';
  content: string;
  imageUrl?: string;
  platformName: string;
}

const ViewFullPostModal: React.FC<ViewFullPostModalProps> = ({
  isOpen,
  onClose,
  platform,
  content,
  imageUrl,
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

  const handleImageDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${platform}-post-image.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Image downloaded',
        description: 'Image has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download image.',
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
            <div 
              className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderTextWithLinks(content) }}
            />
          </div>
          
          {imageUrl && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Attached Image:</h4>
              <img
                src={imageUrl}
                alt={`${platformName} post image`}
                className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
                onError={(e) => {
                  console.error('Failed to load image:', imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-gray-500">
              {content.length} characters {imageUrl && '• Image attached'}
            </div>
            <div className="flex gap-2">
              {imageUrl && (
                <Button
                  onClick={handleImageDownload}
                  variant="outline"
                  className="text-xs"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
              )}
              <Button
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFullPostModal;
