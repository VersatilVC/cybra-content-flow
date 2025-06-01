
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  submission: any,
  status: string,
  errorMessage?: string,
  contentItemId?: string
) {
  const contentName = submission.original_filename || submission.file_url || 'Content';
  
  const notificationTitle = status === 'completed' 
    ? 'Content Processing Complete'
    : 'Content Processing Failed';
  
  let notificationMessage;
  if (status === 'completed') {
    if (submission.knowledge_base === 'content_creation' && contentItemId) {
      // Include content item ID in the message for direct linking
      notificationMessage = `Your content item "${contentName}" has been successfully generated (content item ${contentItemId}) and is ready for review.`;
    } else if (submission.knowledge_base === 'content_creation') {
      notificationMessage = `Your content item "${contentName}" has been successfully generated and is ready for review.`;
    } else {
      notificationMessage = `"${contentName}" has been successfully processed and added to the ${submission.knowledge_base} knowledge base.`;
    }
  } else {
    notificationMessage = `Failed to process "${contentName}". ${errorMessage || 'Please try again.'}`;
  }

  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: notificationTitle,
      message: notificationMessage,
      type: status === 'completed' ? 'success' : 'error',
      related_submission_id: submission.id
    });

  if (notificationError) {
    console.error('Error creating notification:', notificationError);
  } else {
    console.log('Notification created successfully');
  }
}
