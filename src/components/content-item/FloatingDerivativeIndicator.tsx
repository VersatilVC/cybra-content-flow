
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Layers, ArrowRight } from 'lucide-react';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';
import { formatDistanceToNow } from 'date-fns';

interface FloatingDerivativeIndicatorProps {
  contentItemId: string;
  onNavigateToDerivatives: () => void;
}

const FloatingDerivativeIndicator: React.FC<FloatingDerivativeIndicatorProps> = ({ 
  contentItemId, 
  onNavigateToDerivatives 
}) => {
  const { derivatives, isLoading } = useContentDerivatives(contentItemId);

  if (isLoading || derivatives.length === 0) {
    return null;
  }

  const recentDerivatives = derivatives
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const approvedCount = derivatives.filter(d => d.status === 'approved').length;
  const publishedCount = derivatives.filter(d => d.status === 'published').length;

  return (
    <div className="fixed top-24 right-8 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative cursor-pointer" onClick={onNavigateToDerivatives}>
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="font-medium">{derivatives.length}</span>
              </div>
            </Badge>
            {(approvedCount > 0 || publishedCount > 0) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent side="left" className="w-80 p-4 bg-white border shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Derivatives Summary</h4>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{derivatives.length}</span>
              </div>
              {publishedCount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">Published:</span>
                  <span className="font-medium text-green-600">{publishedCount}</span>
                </div>
              )}
              {approvedCount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Approved:</span>
                  <span className="font-medium text-blue-600">{approvedCount}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-2">
              <p className="text-xs text-gray-600 mb-2">Recent:</p>
              <div className="space-y-1">
                {recentDerivatives.map((derivative) => (
                  <div key={derivative.id} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-32">{derivative.title}</span>
                      <span className="text-gray-400 ml-1">
                        {formatDistanceToNow(new Date(derivative.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-gray-500 italic">Click to view all derivatives</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FloatingDerivativeIndicator;
