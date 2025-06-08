
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
      linkedinLength: parsedContent.linkedin?.length || 0,
      xLength: parsedContent.x?.length || 0
    });
  } else if (typeof rawContent === 'string') {
    // Handle string content - enhanced JSON parsing for both platforms
    console.log('🔄 [SocialContentPreview] Processing string content:', rawContent.length, 'chars');
    
    const trimmedContent = rawContent.trim();
    
    // Try to parse as JSON first with enhanced extraction
    if (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) {
      try {
        console.log('🔄 [SocialContentPreview] Attempting JSON parse...');
        
        // Enhanced manual extraction for both platforms
        const multiPlatformMatch = trimmedContent.match(/\{"linkedin":"(.*?)"\s*,\s*"x":"(.*?)"\}/s);
        const linkedinOnlyMatch = trimmedContent.match(/\{"linkedin":"(.*?)"\}/s);
        const xOnlyMatch = trimmedContent.match(/\{"x":"(.*?)"\}/s);
        
        if (multiPlatformMatch) {
          console.log('✅ [SocialContentPreview] Found multi-platform content');
          parsedContent = {
            linkedin: multiPlatformMatch[1],
            x: multiPlatformMatch[2]
          };
        } else if (linkedinOnlyMatch) {
          console.log('✅ [SocialContentPreview] Found LinkedIn-only content');
          parsedContent = {
            linkedin: linkedinOnlyMatch[1],
            x: undefined
          };
        } else if (xOnlyMatch) {
          console.log('✅ [SocialContentPreview] Found X-only content');
          parsedContent = {
            linkedin: undefined,
            x: xOnlyMatch[1]
          };
        } else {
          // Fallback to standard JSON parse
          const directParsed = JSON.parse(trimmedContent);
          console.log('✅ [SocialContentPreview] JSON parse successful:', directParsed);
          
          parsedContent = {
            linkedin: directParsed.linkedin || undefined,
            x: directParsed.x || directParsed.twitter || undefined
          };
        }
        
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
  } else {
    // Fallback for unexpected types
    console.log('⚠️ [SocialContentPreview] Unexpected content type, using empty result');
    parsedContent = {};
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
