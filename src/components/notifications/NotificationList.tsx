
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Clock } from 'lucide-react';
import { Notification } from '@/types/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onViewSuggestions: (notification: Notification) => void;
  onViewBrief: (notification: Notification) => void;
}

export function NotificationList({ 
  notifications, 
  isLoading, 
  onMarkAsRead, 
  onViewSuggestions, 
  onViewBrief 
}: NotificationListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-120px)] mt-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Clock className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No notifications yet</p>
          <p className="text-sm">You'll receive updates when your content is processed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onViewSuggestions={onViewSuggestions}
              onViewBrief={onViewBrief}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
