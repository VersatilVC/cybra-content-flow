
import { ContentItem } from '@/services/contentItemsApi';
import { getStatusInfo, formatDate } from './contentItemStatus';

export const convertToMarkdown = (contentItem: ContentItem): string => {
  const statusInfo = getStatusInfo(contentItem.status);
  const createdDate = formatDate(contentItem.created_at);
  
  let markdown = `# ${contentItem.title}\n\n`;
  
  // Add metadata
  markdown += `**Status:** ${statusInfo.label} | **Type:** ${contentItem.content_type} | **Created:** ${createdDate}\n`;
  if (contentItem.word_count) {
    markdown += `**Word Count:** ${contentItem.word_count} words\n`;
  }
  markdown += '\n';
  
  // Add summary if available
  if (contentItem.summary) {
    markdown += `## Summary\n\n${contentItem.summary}\n\n`;
  }
  
  // Add main content
  if (contentItem.content) {
    markdown += `## Content\n\n${contentItem.content}\n\n`;
  }
  
  // Add tags if available
  if (contentItem.tags && contentItem.tags.length > 0) {
    markdown += `## Tags\n\n`;
    contentItem.tags.forEach(tag => {
      markdown += `- ${tag}\n`;
    });
    markdown += '\n';
  }
  
  // Add resources if available
  if (contentItem.resources && contentItem.resources.length > 0) {
    markdown += `## Resources\n\n`;
    contentItem.resources.forEach(resource => {
      markdown += `- ${resource}\n`;
    });
    markdown += '\n';
  }
  
  // Add multimedia suggestions if available
  if (contentItem.multimedia_suggestions) {
    markdown += `## Multimedia Suggestions\n\n${contentItem.multimedia_suggestions}\n\n`;
  }
  
  return markdown;
};
