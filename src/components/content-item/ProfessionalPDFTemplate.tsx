
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

  // Flatten TL;DR items into a single text string
  const tldrText = tldrElements[0]?.items?.map(item => `• ${item}`).join('\n') || '';
  console.log('ProfessionalPDFTemplate: Flattened TL;DR text:', tldrText);

  return (
    <>
      <CoverPage contentItem={contentItem} formatDate={formatDate} />
      
      {/* Summary and TL;DR Page - Single cohesive unit */}
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header} fixed>
          <Image style={pdfStyles.headerLogo} src="/lovable-uploads/587a1505-0f54-4162-ba43-eff1c5c1287a.png" />
          <Text style={pdfStyles.headerTitle}>{contentItem.title}</Text>
        </View>

        {/* Combined Summary and TL;DR Section - Single indivisible block */}
        <View style={pdfStyles.summaryTldrContainer}>
          {/* Summary Section */}
          {contentItem.summary && (
            <View>
              <Text style={pdfStyles.sectionTitle}>Executive Summary</Text>
              <Text style={pdfStyles.paragraph}>{contentItem.summary}</Text>
            </View>
          )}

          {/* TL;DR Section - Single Text component to prevent breaks */}
          {tldrElements.length > 0 && tldrText && (
            <View style={pdfStyles.tldrBox}>
              <Text style={pdfStyles.tldrTitle}>TL;DR</Text>
              <Text style={pdfStyles.tldrText}>{tldrText}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>
            Generated on {formatDate(new Date().toISOString())}
          </Text>
          <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }) => 
            `${pageNumber} / ${totalPages}`
          } />
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
