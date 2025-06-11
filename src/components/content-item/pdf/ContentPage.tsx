
import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { ContentItem } from '@/services/contentItemsApi';
import { pdfStyles } from './pdfStyles';
import { ContentRenderer } from './ContentRenderer';
import { ParsedElement } from './contentParser';

interface ContentPageProps {
  contentItem: ContentItem;
  contentElements: ParsedElement[];
  formatDate: (dateString: string) => string;
}

export const ContentPage: React.FC<ContentPageProps> = ({ 
  contentItem, 
  contentElements, 
  formatDate 
}) => {
  // Separate TL;DR from other content elements for special rendering
  const tldrElements = contentElements.filter(element => element.type === 'tldr');
  const otherElements = contentElements.filter(element => element.type !== 'tldr');

  console.log('ContentPage: TL;DR elements to render:', tldrElements.length);
  console.log('ContentPage: Other content elements:', otherElements.length);

  return (
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header} fixed>
        <Image style={pdfStyles.headerLogo} src="/lovable-uploads/587a1505-0f54-4162-ba43-eff1c5c1287a.png" />
        <Text style={pdfStyles.headerTitle}>{contentItem.title}</Text>
      </View>

      {/* Main Content */}
      <View>
        {/* Render TL;DR first if available */}
        {tldrElements.length > 0 && (
          <ContentRenderer elements={tldrElements} />
        )}
        
        {/* Then render the rest of the content */}
        <ContentRenderer elements={otherElements} />
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
  );
};
