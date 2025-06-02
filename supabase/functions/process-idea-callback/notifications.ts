
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function createNotification(userId: string, title: string, message: string, type: string, relatedSubmissionId?: string) {
  try {
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        type: type,
        related_submission_id: relatedSubmissionId
      });

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
    } else {
      console.log('Notification created successfully:', title);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
