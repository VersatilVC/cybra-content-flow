
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ContentItem } from '@/services/contentItemsApi';

interface GuidePDFTemplateProps {
  contentItem: ContentItem;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#8B5CF6',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    textAlign: 'justify',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 25,
    marginBottom: 15,
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 12,
  },
  heading3: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
    marginTop: 15,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'justify',
  },
  listItem: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 6,
    marginLeft: 15,
  },
  blockquote: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#6b7280',
    fontStyle: 'italic',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 12,
    borderLeft: 3,
    borderLeftColor: '#8B5CF6',
    paddingLeft: 15,
  },
  tldrBox: {
    backgroundColor: '#8B5CF6',
    color: '#ffffff',
    padding: 15,
    marginBottom: 20,
    marginTop: 10,
  },
  tldrTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  tldrText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#9ca3af',
  },
});

const GuidePDFTemplate: React.FC<GuidePDFTemplateProps> = ({ contentItem }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const parseContent = (content: string) => {
    const lines = content.split('\n');
    const elements: any[] = [];
    let currentList: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (currentList.length > 0) {
          elements.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        continue;
      }

      // Check for TL;DR section
      if (line.toLowerCase().includes('tl;dr')) {
        if (currentList.length > 0) {
          elements.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        
        const tldrItems: string[] = [];
        i++; // Move to next line
        while (i < lines.length && lines[i].trim()) {
          const tldrLine = lines[i].trim();
          if (tldrLine.match(/^[-*+]\s+/)) {
            tldrItems.push(tldrLine.replace(/^[-*+]\s+/, ''));
          }
          i++;
        }
        elements.push({ type: 'tldr', items: tldrItems });
        continue;
      }

      // Check for headings
      if (line.startsWith('### ')) {
        if (currentList.length > 0) {
          elements.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        elements.push({ type: 'heading3', text: line.replace('### ', '') });
      } else if (line.startsWith('## ')) {
        if (currentList.length > 0) {
          elements.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        elements.push({ type: 'heading2', text: line.replace('## ', '') });
      } else if (line.startsWith('# ')) {
        if (currentList.length > 0) {
          elements.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        elements.push({ type: 'heading1', text: line.replace('# ', '') });
      } else if (line.startsWith('> ')) {
        if (currentList.length > 0) {
          elements.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        elements.push({ type: 'blockquote', text: line.replace('> ', '') });
      } else if (line.match(/^[-*+]\s+/)) {
        currentList.push(line.replace(/^[-*+]\s+/, ''));
      } else {
        if (currentList.length > 0) {
          elements.push({ type: 'list', items: [...currentList] });
          currentList = [];
        }
        
        // Clean up markdown formatting
        let cleanText = line
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1');
        
        elements.push({ type: 'paragraph', text: cleanText });
      }
    }

    if (currentList.length > 0) {
      elements.push({ type: 'list', items: currentList });
    }

    return elements;
  };

  const renderElement = (element: any, index: number) => {
    switch (element.type) {
      case 'heading1':
        return <Text key={index} style={styles.heading1}>{element.text}</Text>;
      case 'heading2':
        return <Text key={index} style={styles.heading2}>{element.text}</Text>;
      case 'heading3':
        return <Text key={index} style={styles.heading3}>{element.text}</Text>;
      case 'paragraph':
        return <Text key={index} style={styles.paragraph}>{element.text}</Text>;
      case 'blockquote':
        return <Text key={index} style={styles.blockquote}>{element.text}</Text>;
      case 'list':
        return (
          <View key={index}>
            {element.items.map((item: string, itemIndex: number) => (
              <Text key={itemIndex} style={styles.listItem}>• {item}</Text>
            ))}
          </View>
        );
      case 'tldr':
        return (
          <View key={index} style={styles.tldrBox}>
            <Text style={styles.tldrTitle}>TL;DR</Text>
            {element.items.map((item: string, itemIndex: number) => (
              <Text key={itemIndex} style={styles.tldrText}>• {item}</Text>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  const contentElements = contentItem.content ? parseContent(contentItem.content) : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{contentItem.title}</Text>
          <Text style={styles.subtitle}>
            Created: {formatDate(contentItem.created_at)}
          </Text>
          <Text style={styles.subtitle}>
            Type: {contentItem.content_type} | Status: {contentItem.status}
          </Text>
          {contentItem.word_count && (
            <Text style={styles.subtitle}>
              Word Count: {contentItem.word_count}
            </Text>
          )}
        </View>

        {/* Summary */}
        {contentItem.summary && (
          <View>
            <Text style={styles.heading2}>Summary</Text>
            <Text style={styles.paragraph}>{contentItem.summary}</Text>
          </View>
        )}

        {/* Content */}
        <View>
          {contentElements.map((element, index) => renderElement(element, index))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {formatDate(new Date().toISOString())}
        </Text>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => 
          `${pageNumber} / ${totalPages}`
        } fixed />
      </Page>
    </Document>
  );
};

export default GuidePDFTemplate;
