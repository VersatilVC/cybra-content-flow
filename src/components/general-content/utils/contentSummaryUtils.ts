import { GeneralContentItem } from '@/types/generalContent';
import { isGeneralSocialContent, isGeneralCarouselContent, isGeneralLinkedInAdContent } from './generalContentHelpers';

export interface ContentSummary {
  text: string;
  platforms?: ('linkedin' | 'x')[];
  slideCount?: number;
}

export const getContentSummary = (item: GeneralContentItem): ContentSummary => {
  // Handle carousel content
  if (isGeneralCarouselContent(item)) {
    try {
      let contentToParse = item.content;
      if (typeof contentToParse === 'object') {
        contentToParse = JSON.stringify(contentToParse);
      }
      
      const parsed = JSON.parse(contentToParse);
      let slideCount = 1;
      
      if (Array.isArray(parsed)) {
        slideCount = parsed.length;
      }
      
      return {
        text: `Image carousel (${slideCount} slide${slideCount > 1 ? 's' : ''})`,
        slideCount
      };
    } catch (error) {
      return { text: 'Image carousel content' };
    }
  }

  // Handle LinkedIn ads
  if (isGeneralLinkedInAdContent(item)) {
    try {
      let contentToParse = item.content;
      if (typeof contentToParse === 'object') {
        contentToParse = JSON.stringify(contentToParse);
      }
      
      const parsed = JSON.parse(contentToParse);
      const headline = parsed.headline || '';
      const introText = parsed.intro_text || '';
      
      if (headline) {
        return {
          text: headline,
          platforms: ['linkedin']
        };
      } else if (introText) {
        return {
          text: introText,
          platforms: ['linkedin']
        };
      }
    } catch (error) {
      // Fallback to treating content as headline
      if (item.content && typeof item.content === 'string') {
        return {
          text: item.content.substring(0, 100),
          platforms: ['linkedin']
        };
      }
    }
    
    return {
      text: 'LinkedIn ad content',
      platforms: ['linkedin']
    };
  }

  // Handle social content
  if (isGeneralSocialContent(item)) {
    try {
      let contentToParse = item.content;
      if (typeof contentToParse === 'object') {
        contentToParse = JSON.stringify(contentToParse);
      }
      
      const parsed = JSON.parse(contentToParse);
      const platforms: ('linkedin' | 'x')[] = [];
      let bestText = '';

      // Check for LinkedIn content
      if (parsed.linkedin) {
        platforms.push('linkedin');
        const linkedinContent = typeof parsed.linkedin === 'string' 
          ? parsed.linkedin 
          : parsed.linkedin.text || '';
        if (linkedinContent && linkedinContent.length > bestText.length) {
          bestText = linkedinContent;
        }
      }

      // Check for X/Twitter content
      if (parsed.x || parsed.twitter) {
        platforms.push('x');
        const xContent = typeof (parsed.x || parsed.twitter) === 'string' 
          ? (parsed.x || parsed.twitter)
          : (parsed.x || parsed.twitter)?.text || '';
        if (xContent && xContent.length > bestText.length) {
          bestText = xContent;
        }
      }

      if (bestText) {
        return {
          text: bestText,
          platforms
        };
      }
    } catch (error) {
      // If JSON parsing fails, treat as regular content
    }
  }

  // Handle regular content
  if (item.content) {
    let contentText = item.content;
    
    // If it's an object, try to extract meaningful text
    if (typeof contentText === 'object') {
      try {
        const stringified = JSON.stringify(contentText);
        // Try to extract text content from JSON
        const textMatch = stringified.match(/"text"\s*:\s*"([^"]+)"/);
        if (textMatch) {
          contentText = textMatch[1];
        } else {
          // Extract any readable text from the JSON
          contentText = stringified.replace(/[{}"[\]:,]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      } catch (error) {
        contentText = 'Content available';
      }
    }

    // Clean up and truncate the text
    const cleanText = contentText
      .replace(/\\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      text: cleanText.length > 100 ? cleanText.substring(0, 100) + '...' : cleanText
    };
  }

  return { text: 'No content preview available' };
};

export const getSmartContentPreview = (item: GeneralContentItem): string => {
  const summary = getContentSummary(item);
  return summary.text;
};