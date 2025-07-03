import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DangerActionsProps {
  isUpdating: boolean;
  onStatusUpdate: (status: string) => void;
}

export const DangerActions: React.FC<DangerActionsProps> = ({
  isUpdating,
  onStatusUpdate
}) => {
  const { toast } = useToast();

  const handleDiscard = () => {
    onStatusUpdate('discarded');
    
    toast({
      title: 'Content Discarded',
      description: 'The content item has been discarded.',
    });
  };

  return (
    <Button 
      onClick={handleDiscard}
      disabled={isUpdating}
      variant="ghost"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <AlertTriangle className="w-4 h-4 mr-2" />
      Discard
    </Button>
  );
};