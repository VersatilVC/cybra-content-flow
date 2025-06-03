
import React from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { parseSocialContent, isSocialDerivative } from '../utils/socialContentParser';
import SocialPostSection from './SocialPostSection';

interface SocialContentPreviewProps {
  derivative: ContentDerivative;
}

const SocialContentPreview: React.FC<SocialContentPreviewProps> = ({ derivative }) => {
  if (!isSocialDerivative(derivative.derivative_type) || !derivative.content) {
    console.log('🚫 [SocialContentPreview] Not a social derivative or no content:', {
      isSocial: isSocialDerivative(derivative.derivative_type),
      hasContent: !!derivative.content,
      derivativeType: derivative.derivative_type
    });
    return null;
  }

  console.log('🔄 [SocialContentPreview] Parsing social content for derivative:', derivative.id);
  console.log('🔍 [SocialContentPreview] Raw derivative content:', derivative.content);
  
  // Check if content is already a parsed object
  let contentToProcess = derivative.content;
  if (typeof derivative.content === 'object' && derivative.content !== null) {
    console.log('✅ [SocialContentPreview] Content is already an object:', derivative.content);
    // If it's already an object with linkedin/x properties, use it directly
    if ('linkedin' in derivative.content || 'x' in derivative.content) {
      const parsedContent = {
        linkedin: derivative.content.linkedin || undefined,
        x: derivative.content.x || derivative.content.twitter || undefined
      };
      console.log('✅ [SocialContentPreview] Using direct object content:', parsedContent);
      
      return (
        <div className="space-y-4">
          {parsedContent.linkedin && (
            <SocialPostSection
              platform="linkedin"
              content={parsedContent.linkedin}
              characterCount={parsedContent.linkedin.length}
            />
          )}
          {parsedContent.x && (
            <SocialPostSection
              platform="x"
              content={parsedContent.x}
              characterCount={parsedContent.x.length}
            />
          )}
        </div>
      );
    }
    // If it's an object but not in the expected format, stringify it for parsing
    contentToProcess = JSON.stringify(derivative.content);
  }
  
  const parsedContent = parseSocialContent(contentToProcess as string);
  console.log('✅ [SocialContentPreview] Parsed social content result:', parsedContent);
  
  return (
    <div className="space-y-4">
      {parsedContent.linkedin && (
        <SocialPostSection
          platform="linkedin"
          content={parsedContent.linkedin}
          characterCount={parsedContent.linkedin.length}
        />
      )}
      {parsedContent.x && (
        <SocialPostSection
          platform="x"
          content={parsedContent.x}
          characterCount={parsedContent.x.length}
        />
      )}
    </div>
  );
};

export default SocialContentPreview;
