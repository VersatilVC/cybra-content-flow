import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface ReviewActionsProps {
  isUpdating: boolean;
  onStatusUpdate: (status: string) => void;
}

export const ReviewActions: React.FC<ReviewActionsProps> = ({
  isUpdating,
  onStatusUpdate
}) => {
  return (
    <>
      <Button 
        onClick={() => onStatusUpdate('derivatives_created')}
        disabled={isUpdating}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Approve
      </Button>
      <Button 
        onClick={() => onStatusUpdate('needs_revision')}
        disabled={isUpdating}
        variant="outline"
        className="border-red-300 text-red-600 hover:bg-red-50"
      >
        <XCircle className="w-4 h-4 mr-2" />
        Request Revision
      </Button>
    </>
  );
};