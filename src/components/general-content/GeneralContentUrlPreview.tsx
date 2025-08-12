import React from 'react';
import { GeneralContentItem } from '@/types/generalContent';
import { ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GeneralContentUrlPreviewProps {
  item: GeneralContentItem;
}

const GeneralContentUrlPreview: React.FC<GeneralContentUrlPreviewProps> = ({ item }) => {
  const url = item.source_data?.url;
  
  if (!url) {
    return null;
  }

  const handleOpenUrl = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getDisplayUrl = (url: string) => {
    return url.length > 60 ? url.substring(0, 60) + '...' : url;
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-white rounded-lg border border-blue-200">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-blue-900 truncate" title={url}>
              {getDomain(url)}
            </p>
            <p className="text-xs text-blue-700 truncate mt-1" title={url}>
              {getDisplayUrl(url)}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenUrl}
          className="h-8 w-8 p-0 hover:bg-blue-100"
          title="Open URL in new tab"
        >
          <ExternalLink className="w-4 h-4 text-blue-600" />
        </Button>
      </div>
      
      {/* Show processed content if available */}
      {item.content && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-sm text-blue-800 line-clamp-3">
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

export default GeneralContentUrlPreview;