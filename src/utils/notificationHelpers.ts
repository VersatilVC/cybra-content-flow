
import { CheckCircle, AlertCircle, Info, Lightbulb, FileText, Eye } from 'lucide-react';
import { Notification, NotificationRow } from '@/types/notifications';

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertCircle;
    default:
      return Info;
  }
};

export const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-l-green-500';
    case 'error':
      return 'bg-red-50 border-l-red-500';
    case 'warning':
      return 'bg-yellow-50 border-l-yellow-500';
    default:
      return 'bg-blue-50 border-l-blue-500';
  }
};

export const isContentSuggestionNotification = (notification: Notification): boolean => {
  return notification.title.includes('Content Suggestions Ready') || 
         notification.message.includes('content suggestions');
};

export const isContentBriefNotification = (notification: Notification): boolean => {
  return notification.title.includes('Content Brief Ready') || 
         notification.message.includes('content brief');
};

export const isContentItemNotification = (notification: Notification): boolean => {
  return notification.title.includes('Content Processing Complete') || 
         notification.message.includes('content item') ||
         notification.message.includes('successfully generated');
};

export const mapNotificationRow = (row: NotificationRow): Notification => {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type as 'info' | 'success' | 'warning' | 'error',
    is_read: row.is_read,
    created_at: row.created_at,
    related_submission_id: row.related_submission_id || undefined,
  };
};
