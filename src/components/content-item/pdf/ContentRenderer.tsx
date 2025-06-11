
import React from 'react';
import { Text, View, Link } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';
import { ParsedElement } from './contentParser';

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
        // Handle links in paragraphs
        if (element.text && element.text.includes('[') && element.text.includes('](')) {
          const linkRegex = /\[([^\]]*)\]\(([^\)]*)\)/g;
          const parts = element.text.split(linkRegex);
          return (
            <Text key={index} style={pdfStyles.paragraph}>
              {parts.map((part: string, i: number) => {
                if (i % 3 === 1) {
                  const url = parts[i + 1];
                  return <Link key={i} src={url} style={{ color: '#8B5CF6' }}>{part}</Link>;
                } else if (i % 3 === 2) {
                  return null;
                }
                return part;
              })}
            </Text>
          );
        }
        return <Text key={index} style={pdfStyles.paragraph}>{element.text}</Text>;
      case 'blockquote':
        return <Text key={index} style={pdfStyles.blockquote}>{element.text}</Text>;
      case 'list':
        return (
          <View key={index} style={pdfStyles.listContainer}>
            {element.items?.map((item: string, itemIndex: number) => (
              <View key={itemIndex} style={pdfStyles.listItem}>
                <Text style={pdfStyles.listBullet}>•</Text>
                <Text style={pdfStyles.listText}>{item}</Text>
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
                <Text style={pdfStyles.listText}>{item}</Text>
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
