
import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { ContentItem } from '@/services/contentItemsApi';
import { pdfStyles } from './pdfStyles';

interface CoverPageProps {
  contentItem: ContentItem;
  formatDate: (dateString: string) => string;
}

export const CoverPage: React.FC<CoverPageProps> = ({ contentItem, formatDate }) => {
  return (
    <Page size="A4" style={pdfStyles.coverPage}>
      <View style={pdfStyles.logoContainer}>
        <Image style={pdfStyles.logo} src="/cyabra-logo.png" />
      </View>
      
      <View style={pdfStyles.coverContent}>
        <Text style={pdfStyles.coverTitle}>{contentItem.title}</Text>
        {contentItem.summary && (
          <Text style={pdfStyles.coverSubtitle}>{contentItem.summary}</Text>
        )}
      </View>
      
      <View style={pdfStyles.coverFooter}>
        <Text style={pdfStyles.coverDate}>
          Published: {formatDate(contentItem.created_at)}
        </Text>
      </View>
    </Page>
  );
};
