
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

  // Create SINGLE text block with NO spacing between sections
  let combinedText = '';
  
  if (contentItem.summary) {
    combinedText += `EXECUTIVE SUMMARY\n\n${contentItem.summary}`;
  }
  
  if (tldrElements.length > 0 && tldrElements[0]?.items) {
    // Only add one newline if there's a summary, otherwise start fresh
    if (combinedText) {
      combinedText += `\n\nTL;DR\n`;
    } else {
      combinedText += `TL;DR\n`;
    }
    tldrElements[0].items.forEach(item => {
      combinedText += `• ${item}\n`;
    });
  }

  console.log('ProfessionalPDFTemplate: Combined text length:', combinedText.length);
  console.log('ProfessionalPDFTemplate: Combined text preview:', combinedText.substring(0, 300));

  return (
    <>
      <CoverPage contentItem={contentItem} formatDate={formatDate} />
      
      {/* Summary and TL;DR Page - ABSOLUTELY NO BREAKS */}
      <Page size="A4" style={pdfStyles.unbreakablePage} wrap={false} break={false}>
        {/* Minimal container for all content */}
        <View style={pdfStyles.unbreakableContainer}>
          {/* Logo */}
          <View style={pdfStyles.compactLogo}>
            <Image style={pdfStyles.headerLogo} src="/lovable-uploads/587a1505-0f54-4162-ba43-eff1c5c1287a.png" />
          </View>

          {/* SINGLE Text block with ALL content */}
          {combinedText && (
            <Text style={pdfStyles.singleTextBlock}>
              {combinedText}
            </Text>
          )}

          {/* Minimal footer */}
          <View style={pdfStyles.compactFooter}>
            <Text style={pdfStyles.footerText}>
              Generated on {formatDate(new Date().toISOString())}
            </Text>
          </View>
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
