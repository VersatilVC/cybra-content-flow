
import { Database } from '@/integrations/supabase/types';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  related_submission_id?: string;
  related_entity_id?: string;
  related_entity_type?: 'submission' | 'idea' | 'brief' | 'content_item';
}
