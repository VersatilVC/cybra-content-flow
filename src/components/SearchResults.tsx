
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Lightbulb, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'content_item' | 'content_idea' | 'content_brief';
  status?: string;
  created_at: string;
  url: string;
}

interface SearchResultsProps {
  results: {
    contentItems: SearchResult[];
    contentIdeas: SearchResult[];
    contentBriefs: SearchResult[];
    total: number;
  };
  isLoading: boolean;
  onSelect: () => void;
}

export function SearchResults({ results, isLoading, onSelect }: SearchResultsProps) {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onSelect();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content_item':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'content_idea':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'content_brief':
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'content_item':
        return 'Content Item';
      case 'content_idea':
        return 'Content Idea';
      case 'content_brief':
        return 'Content Brief';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
            <span className="ml-2 text-sm text-gray-600">Searching...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.total === 0) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
        <CardContent className="p-4">
          <p className="text-sm text-gray-500 text-center py-2">No results found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg max-h-96 overflow-y-auto">
      <CardContent className="p-2">
        {results.contentItems.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 px-2 py-1">Content Items</p>
            {results.contentItems.map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {getTypeIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                  {result.description && (
                    <p className="text-xs text-gray-600 truncate">{result.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {result.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{getTypeLabel(result.type)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.contentIdeas.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 px-2 py-1">Content Ideas</p>
            {results.contentIdeas.map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {getTypeIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                  {result.description && (
                    <p className="text-xs text-gray-600 truncate">{result.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {result.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{getTypeLabel(result.type)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.contentBriefs.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 px-2 py-1">Content Briefs</p>
            {results.contentBriefs.map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {getTypeIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                  {result.description && (
                    <p className="text-xs text-gray-600 truncate">{result.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {result.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{getTypeLabel(result.type)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
