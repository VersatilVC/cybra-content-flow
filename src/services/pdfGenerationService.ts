import { pdf } from '@react-pdf/renderer';
import { ContentItem } from '@/services/contentItemsApi';
import React from 'react';
import ProfessionalPDFTemplate from '@/components/content-item/ProfessionalPDFTemplate';

export async function generateGuidePDF(contentItem: ContentItem): Promise<Blob> {
  try {
    console.log('Generating professional PDF for content item:', contentItem.id);
    
    // Create the PDF document directly with the template component
    const pdfBlob = await pdf(<ProfessionalPDFTemplate contentItem={contentItem} />).toBlob();
    
    console.log('Professional PDF generated successfully');
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
