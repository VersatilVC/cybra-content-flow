
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Layers } from 'lucide-react';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';

interface InlineDerivativeIndicatorProps {
  contentItemId: string;
  onNavigate: () => void;
}

const InlineDerivativeIndicator: React.FC<InlineDerivativeIndicatorProps> = ({ 
  contentItemId, 
  onNavigate 
}) => {
  const { derivatives, isLoading } = useContentDerivatives(contentItemId);

  if (isLoading || derivatives.length === 0) {
    return null;
  }

  const approvedCount = derivatives.filter(d => d.status === 'approved').length;
  const publishedCount = derivatives.filter(d => d.status === 'published').length;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            onClick={handleClick}
            className="relative cursor-pointer inline-flex"
          >
            <Badge 
              variant="outline" 
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span className="text-xs font-medium">{derivatives.length}</span>
              </div>
            </Badge>
            {(approvedCount > 0 || publishedCount > 0) && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white border shadow-lg">
          <div className="space-y-1 text-xs">
            <div className="font-medium">Content Derivatives</div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{derivatives.length}</span>
            </div>
            {publishedCount > 0 && (
              <div className="flex justify-between">
                <span className="text-green-600">Published:</span>
                <span className="font-medium text-green-600">{publishedCount}</span>
              </div>
            )}
            {approvedCount > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-600">Approved:</span>
                <span className="font-medium text-blue-600">{approvedCount}</span>
              </div>
            )}
            <div className="text-gray-500 italic pt-1 border-t">
              Click to view derivatives
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InlineDerivativeIndicator;
