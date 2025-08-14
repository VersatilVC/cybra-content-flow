
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
import { secureStringSchema, secureUrlSchema, validateFileType, validateFileSize } from '@/lib/security';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddIdeaModal({ isOpen, onClose }: AddIdeaModalProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState({
    idea: '',
    content_type: '',
    target_audience: '',
    url: '',
    file: null as File | null,
  });
  const [errors, setErrors] = useState({
    idea: false,
    content_type: false,
    target_audience: false,
    url: false,
    file: false,
  });

  const { createIdea, isCreating } = useContentIdeas();

  const validateForm = async () => {
    const newErrors = {
      idea: false,
      content_type: false,
      target_audience: false,
      url: false,
      file: false,
    };

    // Validate idea/description using security schema
    try {
      secureStringSchema.parse(formData.idea);
    } catch {
      newErrors.idea = true;
    }

    // Basic required field checks
    if (!formData.idea) newErrors.idea = true;
    if (!formData.content_type) newErrors.content_type = true;
    if (!formData.target_audience) newErrors.target_audience = true;

    // URL validation with security checks
    if (activeTab === 'url') {
      if (!formData.url) {
        newErrors.url = true;
      } else {
        try {
          secureUrlSchema.parse(formData.url);
        } catch {
          newErrors.url = true;
        }
      }
    }

    // File validation with security checks
    if (activeTab === 'file') {
      if (!formData.file) {
        newErrors.file = true;
      } else {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const isValidType = await validateFileType(formData.file, allowedTypes);
        const isValidSize = validateFileSize(formData.file, 10); // 10MB limit
        
        if (!isValidType || !isValidSize) {
          newErrors.file = true;
        }
      }
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      return;
    }

    let sourceData = {};
    let sourceType: 'manual' | 'file' | 'url' = 'manual';

    if (activeTab === 'url' && formData.url) {
      sourceType = 'url';
      sourceData = { url: formData.url };
    } else if (activeTab === 'file' && formData.file) {
      sourceType = 'file';
      // sourceData will be populated after file upload in the hook
      sourceData = { 
        originalName: formData.file.name,
        size: formData.file.size,
        type: formData.file.type
      };
    }

    const ideaPayload = {
      title: formData.idea.slice(0, 100) + (formData.idea.length > 100 ? '...' : ''),
      description: formData.idea,
      content_type: formData.content_type as any,
      target_audience: formData.target_audience as any,
      status: 'processing' as const,
      source_type: sourceType,
      source_data: sourceData,
      ...(formData.file && { file: formData.file })
    };

    createIdea(ideaPayload);

    // Reset form
    setFormData({
      idea: '',
      content_type: '',
      target_audience: '',
      url: '',
      file: null,
    });
    setErrors({
      idea: false,
      content_type: false,
      target_audience: false,
      url: false,
      file: false,
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
                <Label htmlFor="idea" className={errors.idea ? "text-destructive" : ""}>Content Idea *</Label>
                <Textarea
                  id="idea"
                  value={formData.idea}
                  onChange={(e) => setFormData(prev => ({ ...prev, idea: e.target.value }))}
                  placeholder="Describe your content idea in detail..."
                  rows={4}
                  required
                  className={errors.idea ? "border-destructive" : ""}
                />
                {errors.idea && (
                  <p className="text-sm text-destructive mt-1">Content idea is required</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="url" className={errors.url ? "text-destructive" : ""}>URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/article"
                  required={activeTab === 'url'}
                  className={errors.url ? "border-destructive" : ""}
                />
                {errors.url && (
                  <p className="text-sm text-destructive mt-1">URL is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="url-idea" className={errors.idea ? "text-destructive" : ""}>Content Idea *</Label>
                <Textarea
                  id="url-idea"
                  value={formData.idea}
                  onChange={(e) => setFormData(prev => ({ ...prev, idea: e.target.value }))}
                  placeholder="Describe what content idea this URL inspired..."
                  rows={4}
                  required
                  className={errors.idea ? "border-destructive" : ""}
                />
                {errors.idea && (
                  <p className="text-sm text-destructive mt-1">Content idea is required</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div>
                <Label htmlFor="file" className={errors.file ? "text-destructive" : ""}>Upload File *</Label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.file ? "border-destructive" : "border-gray-300"}`}>
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
                {errors.file && (
                  <p className="text-sm text-destructive mt-1">File upload is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="file-idea" className={errors.idea ? "text-destructive" : ""}>Content Idea *</Label>
                <Textarea
                  id="file-idea"
                  value={formData.idea}
                  onChange={(e) => setFormData(prev => ({ ...prev, idea: e.target.value }))}
                  placeholder="Describe what content idea this file inspired..."
                  rows={4}
                  required
                  className={errors.idea ? "border-destructive" : ""}
                />
                {errors.idea && (
                  <p className="text-sm text-destructive mt-1">Content idea is required</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_audience" className={errors.target_audience ? "text-destructive" : ""}>Target Audience *</Label>
              <Select value={formData.target_audience} onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}>
                <SelectTrigger className={errors.target_audience ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private Sector">Private Sector</SelectItem>
                  <SelectItem value="Government Sector">Government Sector</SelectItem>
                </SelectContent>
              </Select>
              {errors.target_audience && (
                <p className="text-sm text-destructive mt-1">Target audience is required</p>
              )}
            </div>
            <div>
              <Label htmlFor="content_type" className={errors.content_type ? "text-destructive" : ""}>Content Type *</Label>
              <Select value={formData.content_type} onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value }))}>
                <SelectTrigger className={errors.content_type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blog Post">Blog Post</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                    <SelectItem value="Blog Post (Topical)">Blog Post (Topical)</SelectItem>
                  </SelectContent>
              </Select>
              {errors.content_type && (
                <p className="text-sm text-destructive mt-1">Content type is required</p>
              )}
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
