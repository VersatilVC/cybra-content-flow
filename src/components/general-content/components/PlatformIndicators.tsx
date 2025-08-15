import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PlatformIndicatorsProps {
  platforms: ('linkedin' | 'x')[];
  className?: string;
}

const PlatformIndicators: React.FC<PlatformIndicatorsProps> = ({ platforms, className = '' }) => {
  if (!platforms || platforms.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {platforms.includes('linkedin') && (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1.5 py-0.5">
          💼 LinkedIn
        </Badge>
      )}
      {platforms.includes('x') && (
        <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200 text-xs px-1.5 py-0.5">
          𝕏 X
        </Badge>
      )}
    </div>
  );
};

export default PlatformIndicators;