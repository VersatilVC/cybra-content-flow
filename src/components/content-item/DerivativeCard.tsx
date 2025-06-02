
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Image,
  Video,
  Music,
  File
} from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { formatDate } from '@/lib/utils';

interface DerivativeCardProps {
  derivative: ContentDerivative;
}

const DerivativeCard: React.FC<DerivativeCardProps> = ({ derivative }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'discarded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getContentTypeIcon(derivative.content_type)}
            <CardTitle className="text-lg">{derivative.title}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {derivative.content_type}
            </Badge>
          </div>
          <Badge className={`px-2 py-1 text-xs ${getStatusColor(derivative.status)}`}>
            {derivative.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {derivative.content_type === 'text' && derivative.content && (
            <div className="text-sm text-gray-700 line-clamp-3">
              {derivative.content}
            </div>
          )}
          
          {derivative.content_type !== 'text' && derivative.file_url && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>File:</span>
              <a 
                href={derivative.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View {derivative.content_type}
              </a>
              {derivative.file_size && (
                <span className="text-gray-400">
                  ({formatFileSize(derivative.file_size)})
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-500">
              <div>Type: {derivative.derivative_type.replace('_', ' ')}</div>
              <div>Created: {formatDate(derivative.created_at)}</div>
              {derivative.word_count && (
                <div>Words: {derivative.word_count}</div>
              )}
            </div>
            <div className="flex gap-2">
              {derivative.file_url && (
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DerivativeCard;
