-- Drop and recreate the unified timeout monitoring function to include suggestions
DROP FUNCTION IF EXISTS public.monitor_all_timeouts();

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