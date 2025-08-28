import React from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2, FileText, Globe, FileUp, Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ContentIdea } from '@/types/contentIdeas';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import ContentSuggestionsTableRows from './ContentSuggestionsTableRows';
import { format } from 'date-fns';

interface ContentIdeasTableRowProps {
  idea: ContentIdea;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSelect: (isSelected: boolean) => void;
  onEdit: (idea: ContentIdea) => void;
  onDiscard: (id: string) => void;
  onCreateBrief: (id: string, type?: 'idea' | 'suggestion', ideaId?: string) => void;
  isCreatingBrief: (id: string) => boolean;
}

export default function ContentIdeasTableRow({
  idea,
  isSelected,
  isExpanded,
  onToggleExpand,
  onToggleSelect,
  onEdit,
  onDiscard,
  onCreateBrief,
  isCreatingBrief,
}: ContentIdeasTableRowProps) {
  const { data: suggestions, isLoading: loadingSuggestions } = useContentSuggestions(
    isExpanded ? idea.id : ''
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'brief_created': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'discarded': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return FileText;
      case 'url': return Globe;
      case 'file': return FileUp;
      case 'auto_generated': return Zap;
      default: return FileText;
    }
  };

  const SourceIcon = getSourceIcon(idea.source_type);
  const hasSuggestions = suggestions && suggestions.length > 0;

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
          />
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium text-foreground">{idea.title}</div>
            {idea.description && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {idea.description}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs">
              {idea.content_type}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(idea.status)}`}>
              {idea.status.replace('_', ' ')}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="text-xs">
            {idea.target_audience}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="font-mono text-xs text-muted-foreground">
            {idea.internal_name || 'Generating...'}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <SourceIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground capitalize">
              {idea.source_type.replace('_', ' ')}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-xs text-muted-foreground">
            {format(new Date(idea.created_at), 'MMM dd, yyyy')}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(idea)}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateBrief(idea.id)}
              disabled={isCreatingBrief(idea.id) || idea.status !== 'ready'}
              className="h-7 px-2 text-xs"
            >
              {isCreatingBrief(idea.id) ? 'Creating...' : 'Brief'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDiscard(idea.id)}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Suggestions rows */}
      {isExpanded && (
        <ContentSuggestionsTableRows
          ideaId={idea.id}
          parentIdea={idea}
          suggestions={suggestions}
          isLoading={loadingSuggestions}
          onEdit={onEdit}
          onDiscard={onDiscard}
          onCreateBrief={onCreateBrief}
          isCreatingBrief={isCreatingBrief}
        />
      )}
    </>
  );
}