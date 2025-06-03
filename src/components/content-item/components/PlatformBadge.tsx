
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PlatformBadgeProps {
  platform: 'linkedin' | 'x';
  className?: string;
}

const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, className = '' }) => {
  const platformConfig = {
    linkedin: {
      label: 'LinkedIn',
      className: 'bg-blue-600 text-white hover:bg-blue-700',
      icon: '💼'
    },
    x: {
      label: 'X',
      className: 'bg-black text-white hover:bg-gray-800',
      icon: '𝕏'
    }
  };

  const config = platformConfig[platform];

  return (
    <Badge className={`${config.className} ${className} text-xs font-medium px-2 py-1`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
};

export default PlatformBadge;
