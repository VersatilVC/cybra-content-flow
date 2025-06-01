
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentBrief } from '@/types/contentBriefs';
import { useToast } from '@/hooks/use-toast';

interface EditBriefModalProps {
  brief: ContentBrief | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<ContentBrief>) => void;
  isUpdating: boolean;
}

export default function EditBriefModal({ brief, open, onClose, onSave, isUpdating }: EditBriefModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'ready' | 'approved' | 'discarded'>('draft');
  const [briefType, setBriefType] = useState<'Blog Post' | 'Guide'>('Blog Post');
  const [targetAudience, setTargetAudience] = useState<'Private Sector' | 'Government Sector'>('Private Sector');
  const { toast } = useToast();

  useEffect(() => {
    if (brief) {
      setTitle(brief.title);
      setDescription(brief.description || '');
      setContent(brief.content || '');
      setStatus(brief.status);
      setBriefType(brief.brief_type);
      setTargetAudience(brief.target_audience);
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

    onSave(brief.id, {
      title: title.trim(),
      description: description.trim() || null,
      content: content.trim() || null,
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
    }
  };

  if (!brief) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Content Brief</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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
              <Select value={briefType} onValueChange={(value: 'Blog Post' | 'Guide') => setBriefType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blog Post">Blog Post</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
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
            <Select value={status} onValueChange={(value: 'draft' | 'ready' | 'approved' | 'discarded') => setStatus(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
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

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter brief content"
              rows={8}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
