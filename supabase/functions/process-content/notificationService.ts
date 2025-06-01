
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

export async function createProgressNotification(
  supabase: SupabaseClient,
  userId: string,
  submissionId: string,
  message: string
) {
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Processing Update',
      message: message,
      type: 'info',
      related_submission_id: submissionId
    });

  if (notificationError) {
    console.error('Error creating progress notification:', notificationError);
  } else {
    console.log('Progress notification created successfully');
  }
}

export async function createBatchNotification(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
) {
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: title,
      message: message,
      type: type
    });

  if (notificationError) {
    console.error('Error creating batch notification:', notificationError);
  } else {
    console.log('Batch notification created successfully');
  }
}
