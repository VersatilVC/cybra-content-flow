
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Video, Loader2 } from 'lucide-react';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';

interface DerivativeSummaryProps {
  contentItemId: string;
}

const DerivativeSummary: React.FC<DerivativeSummaryProps> = ({ contentItemId }) => {
  const { derivatives, isLoading } = useContentDerivatives(contentItemId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading derivatives...
      </div>
    );
  }

const totalCount = derivatives.length;

  const categorizedCounts: Record<string, number> = derivatives.reduce((acc, d) => {
    const cat = (d as any).category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (totalCount === 0) {
    return (
      <div className="text-sm text-gray-500">
        No derivatives created
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'General': return <FileText className="w-3 h-3" />;
      case 'Social': return <Image className="w-3 h-3" />;
      case 'Ads': return <Video className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'General': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Social': return 'bg-green-100 text-green-800 border-green-200';
      case 'Ads': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">
        {totalCount} derivative{totalCount === 1 ? '' : 's'}:
      </span>
      <div className="flex items-center gap-1">
        {Object.entries(categorizedCounts).map(([category, count]) => (
          <Badge
            key={category}
            variant="outline"
            className={`px-2 py-1 text-xs font-medium border ${getCategoryColor(category)}`}
          >
            <div className="flex items-center gap-1">
              {getCategoryIcon(category)}
              <span>{category}: {count}</span>
            </div>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default DerivativeSummary;
