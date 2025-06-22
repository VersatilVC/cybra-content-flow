
import React from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { parseSocialContent, isSocialDerivative } from '../utils/socialContentParser';
import { processObjectContent, validatePlatformContent } from '../utils/contentValidator';
import SocialPostSection from './SocialPostSection';

interface SocialContentPreviewProps {
  derivative: ContentDerivative;
}

const SocialContentPreview: React.FC<SocialContentPreviewProps> = ({ derivative }) => {
  if (!isSocialDerivative(derivative.derivative_type) || !derivative.content) {
    console.log('🚫 [SocialContentPreview] Not a social derivative or no content:', {
      isSocial: isSocialDerivative(derivative.derivative_type),
      hasContent: !!derivative.content,
      derivativeType: derivative.derivative_type,
      derivativeId: derivative.id
    });
    return null;
  }

  console.log('🔄 [SocialContentPreview] Processing social content for derivative:', {
    id: derivative.id,
    derivativeType: derivative.derivative_type,
    contentType: derivative.content_type,
    rawContentType: typeof derivative.content
  });
  
  const rawContent = derivative.content as string | object;
  let parsedContent;
  
  // Handle object content directly (new composite format)
  if (typeof rawContent === 'object' && rawContent !== null) {
    parsedContent = processObjectContent(rawContent);
  } else if (typeof rawContent === 'string') {
    // Handle string content - enhanced JSON parsing for both platforms
    console.log('🔄 [SocialContentPreview] Processing string content:', rawContent.length, 'chars');
    parsedContent = parseSocialContent(rawContent);
    
    console.log('✅ [SocialContentPreview] String parsing result:', {
      hasLinkedIn: !!parsedContent.linkedin,
      hasX: !!parsedContent.x,
      linkedinType: typeof parsedContent.linkedin,
      xType: typeof parsedContent.x
    });
  } else {
    // Fallback for unexpected types
    console.log('⚠️ [SocialContentPreview] Unexpected content type, using empty result');
    parsedContent = {};
  }
  
  console.log('✅ [SocialContentPreview] Final parsed content for rendering:', {
    derivativeId: derivative.id,
    hasLinkedIn: !!parsedContent.linkedin,
    hasX: !!parsedContent.x,
    linkedinContent: parsedContent.linkedin,
    xContent: parsedContent.x
  });

  // Validate that we have at least one platform with valid content
  const hasValidLinkedIn = validatePlatformContent(parsedContent.linkedin, 'linkedin');
  const hasValidX = validatePlatformContent(parsedContent.x, 'x');

  if (!hasValidLinkedIn && !hasValidX) {
    console.warn('⚠️ [SocialContentPreview] No valid platform content found for derivative:', derivative.id);
    return (
      <div className="text-center text-gray-500 py-4">
        <p>No valid social content found</p>
        <p className="text-xs mt-1">Check console for debugging details</p>
      </div>
    );
  }

  // Only show sections for platforms that have valid content
  return (
    <div className="space-y-4">
      {hasValidLinkedIn && (
        <SocialPostSection
          platform="linkedin"
          content={parsedContent.linkedin}
        />
      )}
      {hasValidX && (
        <SocialPostSection
          platform="x"
          content={parsedContent.x}
        />
      )}
    </div>
  );
};

export default SocialContentPreview;
