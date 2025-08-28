import React from 'react';
import { Edit, Trash2, FileText, Globe, FileUp, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ContentIdea, ContentSuggestion } from '@/types/contentIdeas';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ContentSuggestionsTableRowsProps {
  ideaId: string;
  parentIdea: ContentIdea;
  suggestions?: ContentSuggestion[];
  isLoading: boolean;
  onEdit: (idea: ContentIdea) => void;
  onDiscard: (id: string) => void;
  onCreateBrief: (id: string, type?: 'idea' | 'suggestion', ideaId?: string) => void;
  isCreatingBrief: (id: string) => boolean;
}

export default function ContentSuggestionsTableRows({
  ideaId,
  parentIdea,
  suggestions,
  isLoading,
  onEdit,
  onDiscard,
  onCreateBrief,
  isCreatingBrief,
}: ContentSuggestionsTableRowsProps) {
  const handleSuggestionEdit = (suggestion: ContentSuggestion) => {
    // Convert suggestion to idea format for editing
    const suggestionAsIdea: ContentIdea = {
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      content_type: suggestion.content_type as 'Blog Post' | 'Guide' | 'Blog Post (Topical)',
      target_audience: parentIdea.target_audience,
      status: 'ready' as const,
      source_type: suggestion.source_url ? 'url' : 'file',
      source_data: suggestion.source_url ? { url: suggestion.source_url } : {},
      internal_name: `SUGG_${suggestion.id.slice(0, 8)}`,
      created_at: suggestion.created_at,
      updated_at: suggestion.updated_at,
    };
    onEdit(suggestionAsIdea);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceIcon = (suggestion: ContentSuggestion) => {
    if (suggestion.source_url) return Globe;
    if (suggestion.file_summary) return FileUp;
    return FileText;
  };

  if (isLoading) {
    return (
      <TableRow className="bg-muted/30">
        <TableCell colSpan={9} className="text-center py-4">
          <LoadingSpinner />
        </TableCell>
      </TableRow>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <TableRow className="bg-muted/30">
        <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
          No suggestions available for this idea.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {/* Suggestions header row */}
      <TableRow className="bg-muted/50 border-l-4 border-l-purple-500">
        <TableCell colSpan={9} className="py-2 px-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Star className="h-4 w-4" />
            Content Suggestions ({suggestions.length})
          </div>
        </TableCell>
      </TableRow>

      {/* Individual suggestion rows */}
      {suggestions.map((suggestion) => {
        const SourceIcon = getSourceIcon(suggestion);
        
        return (
          <TableRow key={suggestion.id} className="bg-muted/30 border-l-4 border-l-purple-200">
            <TableCell></TableCell> {/* No checkbox for suggestions */}
            <TableCell></TableCell> {/* No expand button for suggestions */}
            <TableCell>
              <div className="space-y-1 pl-4">
                <div className="font-medium text-foreground text-sm">{suggestion.title}</div>
                {suggestion.description && (
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {suggestion.description}
                  </div>
                )}
                {suggestion.relevance_score && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(suggestion.relevance_score * 100)}% relevance
                    </span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">
                  {suggestion.content_type}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(suggestion.status)}`}>
                  {suggestion.status}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-xs">
                {parentIdea.target_audience}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="font-mono text-xs text-purple-600">
                SUGG_{suggestion.id.slice(0, 8)}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <SourceIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {suggestion.source_url ? 'URL' : suggestion.file_summary ? 'File' : 'Generated'}
                </span>
                {suggestion.source_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => window.open(suggestion.source_url!, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-xs text-muted-foreground">
                {format(new Date(suggestion.created_at), 'MMM dd, yyyy')}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionEdit(suggestion)}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCreateBrief(suggestion.id, 'suggestion', ideaId)}
                  disabled={isCreatingBrief(suggestion.id) || suggestion.status !== 'ready'}
                  className="h-7 px-2 text-xs"
                >
                  {isCreatingBrief(suggestion.id) ? 'Creating...' : 'Brief'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDiscard(suggestion.id)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}