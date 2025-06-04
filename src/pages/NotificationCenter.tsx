
import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Trash } from 'lucide-react';
import { Notification } from '@/types/notifications';

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    handleViewSuggestions,
    handleViewBrief,
    handleViewContentItem,
    handleViewWordPressPublishing,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter((notification) => {
    switch (activeTab) {
      case 'unread':
        return !notification.is_read;
      case 'success':
        return notification.type === 'success';
      case 'error':
        return notification.type === 'error';
      case 'warning':
        return notification.type === 'warning';
      default:
        return true;
    }
  });

  const getTabCount = (type: string) => {
    switch (type) {
      case 'unread':
        return notifications.filter(n => !n.is_read).length;
      case 'success':
        return notifications.filter(n => n.type === 'success').length;
      case 'error':
        return notifications.filter(n => n.type === 'error').length;
      case 'warning':
        return notifications.filter(n => n.type === 'warning').length;
      default:
        return notifications.length;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Notification Center</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          Stay updated with your content processing status and system notifications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
            <Badge variant="secondary" className="text-xs">
              {getTabCount('all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            Unread
            {getTabCount('unread') > 0 && (
              <Badge variant="destructive" className="text-xs">
                {getTabCount('unread')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="success" className="flex items-center gap-2">
            Success
            <Badge variant="outline" className="text-xs">
              {getTabCount('success')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="error" className="flex items-center gap-2">
            Error
            <Badge variant="outline" className="text-xs">
              {getTabCount('error')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="warning" className="flex items-center gap-2">
            Warning
            <Badge variant="outline" className="text-xs">
              {getTabCount('warning')}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p>
                {activeTab === 'all' 
                  ? "You don't have any notifications yet" 
                  : `No ${activeTab} notifications found`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onViewSuggestions={handleViewSuggestions}
                  onViewBrief={handleViewBrief}
                  onViewContentItem={handleViewContentItem}
                  onViewWordPressPublishing={handleViewWordPressPublishing}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
