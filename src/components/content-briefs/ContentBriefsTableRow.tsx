import React from 'react';
import { Eye, Edit, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ContentBrief } from '@/types/contentBriefs';
import { format } from 'date-fns';

interface ContentBriefsTableRowProps {
  brief: ContentBrief;
  isSelected: boolean;
  onToggleSelect: (isSelected: boolean) => void;
  onEdit: (brief: ContentBrief) => void;
  onDiscard: (id: string) => void;
  onCreateContentItem: (briefId: string) => void;
  onView: (brief: ContentBrief) => void;
}

export default function ContentBriefsTableRow({
  brief,
  isSelected,
  onToggleSelect,
  onEdit,
  onDiscard,
  onCreateContentItem,
  onView,
}: ContentBriefsTableRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'discarded': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBriefTypeColor = (briefType: string) => {
    switch (briefType) {
      case 'Blog Post': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Guide': return 'bg-green-50 text-green-700 border-green-200';
      case 'Blog Post (Topical)': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'Private Sector': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Government Sector': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isProcessing = brief.status === 'processing';
  const canCreateContent = brief.status === 'ready' || brief.status === 'completed';

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
        />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium text-foreground">{brief.title}</div>
          {brief.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {brief.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-mono text-xs text-muted-foreground">
          {brief.internal_name || brief.title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 50)}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`text-xs ${getBriefTypeColor(brief.brief_type)}`}>
          {brief.brief_type}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={`text-xs ${getAudienceColor(brief.target_audience)}`}>
          {brief.target_audience}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={`text-xs ${getStatusColor(brief.status)}`}>
          {brief.status}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground capitalize">
          {brief.source_type}
        </span>
      </TableCell>
      <TableCell>
        <div className="text-xs text-muted-foreground">
          {format(new Date(brief.created_at), 'MMM dd, yyyy')}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(brief)}
            className="h-7 w-7 p-0"
            title="View brief"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(brief)}
            className="h-7 w-7 p-0"
            title="Edit brief"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCreateContentItem(brief.id)}
            disabled={!canCreateContent || isProcessing}
            className="h-7 px-2 text-xs"
            title="Create content from brief"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Create
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDiscard(brief.id)}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            title="Delete brief"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}