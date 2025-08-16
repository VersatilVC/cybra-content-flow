
import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, RotateCcw, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GeneralContentItem } from '@/types/generalContent';
import { getStatusInfo, formatDate } from '@/utils/contentItemStatusHelpers';
import { derivativeTypes, getContentTypeIcon } from '@/components/content-item/derivativeTypes';
import GeneralContentCardContent from './GeneralContentCardContent';

interface GeneralContentCardProps {
  item: GeneralContentItem;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onRetry?: (id: string) => void;
}

const GeneralContentCard: React.FC<GeneralContentCardProps> = memo(({
  item,
  onDelete,
  isDeleting,
  onRetry
}) => {
  const statusInfo = useMemo(() => getStatusInfo(item.status), [item.status]);
  const StatusIcon = statusInfo.icon;
  
  // Show processing status
  const isProcessing = item.status === 'processing';

  // Find the derivative type info
  const typeInfo = useMemo(() => {
    const allDerivativeTypes = [
      ...derivativeTypes.General,
      ...derivativeTypes.Social,
      ...derivativeTypes.Ads
    ];
    return allDerivativeTypes.find(t => t.type === item.derivative_type);
  }, [item.derivative_type]);

  const getCategoryColor = useCallback((category: string) => {
    switch (category) {
      case 'General':
        return 'bg-blue-100 text-blue-800';
      case 'Social':
        return 'bg-green-100 text-green-800';
      case 'Ads':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const handleDelete = useCallback(() => onDelete(item.id), [onDelete, item.id]);
  const handleRetry = useCallback(() => onRetry?.(item.id), [onRetry, item.id]);
  const formattedDate = useMemo(() => formatDate(item.created_at), [item.created_at]);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(item.category)}>
                {item.category}
              </Badge>
              {typeInfo && (
                <Badge variant="outline" className="text-xs">
                  {getContentTypeIcon(typeInfo.content_type)} {typeInfo.title}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {item.status === 'failed' && onRetry && (
                <DropdownMenuItem 
                  onClick={handleRetry}
                  className="text-blue-600"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Enhanced content preview with sophisticated parsing */}
          <GeneralContentCardContent item={item} />
          
          <div className="flex items-center gap-2">
            <StatusIcon className="w-4 h-4" style={{ 
              animation: isProcessing ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' 
            }} />
            <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.target_audience}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

GeneralContentCard.displayName = 'GeneralContentCard';

export default GeneralContentCard;
