
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Edit, 
  Trash2, 
  Copy,
  FileText,
  Image,
  Video,
  Music,
  File,
  Check
} from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import EditDerivativeModal from './EditDerivativeModal';
import DeleteDerivativeModal from './DeleteDerivativeModal';

interface DerivativeCardProps {
  derivative: ContentDerivative;
}

const DerivativeCard: React.FC<DerivativeCardProps> = ({ derivative }) => {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'published': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'discarded': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <File className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleCopy = async () => {
    try {
      if (derivative.content_type === 'text' && derivative.content) {
        await navigator.clipboard.writeText(derivative.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
          title: 'Content copied',
          description: 'The content has been copied to your clipboard.',
        });
      } else if (derivative.file_url) {
        await navigator.clipboard.writeText(derivative.file_url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
          title: 'URL copied',
          description: 'The file URL has been copied to your clipboard.',
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
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 text-purple-600">
                {getContentTypeIcon(derivative.content_type)}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {derivative.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {derivative.content_type}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    {derivative.derivative_type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            <Badge className={`px-2 py-1 text-xs font-medium border ${getStatusColor(derivative.status)}`}>
              {derivative.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {derivative.content_type === 'text' && derivative.content && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
                  {derivative.content}
                </div>
              </div>
            )}
            
            {derivative.content_type !== 'text' && derivative.file_url && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">File:</span>
                    <span className="truncate max-w-[200px]">
                      {derivative.file_path?.split('/').pop() || 'Unnamed file'}
                    </span>
                  </div>
                  {derivative.file_size && (
                    <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded">
                      {formatFileSize(derivative.file_size)}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(derivative.created_at)}</span>
                </div>
                {derivative.word_count && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Words:</span>
                    <span>{derivative.word_count.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title={derivative.content_type === 'text' ? 'Copy content' : 'Copy URL'}
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </Button>
                
                {derivative.content_type !== 'text' && derivative.file_url && (
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
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                  title="Edit derivative"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                  title="Delete derivative"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditDerivativeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        derivative={derivative}
      />

      <DeleteDerivativeModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        derivative={derivative}
      />
    </>
  );
};

export default DerivativeCard;
