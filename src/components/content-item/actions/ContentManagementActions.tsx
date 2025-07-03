import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Wand2, Download, Loader2 } from 'lucide-react';
import { ContentItem } from '@/services/contentItemsApi';
import { generateGuidePDF, downloadPDF, sanitizeFilename } from '@/services/pdfGenerationService';
import { useToast } from '@/hooks/use-toast';

interface ContentManagementActionsProps {
  contentItem: ContentItem;
  isUpdating: boolean;
  onEditContent: () => void;
  onRequestAIFix: () => void;
}

export const ContentManagementActions: React.FC<ContentManagementActionsProps> = ({
  contentItem,
  isUpdating,
  onEditContent,
  onRequestAIFix
}) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePDFDownload = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdfBlob = await generateGuidePDF(contentItem);
      const filename = `${sanitizeFilename(contentItem.title)}_guide.pdf`;
      downloadPDF(pdfBlob, filename);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your guide has been downloaded as a PDF.',
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: 'PDF Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <Button 
        onClick={onEditContent}
        variant="outline"
        className="border-blue-300 text-blue-600 hover:bg-blue-50"
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit Content
      </Button>
      
      <Button 
        onClick={onRequestAIFix}
        disabled={isUpdating}
        variant="outline"
        className="border-purple-300 text-purple-600 hover:bg-purple-50"
      >
        <Wand2 className="w-4 h-4 mr-2" />
        Request AI Fix
      </Button>

      {contentItem.content_type === 'Guide' && (
        <Button 
          onClick={handlePDFDownload}
          disabled={isGeneratingPDF || isUpdating}
          variant="outline"
          className="border-green-300 text-green-600 hover:bg-green-50"
        >
          {isGeneratingPDF ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      )}
    </>
  );
};