
import { ContentItem } from '@/services/contentItemsApi';
import React from 'react';
import { loadReactPDF, loadPDFTemplate } from '@/lib/lazyImports';

export async function generateGuidePDF(contentItem: ContentItem): Promise<Blob> {
  try {
    console.log('pdfGenerationService: Generating professional PDF for content item:', contentItem.id);

    // Lazy-load react-pdf and the template to reduce bundle size and avoid DOM Document collisions
    const { pdf, Document: PDFDocument } = await loadReactPDF();
    const ProfessionalPDFTemplate = await loadPDFTemplate();

    // Create the PDF document with Document wrapper from react-pdf
    const pdfDocument = React.createElement(
      PDFDocument as unknown as React.ComponentType<any>,
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
