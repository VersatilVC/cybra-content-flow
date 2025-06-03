
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Edit, Trash2, Check } from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { useToast } from '@/hooks/use-toast';

interface DerivativeCardActionsProps {
  derivative: ContentDerivative;
  onEdit: () => void;
  onDelete: () => void;
}

const DerivativeCardActions: React.FC<DerivativeCardActionsProps> = ({
  derivative,
  onEdit,
  onDelete
}) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const getContentToCopy = () => {
    // Handle LinkedIn ads specifically
    if (derivative.derivative_type === 'linkedin_ads' && derivative.content) {
      try {
        const adContent = JSON.parse(derivative.content);
        const parts = [];
        
        if (adContent.headline) {
          parts.push(`Headline: ${adContent.headline}`);
        }
        
        if (adContent.intro_text) {
          parts.push(`\nIntro: ${adContent.intro_text}`);
        }
        
        return parts.join('\n');
      } catch (error) {
        // Fallback to raw content if JSON parsing fails
        return derivative.content;
      }
    }
    
    // Handle regular text content
    if (derivative.content_type === 'text' && derivative.content) {
      return derivative.content;
    }
    
    // Handle file URL as fallback
    if (derivative.file_url) {
      return derivative.file_url;
    }
    
    return '';
  };

  const handleCopy = async () => {
    try {
      const contentToCopy = getContentToCopy();
      
      if (contentToCopy) {
        await navigator.clipboard.writeText(contentToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        
        const isLinkedInAd = derivative.derivative_type === 'linkedin_ads';
        toast({
          title: 'Content copied',
          description: isLinkedInAd 
            ? 'The LinkedIn ad copy has been copied to your clipboard.'
            : 'The content has been copied to your clipboard.',
        });
      }
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (derivative.file_url) {
      const link = document.createElement('a');
      link.href = derivative.file_url;
      link.download = derivative.file_path?.split('/').pop() || derivative.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex gap-1">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0 hover:bg-gray-100"
        title={derivative.derivative_type === 'linkedin_ads' ? 'Copy ad text' : 
               derivative.content_type === 'text' ? 'Copy content' : 'Copy URL'}
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-600" />
        )}
      </Button>
      
      {derivative.file_url && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDownload}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          title="Download file"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onEdit}
        className="h-8 w-8 p-0 hover:bg-blue-50"
        title="Edit derivative"
      >
        <Edit className="w-4 h-4 text-blue-600" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 hover:bg-red-50"
        title="Delete derivative"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </Button>
    </div>
  );
};

export default DerivativeCardActions;
