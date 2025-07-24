
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentBrief } from '@/types/contentBriefs';
import { useToast } from '@/hooks/use-toast';
import EditableBriefContent from './brief/EditableBriefContent';

interface EditBriefModalProps {
  brief: ContentBrief | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<ContentBrief>) => void;
  isUpdating: boolean;
}

interface BriefContentData {
  whatAndWhy?: {
    targetAudience?: string;
    goal?: string;
  };
  contentSections?: Array<{
    title?: string;
    sectionTitle?: string;
    sectionPoints?: string[];
  }>;
  supportingResearch?: Array<{
    title: string;
    url?: string;
    description: string;
  }>;
}

export default function EditBriefModal({ brief, open, onClose, onSave, isUpdating }: EditBriefModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [structuredContent, setStructuredContent] = useState<BriefContentData>({});
  const [status, setStatus] = useState<'draft' | 'ready' | 'processing' | 'completed' | 'discarded'>('draft');
  const [briefType, setBriefType] = useState<'Blog Post' | 'Guide' | 'Blog Post (Topical)'>('Blog Post');
  const [targetAudience, setTargetAudience] = useState<'Private Sector' | 'Government Sector'>('Private Sector');
  const [activeTab, setActiveTab] = useState('basic');
  const { toast } = useToast();

  const parseStructuredContent = (content: string | null): BriefContentData => {
    if (!content) return {};
    
    try {
      const parsed = JSON.parse(content);
      return {
        whatAndWhy: parsed.whatAndWhy || {},
        contentSections: parsed.contentSections || [],
        supportingResearch: parsed.supportingResearch || []
      };
    } catch (error) {
      console.log('Content is not structured JSON, treating as legacy content');
      return {};
    }
  };

  useEffect(() => {
    if (brief) {
      setTitle(brief.title);
      setDescription(brief.description || '');
      setContent(brief.content || '');
      setStatus(brief.status);
      setBriefType(brief.brief_type);
      setTargetAudience(brief.target_audience);
      setStructuredContent(parseStructuredContent(brief.content));
    }
  }, [brief]);

  const handleSave = () => {
    if (!brief) return;

    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    // Serialize structured content back to JSON for storage
    let finalContent = content;
    if (Object.keys(structuredContent).length > 0) {
      finalContent = JSON.stringify(structuredContent);
    }

    onSave(brief.id, {
      title: title.trim(),
      description: description.trim() || null,
      content: finalContent || null,
      status,
      brief_type: briefType,
      target_audience: targetAudience,
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    if (brief) {
      setTitle(brief.title);
      setDescription(brief.description || '');
      setContent(brief.content || '');
      setStatus(brief.status);
      setBriefType(brief.brief_type);
      setTargetAudience(brief.target_audience);
      setStructuredContent(parseStructuredContent(brief.content));
    }
  };

  if (!brief) return null;

  const hasStructuredContent = Object.keys(structuredContent).length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Content Brief</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="content">Content Structure</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6 mt-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter brief title"
                className="w-full"
              />
            </div>

            {/* Brief Type and Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brief Type
                </label>
                <Select value={briefType} onValueChange={(value: 'Blog Post' | 'Guide' | 'Blog Post (Topical)') => setBriefType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blog Post">Blog Post</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                    <SelectItem value="Blog Post (Topical)">Blog Post (Topical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <Select value={targetAudience} onValueChange={(value: 'Private Sector' | 'Government Sector') => setTargetAudience(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private Sector">Private Sector</SelectItem>
                    <SelectItem value="Government Sector">Government Sector</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select value={status} onValueChange={(value: 'draft' | 'ready' | 'processing' | 'completed' | 'discarded') => setStatus(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="discarded">Discarded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter brief description"
                rows={4}
                className="w-full"
              />
            </div>

            {/* Raw Content - only show if no structured content */}
            {!hasStructuredContent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (Legacy Format)
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter brief content"
                  rows={8}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Switch to Content Structure tab to use the structured editor.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <EditableBriefContent
              briefContent={structuredContent}
              onChange={setStructuredContent}
            />
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
