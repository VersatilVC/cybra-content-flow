
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUp, Link as LinkIcon, PenTool } from 'lucide-react';
import { useGeneralContent } from '@/hooks/useGeneralContent';
import { derivativeTypes, getContentTypeIcon } from '@/components/content-item/derivativeTypes';
import { handleFileUpload } from '@/lib/fileUploadHandler';

interface GeneralContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneralContentModal: React.FC<GeneralContentModalProps> = ({
  isOpen,
  onClose
}) => {
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
    }
  };

  const handleDerivativeTypeSelect = (type: string, category: string) => {
    setFormData(prev => ({
      ...prev,
      derivative_type: type,
      category
    }));
  };

  const allDerivativeTypes = [
    ...derivativeTypes.General,
    ...derivativeTypes.Social,
    ...derivativeTypes.Ads
  ];

  const selectedTypeInfo = allDerivativeTypes.find(t => t.type === formData.derivative_type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create General Content</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Content Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title"
                required
              />
            </div>

            <div>
              <Label htmlFor="target_audience">Target Audience *</Label>
              <Select 
                value={formData.target_audience} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private Sector">Private Sector</SelectItem>
                  <SelectItem value="Government Sector">Government Sector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Input Source</Label>
              <Tabs 
                value={formData.source_type} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  source_type: value as 'manual' | 'url' | 'file' 
                }))}
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
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
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
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com"
                      required={formData.source_type === 'url'}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="file" className="mt-4">
                  <div>
                    <Label htmlFor="file">File Upload *</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        file: e.target.files?.[0] || null 
                      }))}
                      accept=".pdf,.doc,.docx,.txt"
                      required={formData.source_type === 'file'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: PDF, DOC, DOCX, TXT
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Label>Content Type *</Label>
              <div className="mt-2 space-y-4">
                {Object.entries(derivativeTypes).map(([category, types]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {types.map((typeInfo) => (
                        <Card 
                          key={typeInfo.type}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            formData.derivative_type === typeInfo.type 
                              ? 'ring-2 ring-purple-500 bg-purple-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleDerivativeTypeSelect(typeInfo.type, category)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm">{getContentTypeIcon(typeInfo.content_type)}</span>
                                  <h5 className="font-medium text-sm text-gray-900">
                                    {typeInfo.title}
                                  </h5>
                                  <Badge variant="secondary" className="text-xs">
                                    {typeInfo.content_type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {typeInfo.description}
                                </p>
                              </div>
                              {formData.derivative_type === typeInfo.type && (
                                <Badge className="ml-2 bg-purple-600 text-white">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
