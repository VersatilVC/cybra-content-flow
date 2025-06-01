
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ContentBrief } from '@/types/contentBriefs';
import { FileText, User, Calendar, Tag } from 'lucide-react';

interface ViewBriefModalProps {
  brief: ContentBrief | null;
  open: boolean;
  onClose: () => void;
}

export default function ViewBriefModal({ brief, open, onClose }: ViewBriefModalProps) {
  if (!brief) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'discarded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Content Brief Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{brief.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(brief.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(brief.updated_at)}</span>
                </div>
              </div>
            </div>
            <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(brief.status)}`}>
              {brief.status.charAt(0).toUpperCase() + brief.status.slice(1)}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Brief Type</p>
                <p className="text-sm text-gray-600">{brief.brief_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Target Audience</p>
                <p className="text-sm text-gray-600">{brief.target_audience}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Source</p>
                <p className="text-sm text-gray-600">{brief.source_type}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {brief.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{brief.description}</p>
              </div>
            </div>
          )}

          {/* Content */}
          {brief.content && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
              <div className="p-4 bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap">{brief.content}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
