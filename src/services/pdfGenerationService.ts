
import { ContentItem } from '@/services/contentItemsApi';
import React from 'react';

export async function generateGuidePDF(contentItem: ContentItem): Promise<Blob> {
  try {
    console.log('pdfGenerationService: Generating professional PDF for content item:', contentItem.id);
    console.log('pdfGenerationService: Using ProfessionalPDFTemplate');
    
    // Create the PDF document with Document wrapper
    const pdfDocument = React.createElement(
      Document,
      {},
      React.createElement(ProfessionalPDFTemplate, { contentItem })
    );
    const pdfBlob = await pdf(pdfDocument).toBlob();
    
    console.log('pdfGenerationService: Professional PDF generated successfully');
    return pdfBlob;
  } catch (error) {
    console.error('pdfGenerationService: Error generating PDF:', error);
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
    
    console.log('pdfGenerationService: PDF download initiated:', filename);
  } catch (error) {
    console.error('pdfGenerationService: Error downloading PDF:', error);
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
