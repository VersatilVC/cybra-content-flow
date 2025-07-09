import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

async function updateIdeaStatus(supabase: SupabaseClient, ideaId: string, status: string) {
  try {
    await supabase
      .from('content_ideas')
      .update({ status: status })
      .eq('id', ideaId);
    console.log(`Updated idea status to ${status}`);
  } catch (error) {
    console.error('Error updating idea status:', error);
  }
}

async function updateBriefStatus(supabase: SupabaseClient, briefId: string, status: string) {
  try {
    await supabase
      .from('content_briefs')
      .update({ status: status })
      .eq('id', briefId);
    console.log(`Updated brief status to ${status}`);
  } catch (error) {
    console.error('Error updating brief status:', error);
  }
}

async function updateSubmissionStatus(supabase: SupabaseClient, submissionId: string, status: string) {
  try {
    await supabase
      .from('content_submissions')
      .update({ processing_status: status })
      .eq('id', submissionId);
    console.log(`Updated submission status to ${status}`);
  } catch (error) {
    console.error('Error updating submission status:', error);
  }
}

async function updateContentItemWordPressUrl(supabase: SupabaseClient, contentItemId: string, wordpressUrl: string) {
  try {
    await supabase
      .from('content_items')
      .update({ wordpress_url: wordpressUrl })
      .eq('id', contentItemId);
    console.log(`Updated content item ${contentItemId} with WordPress URL: ${wordpressUrl}`);
  } catch (error) {
    console.error('Error updating content item with WordPress URL:', error);
  }
}

async function createIdeaCompletionNotification(supabase: SupabaseClient, userId: string, ideaId: string, ideaTitle: string) {
  try {
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Idea Processing Complete',
        message: `Your content idea "${ideaTitle}" has been successfully processed.`,
        type: 'success',
        related_entity_id: ideaId,
        related_entity_type: 'idea'
      });
    console.log('Idea completion notification created');
  } catch (error) {
    console.error('Error creating idea completion notification:', error);
  }
}

async function createBriefCompletionNotification(supabase: SupabaseClient, userId: string, briefId: string, briefTitle: string) {
  try {
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Content Brief Ready',
        message: `Your content brief "${briefTitle}" is ready.`,
        type: 'success',
        related_entity_id: briefId,
        related_entity_type: 'brief'
      });
    console.log('Brief completion notification created');
  } catch (error) {
    console.error('Error creating brief completion notification:', error);
  }
}

async function createContentItemNotification(
  supabase: SupabaseClient, 
  userId: string, 
  contentItemId: string, 
  contentTitle: string,
  type: 'success' | 'error' = 'success',
  errorMessage?: string
) {
  try {
    const title = type === 'success' ? 'Content Processing Complete' : 'Content Processing Failed';
    const message = type === 'success'
      ? `Your content item "${contentTitle}" has been successfully generated and is ready for review.`
      : `Failed to process content item "${contentTitle}". ${errorMessage || 'Please try again.'}`;

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        type: type,
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });
    console.log('Content item notification created');
  } catch (error) {
    console.error('Error creating content item notification:', error);
  }
}

async function createAutoGenerationNotification(supabase: SupabaseClient, userId: string, ideaId: string, ideaTitle: string) {
  try {
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Content Ideas Ready',
        message: `Your auto-generated content ideas for "${ideaTitle}" are ready to review. Click "View Content Ideas" to see them.`,
        type: 'success',
        related_entity_id: ideaId,
        related_entity_type: 'idea'
      });
    console.log('Auto-generation notification created');
  } catch (error) {
    console.error('Error creating auto-generation notification:', error);
  }
}

