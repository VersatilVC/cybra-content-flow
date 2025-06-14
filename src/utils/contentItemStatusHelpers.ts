
import { FileText, CheckCircle, AlertCircle, Clock, XCircle, Wrench } from 'lucide-react';

export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'ready_for_review':
      return { 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Ready for Review'
      };
    case 'derivatives_created':
      return {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Derivatives Created'
      };
    case 'published':
      return {
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        label: 'Published'
      };
    case 'discarded':
      return {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Discarded'
      };
    case 'needs_revision':
      return {
        color: 'bg-orange-100 text-orange-800',
        icon: AlertCircle,
        label: 'Needs Revision'
      };
    case 'needs_fix':
      return {
        color: 'bg-purple-100 text-purple-800',
        icon: Wrench,
        label: 'Needs Fix'
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: FileText,
        label: status.charAt(0).toUpperCase() + status.slice(1)
      };
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return '1 day ago';
  return `${Math.floor(diffInHours / 24)} days ago`;
};
