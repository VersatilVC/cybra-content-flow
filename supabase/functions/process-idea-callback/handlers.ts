import { supabase } from './supabaseClient.ts';
import { createNotification } from './notifications.ts';

export async function handleContentSuggestionsReady(ideaId: string, suggestionsCount: number) {
  if (!ideaId) {
    throw new Error('idea_id is required for content_suggestions_ready');
  }

  // Update the content idea status to processed
  const { error: updateError } = await supabase
    .from('content_ideas')
    .update({ 
      status: 'processed',
      updated_at: new Date().toISOString()
    })
    .eq('id', ideaId);

  if (updateError) {
    console.error('Error updating content idea status:', updateError);
    throw updateError;
  }

  // Get the user_id for notification
  const { data: idea, error: ideaError } = await supabase
    .from('content_ideas')
    .select('user_id, title')
    .eq('id', ideaId)
    .single();

  if (ideaError) {
    console.error('Error fetching idea for notification:', ideaError);
    throw ideaError;
  }

  // Create notification
  await createNotification({
    user_id: idea.user_id,
    title: 'Content Suggestions Ready',
    message: `${suggestionsCount} content suggestions have been generated for "${idea.title}". Click to view and take action.`,
    type: 'success',
    related_entity_id: ideaId,
    related_entity_type: 'idea'
  });

  console.log(`Successfully processed content suggestions for idea ${ideaId}`);
  return { success: true, ideaId, suggestionsCount };
}

export async function handleBriefCompletion(sourceId: string, briefId: string, status: string, userId: string, title?: string, errorMessage?: string) {
  if (!sourceId || !briefId || !status || !userId) {
    throw new Error('source_id, brief_id, status, and user_id are required for brief_completion');
  }

  try {
    if (status === 'completed') {
      // Get the brief to determine source type
      const { data: brief, error: briefError } = await supabase
        .from('content_briefs')
        .select('source_type, source_id')
        .eq('id', briefId)
        .single();

      if (briefError) {
        console.error('Error fetching brief:', briefError);
        throw briefError;
      }

      // Update the source entity status to 'brief_created' only if brief actually exists
      if (brief.source_type === 'idea') {
        const { error: updateError } = await supabase
          .from('content_ideas')
          .update({ 
            status: 'brief_created',
            updated_at: new Date().toISOString()
          })
          .eq('id', brief.source_id);

        if (updateError) {
          console.error('Error updating content idea status:', updateError);
        }
      }

      // Create success notification
      await createNotification({
        user_id: userId,
        title: 'Content Brief Ready',
        message: `Your content brief "${title || 'Untitled'}" has been created and is ready for review.`,
        type: 'success',
        related_entity_id: briefId,
        related_entity_type: 'brief'
      });

      console.log(`Brief completion handled successfully for brief ${briefId}`);
    } else {
      // Handle failure case
      await createNotification({
        user_id: userId,
        title: 'Content Brief Creation Failed',
        message: `Failed to create content brief: ${errorMessage || 'Unknown error occurred'}`,
        type: 'error',
        related_entity_id: sourceId,
        related_entity_type: 'idea'
      });

      console.log(`Brief creation failed for source ${sourceId}: ${errorMessage}`);
    }

    return { success: true, briefId, status };
  } catch (error) {
    console.error('Error in handleBriefCompletion:', error);
    throw error;
  }
}

export async function handleContentItemCompletion(contentItemId: string, submissionId: string, status: string, userId: string, title?: string, errorMessage?: string) {
  if (!contentItemId || !status || !userId) {
    throw new Error('content_item_id, status, and user_id are required for content_item_completion');
  }

  try {
    if (status === 'completed') {
      // Create success notification
      await createNotification({
        user_id: userId,
        title: 'Content Processing Complete',
        message: `Your content item "${title || 'Untitled'}" has been successfully generated and is ready for review.`,
        type: 'success',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item',
        related_submission_id: submissionId
      });

      console.log(`Content item completion handled successfully for content item ${contentItemId}`);
    } else {
      // Handle failure case
      await createNotification({
        user_id: userId,
        title: 'Content Processing Failed',
        message: `Failed to generate content item: ${errorMessage || 'Unknown error occurred'}`,
        type: 'error',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item',
        related_submission_id: submissionId
      });

      console.log(`Content item generation failed for content item ${contentItemId}: ${errorMessage}`);
    }

    return { success: true, contentItemId, status };
  } catch (error) {
    console.error('Error in handleContentItemCompletion:', error);
    throw error;
  }
}

