
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { EditDerivativeForm } from './edit-derivative/EditDerivativeForm';
import { useEditDerivativeLogic } from './edit-derivative/useEditDerivativeLogic';

interface EditDerivativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  derivative: ContentDerivative;
}

const EditDerivativeModal: React.FC<EditDerivativeModalProps> = ({
  isOpen,
  onClose,
  derivative
}) => {
  const {
    title,
    setTitle,
    content,
    setContent,
    status,
    setStatus,
    file,
    setFile,
    isUploading,
    isUpdating,
    handleSubmit
  } = useEditDerivativeLogic(derivative, isOpen, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Derivative</DialogTitle>
          <DialogDescription>
            Update the content derivative details and content.
          </DialogDescription>
        </DialogHeader>

        <EditDerivativeForm
          derivative={derivative}
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          status={status}
          setStatus={setStatus}
          file={file}
          setFile={setFile}
        />

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdating || isUploading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || isUpdating || isUploading}
            className="flex-1"
          >
            {isUpdating || isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDerivativeModal;