async function createWordPressPublishingNotification(
  supabase: SupabaseClient,
  userId: string,
  contentItemId: string,
  contentTitle: string,
  isSuccess: boolean,
  errorMessage?: string
) {
  try {
    const title = isSuccess ? 'WordPress Publishing Complete' : 'WordPress Publishing Failed';
    const message = isSuccess
      ? `Your content item "${contentTitle}" has been successfully published to WordPress.`
      : `Failed to publish content item "${contentTitle}" to WordPress. ${errorMessage || 'Please check your WordPress settings and try again.'}`;

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        type: isSuccess ? 'success' : 'error',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });
    console.log('WordPress publishing notification created');
  } catch (error) {
    console.error('Error creating WordPress publishing notification:', error);
  }
}

async function createDerivativeGenerationNotification(
  supabase: SupabaseClient,
  userId: string,
  contentItemId: string,
  contentTitle: string,
  isSuccess: boolean,
  errorMessage?: string
) {
  try {
    const title = isSuccess ? 'Content Derivatives Generated' : 'Derivative Generation Failed';
    const message = isSuccess
      ? `Content derivatives have been successfully generated for "${contentTitle}".`
      : `Failed to generate content derivatives for "${contentTitle}". ${errorMessage || 'Please try again.'}`;

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        type: isSuccess ? 'success' : 'error',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });
    console.log('Derivative generation notification created');
  } catch (error) {
    console.error('Error creating derivative generation notification:', error);
  }
}

async function createContentItemFixNotification(
  supabase: SupabaseClient,
  userId: string,
  contentItemId: string,
  contentTitle: string,
  isSuccess: boolean,
  errorMessage?: string
) {
  try {
    const title = isSuccess ? 'AI Content Fix Complete' : 'AI Content Fix Failed';
    const message = isSuccess
      ? `Content item "${contentTitle}" has been successfully improved by AI.`
      : `Failed to fix content item "${contentTitle}" with AI. ${errorMessage || 'Please try again.'}`;

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        type: isSuccess ? 'success' : 'error',
        related_entity_id: contentItemId,
        related_entity_type: 'content_item'
      });
    console.log('Content item fix notification created');
  } catch (error) {
    console.error('Error creating content item fix notification:', error);
  }
}

export async function handleIdeaProcessingCallback(supabase: any, body: any) {
  try {
    console.log('Processing idea completion callback');
    
    if (!body.content_idea_id || !body.user_id) {
      console.error('Missing required fields for idea processing callback:', body);
      return;
    }

    await updateIdeaStatus(supabase, body.content_idea_id, 'ready');
    await createIdeaCompletionNotification(supabase, body.user_id, body.content_idea_id, body.title || 'Content Idea');
    
    console.log('Idea processing callback completed successfully');
  } catch (error) {
    console.error('Error in handleIdeaProcessingCallback:', error);
  }
}

export async function handleBriefCreationCallback(supabase: any, body: any) {
  try {
    console.log('Processing brief creation callback');
    
    if (!body.user_id) {
      console.error('Missing user_id for brief creation callback:', body);
      return;
    }

    // Handle both brief_id and content_idea_id for backward compatibility
    if (body.brief_id) {
      await updateBriefStatus(supabase, body.brief_id, 'ready');
      await createBriefCompletionNotification(supabase, body.user_id, body.brief_id, body.title || 'Content Brief');
    } else if (body.content_idea_id) {
      // If only content_idea_id is provided, find the brief associated with it
      const { data: brief } = await supabase
        .from('content_briefs')
        .select('id, title')
        .eq('source_id', body.content_idea_id)
        .eq('source_type', 'idea')
        .single();
      
      if (brief) {
        await updateBriefStatus(supabase, brief.id, 'ready');
        await createBriefCompletionNotification(supabase, body.user_id, brief.id, brief.title || body.title || 'Content Brief');
      } else {
        console.error('No brief found for content_idea_id:', body.content_idea_id);
      }
    } else {
      console.error('No brief_id or content_idea_id provided for brief creation callback:', body);
      return;
    }
    
    console.log('Brief creation callback completed successfully');
  } catch (error) {
    console.error('Error in handleBriefCreationCallback:', error);
  }
}

