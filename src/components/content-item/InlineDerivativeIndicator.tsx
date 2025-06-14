
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

  // Group derivatives by category
  const categoryCounts = derivatives.reduce((acc, derivative) => {
    const category = derivative.category;
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        approved: 0,
        published: 0
      };
    }
    acc[category].total++;
    if (derivative.status === 'approved') acc[category].approved++;
    if (derivative.status === 'published') acc[category].published++;
    return acc;
  }, {} as Record<string, { total: number; approved: number; published: number }>);

  const getCategoryBadgeInfo = (category: string) => {
    switch (category) {
      case 'General':
        return { 
          label: 'General', 
          color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
        };
      case 'Social':
        return { 
          label: 'Social', 
          color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
        };
      case 'Ads':
        return { 
          label: 'Ads', 
          color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
        };
      default:
        return { 
          label: category, 
          color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
        };
    }
  };

  const hasApprovedOrPublished = Object.values(categoryCounts).some(
    category => category.approved > 0 || category.published > 0
  );

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
            className="relative cursor-pointer inline-flex items-center gap-1"
          >
            <Layers className="w-3 h-3 text-purple-600" />
            {Object.entries(categoryCounts).map(([category, counts]) => {
              const badgeInfo = getCategoryBadgeInfo(category);
              return (
                <div key={category} className="relative">
                  <Badge 
                    variant="outline" 
                    className={`${badgeInfo.color} transition-colors px-2 py-0.5`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">{badgeInfo.label}</span>
                      <span className="text-xs">{counts.total}</span>
                    </div>
                  </Badge>
                  {(counts.approved > 0 || counts.published > 0) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
            {hasApprovedOrPublished && Object.keys(categoryCounts).length > 1 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-white border shadow-lg">
          <div className="space-y-2 text-xs">
            <div className="font-medium">Content Derivatives by Category</div>
            {Object.entries(categoryCounts).map(([category, counts]) => (
              <div key={category} className="space-y-1">
                <div className="font-medium text-gray-800">{category}:</div>
                <div className="ml-2 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{counts.total}</span>
                  </div>
                  {counts.published > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600">Published:</span>
                      <span className="font-medium text-green-600">{counts.published}</span>
                    </div>
                  )}
                  {counts.approved > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-600">Approved:</span>
                      <span className="font-medium text-blue-600">{counts.approved}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
