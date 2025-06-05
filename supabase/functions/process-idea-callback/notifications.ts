import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function createNotification({
  user_id,
  title,
  message,
  type,
  related_entity_id,
  related_entity_type,
  related_submission_id
}: {
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_entity_id?: string | null;
  related_entity_type?: 'submission' | 'idea' | 'brief' | 'content_item' | null;
  related_submission_id?: string | null;
}) {
  try {
    const notificationData = {
      user_id: user_id,
      title: title,
      message: message,
      type: type,
      related_entity_id: related_entity_id,
      related_entity_type: related_entity_type || 'submission',
      // Keep backward compatibility
      related_submission_id: related_entity_type === 'submission' ? related_entity_id : related_submission_id
    };

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationData);

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
    } else {
      console.log('Notification created successfully:', title);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
