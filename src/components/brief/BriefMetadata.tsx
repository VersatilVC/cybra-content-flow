
import React from 'react';
import { Tag, User, FileText } from 'lucide-react';
import { ContentBrief } from '@/types/contentBriefs';

interface BriefMetadataProps {
  brief: ContentBrief;
}

export default function BriefMetadata({ brief }: BriefMetadataProps) {
  return (
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
  );
}
