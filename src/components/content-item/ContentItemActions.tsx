
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Wand2, 
  Share, 
  Globe,
  AlertTriangle,
  Loader2,
  Download
} from 'lucide-react';
import { ContentItem } from '@/services/contentItemsApi';
import { publishToWordPress } from '@/services/wordpressPublishingService';
import { generateGuidePDF, downloadPDF, sanitizeFilename } from '@/services/pdfGenerationService';
import { useToast } from '@/hooks/use-toast';

interface ContentItemActionsProps {
  contentItem: ContentItem;
  isUpdating: boolean;
  userId: string;
  onStatusUpdate: (status: string) => void;
  onEditContent: () => void;
  onRequestAIFix: () => void;
  onRefetch: () => void;
}

const ContentItemActions: React.FC<ContentItemActionsProps> = ({
  contentItem,
  isUpdating,
  userId,
  onStatusUpdate,
  onEditContent,
  onRequestAIFix,
  onRefetch
}) => {
  const { toast } = useToast();
  const [isPublishingToWordPress, setIsPublishingToWordPress] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePublish = () => {
    onStatusUpdate('published');
    
    toast({
      title: 'Content Published',
      description: 'Your content item has been published successfully.',
    });
  };

  const handleWordPressPublish = async () => {
    setIsPublishingToWordPress(true);
    
    try {
      await publishToWordPress(contentItem, userId);
      
      toast({
        title: 'WordPress Publishing Started',
        description: 'Your content is being published to WordPress. You will receive a notification when complete.',
      });
      
      onRefetch();
    } catch (error) {
      console.error('WordPress publishing failed:', error);
      toast({
        title: 'WordPress Publishing Failed',
        description: error instanceof Error ? error.message : 'Failed to start WordPress publishing. Please check your webhook configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishingToWordPress(false);
    }
  };

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

  const handleDiscard = () => {
    onStatusUpdate('discarded');
    
    toast({
      title: 'Content Discarded',
      description: 'The content item has been discarded.',
    });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8 p-4 bg-gray-50 rounded-lg">
      {contentItem.status === 'ready_for_review' && (
        <>
          <Button 
            onClick={() => onStatusUpdate('derivatives_created')}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button 
            onClick={() => onStatusUpdate('needs_revision')}
            disabled={isUpdating}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Request Revision
          </Button>
        </>
      )}
      
      {contentItem.status === 'derivatives_created' && (
        <Button 
          onClick={handlePublish}
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Share className="w-4 h-4 mr-2" />
          Publish
        </Button>
      )}
      
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

      {/* PDF Download - only for guides */}
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

      <Button 
        onClick={handleWordPressPublish}
        disabled={isPublishingToWordPress || isUpdating}
        variant="outline"
        className="border-orange-300 text-orange-600 hover:bg-orange-50"
      >
        {isPublishingToWordPress ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Globe className="w-4 h-4 mr-2" />
        )}
        {isPublishingToWordPress ? 'Publishing...' : 'Publish to WordPress'}
      </Button>
      
      <Button 
        onClick={handleDiscard}
        disabled={isUpdating}
        variant="ghost"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Discard
      </Button>
    </div>
  );
};

export default ContentItemActions;
