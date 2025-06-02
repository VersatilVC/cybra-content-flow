
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';

interface DeleteDerivativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  derivative: ContentDerivative | null;
}

const DeleteDerivativeModal: React.FC<DeleteDerivativeModalProps> = ({
  isOpen,
  onClose,
  derivative
}) => {
  const { deleteDerivative, isDeleting } = useContentDerivatives(derivative?.content_item_id || '');

  const handleDelete = () => {
    if (derivative) {
      deleteDerivative(derivative.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Delete Derivative
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this derivative? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {derivative && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium">{derivative.title}</p>
            <p className="text-sm text-gray-600">
              {derivative.content_type} • {derivative.category}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDerivativeModal;
