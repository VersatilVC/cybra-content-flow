
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import { StatusSelect } from './StatusSelect';
import { FileUploadSection } from './FileUploadSection';

interface EditDerivativeFormProps {
  derivative: ContentDerivative;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  status: 'draft' | 'approved' | 'published' | 'discarded';
  setStatus: (status: 'draft' | 'approved' | 'published' | 'discarded') => void;
  file: File | null;
  setFile: (file: File | null) => void;
}

export const EditDerivativeForm: React.FC<EditDerivativeFormProps> = ({
  derivative,
  title,
  setTitle,
  content,
  setContent,
  status,
  setStatus,
  file,
  setFile
}) => {
  return (
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

      <StatusSelect value={status} onChange={setStatus} />

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
        <FileUploadSection
          derivative={derivative}
          file={file}
          setFile={setFile}
        />
      )}
    </div>
  );
};
