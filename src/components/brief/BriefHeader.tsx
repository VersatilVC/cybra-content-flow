
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { ContentBrief } from '@/types/contentBriefs';

interface BriefHeaderProps {
  brief: ContentBrief;
}

export default function BriefHeader({ brief }: BriefHeaderProps) {
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
  );
}
