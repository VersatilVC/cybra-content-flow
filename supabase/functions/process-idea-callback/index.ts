
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCorsPreflightRequest } from './cors.ts';
import { createErrorResponse, createSuccessResponse } from './responses.ts';
import {
  handleContentSuggestionsReady,
  handleBriefCompletion,
  handleContentItemCompletion,
  handleIdeaProcessingComplete,
  handleKnowledgeBaseProcessingComplete,
  handleAutoGenerationComplete
} from './handlers.ts';

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
        return createErrorResponse('Unknown callback type', `Callback type '${type}' is not supported`);
    }

  } catch (error) {
    console.error('Callback function error:', error);
    return createErrorResponse('Internal server error', error.message);
  }
});
