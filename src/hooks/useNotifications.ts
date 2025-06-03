
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';
import { mapNotificationRow } from '@/utils/notificationHelpers';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mappedNotifications = (data || []).map(mapNotificationRow);
      setNotifications(mappedNotifications);
      setUnreadCount(mappedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      toast({
        title: 'All Notifications Marked as Read',
        description: 'All notifications have been marked as read.',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const handleViewSuggestions = async (notification: Notification) => {
    markAsRead(notification.id);
    
    // Use the appropriate entity ID based on the notification type
    const entityId = notification.related_entity_id || notification.related_submission_id;
    
    if (entityId) {
      if (notification.related_entity_type === 'idea') {
        navigate(`/content-ideas?expand=${entityId}`);
      } else {
        navigate(`/content-ideas?expand=${entityId}`);
      }
    } else {
      navigate('/content-ideas');
    }
  };

  const handleViewBrief = async (notification: Notification) => {
    markAsRead(notification.id);
    
    // Link directly to the brief details if we have the brief ID
    const briefId = notification.related_entity_id;
    if (briefId && notification.related_entity_type === 'brief') {
      // Navigate to content briefs with a query parameter to open the brief details
      navigate(`/content-briefs?view=${briefId}`);
    } else {
      navigate('/content-briefs');
    }
  };

  const handleViewContentItem = async (notification: Notification) => {
    markAsRead(notification.id);
    
    // Use the related_entity_id if it's a content_item type, otherwise extract from message
    const contentItemId = notification.related_entity_type === 'content_item' 
      ? notification.related_entity_id 
      : notification.message.match(/content item ([a-f0-9-]+)/i)?.[1];
    
    if (contentItemId) {
      navigate(`/content-items/${contentItemId}`);
    } else {
      // Fallback to content items list if we can't extract the ID
      navigate('/content-items');
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    handleViewSuggestions,
    handleViewBrief,
    handleViewContentItem,
  };
}
