
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGeneralContent } from '@/hooks/useGeneralContent';
import { handleFileUpload } from '@/lib/fileUploadHandler';
import { BasicFormFields } from '@/components/general-content/BasicFormFields';
import { InputSourceSection } from '@/components/general-content/InputSourceSection';
import { ContentTypeSelection } from '@/components/general-content/ContentTypeSelection';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GeneralContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneralContentModal: React.FC<GeneralContentModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    derivative_types: [] as string[],
    category: '',
    target_audience: 'Private Sector',
    source_type: 'manual' as 'manual' | 'url' | 'file',
    source_data: {},
    url: '',
    file: null as File | null,
  });

  const { createGeneralContent, isCreating } = useGeneralContent({
    category: 'all',
    derivativeType: 'all', 
    status: 'all',
    search: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create content.',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (formData.derivative_types.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one content type.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a title.',
        variant: 'destructive',
      });
      return;
    }

    // Validate source-specific requirements
    if (formData.source_type === 'url' && !formData.url.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a URL.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.source_type === 'file' && !formData.file) {
      toast({
        title: 'Validation Error',
        description: 'Please select a file.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.source_type === 'manual' && !formData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating general content with user ID:', user.id);
      console.log('Form data:', formData);
      
      let fileData = {};
      
      if (formData.source_type === 'file' && formData.file) {
        console.log('Uploading file...');
        try {
          const uploadResult = await handleFileUpload(formData.file, user.id);
          fileData = {
            file_path: uploadResult.path,
            file_url: uploadResult.url,
            file_size: uploadResult.size,
            mime_type: uploadResult.type,
          };
          console.log('File uploaded successfully:', fileData);
        } catch (fileError) {
          console.error('File upload failed:', fileError);
          toast({
            title: 'File Upload Error',
            description: 'Failed to upload file. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }

      const sourceData = formData.source_type === 'url' 
        ? { url: formData.url }
        : formData.source_type === 'file' 
        ? { originalName: formData.file?.name }
        : {};

      const contentData = {
        title: formData.title,
        content: formData.content,
        derivative_type: formData.derivative_types[0], // First selected for backward compatibility
        derivative_types: formData.derivative_types, // Full array for new functionality
        category: formData.category,
        content_type: 'text',
        source_type: formData.source_type,
        source_data: sourceData,
        target_audience: formData.target_audience,
        ...fileData,
      };

      console.log('Submitting content data:', contentData);

      await createGeneralContent(contentData);

      // Show success message with webhook information
      toast({
        title: 'Content Created Successfully',
        description: 'Your general content has been created and sent for processing. You will be notified when it\'s ready.',
      });

      onClose();
      setFormData({
        title: '',
        content: '',
        derivative_types: [],
        category: '',
        target_audience: 'Private Sector',
        source_type: 'manual',
        source_data: {},
        url: '',
        file: null,
      });
    } catch (error) {
      console.error('Error creating general content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: `Failed to create general content: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  const handleDerivativeTypesSelect = (types: string[], category: string) => {
    setFormData(prev => ({
      ...prev,
      derivative_types: types,
      category
    }));
  };

  // Don't render modal if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create General Content</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <BasicFormFields
              title={formData.title}
              targetAudience={formData.target_audience}
              onTitleChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              onTargetAudienceChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}
            />

            <InputSourceSection
              sourceType={formData.source_type}
              content={formData.content}
              url={formData.url}
              file={formData.file}
              onSourceTypeChange={(value) => setFormData(prev => ({ ...prev, source_type: value }))}
              onContentChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              onUrlChange={(value) => setFormData(prev => ({ ...prev, url: value }))}
              onFileChange={(file) => setFormData(prev => ({ ...prev, file }))}
            />

            <ContentTypeSelection
              selectedTypes={formData.derivative_types}
              onTypesSelect={handleDerivativeTypesSelect}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || formData.derivative_types.length === 0 || !formData.title.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isCreating ? 'Creating...' : 'Create Content'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GeneralContentModal;
