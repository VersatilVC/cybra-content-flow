
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { ContentItem } from '@/services/contentItemsApi';
import { addUTMToLinks } from '@/utils/utmGenerator';

interface ProfessionalPDFTemplateProps {
  contentItem: ContentItem;
}

const styles = StyleSheet.create({
  // Cover Page Styles
  coverPage: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 60,
    fontFamily: 'Helvetica',
    justifyContent: 'space-between',
    minHeight: '100vh',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 40,
  },
  coverContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 1.3,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  coverFooter: {
    borderTop: 2,
    borderTopColor: '#8B5CF6',
    paddingTop: 20,
    alignItems: 'center',
  },
  coverDate: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  
  // Table of Contents Styles
  tocPage: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  tocTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#8B5CF6',
    paddingBottom: 15,
  },
  tocItem: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tocDots: {
    flex: 1,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    marginHorizontal: 10,
    marginBottom: 3,
  },
  
  // Content Page Styles
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    paddingTop: 60,
    paddingBottom: 80,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  headerLogo: {
    width: 60,
    height: 20,
  },
  headerTitle: {
    fontSize: 10,
    color: '#6b7280',
    flex: 1,
    textAlign: 'center',
  },
  
  // Content Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 25,
    marginBottom: 15,
    borderLeft: 4,
    borderLeftColor: '#8B5CF6',
    paddingLeft: 15,
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 10,
  },
  heading3: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'justify',
  },
  listContainer: {
    marginBottom: 16,
  },
  listItem: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 6,
    marginLeft: 15,
    flexDirection: 'row',
  },
  listBullet: {
    width: 15,
    fontSize: 11,
    color: '#8B5CF6',
  },
  listText: {
    flex: 1,
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
    backgroundColor: '#f8fafc',
    padding: 15,
  },
  tldrBox: {
    backgroundColor: '#8B5CF6',
    color: '#ffffff',
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  tldrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  tldrItem: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#ffffff',
    marginBottom: 6,
    flexDirection: 'row',
  },
  tldrBullet: {
    width: 15,
    fontSize: 11,
    color: '#ffffff',
  },
  
  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
  },
  pageNumber: {
    fontSize: 9,
    color: '#9ca3af',
  },
});

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
        
        // Clean up markdown formatting and handle links
        let cleanText = line
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1');
        
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
        // Handle links in paragraphs
        if (element.text.includes('[') && element.text.includes('](')) {
          const linkRegex = /\[([^\]]*)\]\(([^\)]*)\)/g;
          const parts = element.text.split(linkRegex);
          return (
            <Text key={index} style={styles.paragraph}>
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
        return <Text key={index} style={styles.paragraph}>{element.text}</Text>;
      case 'blockquote':
        return <Text key={index} style={styles.blockquote}>{element.text}</Text>;
      case 'list':
        return (
          <View key={index} style={styles.listContainer}>
            {element.items.map((item: string, itemIndex: number) => (
              <View key={itemIndex} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        );
      case 'tldr':
        return (
          <View key={index} style={styles.tldrBox}>
            <Text style={styles.tldrTitle}>TL;DR</Text>
            {element.items.map((item: string, itemIndex: number) => (
              <View key={itemIndex} style={styles.tldrItem}>
                <Text style={styles.tldrBullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  const contentElements = processedContent ? parseContent(processedContent) : [];
  const tocItems = contentElements
    .filter(el => el.type.startsWith('heading'))
    .map((el, idx) => ({ ...el, page: idx + 3 })); // Start after cover and TOC

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} src="/cyabra-logo.png" />
        </View>
        
        <View style={styles.coverContent}>
          <Text style={styles.coverTitle}>{contentItem.title}</Text>
          {contentItem.summary && (
            <Text style={styles.coverSubtitle}>{contentItem.summary}</Text>
          )}
        </View>
        
        <View style={styles.coverFooter}>
          <Text style={styles.coverDate}>
            Published: {formatDate(contentItem.created_at)}
          </Text>
        </View>
      </Page>

      {/* Table of Contents */}
      {tocItems.length > 0 && (
        <Page size="A4" style={styles.tocPage}>
          <Text style={styles.tocTitle}>Table of Contents</Text>
          {tocItems.map((item, index) => (
            <View key={index} style={styles.tocItem}>
              <Text>{item.text}</Text>
              <View style={styles.tocDots} />
              <Text>{item.page}</Text>
            </View>
          ))}
        </Page>
      )}

      {/* Content Pages */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Image style={styles.headerLogo} src="/cyabra-logo.png" />
          <Text style={styles.headerTitle}>{contentItem.title}</Text>
        </View>

        {/* Summary Section */}
        {contentItem.summary && (
          <View>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.paragraph}>{contentItem.summary}</Text>
          </View>
        )}

        {/* Main Content */}
        <View>
          {contentElements.map((element, index) => renderElement(element, index))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated on {formatDate(new Date().toISOString())}
          </Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => 
            `${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
};

export default ProfessionalPDFTemplate;
