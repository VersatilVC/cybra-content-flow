
import React from 'react';
import { ContentItem } from '@/services/contentItemsApi';
import { addUTMToLinks } from '@/utils/utmGenerator';
import { parseContent } from './pdf/contentParser';
import { CoverPage } from './pdf/CoverPage';
import { TableOfContents } from './pdf/TableOfContents';
import { ContentPage } from './pdf/ContentPage';

interface ProfessionalPDFTemplateProps {
  contentItem: ContentItem;
}

const ProfessionalPDFTemplate: React.FC<ProfessionalPDFTemplateProps> = ({ contentItem }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Process content with UTM parameters
  const processedContent = contentItem.content 
    ? addUTMToLinks(contentItem.content, contentItem.title)
    : '';

  const contentElements = processedContent ? parseContent(processedContent) : [];

  return (
    <>
      <CoverPage contentItem={contentItem} formatDate={formatDate} />
      <TableOfContents contentElements={contentElements} />
      <ContentPage 
        contentItem={contentItem} 
        contentElements={contentElements} 
        formatDate={formatDate} 
      />
    </>
  );
};

export default ProfessionalPDFTemplate;
