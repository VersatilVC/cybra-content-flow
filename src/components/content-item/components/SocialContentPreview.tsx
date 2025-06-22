
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

  console.log('🔄 [SocialContentPreview] Processing social content for derivative:', derivative.id);
  console.log('🔍 [SocialContentPreview] Raw derivative content type:', typeof derivative.content);
  
  const rawContent = derivative.content as string | object;
  let parsedContent;
  
  // Handle object content directly
  if (typeof rawContent === 'object' && rawContent !== null) {
    console.log('✅ [SocialContentPreview] Content is already an object');
    console.log('🔍 [SocialContentPreview] Object content:', rawContent);
    
    const contentObj = rawContent as any;
    parsedContent = {
      linkedin: contentObj.linkedin || undefined,
      x: contentObj.x || contentObj.twitter || undefined
    };
    console.log('✅ [SocialContentPreview] Using direct object content:', {
      hasLinkedIn: !!parsedContent.linkedin,
      hasX: !!parsedContent.x,
      linkedinType: typeof parsedContent.linkedin,
      xType: typeof parsedContent.x
    });
  } else if (typeof rawContent === 'string') {
    // Handle string content - enhanced JSON parsing for both platforms
    console.log('🔄 [SocialContentPreview] Processing string content:', rawContent.length, 'chars');
    parsedContent = parseSocialContent(rawContent);
  } else {
    // Fallback for unexpected types
    console.log('⚠️ [SocialContentPreview] Unexpected content type, using empty result');
    parsedContent = {};
  }
  
  console.log('✅ [SocialContentPreview] Final parsed content result:', {
    hasLinkedIn: !!parsedContent.linkedin,
    hasX: !!parsedContent.x,
    linkedinType: typeof parsedContent.linkedin,
    xType: typeof parsedContent.x
  });

  // Only show sections for platforms that have content
  return (
    <div className="space-y-4">
      {parsedContent.linkedin && (
        <SocialPostSection
          platform="linkedin"
          content={parsedContent.linkedin}
        />
      )}
      {parsedContent.x && (
        <SocialPostSection
          platform="x"
          content={parsedContent.x}
        />
      )}
    </div>
  );
};

export default SocialContentPreview;
