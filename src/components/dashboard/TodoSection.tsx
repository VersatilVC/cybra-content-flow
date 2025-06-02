
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Briefcase, Lightbulb } from 'lucide-react';
import { useDashboardTodos } from '@/hooks/useDashboardTodos';
import { Skeleton } from '@/components/ui/skeleton';

export function TodoSection() {
  const { data: todos, isLoading } = useDashboardTodos();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Recently';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Todo List</CardTitle>
        <Badge variant="secondary" className="ml-2">
          {todos?.totalCount || 0} items
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Review Content Ideas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <h3 className="font-medium text-gray-900">Review Content Ideas</h3>
                <Badge variant="outline" className="text-xs">
                  {todos?.contentIdeas.length || 0}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/content-ideas?status=processed'}
              >
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            {todos?.contentIdeas.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No ideas pending review</p>
            ) : (
              <div className="space-y-2">
                {todos?.contentIdeas.slice(0, 3).map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{idea.title}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(idea.created_at)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.location.href = `/content-ideas?idea=${idea.id}`}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Content Briefs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium text-gray-900">Review Content Briefs</h3>
                <Badge variant="outline" className="text-xs">
                  {todos?.contentBriefs.length || 0}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/content-briefs?status=ready,draft'}
              >
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            {todos?.contentBriefs.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No briefs pending review</p>
            ) : (
              <div className="space-y-2">
                {todos?.contentBriefs.slice(0, 3).map((brief) => (
                  <div key={brief.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{brief.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {brief.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{formatTimeAgo(brief.created_at)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.location.href = `/content-briefs?brief=${brief.id}`}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Content Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-gray-900">Review Content Items</h3>
                <Badge variant="outline" className="text-xs">
                  {todos?.contentItems.length || 0}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/content-items?status=pending,needs_fix'}
              >
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            {todos?.contentItems.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No content items pending review</p>
            ) : (
              <div className="space-y-2">
                {todos?.contentItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{formatTimeAgo(item.created_at)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.location.href = `/content-items/${item.id}`}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
