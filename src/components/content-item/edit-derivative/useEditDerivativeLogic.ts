
import { useState, useEffect } from 'react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { getStorageUrl } from '@/config/environment';
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
  
  // LinkedIn ad specific states
  const [headline, setHeadline] = useState('');
  const [introText, setIntroText] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(derivative.title);
      setContent(derivative.content || '');
      setStatus(derivative.status);
      setFile(null);
      
      // Parse LinkedIn ad content if applicable
      if (derivative.derivative_type === 'linkedin_ads' && derivative.content) {
        try {
          const adContent = JSON.parse(derivative.content);
          setHeadline(adContent.headline || '');
          setIntroText(adContent.intro_text || '');
          setImageUrl(adContent.image_url || derivative.file_url || '');
        } catch (error) {
          // Fallback to treating content as headline
          setHeadline(derivative.content);
          setIntroText('');
          setImageUrl(derivative.file_url || '');
        }
      } else {
        setHeadline('');
        setIntroText('');
        setImageUrl('');
      }
    }
  }, [isOpen, derivative]);

  const handleSubmit = async () => {
    if (!user?.id) return;

    try {
      let updates: Partial<ContentDerivative> = {
        title,
        status,
      };

      // Handle LinkedIn ad content reconstruction
      if (derivative.derivative_type === 'linkedin_ads') {
        const adContent = {
          headline: headline.trim(),
          intro_text: introText.trim(),
          image_url: imageUrl.trim()
        };
        
        updates.content = JSON.stringify(adContent);
        updates.word_count = (headline + ' ' + introText).split(' ').filter(word => word.length > 0).length;
        
        // Update file_url if image_url changed
        if (imageUrl !== derivative.file_url) {
          updates.file_url = imageUrl;
        }
      } else if (derivative.content_type === 'text') {
        updates.content = content;
        updates.word_count = content.split(' ').filter(word => word.length > 0).length;
      } else {
        updates.word_count = derivative.word_count;
      }

      // Handle file upload if a new file is selected
      if (file) {
        setIsUploading(true);
        try {
          const uploadResult = await handleDerivativeFileUpload(file, user.id);
          const publicUrl = getStorageUrl('content-derivatives', uploadResult.path);
          
          updates.file_url = publicUrl;
          updates.file_path = uploadResult.path;
          updates.file_size = uploadResult.size;
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
    handleSubmit,
    // LinkedIn ad specific returns
    headline,
    setHeadline,
    introText,
    setIntroText,
    imageUrl,
    setImageUrl
  };
}
