
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
  return (
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header} fixed>
        <Image style={pdfStyles.headerLogo} src="/lovable-uploads/587a1505-0f54-4162-ba43-eff1c5c1287a.png" />
        <Text style={pdfStyles.headerTitle}>{contentItem.title}</Text>
      </View>

      {/* Main Content */}
      <View>
        <ContentRenderer elements={contentElements} />
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
