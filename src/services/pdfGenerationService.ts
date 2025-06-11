
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ContentItem } from '@/services/contentItemsApi';
import React from 'react';

// Move the PDF template logic directly into this service
const createPDFDocument = (contentItem: ContentItem) => {
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
    paragraph: {
      fontSize: 11,
      lineHeight: 1.6,
      color: '#374151',
      marginBottom: 12,
      textAlign: 'justify',
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
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, contentItem.title),
        React.createElement(Text, { style: styles.subtitle }, 
          `Created: ${formatDate(contentItem.created_at)}`
        ),
        React.createElement(Text, { style: styles.subtitle }, 
          `Type: ${contentItem.content_type} | Status: ${contentItem.status}`
        ),
        contentItem.word_count && React.createElement(Text, { style: styles.subtitle }, 
          `Word Count: ${contentItem.word_count}`
        )
      ),
      
      contentItem.summary && React.createElement(View, null,
        React.createElement(Text, { style: styles.paragraph }, contentItem.summary)
      ),

      contentItem.content && React.createElement(View, null,
        React.createElement(Text, { style: styles.content }, contentItem.content)
      ),

      React.createElement(Text, { style: styles.footer }, 
        `Generated on ${formatDate(new Date().toISOString())}`
      )
    )
  );
};

export async function generateGuidePDF(contentItem: ContentItem): Promise<Blob> {
  try {
    console.log('Generating PDF for content item:', contentItem.id);
    
    // Create the PDF document directly
    const pdfBlob = await pdf(createPDFDocument(contentItem)).toBlob();
    
    console.log('PDF generated successfully');
    return pdfBlob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

export function downloadPDF(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('PDF download initiated:', filename);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF. Please try again.');
  }
}

export function sanitizeFilename(title: string): string {
  return title
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}