export async function handleContentCreationCallback(supabase: any, body: any) {
  try {
    console.log('Processing content creation callback');
    
    if (!body.user_id) {
      console.error('Missing user_id for content creation callback:', body);
      return;
    }

    // Handle content item creation if provided
    if (body.content_item_id) {
      console.log('Content item created:', body.content_item_id);
      await createContentItemNotification(
        supabase, 
        body.user_id, 
        body.content_item_id, 
        body.title || 'Content Item',
        body.status === 'failed' ? 'error' : 'success',
        body.error_message
      );

      // Update brief status to content_item_created if brief_id is provided
      if (body.brief_id && body.status !== 'failed') {
        await supabase
          .from('content_briefs')
          .update({ status: 'content_item_created' })
          .eq('id', body.brief_id);
        
        console.log('Brief status updated to content_item_created for brief:', body.brief_id);
      }
    }

    // Update submission status if provided
    if (body.submission_id) {
      await updateSubmissionStatus(supabase, body.submission_id, body.status || 'completed');
    }

    console.log('Content creation callback completed successfully');
  } catch (error) {
    console.error('Error in handleContentCreationCallback:', error);
  }
}

export async function handleAutoGenerationCallback(supabase: any, body: any) {
  try {
    console.log('Processing auto-generation callback');
    
    if (!body.content_idea_id || !body.user_id) {
      console.error('Missing required fields for auto-generation callback:', body);
      return;
    }

    await updateIdeaStatus(supabase, body.content_idea_id, 'ready');
    await createAutoGenerationNotification(supabase, body.user_id, body.content_idea_id, body.title || 'Auto-Generated Content');
    
    console.log('Auto-generation callback completed successfully');
  } catch (error) {
    console.error('Error in handleAutoGenerationCallback:', error);
  }
}

export async function handleWordPressPublishingCallback(supabase: any, body: any) {
  try {
    console.log('Processing WordPress publishing callback');
    
    if (!body.content_item_id || !body.user_id) {
      console.error('Missing required fields for WordPress publishing callback:', body);
      return;
    }

    const isSuccess = body.status === 'completed' && !body.error_message;
    
    // Update content item with WordPress URL if successful
    if (isSuccess && body.wordpress_url) {
      await updateContentItemWordPressUrl(supabase, body.content_item_id, body.wordpress_url);
      console.log(`Content item ${body.content_item_id} updated with WordPress URL: ${body.wordpress_url}`);
    }

    await createWordPressPublishingNotification(
      supabase,
      body.user_id,
      body.content_item_id,
      body.title || 'Content Item',
      isSuccess,
      body.error_message
    );

    console.log('WordPress publishing completed successfully for content item', body.content_item_id);
  } catch (error) {
    console.error('Error in handleWordPressPublishingCallback:', error);
  }
}

export async function handleDerivativeGenerationCallback(supabase: any, body: any) {
  try {
    console.log('Processing derivative generation callback');
    
    if (!body.content_item_id || !body.user_id) {
      console.error('Missing required fields for derivative generation callback:', body);
      return;
    }

    const isSuccess = body.status === 'completed' && !body.error_message;
    
    await createDerivativeGenerationNotification(
      supabase,
      body.user_id,
      body.content_item_id,
      body.title || 'Content Item',
      isSuccess,
      body.error_message
    );

    console.log('Derivative generation callback completed successfully');
  } catch (error) {
    console.error('Error in handleDerivativeGenerationCallback:', error);
  }
}

export async function handleContentItemFixCallback(supabase: any, body: any) {
  try {
    console.log('Processing content item fix callback');
    
    if (!body.content_item_id || !body.user_id) {
      console.error('Missing required fields for content item fix callback:', body);
      return;
    }

    const isSuccess = body.status === 'completed' && !body.error_message;
    
    await createContentItemFixNotification(
      supabase,
      body.user_id,
      body.content_item_id,
      body.title || 'Content Item',
      isSuccess,
      body.error_message
    );

    console.log('Content item fix callback completed successfully');
  } catch (error) {
    console.error('Error in handleContentItemFixCallback:', error);
  }
}
