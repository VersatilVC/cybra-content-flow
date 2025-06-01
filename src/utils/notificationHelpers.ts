
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { NotificationRow, Notification } from '@/types/notifications';

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'warning': return AlertTriangle;
    default: return Info;
  }
};

export const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success': return 'border-l-green-500 bg-green-50';
    case 'error': return 'border-l-red-500 bg-red-50';
    case 'warning': return 'border-l-yellow-500 bg-yellow-50';
    default: return 'border-l-blue-500 bg-blue-50';
  }
};

export const mapNotificationRow = (row: NotificationRow): Notification => {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: (row.type as 'info' | 'success' | 'warning' | 'error') || 'info',
    is_read: row.is_read,
    created_at: row.created_at,
    related_submission_id: row.related_submission_id || undefined,
  };
};

export const isContentSuggestionNotification = (notification: Notification) => {
  return notification.title.includes('Content Suggestions Ready') || 
         notification.message.includes('content suggestions');
};

export const isContentBriefNotification = (notification: Notification) => {
  return notification.title.includes('Content Brief Ready') || 
         notification.message.includes('content brief');
};
