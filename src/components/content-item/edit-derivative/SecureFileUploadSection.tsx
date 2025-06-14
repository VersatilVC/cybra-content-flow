
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, AlertTriangle, CheckCircle, FileIcon } from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { validateFileSize, validateFileType } from '@/lib/security';

interface SecureFileUploadSectionProps {
  derivative: ContentDerivative;
  file: File | null;
  setFile: (file: File | null) => void;
}

export const SecureFileUploadSection: React.FC<SecureFileUploadSectionProps> = ({
  derivative,
  file,
  setFile
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const getAllowedTypes = () => {
    switch (derivative.content_type) {
      case 'image':
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      case 'video':
        return ['video/mp4', 'video/mpeg', 'video/quicktime'];
      case 'audio':
        return ['audio/mpeg', 'audio/wav', 'audio/ogg'];
      default:
        return ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      // File size validation
      if (!validateFileSize(selectedFile, 10)) {
        throw new Error('File size exceeds 10MB limit');
      }

      // File type validation
      const allowedTypes = getAllowedTypes();
      const isValidType = await validateFileType(selectedFile, allowedTypes);
      
      if (!isValidType) {
        throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }

      // Additional security checks
      if (selectedFile.name.length > 255) {
        throw new Error('File name too long');
      }

      if (!/^[a-zA-Z0-9._\-\s]+$/.test(selectedFile.name)) {
        throw new Error('File name contains invalid characters');
      }

      setFile(selectedFile);
      setValidationError(null);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'File validation failed');
      setFile(null);
      
      // Clear the input
      event.target.value = '';
    } finally {
      setIsValidating(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setValidationError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allowedTypes = getAllowedTypes();

  return (
    <div className="space-y-4">
      <Label>File Upload</Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        {file ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-3">
                <FileIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium">{file.name}</span>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              File validated and ready for upload
            </div>
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
              id="secure-file-upload"
              accept={allowedTypes.join(',')}
              disabled={isValidating}
            />
            <label
              htmlFor="secure-file-upload"
              className={`cursor-pointer text-blue-600 hover:text-blue-700 ${
                isValidating ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {isValidating ? 'Validating...' : 'Choose file'}
            </label>
          </div>
        )}
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Files are automatically scanned for security threats. 
            Maximum file size: 10MB. Only approved file types are allowed.
          </AlertDescription>
        </Alert>
        
        <div className="text-xs text-gray-500">
          <p><strong>Allowed file types:</strong> {allowedTypes.join(', ')}</p>
          <p><strong>Maximum size:</strong> 10MB</p>
        </div>
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
