import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Edit, Trash2, Check, RefreshCw, Eye, ExternalLink } from 'lucide-react';
import { GeneralContentItem } from '@/types/generalContent';
import { useToast } from '@/hooks/use-toast';

interface GeneralContentCardActionsProps {
  item: GeneralContentItem;
  onEdit?: () => void;
  onDelete: () => void;
  onView?: () => void;
  onRetry?: () => void;
}

const GeneralContentCardActions: React.FC<GeneralContentCardActionsProps> = ({
  item,
  onEdit,
  onDelete,
  onView,
  onRetry
}) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const getContentToCopy = () => {
    // Prioritize content if available
    if (item.content) {
      return item.content;
    }
    
    // For URL sources, copy the URL
    if (item.source_type === 'url' && item.source_data?.url) {
      return item.source_data.url;
    }
    
    // For file sources, copy the file URL if available
    if (item.file_url) {
      return item.file_url;
    }
    
    // Fallback to title
    return item.title;
  };

  const handleCopy = async () => {
    try {
      const contentToCopy = getContentToCopy();
      
      if (contentToCopy) {
        await navigator.clipboard.writeText(contentToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        
        toast({
          title: 'Content copied',
          description: 'The content has been copied to your clipboard.',
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
    if (item.file_url) {
      const link = document.createElement('a');
      link.href = item.file_url;
      link.download = item.file_path?.split('/').pop() || item.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenUrl = () => {
    if (item.source_type === 'url' && item.source_data?.url) {
      window.open(item.source_data.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex gap-1">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0 hover:bg-gray-100"
        title={item.content ? 'Copy content' : 
               item.source_type === 'url' ? 'Copy URL' :
               item.file_url ? 'Copy file URL' : 'Copy title'}
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-600" />
        )}
      </Button>
      
      {/* Download for files */}
      {item.file_url && (
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
      
      {/* Open URL for URL sources */}
      {item.source_type === 'url' && item.source_data?.url && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleOpenUrl}
          className="h-8 w-8 p-0 hover:bg-blue-50"
          title="Open original URL"
        >
          <ExternalLink className="w-4 h-4 text-blue-600" />
        </Button>
      )}
      
      {/* View action */}
      {onView && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onView}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          title="View details"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </Button>
      )}
      
      {/* Retry for failed items */}
      {item.status === 'failed' && onRetry && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRetry}
          className="h-8 w-8 p-0 hover:bg-yellow-50"
          title="Retry processing"
        >
          <RefreshCw className="w-4 h-4 text-yellow-600" />
        </Button>
      )}
      
      {/* Edit action */}
      {onEdit && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0 hover:bg-blue-50"
          title="Edit content"
        >
          <Edit className="w-4 h-4 text-blue-600" />
        </Button>
      )}
      
      {/* Delete action */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 hover:bg-red-50"
        title="Delete content"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </Button>
    </div>
  );
};

export default GeneralContentCardActions;