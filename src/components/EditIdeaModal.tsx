
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { useContentIdeas, ContentIdea } from '@/hooks/useContentIdeas';

interface EditIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: ContentIdea | null;
}

export default function EditIdeaModal({ isOpen, onClose, idea }: EditIdeaModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: '',
    target_audience: '',
  });

  const { updateIdea, isUpdating } = useContentIdeas();

  useEffect(() => {
    if (idea) {
      setFormData({
        title: idea.title,
        description: idea.description || '',
        content_type: idea.content_type,
        target_audience: idea.target_audience,
      });
    }
  }, [idea]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idea || !formData.title || !formData.content_type || !formData.target_audience) return;

    updateIdea({
      id: idea.id,
      updates: {
        title: formData.title,
        description: formData.description,
        content_type: formData.content_type as any,
        target_audience: formData.target_audience as any,
      }
    });

    onClose();
  };

  if (!idea) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Content Idea
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Textarea
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Content idea title..."
              rows={2}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your content idea in detail..."
              rows={4}
            />
          </div>

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
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Idea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
