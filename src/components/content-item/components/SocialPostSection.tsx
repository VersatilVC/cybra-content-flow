
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

  // Parse content to handle both string and object formats with better debugging
  const postData: SocialPostData = React.useMemo(() => {
    console.log(`🔍 [SocialPostSection] Processing ${platform} content:`, {
      contentType: typeof content,
      content: content,
      isString: typeof content === 'string',
      isObject: typeof content === 'object' && content !== null
    });

    if (typeof content === 'string') {
      console.log(`✅ [SocialPostSection] ${platform} - Using string format`);
      return { text: content };
    }
    
    if (typeof content === 'object' && content !== null) {
      const objectContent = content as SocialPostData;
      console.log(`✅ [SocialPostSection] ${platform} - Using object format:`, {
        hasText: !!objectContent.text,
        textLength: objectContent.text?.length || 0,
        hasImage: !!objectContent.image_url,
        imageUrl: objectContent.image_url
      });
      
      // Ensure we have at least text content
      if (!objectContent.text) {
        console.warn(`⚠️ [SocialPostSection] ${platform} - Object content missing text field`);
        return { text: 'Content missing text field' };
      }
      
      return objectContent;
    }
    
    console.error(`❌ [SocialPostSection] ${platform} - Invalid content format:`, content);
    return { text: 'Invalid content format' };
  }, [content, platform]);

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
      console.error(`❌ [SocialPostSection] ${platform} - Copy failed:`, error);
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
      console.error(`❌ [SocialPostSection] ${platform} - Image download failed:`, error);
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
  const characterCount = postData.text?.length || 0;
  
  console.log(`🔍 [SocialPostSection] ${platformName} final render data:`, {
    actualContentLength: characterCount,
    contentPreview: postData.text?.substring(0, 50) + '...',
    platform,
    maxLength,
    hasImage: !!postData.image_url,
    willShowExpandable: characterCount > maxLength
  });

  // Don't render if we don't have valid text content
  if (!postData.text || characterCount === 0) {
    console.warn(`⚠️ [SocialPostSection] ${platformName} - No valid text content, skipping render`);
    return null;
  }

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
            <div className="text-xs text-gray-500 mb-2">Attached Image:</div>
            <img
              src={postData.image_url}
              alt={`${platformName} post image`}
              className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
              onError={(e) => {
                console.error(`❌ [SocialPostSection] ${platform} - Failed to load image:`, postData.image_url);
                e.currentTarget.style.display = 'none';
                // Show a fallback message
                const fallback = document.createElement('div');
                fallback.className = 'text-xs text-gray-400 text-center p-2 border rounded bg-gray-100';
                fallback.textContent = 'Image failed to load';
                e.currentTarget.parentNode?.appendChild(fallback);
              }}
              onLoad={() => {
                console.log(`✅ [SocialPostSection] ${platform} - Image loaded successfully:`, postData.image_url);
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
