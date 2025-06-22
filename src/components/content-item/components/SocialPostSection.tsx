
import React, { useState } from 'react';
import { useSocialPostActions } from './SocialPostActions';
import SocialPostHeader from './SocialPostHeader';
import SocialPostContent from './SocialPostContent';
import SocialPostImage from './SocialPostImage';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const { copied, handleCopy, handleImageDownload } = useSocialPostActions({
    text: postData.text,
    imageUrl: postData.image_url,
    platform
  });

  const platformName = platform === 'linkedin' ? 'LinkedIn' : 'X';
  const characterCount = postData.text?.length || 0;
  
  console.log(`🔍 [SocialPostSection] ${platformName} final render data:`, {
    actualContentLength: characterCount,
    contentPreview: postData.text?.substring(0, 50) + '...',
    platform,
    hasImage: !!postData.image_url
  });

  // Don't render if we don't have valid text content
  if (!postData.text || characterCount === 0) {
    console.warn(`⚠️ [SocialPostSection] ${platformName} - No valid text content, skipping render`);
    return null;
  }

  return (
    <>
      <div className="border rounded-lg p-4 bg-gray-50">
        <SocialPostHeader
          platform={platform}
          characterCount={characterCount}
          hasImage={!!postData.image_url}
          copied={copied}
          onCopy={handleCopy}
          onViewModal={() => setIsModalOpen(true)}
          onImageDownload={handleImageDownload}
        />
        
        <SocialPostContent text={postData.text} platform={platform} />

        {postData.image_url && (
          <SocialPostImage imageUrl={postData.image_url} platform={platform} />
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
