
import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { ContentItem } from '@/services/contentItemsApi';
import { addUTMToLinks } from '@/utils/utmGenerator';
import { parseContent } from './pdf/contentParser';
import { CoverPage } from './pdf/CoverPage';
import { ContentPage } from './pdf/ContentPage';
import { pdfStyles } from './pdf/pdfStyles';

interface ProfessionalPDFTemplateProps {
  contentItem: ContentItem;
}

const ProfessionalPDFTemplate: React.FC<ProfessionalPDFTemplateProps> = ({ contentItem }) => {
  console.log('ProfessionalPDFTemplate: Rendering PDF for content item:', contentItem.id);
  
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

  // Separate TL;DR from main content
  const tldrElements = contentElements.filter(element => element.type === 'tldr');
  const mainContentElements = contentElements.filter(element => element.type !== 'tldr');

  console.log('ProfessionalPDFTemplate: TL;DR elements found:', tldrElements.length);
  console.log('ProfessionalPDFTemplate: Main content elements:', mainContentElements.length);
  console.log('ProfessionalPDFTemplate: Starting directly with content page including TL;DR');

  return (
    <>
      <CoverPage contentItem={contentItem} formatDate={formatDate} />
      
      {/* Main Content Page - starts with TL;DR if available */}
      <ContentPage 
        contentItem={contentItem} 
        contentElements={contentElements} // Pass ALL elements including TL;DR
        formatDate={formatDate} 
      />
    </>
  );
};

export default ProfessionalPDFTemplate;
