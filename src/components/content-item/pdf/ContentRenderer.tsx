
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';
import { ParsedElement } from './contentParser';
import { renderTextWithLinks } from './linkParser';

interface ContentRendererProps {
  elements: ParsedElement[];
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ elements }) => {
  const renderElement = (element: ParsedElement, index: number) => {
    switch (element.type) {
      case 'heading1':
        return <Text key={index} style={pdfStyles.heading1}>{element.text}</Text>;
      case 'heading2':
        return <Text key={index} style={pdfStyles.heading2}>{element.text}</Text>;
      case 'heading3':
        return <Text key={index} style={pdfStyles.heading3}>{element.text}</Text>;
      case 'paragraph':
        return (
          <View key={index}>
            {renderTextWithLinks(element.text || '', pdfStyles.paragraph)}
          </View>
        );
      case 'blockquote':
        return <Text key={index} style={pdfStyles.blockquote}>{element.text}</Text>;
      case 'list':
        return (
          <View key={index} style={pdfStyles.listContainer}>
            {element.items?.map((item: string, itemIndex: number) => (
              <View key={itemIndex} style={pdfStyles.listItem}>
                <Text style={pdfStyles.listBullet}>•</Text>
                {renderTextWithLinks(item, pdfStyles.listText)}
              </View>
            ))}
          </View>
        );
      case 'tldr':
        return (
          <View key={index} style={pdfStyles.tldrBox}>
            <Text style={pdfStyles.tldrTitle}>TL;DR</Text>
            {element.items?.map((item: string, itemIndex: number) => (
              <View key={itemIndex} style={pdfStyles.tldrItem}>
                <Text style={pdfStyles.tldrBullet}>•</Text>
                {renderTextWithLinks(item, pdfStyles.listText)}
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {elements.map((element, index) => renderElement(element, index))}
    </>
  );
};
