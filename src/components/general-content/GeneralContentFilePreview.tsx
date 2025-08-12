import React from 'react';
import { GeneralContentItem } from '@/types/generalContent';
import { File, Download, FileText, FileImage, FileVideo, FileMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GeneralContentFilePreviewProps {
  item: GeneralContentItem;
}

const GeneralContentFilePreview: React.FC<GeneralContentFilePreviewProps> = ({ item }) => {
  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return File;
    
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType.startsWith('audio/')) return FileMusic;
    if (mimeType.includes('text') || mimeType.includes('pdf')) return FileText;
    
    return File;
  };

  const formatFileSize = (size?: string) => {
    if (!size) return 'Unknown size';
    
    const bytes = parseInt(size);
    if (isNaN(bytes)) return size;
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = bytes;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileName = () => {
    if (item.file_path) {
      return item.file_path.split('/').pop() || 'Unknown file';
    }
    return `${item.title.substring(0, 30)}${item.title.length > 30 ? '...' : ''}`;
  };

  const handleDownload = () => {
    if (item.file_url) {
      const link = document.createElement('a');
      link.href = item.file_url;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const FileIcon = getFileIcon(item.mime_type);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-white rounded-lg border border-gray-200">
            <FileIcon className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate" title={getFileName()}>
              {getFileName()}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              {item.mime_type && (
                <span className="uppercase">{item.mime_type.split('/')[1] || item.mime_type}</span>
              )}
              {item.file_size && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(item.file_size)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
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
      </div>
      
      {/* Show content preview if available */}
      {item.content && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-700 line-clamp-3">
            {item.content.length > 150 
              ? item.content.substring(0, 150) + '...'
              : item.content
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralContentFilePreview;