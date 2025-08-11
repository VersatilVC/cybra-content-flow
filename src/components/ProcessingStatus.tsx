import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useRetryBrief } from '@/hooks/useRetryBrief';
import { useRetryContentItemCreation } from '@/hooks/useRetryContentItemCreation';
import { useRetryDerivativeGeneration } from '@/hooks/useRetryDerivativeGeneration';

interface ProcessingStatusProps {
  status: string;
  entityType: 'brief' | 'content_item' | 'derivative';
  entityId: string;
  retryCount?: number;
  errorMessage?: string;
  className?: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  status,
  entityType,
  entityId,
  retryCount = 0,
  errorMessage,
  className = ''
}) => {
  const { retryBrief, isRetrying: isRetryingBrief } = useRetryBrief();
  const { retryContentItemCreation, isRetrying: isRetryingContent } = useRetryContentItemCreation();
  const { retryDerivativeGeneration, isRetrying: isRetryingDerivative } = useRetryDerivativeGeneration();

  const getStatusDisplay = () => {
    switch (status) {
      case 'processing':
        return {
          badge: <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="w-3 h-3 mr-1" />Processing</Badge>,
          showRetry: false
        };
      case 'failed':
        return {
          badge: <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>,
          showRetry: retryCount < 3
        };
      case 'completed':
        return {
          badge: <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>,
          showRetry: false
        };
      case 'ready':
        return {
          badge: <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Ready</Badge>,
          showRetry: false
        };
      default:
        return {
          badge: <Badge variant="outline">{status}</Badge>,
          showRetry: false
        };
    }
  };

  const handleRetry = () => {
    switch (entityType) {
      case 'brief':
        retryBrief(entityId);
        break;
      case 'content_item':
        retryContentItemCreation(entityId);
        break;
      case 'derivative':
        retryDerivativeGeneration(entityId);
        break;
    }
  };

  const isRetrying = isRetryingBrief || isRetryingContent || isRetryingDerivative;
  const { badge, showRetry } = getStatusDisplay();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {badge}
      
      {retryCount > 0 && (
        <span className="text-xs text-muted-foreground">
          Attempt {retryCount}/3
        </span>
      )}
      
      {showRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={isRetrying}
          className="h-6 px-2 text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      )}
      
      {errorMessage && status === 'failed' && (
        <div className="text-xs text-red-600 max-w-xs truncate" title={errorMessage}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};