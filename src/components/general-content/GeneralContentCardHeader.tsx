import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Link, Upload, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { GeneralContentItem } from '@/types/generalContent';

interface GeneralContentCardHeaderProps {
  item: GeneralContentItem;
}

const GeneralContentCardHeader: React.FC<GeneralContentCardHeaderProps> = ({ item }) => {
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return FileText;
      case 'url': return Link;
      case 'file': return Upload;
      default: return FileText;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'published': return CheckCircle;
      case 'failed': return XCircle;
      case 'ready_for_review': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'published': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'ready_for_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'General': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Social': return 'bg-blue-100 text-blue-700 border-blue-200'; 
      case 'Ads': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const StatusIcon = getStatusIcon(item.status);
  const SourceIcon = getSourceIcon(item.source_type);

  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-purple-600 shrink-0">
            <SourceIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-lg font-semibold text-gray-900 truncate cursor-help">
                    {truncateTitle(item.title)}
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getCategoryColor(item.category)}>
                {item.category}
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                {item.derivative_type.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.content_type}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <StatusIcon className="w-4 h-4" />
          <Badge className={`px-2 py-1 text-xs font-medium border ${getStatusColor(item.status)}`}>
            {item.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
};

export default GeneralContentCardHeader;