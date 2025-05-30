
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, FileText, Star } from 'lucide-react';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ViewSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  ideaTitle: string;
}

export default function ViewSuggestionsModal({ 
  isOpen, 
  onClose, 
  ideaId, 
  ideaTitle 
}: ViewSuggestionsModalProps) {
  const { data: suggestions, isLoading, error } = useContentSuggestions(ideaId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Content Suggestions</DialogTitle>
          <DialogDescription>
            Generated suggestions for "{ideaTitle}"
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Failed to load suggestions
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                    </div>
                    {suggestion.relevance_score && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-600">
                          {Math.round(suggestion.relevance_score * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {suggestion.description && (
                    <p className="text-gray-600 mb-3">{suggestion.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.content_type}
                      </Badge>
                      {suggestion.source_title && (
                        <span className="text-xs text-gray-500">
                          Source: {suggestion.source_title}
                        </span>
                      )}
                    </div>
                    
                    {suggestion.source_url && (
                      <a
                        href={suggestion.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Source
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No suggestions available yet
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
