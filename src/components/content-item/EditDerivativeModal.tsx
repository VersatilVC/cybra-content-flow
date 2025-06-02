
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Loader2 } from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';
import { handleDerivativeFileUpload } from '@/lib/fileUploadHandler';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as 'draft' | 'approved' | 'published' | 'discarded');
  };

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

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Derivative</DialogTitle>
          <DialogDescription>
            Update the content derivative details and content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter derivative title"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="discarded">Discarded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mb-4">
            <Badge variant="outline">{derivative.content_type}</Badge>
            <Badge variant="outline">{derivative.category}</Badge>
            <Badge variant="outline">{derivative.derivative_type}</Badge>
          </div>

          {derivative.content_type === 'text' ? (
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content"
                rows={8}
                className="resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                Word count: {content.split(' ').filter(word => word.length > 0).length}
              </p>
            </div>
          ) : (
            <div>
              <Label>File Upload</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {file ? (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a new file to replace the current one
                    </p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept={derivative.content_type === 'image' ? 'image/*' : 
                             derivative.content_type === 'video' ? 'video/*' :
                             derivative.content_type === 'audio' ? 'audio/*' : '*/*'}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                    >
                      Choose file
                    </label>
                  </div>
                )}
              </div>
              
              {derivative.file_url && !file && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    Current file: {derivative.file_path?.split('/').pop()}
                  </p>
                </div>
              )}
            </div>
          )}

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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDerivativeModal;
