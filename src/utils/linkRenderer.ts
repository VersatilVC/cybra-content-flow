import React from 'react';

// Utility function to render text with markdown links that open in new tabs
export function renderTextWithLinks(text: string): string {
  if (!text || !text.includes('[') || !text.includes('](')) {
    return text;
  }

  // Replace markdown links with HTML links that open in new tabs
  return text.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
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