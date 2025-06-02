
import { useState, useEffect } from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';
import { handleDerivativeFileUpload } from '@/lib/fileUploadHandler';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useEditDerivativeLogic(derivative: ContentDerivative, isOpen: boolean, onClose: () => void) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateDerivative, isUpdating } = useContentDerivatives(derivative.content_item_id);
  
  const [title, setTitle] = useState(derivative.title);
  const [content, setContent] = useState(derivative.content || '');
  const [status, setStatus] = useState<'draft' | 'approved' | 'published' | 'discarded'>(derivative.status);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(derivative.title);
      setContent(derivative.content || '');
      setStatus(derivative.status);
      setFile(null);
    }
  }, [isOpen, derivative]);

  const handleSubmit = async () => {
    if (!user?.id) return;

    try {
      let updates: Partial<ContentDerivative> = {
        title,
        status,
        word_count: derivative.content_type === 'text' ? content.split(' ').length : derivative.word_count
      };

      if (derivative.content_type === 'text') {
        updates.content = content;
      }

      // Handle file upload if a new file is selected
      if (file) {
        setIsUploading(true);
        try {
          const uploadResult = await handleDerivativeFileUpload(file, user.id);
          const publicUrl = `https://uejgjytmqpcilwfrlpai.supabase.co/storage/v1/object/public/content-derivatives/${uploadResult.path}`;
          
          updates.file_url = publicUrl;
          updates.file_path = uploadResult.path;
          updates.file_size = uploadResult.size; // This is now a string
          updates.mime_type = uploadResult.type;
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          toast({
            title: 'Upload failed',
            description: 'Failed to upload file. Please try again.',
            variant: 'destructive',
          });
          return;
        } finally {
          setIsUploading(false);
        }
      }

      updateDerivative({ id: derivative.id, updates });
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return {
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
  };
}
