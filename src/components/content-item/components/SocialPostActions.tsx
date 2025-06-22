
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SocialPostActionsProps {
  text: string;
  imageUrl?: string;
  platform: 'linkedin' | 'x';
}

export const useSocialPostActions = ({ text, imageUrl, platform }: SocialPostActionsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: `${platform === 'linkedin' ? 'LinkedIn' : 'X'} post copied successfully.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(`❌ [SocialPostActions] ${platform} - Copy failed:`, error);
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
      console.error(`❌ [SocialPostActions] ${platform} - Image download failed:`, error);
      toast({
        title: 'Download failed',
        description: 'Failed to download image.',
        variant: 'destructive',
      });
    }
  };

  return {
    copied,
    handleCopy,
    handleImageDownload
  };
};