export async function handleIdeaProcessingComplete(ideaId: string, status: string, suggestionsCount: number, errorMessage?: string) {
  if (!ideaId || !status) {
    throw new Error('idea_id and status are required for idea_processing_complete');
  }

  try {
    if (status === 'completed') {
      // Get the user_id and title for notification
      const { data: idea, error: ideaError } = await supabase
        .from('content_ideas')
        .select('user_id, title')
        .eq('id', ideaId)
        .single();

      if (ideaError) {
        console.error('Error fetching idea for notification:', ideaError);
        throw ideaError;
      }

      // Create success notification
      await createNotification({
        user_id: idea.user_id,
        title: 'Idea Processing Complete',
        message: `${suggestionsCount} content suggestions have been generated for "${idea.title}". They are ready for your review.`,
        type: 'success',
        related_entity_id: ideaId,
        related_entity_type: 'idea'
      });

      console.log(`Idea processing completed successfully for idea ${ideaId}`);
    } else {
      // Handle failure case
      const { data: idea, error: ideaError } = await supabase
        .from('content_ideas')
        .select('user_id, title')
        .eq('id', ideaId)
        .single();

      if (ideaError) {
        console.error('Error fetching idea for notification:', ideaError);
        throw ideaError;
      }

      await createNotification({
        user_id: idea.user_id,
        title: 'Idea Processing Failed',
        message: `Failed to process content idea "${idea.title}": ${errorMessage || 'Unknown error occurred'}`,
        type: 'error',
        related_entity_id: ideaId,
        related_entity_type: 'idea'
      });

      console.log(`Idea processing failed for idea ${ideaId}: ${errorMessage}`);
    }

    return { success: true, ideaId, status };
  } catch (error) {
    console.error('Error in handleIdeaProcessingComplete:', error);
    throw error;
  }
}

export async function handleKnowledgeBaseProcessingComplete(submissionId: string, status: string, userId: string, errorMessage?: string) {
  if (!submissionId || !status || !userId) {
    throw new Error('submission_id, status, and user_id are required for knowledge_base_processing_complete');
  }

  try {
    if (status === 'completed') {
      // Create success notification
      await createNotification({
        user_id: userId,
        title: 'Knowledge Base Processing Complete',
        message: 'Your knowledge base submission has been successfully processed and is now ready for use.',
        type: 'success',
        related_entity_id: submissionId,
        related_entity_type: 'submission'
      });

      console.log(`Knowledge base processing completed successfully for submission ${submissionId}`);
    } else {
      // Handle failure case
      await createNotification({
        user_id: userId,
        title: 'Knowledge Base Processing Failed',
        message: `Failed to process knowledge base submission: ${errorMessage || 'Unknown error occurred'}`,
        type: 'error',
        related_entity_id: submissionId,
        related_entity_type: 'submission'
      });

      console.log(`Knowledge base processing failed for submission ${submissionId}: ${errorMessage}`);
    }

    return { success: true, submissionId, status };
  } catch (error) {
    console.error('Error in handleKnowledgeBaseProcessingComplete:', error);
    throw error;
  }
}

