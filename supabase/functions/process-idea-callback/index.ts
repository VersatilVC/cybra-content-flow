
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  console.log('Enhanced callback function called with method:', req.method);
  
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.text();
    console.log('Callback raw body:', body);
    
    const callbackData = JSON.parse(body);
    console.log('Callback received:', callbackData);

    const { 
      type, 
      content_idea_id, 
      source_id, 
      status, 
      suggestions_count, 
      brief_id, 
      user_id, 
      title, 
      brief_type, 
      target_audience,
      content_item_id,
      workflow_type,
      submission_id,
      error_message
    } = callbackData;

    // Accept either content_idea_id or source_id for flexibility
    const ideaId = content_idea_id || source_id;

    // Handle different types of workflow completions
    switch (type) {
      case 'content_suggestions_ready':
        return await handleContentSuggestionsReady(ideaId, suggestions_count);
      
      case 'brief_completion':
        return await handleBriefCompletion(ideaId, brief_id, status, user_id, title, error_message);
      
      case 'content_item_completion':
        return await handleContentItemCompletion(content_item_id, submission_id, status, user_id, title, error_message);
      
      case 'idea_processing_complete':
        return await handleIdeaProcessingComplete(ideaId, status, suggestions_count, error_message);
      
      case 'knowledge_base_processing_complete':
        return await handleKnowledgeBaseProcessingComplete(submission_id, status, user_id, error_message);
      
      case 'auto_generation_complete':
        return await handleAutoGenerationComplete(user_id, status, callbackData.generated_count, error_message);
      
      default:
        console.log('Unknown callback type:', type);
        return new Response(
          JSON.stringify({ 
            error: 'Unknown callback type',
            details: `Callback type '${type}' is not supported`
          }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Callback function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleContentSuggestionsReady(ideaId: string, suggestionsCount: number) {
  if (!ideaId) {
    return createErrorResponse('Missing content_idea_id or source_id');
  }

  console.log(`Processing content suggestions completion for idea: ${ideaId}`);
  
  // Update the content idea status to 'processed'
  const { data: updatedIdea, error: updateError } = await supabase
    .from('content_ideas')
    .update({ 
      status: 'processed',
      updated_at: new Date().toISOString()
    })
    .eq('id', ideaId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating content idea:', updateError);
    return createErrorResponse('Failed to update content idea', updateError.message);
  }

  console.log('Content idea updated successfully:', updatedIdea);

  // Create notification
  if (updatedIdea) {
    await createNotification(
      updatedIdea.user_id,
      'Content Suggestions Ready',
      `${suggestionsCount || 'Several'} content suggestions have been generated for "${updatedIdea.title}"`,
      'success',
      ideaId
    );
  }

  return createSuccessResponse({
    message: 'Content idea callback processed successfully',
    idea_id: ideaId,
    status: 'processed'
  });
}

async function handleBriefCompletion(ideaId: string, briefId: string, status: string, userId: string, title: string, errorMessage?: string) {
  console.log(`Processing brief completion for idea: ${ideaId}, brief: ${briefId}`);
  
  if (status === 'success') {
    // Update the content idea status to 'brief_created'
    const { data: updatedIdea, error: updateError } = await supabase
      .from('content_ideas')
      .update({ 
        status: 'brief_created',
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating content idea for brief completion:', updateError);
      return createErrorResponse('Failed to update content idea', updateError.message);
    }

    console.log('Content idea updated for brief completion:', updatedIdea);

    // Create success notification
    if (userId) {
      await createNotification(
        userId,
        'Content Brief Ready',
        `Your content brief "${title}" has been created successfully and is ready for review.`,
        'success',
        ideaId
      );
    }

    return createSuccessResponse({
      message: 'Brief completion callback processed successfully',
      idea_id: ideaId,
      brief_id: briefId,
      status: 'brief_created'
    });
  } else {
    // Handle failed brief creation
    console.error('Brief creation failed:', { ideaId, briefId, errorMessage });
    
    // Update idea status back to processed if brief creation failed
    await supabase
      .from('content_ideas')
      .update({ 
        status: 'processed',
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId);
    
    if (userId) {
      await createNotification(
        userId,
        'Content Brief Creation Failed',
        `Failed to create content brief for "${title}". ${errorMessage || 'Please try again.'}`,
        'error',
        ideaId
      );
    }

    return createSuccessResponse({
      success: false, 
      message: 'Brief creation failed',
      idea_id: ideaId,
      error: errorMessage || 'Unknown error'
    });
  }
}

async function handleContentItemCompletion(contentItemId: string, submissionId: string, status: string, userId: string, title: string, errorMessage?: string) {
  console.log(`Processing content item completion: ${contentItemId}, submission: ${submissionId}`);
  
  if (status === 'success' || status === 'completed') {
    // Update submission status if provided
    if (submissionId) {
      await supabase
        .from('content_submissions')
        .update({ 
          processing_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);
    }

    // Create success notification with content item ID for direct linking
    if (userId) {
      await createNotification(
        userId,
        'Content Processing Complete',
        `Your content item "${title}" has been successfully generated (content item ${contentItemId}) and is ready for review.`,
        'success',
        submissionId
      );
    }

    return createSuccessResponse({
      message: 'Content item completion processed successfully',
      content_item_id: contentItemId,
      submission_id: submissionId,
      status: 'completed'
    });
  } else {
    // Handle failed content generation
    if (submissionId) {
      await supabase
        .from('content_submissions')
        .update({ 
          processing_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);
    }

    if (userId) {
      await createNotification(
        userId,
        'Content Processing Failed',
        `Failed to generate content item "${title}". ${errorMessage || 'Please try again.'}`,
        'error',
        submissionId
      );
    }

    return createSuccessResponse({
      success: false,
      message: 'Content item generation failed',
      content_item_id: contentItemId,
      error: errorMessage || 'Unknown error'
    });
  }
}

async function handleIdeaProcessingComplete(ideaId: string, status: string, suggestionsCount?: number, errorMessage?: string) {
  console.log(`Processing idea completion: ${ideaId}, status: ${status}`);
  
  if (!ideaId) {
    return createErrorResponse('Missing idea ID');
  }

  // Get the idea details
  const { data: idea, error: ideaError } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('id', ideaId)
    .single();

  if (ideaError || !idea) {
    console.error('Error fetching idea:', ideaError);
    return createErrorResponse('Failed to fetch idea details');
  }

  if (status === 'success' || status === 'completed') {
    // Update idea status to processed
    await supabase
      .from('content_ideas')
      .update({ 
        status: 'processed',
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId);

    // Create success notification
    await createNotification(
      idea.user_id,
      'Idea Processing Complete',
      `Your idea "${idea.title}" has been processed successfully. ${suggestionsCount ? `${suggestionsCount} suggestions are now available.` : 'Content suggestions are ready for review.'}`,
      'success',
      ideaId
    );
  } else {
    // Update idea status to failed
    await supabase
      .from('content_ideas')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId);

    // Create error notification
    await createNotification(
      idea.user_id,
      'Idea Processing Failed',
      `Failed to process your idea "${idea.title}". ${errorMessage || 'Please try submitting again.'}`,
      'error',
      ideaId
    );
  }

  return createSuccessResponse({
    message: 'Idea processing completion handled',
    idea_id: ideaId,
    status: status === 'success' || status === 'completed' ? 'processed' : 'failed'
  });
}

async function handleKnowledgeBaseProcessingComplete(submissionId: string, status: string, userId: string, errorMessage?: string) {
  console.log(`Processing knowledge base completion: ${submissionId}, status: ${status}`);
  
  if (!submissionId) {
    return createErrorResponse('Missing submission ID');
  }

  // Get submission details
  const { data: submission, error: submissionError } = await supabase
    .from('content_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (submissionError || !submission) {
    console.error('Error fetching submission:', submissionError);
    return createErrorResponse('Failed to fetch submission details');
  }

  if (status === 'success' || status === 'completed') {
    // Update submission status
    await supabase
      .from('content_submissions')
      .update({ 
        processing_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    // Create success notification
    await createNotification(
      submission.user_id,
      'Knowledge Base Processing Complete',
      `Your file "${submission.original_filename}" has been successfully processed and added to the ${submission.knowledge_base} knowledge base.`,
      'success',
      submissionId
    );
  } else {
    // Update submission status to failed
    await supabase
      .from('content_submissions')
      .update({ 
        processing_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    // Create error notification
    await createNotification(
      submission.user_id,
      'Knowledge Base Processing Failed',
      `Failed to process your file "${submission.original_filename}". ${errorMessage || 'Please try uploading again.'}`,
      'error',
      submissionId
    );
  }

  return createSuccessResponse({
    message: 'Knowledge base processing completion handled',
    submission_id: submissionId,
    status: status === 'success' || status === 'completed' ? 'completed' : 'failed'
  });
}

async function handleAutoGenerationComplete(userId: string, status: string, generatedCount?: number, errorMessage?: string) {
  console.log(`Processing auto-generation completion for user: ${userId}, status: ${status}`);
  
  if (!userId) {
    return createErrorResponse('Missing user ID');
  }

  if (status === 'success' || status === 'completed') {
    await createNotification(
      userId,
      'Auto-Generation Complete',
      `Successfully generated ${generatedCount || 'multiple'} new content ideas. Check your ideas dashboard to review them.`,
      'success'
    );
  } else {
    await createNotification(
      userId,
      'Auto-Generation Failed',
      `Failed to auto-generate content ideas. ${errorMessage || 'Please try again.'}`,
      'error'
    );
  }

  return createSuccessResponse({
    message: 'Auto-generation completion handled',
    user_id: userId,
    status: status === 'success' || status === 'completed' ? 'completed' : 'failed',
    generated_count: generatedCount
  });
}

async function createNotification(userId: string, title: string, message: string, type: string, relatedSubmissionId?: string) {
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

function createErrorResponse(message: string, details?: string) {
  return new Response(
    JSON.stringify({ 
      error: message,
      details: details
    }), 
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify({ 
      success: true,
      ...data
    }), 
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
