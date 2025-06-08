
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

  // Log information for debugging
  console.log('🔍 [ExpandableText] Processing text:', {
    originalLength: text.length,
    maxLength,
    shouldTruncate,
    displayLength: displayText.length,
    isExpanded
  });

  if (!shouldTruncate) {
    return (
      <div className={`whitespace-pre-wrap ${className}`}>
        {text}
      </div>
    );
  }

  const remainingChars = text.length - maxLength;

  return (
    <div className={className}>
      <div className="whitespace-pre-wrap">
        {displayText}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 h-auto p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4 mr-1" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-1" />
            Read More ({remainingChars} more chars)
          </>
        )}
      </Button>
    </div>
  );
};

export default ExpandableText;
