import React from 'react';
import { sanitizeHtml } from '@/lib/security';

// Utility function to render text with markdown links that open in new tabs
export function renderTextWithLinks(text: string): string {
  if (!text) {
    return '';
  }

  if (!text.includes('[') || !text.includes('](')) {
    return sanitizeHtml(text);
  }

  // Replace markdown links with HTML links that open in new tabs, then sanitize
  const withLinks = text.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
  return sanitizeHtml(withLinks);
}

// React component helper for rendering text with links
interface TextWithLinksProps {
  text: string;
  className?: string;
}

export const TextWithLinks: React.FC<TextWithLinksProps> = ({ text, className = '' }) => {
  const processedText = renderTextWithLinks(text);
  
  return React.createElement('div', {
    className,
    dangerouslySetInnerHTML: { __html: processedText }
  });
};