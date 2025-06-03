
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ContentDerivative, downloadDerivativeFile } from '@/services/contentDerivativesApi';
import { formatFileSize } from '../utils/derivativeCardHelpers';
import { useToast } from '@/hooks/use-toast';

interface FilePreviewProps {
  derivative: ContentDerivative;
}

const FilePreview: React.FC<FilePreviewProps> = ({ derivative }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadDerivativeFile(derivative);
      toast({
        title: 'Download started',
        description: 'Your file download has started.',
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!derivative.file_url) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">File:</span>
          <span className="truncate max-w-[200px]">
            {derivative.file_path?.split('/').pop() || 'Unnamed file'}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-7 px-2 text-xs hover:bg-green-50"
            title="Download file"
          >
            <Download className="w-3 h-3 mr-1" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
          {derivative.file_size && (
            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded">
              {formatFileSize(derivative.file_size)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
