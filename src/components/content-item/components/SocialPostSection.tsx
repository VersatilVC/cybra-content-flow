
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Eye, Check, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PlatformBadge from './PlatformBadge';
import ExpandableText from './ExpandableText';
import ViewFullPostModal from './ViewFullPostModal';

interface SocialPostData {
  text: string;
  image_url?: string;
}

interface SocialPostSectionProps {
  platform: 'linkedin' | 'x';
  content: string | SocialPostData;
}

const SocialPostSection: React.FC<SocialPostSectionProps> = ({ 
  platform, 
  content
}) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Parse content to handle both string and object formats
  const postData: SocialPostData = React.useMemo(() => {
    if (typeof content === 'string') {
      return { text: content };
    }
    return content;
  }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postData.text);
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: `${platform === 'linkedin' ? 'LinkedIn' : 'X'} post copied successfully.`,
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
    if (!postData.image_url) return;
    
    try {
      const response = await fetch(postData.image_url);
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

  const platformName = platform === 'linkedin' ? 'LinkedIn' : 'X';
  
  // Set different maxLength based on platform for better readability
  const maxLength = platform === 'linkedin' ? 600 : 250;

  // Use the actual content length for accurate display
  const characterCount = postData.text.length;
  
  console.log(`🔍 [SocialPostSection] ${platformName} post processing:`, {
    actualContentLength: characterCount,
    contentPreview: postData.text.substring(0, 150) + '...',
    platform,
    maxLength,
    hasImage: !!postData.image_url,
    willShowExpandable: characterCount > maxLength
  });

  return (
    <>
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <PlatformBadge platform={platform} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {characterCount} chars
            </span>
            {postData.image_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageDownload}
                className="h-7 px-2 text-xs hover:bg-purple-50"
              >
                <Download className="w-3 h-3 mr-1" />
                Image
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-7 px-2 text-xs hover:bg-blue-50"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs hover:bg-green-50"
            >
              {copied ? (
                <Check className="w-3 h-3 mr-1 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
        
        <ExpandableText 
          text={postData.text}
          maxLength={maxLength}
          className="text-sm text-gray-700 leading-relaxed"
        />

        {postData.image_url && (
          <div className="mt-4">
            <img
              src={postData.image_url}
              alt={`${platformName} post image`}
              className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
              onError={(e) => {
                console.error('Failed to load image:', postData.image_url);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <ViewFullPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={platform}
        content={postData.text}
        imageUrl={postData.image_url}
        platformName={platformName}
      />
    </>
  );
};

export default SocialPostSection;
