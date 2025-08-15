import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Target,
  FileText,
  X 
} from 'lucide-react';
import { format } from 'date-fns';
import { GeneralContentItem } from '@/types/generalContent';
import GeneralContentCardContent from './GeneralContentCardContent';

interface GeneralContentPreviewModalProps {
  item: GeneralContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GeneralContentItem[];
  onNavigate: (item: GeneralContentItem) => void;
}

const GeneralContentPreviewModal: React.FC<GeneralContentPreviewModalProps> = ({
  item,
  open,
  onOpenChange,
  items,
  onNavigate
}) => {
  if (!item) return null;

  const currentIndex = items.findIndex(i => i.id === item.id);
  const canGoNext = currentIndex < items.length - 1;
  const canGoPrev = currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      onNavigate(items[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      onNavigate(items[currentIndex - 1]);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-semibold">
                {item.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={getCategoryBadgeColor(item.category)}
                >
                  {item.category}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(item.status)}
                >
                  {item.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} of {items.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={!canGoNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Type:</span>
              <span className="capitalize">{item.content_type.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Audience:</span>
              <span className="capitalize">{item.target_audience}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Created:</span>
              <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
            </div>
          </div>

          {/* Source Information */}
          {item.source_type !== 'manual' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Source Information</h4>
              <div className="text-sm text-blue-800">
                <span className="font-medium">Type:</span> {item.source_type}
                {item.source_data?.url && (
                  <div className="mt-1">
                    <span className="font-medium">URL:</span>{' '}
                    <a 
                      href={item.source_data.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {item.source_data.url}
                    </a>
                  </div>
                )}
                {item.file_url && (
                  <div className="mt-1">
                    <span className="font-medium">File:</span>{' '}
                    <a 
                      href={item.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View file
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Preview */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Content Preview</h4>
            <div className="border border-border rounded-lg p-4 bg-card">
              <GeneralContentCardContent item={item} />
            </div>
          </div>

          {/* Word Count */}
          {item.word_count && (
            <div className="text-sm text-muted-foreground">
              Word count: {item.word_count} words
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeneralContentPreviewModal;