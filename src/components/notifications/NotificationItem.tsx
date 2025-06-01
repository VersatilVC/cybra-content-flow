
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notifications';
import { 
  getNotificationIcon, 
  getNotificationColor,
  isContentSuggestionNotification,
  isContentBriefNotification,
  isContentItemNotification
} from '@/utils/notificationHelpers';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onViewSuggestions: (notification: Notification) => void;
  onViewBrief: (notification: Notification) => void;
  onViewContentItem: (notification: Notification) => void;
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onViewSuggestions, 
  onViewBrief,
  onViewContentItem
}: NotificationItemProps) {
  const IconComponent = getNotificationIcon(notification.type);

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
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className={`text-sm mt-1 ${
            notification.is_read ? 'text-gray-500' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>
          
          {isContentSuggestionNotification(notification) && (
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
          )}

          {isContentBriefNotification(notification) && (
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
          )}

          {isContentItemNotification(notification) && (
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
          )}
          
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
