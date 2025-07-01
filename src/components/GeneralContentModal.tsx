
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGeneralContent } from '@/hooks/useGeneralContent';
import { handleFileUpload } from '@/lib/fileUploadHandler';
import { BasicFormFields } from '@/components/general-content/BasicFormFields';
import { InputSourceSection } from '@/components/general-content/InputSourceSection';
import { ContentTypeSelection } from '@/components/general-content/ContentTypeSelection';
import { useToast } from '@/hooks/use-toast';

interface GeneralContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneralContentModal: React.FC<GeneralContentModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    derivative_type: '',
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
    
    if (!formData.derivative_type || !formData.title.trim()) {
      return;
    }

    try {
      let fileData = {};
      
      if (formData.source_type === 'file' && formData.file) {
        const uploadResult = await handleFileUpload(formData.file, 'current-user-id');
        fileData = {
          file_path: uploadResult.path,
          file_url: uploadResult.url,
          file_size: uploadResult.size,
          mime_type: uploadResult.type,
        };
      }

      const sourceData = formData.source_type === 'url' 
        ? { url: formData.url }
        : formData.source_type === 'file' 
        ? { originalName: formData.file?.name }
        : {};

      await createGeneralContent({
        title: formData.title,
        content: formData.content,
        derivative_type: formData.derivative_type,
        category: formData.category,
        content_type: 'text',
        source_type: formData.source_type,
        source_data: sourceData,
        target_audience: formData.target_audience,
        ...fileData,
      });

      // Show success message with webhook information
      toast({
        title: 'Content Created Successfully',
        description: 'Your general content has been created and sent for processing. You will be notified when it\'s ready.',
      });

      onClose();
      setFormData({
        title: '',
        content: '',
        derivative_type: '',
        category: '',
        target_audience: 'Private Sector',
        source_type: 'manual',
        source_data: {},
        url: '',
        file: null,
      });
    } catch (error) {
      console.error('Error creating general content:', error);
      toast({
        title: 'Error',
        description: 'Failed to create general content. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDerivativeTypeSelect = (type: string, category: string) => {
    setFormData(prev => ({
      ...prev,
      derivative_type: type,
      category
    }));
  };

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
              selectedType={formData.derivative_type}
              onTypeSelect={handleDerivativeTypeSelect}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !formData.derivative_type || !formData.title.trim()}
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
