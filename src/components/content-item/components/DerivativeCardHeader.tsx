
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Image, Video, Music, File } from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { getStatusColor, getContentTypeIcon, truncateTitle } from '../utils/derivativeCardHelpers';

interface DerivativeCardHeaderProps {
  derivative: ContentDerivative;
}

const DerivativeCardHeader: React.FC<DerivativeCardHeaderProps> = ({ derivative }) => {
  const iconComponents = {
    FileText,
    Image,
    Video,
    Music,
    File
  };

  const IconComponent = iconComponents[getContentTypeIcon(derivative.content_type) as keyof typeof iconComponents] || FileText;

  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-purple-600 shrink-0">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-lg font-semibold text-gray-900 truncate cursor-help">
                    {truncateTitle(derivative.title)}
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{derivative.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {derivative.content_type}
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                {derivative.derivative_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
        <Badge className={`px-2 py-1 text-xs font-medium border shrink-0 ${getStatusColor(derivative.status)}`}>
          {derivative.status}
        </Badge>
      </div>
    </CardHeader>
  );
};

export default DerivativeCardHeader;
