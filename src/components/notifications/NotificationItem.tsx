
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notifications';
import { 
  getNotificationIcon, 
  getNotificationColor,
  isContentSuggestionNotification,
  isContentBriefNotification,
  isContentItemNotification,
  isWordPressPublishingNotification,
  isDerivativeGenerationNotification,
  isContentItemFixNotification
} from '@/utils/notificationHelpers';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onViewSuggestions: (notification: Notification) => void;
  onViewBrief: (notification: Notification) => void;
  onViewContentItem: (notification: Notification) => void;
  onViewWordPressPublishing?: (notification: Notification) => void;
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  onViewSuggestions, 
  onViewBrief,
  onViewContentItem,
  onViewWordPressPublishing
}: NotificationItemProps) {
  const IconComponent = getNotificationIcon(notification.type);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const getActionButton = () => {
    if (isContentSuggestionNotification(notification)) {
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewSuggestions(notification);
          }}
          size="sm"
          variant="outline"
          className="mt-2 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          View Suggestions
        </Button>
      );
    }

    if (isContentBriefNotification(notification)) {
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewBrief(notification);
          }}
          size="sm"
          variant="outline"
          className="mt-2 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          View Brief
        </Button>
      );
    }

    if (isWordPressPublishingNotification(notification)) {
      // Only show "View on WordPress" for successful publishing
      const isSuccess = notification.type === 'success' && notification.title.includes('WordPress Publishing Complete');
      
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewWordPressPublishing ? onViewWordPressPublishing(notification) : onViewContentItem(notification);
          }}
          size="sm"
          variant="outline"
          className="mt-2 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          {isSuccess ? 'View on WordPress' : 'View Content Item'}
        </Button>
      );
    }

    if (isDerivativeGenerationNotification(notification)) {
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewContentItem(notification);
          }}
          size="sm"
          variant="outline"
          className="mt-2 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          View Derivatives
        </Button>
      );
    }

    if (isContentItemFixNotification(notification) || isContentItemNotification(notification)) {
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewContentItem(notification);
          }}
          size="sm"
          variant="outline"
          className="mt-2 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          View Content Item
        </Button>
      );
    }

    return null;
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
        notification.is_read 
          ? 'bg-gray-50 border-l-gray-300' 
          : getNotificationColor(notification.type)
      }`}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${
              notification.is_read ? 'text-gray-600' : 'text-gray-900'
            }`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-2">
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
              )}
              <Button
                onClick={handleDelete}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                <Trash className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <p className={`text-sm mt-1 ${
            notification.is_read ? 'text-gray-500' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>
          
          {getActionButton()}
          
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
