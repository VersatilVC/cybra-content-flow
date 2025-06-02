
import React from 'react';
import { ContentBrief } from '@/types/contentBriefs';
import ContentBriefCard from '@/components/ContentBriefCard';
import EmptyBriefsState from './EmptyBriefsState';

interface BriefsGridProps {
  briefs: ContentBrief[];
  onEdit: (brief: ContentBrief) => void;
  onDiscard: (id: string) => void;
  onCreateContentItem: (briefId: string) => void;
  onView: (brief: ContentBrief) => void;
}

export default function BriefsGrid({ 
  briefs, 
  onEdit, 
  onDiscard, 
  onCreateContentItem, 
  onView 
}: BriefsGridProps) {
  if (briefs.length === 0) {
    return <EmptyBriefsState />;
  }

  return (
    <div className="space-y-4">
      {briefs.map((brief) => (
        <ContentBriefCard
          key={brief.id}
          brief={brief}
          onEdit={onEdit}
          onDiscard={onDiscard}
          onCreateContentItem={onCreateContentItem}
          onView={onView}
        />
      ))}
    </div>
  );
}
