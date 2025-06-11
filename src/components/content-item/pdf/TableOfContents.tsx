
import React from 'react';
import { Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';
import { ParsedElement } from './contentParser';

interface TableOfContentsProps {
  contentElements: ParsedElement[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ contentElements }) => {
  const tocItems = contentElements
    .filter(el => el.type.startsWith('heading'))
    .map((el, idx) => ({ ...el, page: idx + 3 })); // Start after cover and TOC

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <Page size="A4" style={pdfStyles.tocPage}>
      <Text style={pdfStyles.tocTitle}>Table of Contents</Text>
      {tocItems.map((item, index) => (
        <View key={index} style={pdfStyles.tocItem}>
          <Text>{item.text}</Text>
          <View style={pdfStyles.tocDots} />
          <Text>{item.page}</Text>
        </View>
      ))}
    </Page>
  );
};
