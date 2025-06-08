
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
  
  // Simplified and more reliable parsing logic
  if (typeof rawContent === 'object') {
    console.log('✅ [SocialContentPreview] Content is already an object');
    
    // Direct object handling - check if it has the expected structure
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
      // Fallback: stringify and parse
      const stringified = JSON.stringify(rawContent);
      console.log('🔄 [SocialContentPreview] Stringifying object for parsing');
      parsedContent = parseSocialContent(stringified);
    }
  } else {
    // Handle string content - try direct JSON parse first
    console.log('🔄 [SocialContentPreview] Processing string content:', rawContent.length, 'chars');
    
    // Check if it looks like JSON and try to parse it directly
    const trimmedContent = rawContent.trim();
    if (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) {
      try {
        console.log('🔄 [SocialContentPreview] Attempting direct JSON parse...');
        const directParsed = JSON.parse(trimmedContent);
        console.log('✅ [SocialContentPreview] Direct JSON parse successful:', directParsed);
        
        if (directParsed.linkedin || directParsed.x || directParsed.twitter) {
          parsedContent = {
            linkedin: directParsed.linkedin || undefined,
            x: directParsed.x || directParsed.twitter || undefined
          };
          console.log('✅ [SocialContentPreview] Direct JSON extraction successful:', {
            hasLinkedIn: !!parsedContent.linkedin,
            hasX: !!parsedContent.x,
            linkedinLength: parsedContent.linkedin?.length || 0,
            xLength: parsedContent.x?.length || 0
          });
        } else {
          console.log('⚠️ [SocialContentPreview] JSON parsed but no platform keys found, falling back to text parsing');
          parsedContent = parseSocialContent(rawContent);
        }
      } catch (error) {
        console.log('❌ [SocialContentPreview] Direct JSON parse failed, using text parser:', error);
        parsedContent = parseSocialContent(rawContent);
      }
    } else {
      // Not JSON-like, use text parser
      console.log('🔄 [SocialContentPreview] Content not JSON-like, using text parser');
      parsedContent = parseSocialContent(rawContent);
    }
  }
  
  console.log('✅ [SocialContentPreview] Final parsed content result:', {
    hasLinkedIn: !!parsedContent.linkedin,
    hasX: !!parsedContent.x,
    linkedinLength: parsedContent.linkedin?.length || 0,
    xLength: parsedContent.x?.length || 0,
    linkedinPreview: parsedContent.linkedin ? parsedContent.linkedin.substring(0, 100) + '...' : 'none',
    xPreview: parsedContent.x ? parsedContent.x.substring(0, 100) + '...' : 'none'
  });

  // Enhanced fallback - if no content extracted, use the raw content
  if (!parsedContent.linkedin && !parsedContent.x) {
    console.log('⚠️ [SocialContentPreview] No content extracted, using raw content as fallback');
    const fallbackContent = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
    parsedContent = {
      linkedin: fallbackContent,
      x: fallbackContent
    };
    console.log('🛠️ [SocialContentPreview] Applied fallback - content length:', fallbackContent.length);
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
