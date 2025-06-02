
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  type: 'content_created' | 'brief_approved' | 'idea_processed' | 'submission_completed';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  entity_id?: string;
}

export function useDashboardActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-activity', user?.id],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get recent notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsError) throw notificationsError;

      // Get recent content submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('content_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (submissionsError) throw submissionsError;

      const activities: ActivityItem[] = [];

      // Add notifications as activities
      notifications?.forEach(notification => {
        activities.push({
          id: notification.id,
          type: getActivityTypeFromNotification(notification.type),
          title: notification.title,
          description: notification.message,
          timestamp: notification.created_at,
          entity_id: notification.related_entity_id,
        });
      });

      // Add submissions as activities
      submissions?.forEach(submission => {
        activities.push({
          id: submission.id,
          type: 'submission_completed',
          title: 'Content submission processed',
          description: submission.original_filename || 'File processed',
          timestamp: submission.completed_at || submission.created_at,
          status: submission.processing_status,
        });
      });

      // Sort by timestamp and limit to 8 items
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);
    },
    enabled: !!user?.id,
  });
}

function getActivityTypeFromNotification(type: string): ActivityItem['type'] {
  switch (type) {
    case 'content_item_created':
      return 'content_created';
    case 'brief_approved':
      return 'brief_approved';
    case 'idea_processed':
      return 'idea_processed';
    default:
      return 'content_created';
  }
}
