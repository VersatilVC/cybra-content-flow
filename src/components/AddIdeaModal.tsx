
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Link as LinkIcon, PenTool, Upload } from 'lucide-react';
import { useContentIdeas } from '@/hooks/useContentIdeas';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddIdeaModal({ isOpen, onClose }: AddIdeaModalProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: '',
    target_audience: '',
    url: '',
    file: null as File | null,
  });

  const { createIdea, isCreating } = useContentIdeas();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content_type || !formData.target_audience) return;

    let sourceData = {};
    let sourceType: 'manual' | 'file' | 'url' = 'manual';

    if (activeTab === 'url' && formData.url) {
      sourceType = 'url';
      sourceData = { url: formData.url };
    } else if (activeTab === 'file' && formData.file) {
      sourceType = 'file';
      sourceData = { 
        filename: formData.file.name,
        size: formData.file.size,
        type: formData.file.type
      };
    }

    createIdea({
      title: formData.title,
      description: formData.description || null,
      content_type: formData.content_type as any,
      target_audience: formData.target_audience as any,
      status: 'submitted',
      source_type: sourceType,
      source_data: sourceData,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      content_type: '',
      target_audience: '',
      url: '',
      file: null,
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Submit New Content Idea
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                From URL
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                From File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div>
                <Label htmlFor="title">Idea Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your content idea title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your content idea in detail"
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/article"
                  required={activeTab === 'url'}
                />
              </div>
              <div>
                <Label htmlFor="url-title">Idea Title *</Label>
                <Input
                  id="url-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Title for this content idea"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div>
                <Label htmlFor="file">Upload File *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    required={activeTab === 'file'}
                  />
                  <Label htmlFor="file" className="cursor-pointer">
                    <span className="text-purple-600 hover:text-purple-700">Click to upload</span> or drag and drop
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, TXT files only</p>
                  {formData.file && (
                    <p className="text-sm text-green-600 mt-2">Selected: {formData.file.name}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="file-title">Idea Title *</Label>
                <Input
                  id="file-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Title for this content idea"
                  required
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_audience">Target Audience *</Label>
              <Select value={formData.target_audience} onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private Sector">Private Sector</SelectItem>
                  <SelectItem value="Government Sector">Government Sector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content_type">Content Type *</Label>
              <Select value={formData.content_type} onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blog Post">Blog Post</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Submitting...' : 'Submit Idea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
