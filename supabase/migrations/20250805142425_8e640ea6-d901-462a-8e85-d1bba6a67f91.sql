-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job that runs the monitor-idea-timeouts function every 5 minutes
-- This will automatically detect and handle timed-out content ideas
SELECT cron.schedule(
  'monitor-idea-timeouts',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/monitor-idea-timeouts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYmNzbHdpZ3F0aHJseG5xYm1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgxMzYxNiwiZXhwIjoyMDY3Mzg5NjE2fQ.VH-K19fFqOl2Gfh4-lgnhMOqGz3I2bVWdJu0RKAMhzA"}'::jsonb,
        body:='{"automated_check": true}'::jsonb
    ) as request_id;
  $$
);

-- Also create a function to manually force check for timed out ideas
CREATE OR REPLACE FUNCTION public.force_check_timed_out_ideas()
RETURNS TABLE(updated_count integer, failed_ideas jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  timed_out_count integer;
  failed_ideas_list jsonb;
BEGIN
  -- Update all timed out ideas to failed status
  WITH timed_out AS (
    UPDATE content_ideas 
    SET 
      status = 'failed',
      last_error_message = 'Processing timed out after 30 minutes - please try again',
      processing_timeout_at = NULL,
      processing_started_at = NULL,
      updated_at = now()
    WHERE 
      status = 'processing' 
      AND processing_timeout_at < now()
    RETURNING id, title, retry_count, user_id
  )
  SELECT 
    COUNT(*)::integer,
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'retry_count', retry_count,
        'user_id', user_id
      )
    ), '[]'::jsonb)
  INTO timed_out_count, failed_ideas_list
  FROM timed_out;
  
  -- Return the results
  RETURN QUERY SELECT timed_out_count, failed_ideas_list;
END;
$$;