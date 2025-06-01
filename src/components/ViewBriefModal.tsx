
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ContentBrief } from '@/types/contentBriefs';
import { FileText, Edit } from 'lucide-react';
import BriefHeader from './brief/BriefHeader';
import BriefMetadata from './brief/BriefMetadata';
import BriefContent from './brief/BriefContent';
import CreateContentCTA from './brief/CreateContentCTA';

interface ViewBriefModalProps {
  brief: ContentBrief | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (brief: ContentBrief) => void;
  onCreateContentItem?: (briefId: string) => void;
}

interface BriefContent {
  whatAndWhy?: {
    targetAudience?: string;
    goal?: string;
  };
  contentSections?: Array<{
    title?: string;
    sectionTitle?: string;
    bulletPoints?: string[] | string;
    sectionPoints?: string[];
    content?: string;
    points?: string[];
    items?: string[];
  }>;
  supportingResearch?: Array<{
    title: string;
    url?: string;
    description: string;
  }>;
}

export default function ViewBriefModal({ brief, open, onClose, onEdit, onCreateContentItem }: ViewBriefModalProps) {
  if (!brief) return null;

  const parseBriefContent = (content: string | null): BriefContent | null => {
    if (!content) return null;
    
    try {
      const parsed = JSON.parse(content) as BriefContent;
      console.log('Parsed brief content:', parsed);
      return parsed;
    } catch (error) {
      console.error('Failed to parse brief content:', error);
      console.log('Raw content:', content);
      return null;
    }
  };

  const briefContent = parseBriefContent(brief.content);

  // Debug logging
  console.log('Brief content structure:', {
    rawContent: brief.content,
    parsedContent: briefContent,
    contentSections: briefContent?.contentSections,
    contentSectionsLength: briefContent?.contentSections?.length,
    isArray: Array.isArray(briefContent?.contentSections)
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Content Brief Details
            </DialogTitle>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(brief)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Brief
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header */}
          <BriefHeader brief={brief} />

          {/* Metadata */}
          <BriefMetadata brief={brief} />

          {/* Description */}
          {brief.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{brief.description}</p>
              </div>
            </div>
          )}

          {/* Structured Content */}
          {briefContent ? (
            <div className="space-y-6">
              <BriefContent briefContent={briefContent} />
              <CreateContentCTA brief={brief} onCreateContentItem={onCreateContentItem} />
            </div>
          ) : (
            /* Fallback for non-JSON content */
            brief.content && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
                <div className="p-4 bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap">{brief.content}</p>
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
