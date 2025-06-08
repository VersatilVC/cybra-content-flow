
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
  
  const rawContent = derivative.content as string | object;
  let parsedContent;
  
  // Handle object content directly
  if (typeof rawContent === 'object' && rawContent !== null) {
    console.log('✅ [SocialContentPreview] Content is already an object');
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
    // Handle string content
    console.log('🔄 [SocialContentPreview] Processing string content:', rawContent.length, 'chars');
    
    const trimmedContent = rawContent.trim();
    
    // Try to parse as JSON first
    if (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) {
      try {
        console.log('🔄 [SocialContentPreview] Attempting JSON parse...');
        const directParsed = JSON.parse(trimmedContent);
        console.log('✅ [SocialContentPreview] JSON parse successful:', directParsed);
        
        // Extract platform-specific content
        parsedContent = {
          linkedin: directParsed.linkedin || undefined,
          x: directParsed.x || directParsed.twitter || undefined
        };
        
        console.log('✅ [SocialContentPreview] Extracted platform content:', {
          hasLinkedIn: !!parsedContent.linkedin,
          hasX: !!parsedContent.x,
          linkedinLength: parsedContent.linkedin?.length || 0,
          xLength: parsedContent.x?.length || 0
        });
      } catch (error) {
        console.log('❌ [SocialContentPreview] JSON parse failed, using text parser:', error);
        parsedContent = parseSocialContent(rawContent);
      }
    } else {
      // Not JSON-like, use text parser for text-based content
      console.log('🔄 [SocialContentPreview] Content not JSON-like, using text parser');
      parsedContent = parseSocialContent(rawContent);
    }
  }
  
  console.log('✅ [SocialContentPreview] Final parsed content result:', {
    hasLinkedIn: !!parsedContent.linkedin,
    hasX: !!parsedContent.x,
    linkedinLength: parsedContent.linkedin?.length || 0,
    xLength: parsedContent.x?.length || 0
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
