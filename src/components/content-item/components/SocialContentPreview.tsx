
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
  console.log('🔍 [SocialContentPreview] Raw derivative content length:', derivative.content?.length);
  
  // At this point we know derivative.content is not null due to the check above
  const rawContent = derivative.content as string | object;
  
  // Enhanced handling for different content types
  let parsedContent;
  
  if (typeof rawContent === 'object') {
    console.log('✅ [SocialContentPreview] Content is already an object:', rawContent);
    
    // Check if it's already in the expected format
    if ('linkedin' in rawContent || 'x' in rawContent) {
      const contentObj = rawContent as any;
      parsedContent = {
        linkedin: contentObj.linkedin || undefined,
        x: contentObj.x || contentObj.twitter || undefined
      };
      console.log('✅ [SocialContentPreview] Using direct object content:', {
        hasLinkedIn: !!parsedContent.linkedin,
        hasX: !!parsedContent.x,
        linkedinLength: parsedContent.linkedin?.length || 0,
        xLength: parsedContent.x?.length || 0
      });
    } else {
      // If it's an object but not in expected format, stringify and parse
      const stringified = JSON.stringify(rawContent);
      console.log('🔄 [SocialContentPreview] Stringifying object for parsing:', stringified.length, 'chars');
      parsedContent = parseSocialContent(stringified);
    }
  } else {
    // Handle string content
    console.log('🔄 [SocialContentPreview] Processing string content:', rawContent.length, 'chars');
    parsedContent = parseSocialContent(rawContent as string);
  }
  
  console.log('✅ [SocialContentPreview] Final parsed content result:', {
    hasLinkedIn: !!parsedContent.linkedin,
    hasX: !!parsedContent.x,
    linkedinLength: parsedContent.linkedin?.length || 0,
    xLength: parsedContent.x?.length || 0
  });

  // Add fallback error handling
  if (!parsedContent.linkedin && !parsedContent.x) {
    console.log('⚠️ [SocialContentPreview] No content extracted, falling back to raw content');
    const fallbackContent = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
    parsedContent = {
      linkedin: fallbackContent,
      x: fallbackContent
    };
  }
  
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