export async function handleAutoGenerationComplete(userId: string, status: string, generatedCount: number, errorMessage?: string) {
  if (!userId || !status) {
    throw new Error('user_id and status are required for auto_generation_complete');
  }

  try {
    if (status === 'completed') {
      // Create success notification
      await createNotification({
        user_id: userId,
        title: 'Auto Generation Complete',
        message: `${generatedCount} new content ideas have been automatically generated and added to your dashboard.`,
        type: 'success',
        related_entity_id: null,
        related_entity_type: null
      });

      console.log(`Auto generation completed successfully for user ${userId}`);
    } else {
      // Handle failure case
      await createNotification({
        user_id: userId,
        title: 'Auto Generation Failed',
        message: `Failed to auto-generate content ideas: ${errorMessage || 'Unknown error occurred'}`,
        type: 'error',
        related_entity_id: null,
        related_entity_type: null
      });

      console.log(`Auto generation failed for user ${userId}: ${errorMessage}`);
    }

    return { success: true, userId, status };
  } catch (error) {
    console.error('Error in handleAutoGenerationComplete:', error);
    throw error;
  }
}

export async function handleWordPressPublishingComplete(contentItemId: string, status: string, userId: string, title?: string, errorMessage?: string) {
  if (!contentItemId || !status || !userId) {
    throw new Error('content_item_id, status, and user_id are required for wordpress_publishing_complete');
  }

  try {
    if (status === 'completed') {
      // Create success notification
      await createNotification({
        user_id: userId,
        title: 'WordPress Publishing Complete',
        message: `Content item "${title || 'Untitled'}" has been successfully published to WordPress.`,
        type: 'success',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });

      console.log(`WordPress publishing completed successfully for content item ${contentItemId}`);
    } else {
      // Handle failure case
      await createNotification({
        user_id: userId,
        title: 'WordPress Publishing Failed',
        message: `Failed to publish content item "${title || 'Untitled'}" to WordPress: ${errorMessage || 'Unknown error occurred'}`,
        type: 'error',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });

      console.log(`WordPress publishing failed for content item ${contentItemId}: ${errorMessage}`);
    }

    return { success: true, contentItemId, status };
  } catch (error) {
    console.error('Error in handleWordPressPublishingComplete:', error);
    throw error;
  }
}

export async function handleContentItemFixComplete(contentItemId: string, status: string, userId: string, title?: string, errorMessage?: string) {
  if (!contentItemId || !status || !userId) {
    throw new Error('content_item_id, status, and user_id are required for content_item_fix_complete');
  }

  try {
    if (status === 'completed') {
      // Create success notification
      await createNotification({
        user_id: userId,
        title: 'AI Content Fix Complete',
        message: `Content item "${title || 'Untitled'}" has been successfully improved by AI and is ready for review.`,
        type: 'success',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });

      console.log(`Content item fix completed successfully for content item ${contentItemId}`);
    } else {
      // Handle failure case
      await createNotification({
        user_id: userId,
        title: 'AI Content Fix Failed',
        message: `Failed to improve content item "${title || 'Untitled'}" by AI: ${errorMessage || 'Unknown error occurred'}`,
        type: 'error',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });

      console.log(`Content item fix failed for content item ${contentItemId}: ${errorMessage}`);
    }

    return { success: true, contentItemId, status };
  } catch (error) {
    console.error('Error in handleContentItemFixComplete:', error);
    throw error;
  }
}

export async function handleDerivativeGenerationComplete(contentItemId: string, status: string, userId: string, title?: string, derivativeCount?: number, errorMessage?: string) {
  if (!contentItemId || !status || !userId) {
    throw new Error('content_item_id, status, and user_id are required for derivative_generation_complete');
  }

  try {
    if (status === 'completed') {
      // Create success notification
      await createNotification({
        user_id: userId,
        title: 'Content Derivatives Generated',
        message: `${derivativeCount || 0} new content derivatives have been generated for "${title || 'Untitled'}". Check the Derivatives tab to view them.`,
        type: 'success',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });

      console.log(`Derivative generation completed successfully for content item ${contentItemId}`);
    } else {
      // Handle failure case
      await createNotification({
        user_id: userId,
        title: 'Derivative Generation Failed',
        message: `Failed to generate content derivatives for "${title || 'Untitled'}": ${errorMessage || 'Unknown error occurred'}`,
        type: 'error',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });

      console.log(`Derivative generation failed for content item ${contentItemId}: ${errorMessage}`);
    }

    return { success: true, contentItemId, status };
  } catch (error) {
    console.error('Error in handleDerivativeGenerationComplete:', error);
    throw error;
  }
}
