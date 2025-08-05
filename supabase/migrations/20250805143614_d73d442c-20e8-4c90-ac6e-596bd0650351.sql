-- Fix historical failed content ideas to ensure they can be retried
-- Update all failed content ideas to have proper retry state and clear processing timestamps

-- First, let's see the current count of failed ideas
DO $$
DECLARE
    failed_count integer;
BEGIN
    SELECT COUNT(*) INTO failed_count FROM content_ideas WHERE status = 'failed';
    RAISE NOTICE 'Found % failed content ideas that will be updated', failed_count;
END $$;

-- Update all failed content ideas to ensure they can be retried
UPDATE content_ideas 
SET 
    retry_count = COALESCE(retry_count, 0),
    processing_started_at = NULL,
    processing_timeout_at = NULL,
    last_error_message = CASE 
        WHEN last_error_message IS NULL OR last_error_message = '' 
        THEN 'Processing failed - please try again'
        ELSE last_error_message
    END,
    updated_at = now()
WHERE status = 'failed'
  AND (
    processing_started_at IS NOT NULL 
    OR processing_timeout_at IS NOT NULL 
    OR retry_count IS NULL
    OR last_error_message IS NULL
    OR last_error_message = ''
  );

-- Also ensure that any ideas stuck in 'processing' status for more than 30 minutes are marked as failed
UPDATE content_ideas 
SET 
    status = 'failed',
    last_error_message = 'Processing timed out after 30 minutes - please try again',
    processing_timeout_at = NULL,
    processing_started_at = NULL,
    retry_count = COALESCE(retry_count, 0),
    updated_at = now()
WHERE status = 'processing' 
  AND (
    processing_timeout_at < now() 
    OR processing_started_at < (now() - INTERVAL '30 minutes')
    OR processing_timeout_at IS NULL
  );

-- Create a function to validate content idea retry state
CREATE OR REPLACE FUNCTION public.validate_content_idea_retry_state()
RETURNS TABLE(
    total_ideas integer,
    failed_ideas integer,
    processing_ideas integer,
    stuck_ideas integer,
    retryable_ideas integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::integer FROM content_ideas) as total_ideas,
        (SELECT COUNT(*)::integer FROM content_ideas WHERE status = 'failed') as failed_ideas,
        (SELECT COUNT(*)::integer FROM content_ideas WHERE status = 'processing') as processing_ideas,
        (SELECT COUNT(*)::integer FROM content_ideas 
         WHERE status = 'processing' 
         AND (processing_timeout_at < now() OR processing_started_at < (now() - INTERVAL '30 minutes'))
        ) as stuck_ideas,
        (SELECT COUNT(*)::integer FROM content_ideas 
         WHERE status = 'failed' 
         AND COALESCE(retry_count, 0) < 3
        ) as retryable_ideas;
END;
$$;