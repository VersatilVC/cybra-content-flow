
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ 
  text, 
  maxLength = 150, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate 
    ? text 
    : text.substring(0, maxLength) + '...';

  if (!shouldTruncate) {
    return (
      <div className={`whitespace-pre-wrap ${className}`}>
        {text}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="whitespace-pre-wrap">
        {displayText}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 h-auto p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3 mr-1" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 mr-1" />
            Read More
          </>
        )}
      </Button>
    </div>
  );
};

export default ExpandableText;
