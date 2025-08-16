import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  FileText,
  Image,
  Video,
  Share2,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { GeneralContentItem } from '@/types/generalContent';
import GeneralContentPreviewModal from './GeneralContentPreviewModal';
import { getContentSummary } from './utils/contentSummaryUtils';
import PlatformIndicators from './components/PlatformIndicators';

interface GeneralContentTableProps {
  items: GeneralContentItem[];
  selectedItems: GeneralContentItem[];
  onSelectionChange: (items: GeneralContentItem[]) => void;
  onDelete: (id: string) => void;
  onRetry: (item: GeneralContentItem) => void;
  isDeleting: boolean;
}

const GeneralContentTable: React.FC<GeneralContentTableProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  onDelete,
  onRetry,
  isDeleting
}) => {
  const [previewItem, setPreviewItem] = useState<GeneralContentItem | null>(null);

  const getDerivativeTypeIcon = (derivativeType: string) => {
    switch (derivativeType) {
      case 'blog_banner_image':
      case 'blog_post':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'social_company':
      case 'social_post':
      case 'social_media_post':
        return <Share2 className="w-4 h-4 text-green-600" />;
      case 'linkedin_ads':
      case 'linkedin_ad':
        return <Target className="w-4 h-4 text-purple-600" />;
      case 'image_carousel':
        return <Image className="w-4 h-4 text-orange-600" />;
      case 'video_script':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'article':
      case 'summary':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDerivativeType = (derivativeType: string) => {
    return derivativeType
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'published':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'General':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Social':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Ads':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleItemSelect = (item: GeneralContentItem, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, item]);
    } else {
      onSelectionChange(selectedItems.filter(selected => selected.id !== item.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(items);
    } else {
      onSelectionChange([]);
    }
  };

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Title & Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedItems.some(selected => selected.id === item.id)}
                    onCheckedChange={(checked) => handleItemSelect(item, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground line-clamp-1">
                      {item.title}
                    </div>
                    {(() => {
                      const summary = getContentSummary(item);
                      return (
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                            {summary.text}
                          </div>
                          {summary.platforms && (
                            <PlatformIndicators platforms={summary.platforms} />
                          )}
                        </div>
                      );
                    })()}
                    {item.word_count && (
                      <div className="text-xs text-muted-foreground">
                        {item.word_count} words
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getDerivativeTypeIcon(item.derivative_type || item.content_type)}
                    <span className="text-sm">
                      {formatDerivativeType(item.derivative_type || item.content_type)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getCategoryBadgeColor(item.category)}
                  >
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(item.status)}
                  >
                    {item.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Target className="w-3 h-3" />
                    <span className="capitalize line-clamp-1 max-w-24">
                      {item.target_audience}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(item.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewItem(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {item.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRetry(item)}
                        className="h-8 w-8 p-0"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Preview Modal */}
      <GeneralContentPreviewModal
        item={previewItem}
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
        items={items}
        onNavigate={setPreviewItem}
      />
    </>
  );
};

export default GeneralContentTable;