-- Add missing processing fields to content_suggestions table
ALTER TABLE public.content_suggestions 
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processing_timeout_at TIMESTAMP WITH TIME ZONE;

-- Update content_suggestions timeout monitoring function
CREATE OR REPLACE FUNCTION public.force_check_timed_out_suggestions()
RETURNS TABLE(updated_count integer, failed_suggestions jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cnt integer;
  failed_list jsonb;
  cutoff timestamptz := now() - interval '30 minutes';
BEGIN
  -- Mark stuck suggestions as failed
  WITH stuck AS (
    UPDATE public.content_suggestions
    SET status = 'failed',
        last_error_message = COALESCE(last_error_message, 'Processing timed out after 30 minutes - please try again'),
        processing_started_at = NULL,
        processing_timeout_at = NULL,
        updated_at = now()
    WHERE status = 'processing'
      AND (
        (processing_timeout_at IS NOT NULL AND processing_timeout_at < now())
        OR (processing_started_at IS NOT NULL AND processing_started_at < cutoff)
        OR (processing_started_at IS NULL AND updated_at < cutoff AND status = 'processing')
      )
    RETURNING id, content_idea_id, title
  )
  SELECT COUNT(*)::integer,
         COALESCE(jsonb_agg(jsonb_build_object('id', id, 'content_idea_id', content_idea_id, 'title', title)), '[]'::jsonb)
  INTO cnt, failed_list
  FROM stuck;

  RETURN QUERY SELECT cnt, failed_list;
END;
$$;

-- Update the unified timeout monitoring function to include suggestions
CREATE OR REPLACE FUNCTION public.monitor_all_timeouts()
RETURNS TABLE(
  idea_timeouts integer, 
  submission_timeouts integer, 
  suggestion_timeouts integer,
  total_processed integer,
  failed_ideas jsonb,
  failed_submissions jsonb,
  failed_suggestions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  idea_count integer := 0;
  submission_count integer := 0;
  suggestion_count integer := 0;
  ideas_list jsonb := '[]'::jsonb;
  submissions_list jsonb := '[]'::jsonb;
  suggestions_list jsonb := '[]'::jsonb;
BEGIN
  -- Check for timed out ideas
  SELECT updated_count, failed_ideas INTO idea_count, ideas_list
  FROM force_check_timed_out_ideas();
  
  -- Check for timed out submissions  
  SELECT updated_count, failed_submissions INTO submission_count, submissions_list
  FROM force_check_timed_out_submissions();
  
  -- Check for timed out suggestions
  SELECT updated_count, failed_suggestions INTO suggestion_count, suggestions_list
  FROM force_check_timed_out_suggestions();
  
  -- Return combined results
  RETURN QUERY SELECT 
    idea_count,
    submission_count,
    suggestion_count,
    (idea_count + submission_count + suggestion_count),
    ideas_list,
    submissions_list,
    suggestions_list;
END;
$$;