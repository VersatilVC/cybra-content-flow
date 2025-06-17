
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, Link as LinkIcon, PenTool } from 'lucide-react';

interface InputSourceSectionProps {
  sourceType: 'manual' | 'url' | 'file';
  content: string;
  url: string;
  file: File | null;
  onSourceTypeChange: (value: 'manual' | 'url' | 'file') => void;
  onContentChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
}

export const InputSourceSection: React.FC<InputSourceSectionProps> = ({
  sourceType,
  content,
  url,
  file,
  onSourceTypeChange,
  onContentChange,
  onUrlChange,
  onFileChange
}) => {
  return (
    <div>
      <Label>Input Source</Label>
      <Tabs 
        value={sourceType} 
        onValueChange={onSourceTypeChange}
        className="mt-2"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2">
            <FileUp className="w-4 h-4" />
            File Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <div>
            <Label htmlFor="content">Content Description</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Describe the content you want to create..."
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://example.com"
              required={sourceType === 'url'}
            />
          </div>
        </TabsContent>

        <TabsContent value="file" className="mt-4">
          <div>
            <Label htmlFor="file">File Upload *</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.txt"
              required={sourceType === 'file'}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, TXT
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
