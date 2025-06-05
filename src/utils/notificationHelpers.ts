import { CheckCircle, AlertCircle, Info, Lightbulb, FileText, Eye, Globe, Wrench, Wand2 } from 'lucide-react';
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
         notification.title.includes('Idea Processing Complete') ||
         notification.message.includes('content suggestions') ||
         notification.related_entity_type === 'idea';
};

export const isContentBriefNotification = (notification: Notification): boolean => {
  return notification.title.includes('Content Brief Ready') || 
         notification.message.includes('content brief') ||
         notification.related_entity_type === 'brief';
};

export const isContentItemNotification = (notification: Notification): boolean => {
  return notification.title.includes('Content Processing Complete') || 
         notification.title.includes('AI Content Fix Complete') ||
         notification.message.includes('content item') ||
         notification.message.includes('successfully generated') ||
         notification.message.includes('ready for review') ||
         notification.related_entity_type === 'content_item';
};

export const isWordPressPublishingNotification = (notification: Notification): boolean => {
  return notification.title.includes('WordPress Publishing Complete') ||
         notification.title.includes('WordPress Publishing Failed') ||
         notification.message.includes('published to WordPress') ||
         (notification.related_entity_type === 'content_item' && 
          notification.title.includes('WordPress'));
};

export const isDerivativeGenerationNotification = (notification: Notification): boolean => {
  return notification.title.includes('Content Derivatives Generated') ||
         notification.title.includes('Derivative Generation Failed') ||
         notification.message.includes('content derivatives') ||
         notification.message.includes('Derivatives tab');
};

export const isContentItemFixNotification = (notification: Notification): boolean => {
  return notification.title.includes('AI Content Fix Complete') ||
         notification.title.includes('AI Content Fix Failed') ||
         notification.message.includes('improved by AI');
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
    related_entity_id: row.related_entity_id || undefined,
    related_entity_type: row.related_entity_type as 'submission' | 'idea' | 'brief' | 'content_item' || undefined,
  };
};
