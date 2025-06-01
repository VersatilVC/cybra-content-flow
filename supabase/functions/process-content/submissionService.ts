
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function getSubmission(supabase: SupabaseClient, submissionId: string) {
  const { data: submission, error: submissionError } = await supabase
    .from('content_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (submissionError || !submission) {
    console.error('Error fetching submission:', submissionError);
    throw new Error(`Submission not found: ${submissionError?.message}`);
  }

  console.log('Found submission:', submission);
  return submission;
}

export async function updateSubmissionStatus(
  supabase: SupabaseClient, 
  submissionId: string, 
  status: string, 
  additionalData: Record<string, any> = {}
) {
  const updateData = {
    processing_status: status,
    updated_at: new Date().toISOString(),
    ...additionalData
  };

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('content_submissions')
    .update(updateData)
    .eq('id', submissionId);

  if (updateError) {
    console.error('Error updating submission status:', updateError);
    throw new Error(`Failed to update submission status: ${updateError.message}`);
  }
}

export async function updateBriefStatus(supabase: SupabaseClient, briefId: string, status: string) {
  try {
    await supabase
      .from('content_briefs')
      .update({ status })
      .eq('id', briefId);
    console.log(`Updated brief status to ${status}`);
  } catch (briefError) {
    console.error('Error updating brief status:', briefError);
    // Don't fail the callback if brief update fails
  }
}
