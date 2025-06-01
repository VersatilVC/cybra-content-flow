
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContentBrief } from '@/types/contentBriefs';

interface CreateContentCTAProps {
  brief: ContentBrief;
  onCreateContentItem?: (briefId: string) => void;
}

export default function CreateContentCTA({ brief, onCreateContentItem }: CreateContentCTAProps) {
  const canCreateContent = brief.status === 'ready' || brief.status === 'approved';

  if (!canCreateContent) return null;

  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Create Content?</h3>
        <p className="text-gray-600 mb-4">
          Transform this brief into a content item and start writing your {brief.brief_type.toLowerCase()}.
        </p>
        <Button
          onClick={() => onCreateContentItem?.(brief.id)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Content Item
        </Button>
      </div>
    </div>
  );
}
