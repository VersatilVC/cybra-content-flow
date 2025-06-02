
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';

interface FileUploadSectionProps {
  derivative: ContentDerivative;
  file: File | null;
  setFile: (file: File | null) => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  derivative,
  file,
  setFile
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
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
  );
};
