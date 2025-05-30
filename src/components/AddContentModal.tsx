
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Link, FileText, Database, Newspaper, Building2, Zap } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AddContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const knowledgeBases = [
  { value: 'cyabra', label: 'Cyabra Knowledge Base', icon: Building2, color: 'text-purple-600' },
  { value: 'industry', label: 'Industry Knowledge Base', icon: Database, color: 'text-blue-600' },
  { value: 'news', label: 'News Knowledge Base', icon: Newspaper, color: 'text-green-600' },
  { value: 'competitor', label: 'Competitor Knowledge Base', icon: Zap, color: 'text-orange-600' },
];

export function AddContentModal({ open, onOpenChange }: AddContentModalProps) {
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('knowledge-base-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data.path;
  };

  const createSubmission = async (type: 'file' | 'url', filePath?: string) => {
    if (!user) throw new Error('User not authenticated');

    const submissionData: any = {
      user_id: user.id,
      knowledge_base: selectedKnowledgeBase,
      content_type: type
    };

    if (type === 'file' && selectedFile && filePath) {
      submissionData.file_path = filePath;
      submissionData.original_filename = selectedFile.name;
      submissionData.file_size = selectedFile.size;
      submissionData.mime_type = selectedFile.type;
    } else if (type === 'url') {
      submissionData.file_url = url;
    }

    const { data, error } = await supabase
      .from('content_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const triggerWebhook = async (submissionId: string) => {
    const { error } = await supabase.functions.invoke('process-content', {
      body: { submissionId },
      headers: { 'Content-Type': 'application/json' }
    });

    if (error) throw error;
  };

  const handleFileSubmit = async () => {
    if (!selectedFile || !selectedKnowledgeBase) {
      toast({
        title: 'Missing Information',
        description: 'Please select a file and knowledge base.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload file
      setUploadProgress(25);
      const filePath = await uploadFile(selectedFile);
      
      // Create submission record
      setUploadProgress(50);
      const submission = await createSubmission('file', filePath);
      
      // Trigger webhook
      setUploadProgress(75);
      await triggerWebhook(submission.id);
      
      setUploadProgress(100);

      toast({
        title: 'File Uploaded Successfully! 🎉',
        description: `Your file "${selectedFile.name}" has been queued for processing. You'll receive a notification when it's complete.`,
      });

      // Reset form
      setSelectedFile(null);
      setSelectedKnowledgeBase('');
      onOpenChange(false);

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleUrlSubmit = async () => {
    if (!url || !selectedKnowledgeBase) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a URL and select a knowledge base.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create submission record
      const submission = await createSubmission('url');
      
      // Trigger webhook
      await triggerWebhook(submission.id);

      toast({
        title: 'URL Submitted Successfully! 🚀',
        description: `Your URL has been queued for processing. You'll receive a notification when it's complete.`,
      });

      // Reset form
      setUrl('');
      setSelectedKnowledgeBase('');
      onOpenChange(false);

    } catch (error) {
      console.error('Error submitting URL:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit URL',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedKB = knowledgeBases.find(kb => kb.value === selectedKnowledgeBase);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Add Content to Knowledge Base
          </DialogTitle>
          <DialogDescription>
            Upload files or submit URLs to add content to your knowledge bases.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Knowledge Base Selection */}
          <div className="space-y-2">
            <Label htmlFor="knowledge-base">Select Knowledge Base</Label>
            <Select value={selectedKnowledgeBase} onValueChange={setSelectedKnowledgeBase}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a knowledge base..." />
              </SelectTrigger>
              <SelectContent>
                {knowledgeBases.map((kb) => (
                  <SelectItem key={kb.value} value={kb.value}>
                    <div className="flex items-center gap-2">
                      <kb.icon className={`w-4 h-4 ${kb.color}`} />
                      {kb.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedKnowledgeBase && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                {selectedKB && <selectedKB.icon className={`w-4 h-4 ${selectedKB.color}`} />}
                <span className="text-sm font-medium">Selected: {selectedKB?.label}</span>
              </div>
            </div>
          )}

          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Submit URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-purple-600 mx-auto" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm font-medium">Drag and drop your file here</p>
                      <p className="text-xs text-gray-500">or click to browse</p>
                    </div>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose File
                    </Button>
                    <p className="text-xs text-gray-500">
                      Supported: PDF, DOC, DOCX, TXT, CSV, XLS, XLSX (Max: 50MB)
                    </p>
                  </div>
                )}
              </div>

              {isSubmitting && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleFileSubmit}
                disabled={!selectedFile || !selectedKnowledgeBase || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Upload and Process'
                )}
              </Button>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <Button
                onClick={handleUrlSubmit}
                disabled={!url || !selectedKnowledgeBase || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Submit URL'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
