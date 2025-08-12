import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Eye,
  FileText,
  Link,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GeneralContentItem } from '@/types/generalContent';
import { formatDate } from '@/lib/utils';
import GeneralContentPreview from './GeneralContentPreview';

interface EnhancedGeneralContentCardProps {
  item: GeneralContentItem;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const EnhancedGeneralContentCard: React.FC<EnhancedGeneralContentCardProps> = ({
  item,
  onDelete,
  isDeleting
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'published': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'ready_for_review': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'published': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'ready_for_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return <FileText className="w-4 h-4" />;
      case 'url': return <Link className="w-4 h-4" />;
      case 'file': return <Upload className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'General': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Social': return 'bg-blue-100 text-blue-700 border-blue-200'; 
      case 'Ads': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate" title={item.title}>
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.derivative_type}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {item.status === 'failed' && (
                  <DropdownMenuItem>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(item.id)}
                  className="text-red-600"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Content Preview */}
            <GeneralContentPreview item={item} />
            
            {/* Status and metadata footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                  {getSourceIcon(item.source_type)}
                  <span className="capitalize">{item.source_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>
                {item.word_count && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Words:</span>
                    <span>{item.word_count.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(item.status)}
                <Badge className={getStatusColor(item.status)}>
                  {item.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal would go here */}
    </>
  );
};

export default EnhancedGeneralContentCard;