
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Eye, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PlatformBadge from './PlatformBadge';
import ExpandableText from './ExpandableText';
import ViewFullPostModal from './ViewFullPostModal';

interface SocialPostSectionProps {
  platform: 'linkedin' | 'x';
  content: string;
  characterCount?: number;
}

const SocialPostSection: React.FC<SocialPostSectionProps> = ({ 
  platform, 
  content, 
  characterCount 
}) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
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

  const platformName = platform === 'linkedin' ? 'LinkedIn' : 'X';
  
  // Set different maxLength based on platform - increased for better visibility
  // LinkedIn posts can be much longer, X/Twitter has character limits
  const maxLength = platform === 'linkedin' ? 600 : 250;

  // Always use the actual content length, not the provided characterCount if it seems wrong
  const actualCharacterCount = content.length;
  const displayCharacterCount = characterCount || actualCharacterCount;
  
  // Log discrepancies for debugging
  if (characterCount && characterCount !== actualCharacterCount) {
    console.log('⚠️ [SocialPostSection] Character count mismatch:', {
      provided: characterCount,
      actual: actualCharacterCount,
      platform,
      contentPreview: content.substring(0, 100) + '...'
    });
  }

  return (
    <>
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <PlatformBadge platform={platform} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {actualCharacterCount} chars
            </span>
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
          text={content}
          maxLength={maxLength}
          className="text-sm text-gray-700 leading-relaxed"
        />
      </div>

      <ViewFullPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={platform}
        content={content}
        platformName={platformName}
      />
    </>
  );
};

export default SocialPostSection;
