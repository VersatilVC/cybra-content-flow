
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Eye, Check, Download } from 'lucide-react';
import PlatformBadge from './PlatformBadge';

interface SocialPostHeaderProps {
  platform: 'linkedin' | 'x';
  characterCount: number;
  hasImage: boolean;
  copied: boolean;
  onCopy: () => void;
  onViewModal: () => void;
  onImageDownload: () => void;
}

const SocialPostHeader: React.FC<SocialPostHeaderProps> = ({
  platform,
  characterCount,
  hasImage,
  copied,
  onCopy,
  onViewModal,
  onImageDownload
}) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <PlatformBadge platform={platform} />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {characterCount} chars
        </span>
        {hasImage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onImageDownload}
            className="h-7 px-2 text-xs hover:bg-purple-50"
          >
            <Download className="w-3 h-3 mr-1" />
            Image
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewModal}
          className="h-7 px-2 text-xs hover:bg-blue-50"
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="h-7 px-2 text-xs hover:bg-green-50"
        >
          {copied ? (
            <Check className="w-3 h-3 mr-1 text-green-600" />
          ) : (
            <Copy className="w-3 h-3 mr-1" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  );
};

export default SocialPostHeader;
