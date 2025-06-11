
import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { ContentItem } from '@/services/contentItemsApi';
import { addUTMToLinks } from '@/utils/utmGenerator';
import { parseContent } from './pdf/contentParser';
import { CoverPage } from './pdf/CoverPage';
import { TableOfContents } from './pdf/TableOfContents';
import { ContentPage } from './pdf/ContentPage';
import { pdfStyles } from './pdf/pdfStyles';

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

  // Separate TL;DR from main content
  const tldrElements = contentElements.filter(element => element.type === 'tldr');
  const mainContentElements = contentElements.filter(element => element.type !== 'tldr');

  return (
    <>
      <CoverPage contentItem={contentItem} formatDate={formatDate} />
      <TableOfContents contentElements={contentElements} />
      
      {/* Summary and TL;DR Page */}
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header} fixed>
          <Image style={pdfStyles.headerLogo} src="/lovable-uploads/587a1505-0f54-4162-ba43-eff1c5c1287a.png" />
          <Text style={pdfStyles.headerTitle}>{contentItem.title}</Text>
        </View>

        {/* Summary Section */}
        {contentItem.summary && (
          <View>
            <Text style={pdfStyles.sectionTitle}>Executive Summary</Text>
            <Text style={pdfStyles.paragraph}>{contentItem.summary}</Text>
          </View>
        )}

        {/* TL;DR Section */}
        {tldrElements.map((element, index) => (
          <View key={index} style={pdfStyles.tldrBox}>
            <Text style={pdfStyles.tldrTitle}>TL;DR</Text>
            {element.items?.map((item: string, itemIndex: number) => (
              <View key={itemIndex} style={pdfStyles.tldrItem}>
                <Text style={pdfStyles.tldrBullet}>•</Text>
                <Text style={pdfStyles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

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
