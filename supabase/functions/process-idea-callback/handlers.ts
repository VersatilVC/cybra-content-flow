import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createNotification } from './notifications.ts';
import { createErrorResponse, createSuccessResponse } from './responses.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleContentSuggestionsReady(ideaId: string, suggestionsCount: number) {
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

  // Create notification with idea entity type
  if (updatedIdea) {
    await createNotification(
      updatedIdea.user_id,
      'Content Suggestions Ready',
      `${suggestionsCount || 'Several'} content suggestions have been generated for "${updatedIdea.title}"`,
      'success',
      ideaId,
      'idea'
    );
  }

  return createSuccessResponse({
    message: 'Content idea callback processed successfully',
    idea_id: ideaId,
    status: 'processed'
  });
}

export async function handleBriefCompletion(ideaId: string, briefId: string, status: string, userId: string, title: string, errorMessage?: string) {
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

    // Create success notification with brief entity type
    if (userId) {
      await createNotification(
        userId,
        'Content Brief Ready',
        `Your content brief "${title}" has been created successfully and is ready for review.`,
        'success',
        briefId,
        'brief'
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
        ideaId,
        'idea'
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

export async function handleContentItemCompletion(contentItemId: string, submissionId: string, status: string, userId: string, title: string, errorMessage?: string) {
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

    // Create success notification with content_item entity type
    if (userId) {
      await createNotification(
        userId,
        'Content Processing Complete',
        `Your content item "${title}" has been successfully generated (content item ${contentItemId}) and is ready for review.`,
        'success',
        contentItemId,
        'content_item'
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
        submissionId,
        'submission'
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

export async function handleIdeaProcessingComplete(ideaId: string, status: string, suggestionsCount?: number, errorMessage?: string) {
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

    // Create success notification with idea entity type
    await createNotification(
      idea.user_id,
      'Idea Processing Complete',
      `Your idea "${idea.title}" has been processed successfully. ${suggestionsCount ? `${suggestionsCount} suggestions are now available.` : 'Content suggestions are ready for review.'}`,
      'success',
      ideaId,
      'idea'
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

    // Create error notification with idea entity type
    await createNotification(
      idea.user_id,
      'Idea Processing Failed',
      `Failed to process your idea "${idea.title}". ${errorMessage || 'Please try submitting again.'}`,
      'error',
      ideaId,
      'idea'
    );
  }

  return createSuccessResponse({
    message: 'Idea processing completion handled',
    idea_id: ideaId,
    status: status === 'success' || status === 'completed' ? 'processed' : 'failed'
  });
}

export async function handleKnowledgeBaseProcessingComplete(submissionId: string, status: string, userId: string, errorMessage?: string) {
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

    // Create success notification with submission entity type
    await createNotification(
      submission.user_id,
      'Knowledge Base Processing Complete',
      `Your file "${submission.original_filename}" has been successfully processed and added to the ${submission.knowledge_base} knowledge base.`,
      'success',
      submissionId,
      'submission'
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

    // Create error notification with submission entity type
    await createNotification(
      submission.user_id,
      'Knowledge Base Processing Failed',
      `Failed to process your file "${submission.original_filename}". ${errorMessage || 'Please try uploading again.'}`,
      'error',
      submissionId,
      'submission'
    );
  }

  return createSuccessResponse({
    message: 'Knowledge base processing completion handled',
    submission_id: submissionId,
    status: status === 'success' || status === 'completed' ? 'completed' : 'failed'
  });
}

export async function handleAutoGenerationComplete(userId: string, status: string, generatedCount?: number, errorMessage?: string) {
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

export async function handleWordPressPublishingComplete(contentItemId: string, status: string, userId: string, title: string, errorMessage?: string) {
  console.log(`Processing WordPress publishing completion: ${contentItemId}, status: ${status}`);
  
  if (!contentItemId || !userId) {
    return createErrorResponse('Missing content item ID or user ID');
  }

  if (status === 'success' || status === 'completed') {
    // Update content item status to published
    await supabase
      .from('content_items')
      .update({ 
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);

    // Create success notification
    await createNotification(
      userId,
      'WordPress Publishing Complete',
      `Your content "${title}" has been successfully published to WordPress and is now live.`,
      'success',
      contentItemId,
      'content_item'
    );

    return createSuccessResponse({
      message: 'WordPress publishing completion processed successfully',
      content_item_id: contentItemId,
      status: 'published'
    });
  } else {
    // Update content item status to publish failed
    await supabase
      .from('content_items')
      .update({ 
        status: 'publish_failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);

    // Create error notification
    await createNotification(
      userId,
      'WordPress Publishing Failed',
      `Failed to publish "${title}" to WordPress. ${errorMessage || 'Please check your WordPress configuration and try again.'}`,
      'error',
      contentItemId,
      'content_item'
    );

    return createSuccessResponse({
      success: false,
      message: 'WordPress publishing failed',
      content_item_id: contentItemId,
      error: errorMessage || 'Unknown error'
    });
  }
}

export async function handleContentItemFixComplete(contentItemId: string, status: string, userId: string, title: string, errorMessage?: string) {
  console.log(`Processing content item fix completion: ${contentItemId}, status: ${status}`);
  
  if (!contentItemId || !userId) {
    return createErrorResponse('Missing content item ID or user ID');
  }

  if (status === 'success' || status === 'completed') {
    // Update content item status back to ready for review
    await supabase
      .from('content_items')
      .update({ 
        status: 'ready_for_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', contentItemId);

    // Create success notification
    await createNotification(
      userId,
      'AI Content Fix Complete',
      `Your content "${title}" has been successfully improved by AI and is ready for review.`,
      'success',
      contentItemId,
      'content_item'
    );

    return createSuccessResponse({
      message: 'Content item fix completion processed successfully',
      content_item_id: contentItemId,
      status: 'ready_for_review'
    });
  } else {
    // Create error notification
    await createNotification(
      userId,
      'AI Content Fix Failed',
      `Failed to improve "${title}" with AI. ${errorMessage || 'Please try again or edit the content manually.'}`,
      'error',
      contentItemId,
      'content_item'
    );

    return createSuccessResponse({
      success: false,
      message: 'Content item fix failed',
      content_item_id: contentItemId,
      error: errorMessage || 'Unknown error'
    });
  }
}

export async function handleDerivativeGenerationComplete(contentItemId: string, status: string, userId: string, title: string, derivativeCount?: number, errorMessage?: string) {
  console.log(`Processing derivative generation completion: ${contentItemId}, status: ${status}`);
  
  if (!contentItemId || !userId) {
    return createErrorResponse('Missing content item ID or user ID');
  }

  if (status === 'success' || status === 'completed') {
    // Create success notification
    await createNotification(
      userId,
      'Content Derivatives Generated',
      `Successfully generated ${derivativeCount || 'new'} content derivatives for "${title}". View them in the Derivatives tab.`,
      'success',
      contentItemId,
      'content_item'
    );

    return createSuccessResponse({
      message: 'Derivative generation completion processed successfully',
      content_item_id: contentItemId,
      derivative_count: derivativeCount,
      status: 'completed'
    });
  } else {
    // Create error notification
    await createNotification(
      userId,
      'Derivative Generation Failed',
      `Failed to generate content derivatives for "${title}". ${errorMessage || 'Please try again.'}`,
      'error',
      contentItemId,
      'content_item'
    );

    return createSuccessResponse({
      success: false,
      message: 'Derivative generation failed',
      content_item_id: contentItemId,
      error: errorMessage || 'Unknown error'
    });
  }
}
