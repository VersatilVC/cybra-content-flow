import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { ContentItem } from '@/services/contentItemsApi';
import { getStatusInfo, formatDate } from '@/utils/contentItemStatusHelpers';
import InlineDerivativeIndicator from '@/components/content-item/InlineDerivativeIndicator';
import type { CategoryCounts } from '@/hooks/useDerivativeCounts';

interface ContentItemsTableRowProps {
  item: ContentItem;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onViewItem: (itemId: string) => void;
  onNavigateToDerivatives: (itemId: string) => void;
  categoryCounts?: CategoryCounts;
  isLoadingCounts: boolean;
}

const ContentItemsTableRow: React.FC<ContentItemsTableRowProps> = ({
  item,
  isSelected,
  onSelect,
  onViewItem,
  onNavigateToDerivatives,
  categoryCounts,
  isLoadingCounts,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = getStatusInfo(item.status);
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            aria-label={`Select ${item.title}`}
          />
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
              <div className="font-medium text-sm line-clamp-2">{item.title}</div>
            </div>
            {isExpanded && item.summary && (
              <div className="text-sm text-muted-foreground pl-6 mt-2">
                {item.summary}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm">{item.content_type}</span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <StatusIcon className="w-4 h-4" />
            <Badge className={`px-2 py-1 text-xs ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm font-mono text-muted-foreground">
            {item.internal_name}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm">
            {item.word_count ? `${item.word_count.toLocaleString()}` : '—'}
          </span>
        </TableCell>
        <TableCell>
          <InlineDerivativeIndicator 
            contentItemId={item.id}
            onNavigate={() => onNavigateToDerivatives(item.id)}
            categoryCounts={categoryCounts}
            isLoadingExternal={isLoadingCounts}
          />
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {formatDate(item.created_at)}
          </span>
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              onClick={() => onViewItem(item.id)}
              size="sm"
              variant="outline"
              className="h-8 px-2"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ContentItemsTableRow;