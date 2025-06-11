
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
  console.log('ProfessionalPDFTemplate: TL;DR content structure:', tldrElements[0]?.items);

  // Create combined Summary + TL;DR text block
  let combinedText = '';
  
  if (contentItem.summary) {
    combinedText += `EXECUTIVE SUMMARY\n\n${contentItem.summary}\n\n`;
  }
  
  if (tldrElements.length > 0 && tldrElements[0]?.items) {
    combinedText += `TL;DR\n\n`;
    tldrElements[0].items.forEach(item => {
      combinedText += `• ${item}\n`;
    });
  }

  console.log('ProfessionalPDFTemplate: Combined text length:', combinedText.length);
  console.log('ProfessionalPDFTemplate: Combined text preview:', combinedText.substring(0, 200));

  return (
    <>
      <CoverPage contentItem={contentItem} formatDate={formatDate} />
      
      {/* Summary and TL;DR Page - NO HEADER, single unbreakable block */}
      <Page size="A4" style={pdfStyles.summaryPage} wrap={false}>
        {/* Logo at top without header styling */}
        <View style={pdfStyles.summaryLogo}>
          <Image style={pdfStyles.headerLogo} src="/lovable-uploads/587a1505-0f54-4162-ba43-eff1c5c1287a.png" />
        </View>

        {/* Single Combined Text Block - Summary + TL;DR */}
        {combinedText && (
          <Text style={pdfStyles.combinedSummaryTldr}>
            {combinedText}
          </Text>
        )}

        {/* Simple footer without fixed positioning */}
        <View style={pdfStyles.summaryFooter}>
          <Text style={pdfStyles.footerText}>
            Generated on {formatDate(new Date().toISOString())}
          </Text>
        </View>
      </Page>

      {/* Main Content Page */}
      <ContentPage 
        contentItem={contentItem} 
        contentElements={mainContentElements} 
        formatDate={formatDate} 
      />
    </>
  );
};

export default ProfessionalPDFTemplate;
