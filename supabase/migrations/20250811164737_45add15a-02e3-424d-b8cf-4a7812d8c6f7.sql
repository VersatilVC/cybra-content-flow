-- Create unified timeout monitoring function
CREATE OR REPLACE FUNCTION public.monitor_all_timeouts()
RETURNS TABLE(
  idea_timeouts integer, 
  submission_timeouts integer, 
  total_processed integer,
  failed_ideas jsonb,
  failed_submissions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  idea_count integer := 0;
  submission_count integer := 0;
  ideas_list jsonb := '[]'::jsonb;
  submissions_list jsonb := '[]'::jsonb;
BEGIN
  -- Check for timed out ideas
  SELECT updated_count, failed_ideas INTO idea_count, ideas_list
  FROM force_check_timed_out_ideas();
  
  -- Check for timed out submissions  
  SELECT updated_count, failed_submissions INTO submission_count, submissions_list
  FROM force_check_timed_out_submissions();
  
  -- Return combined results
  RETURN QUERY SELECT 
    idea_count,
    submission_count,
    (idea_count + submission_count),
    ideas_list,
    submissions_list;
END;
$$;

-- Create cron job to monitor timeouts every 5 minutes
SELECT cron.schedule(
  'monitor-all-timeouts',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/monitor-submission-timeouts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYmNzbHdpZ3F0aHJseG5xYm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTM2MTYsImV4cCI6MjA2NzM4OTYxNn0.9tciRjcOCMQNlVlkjdcASHRBQr4xmFvj_ypgbP3xgQU"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);

-- Also update the existing idea timeout monitor to use the same schedule
SELECT cron.unschedule('monitor-all-timeouts') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monitor-all-timeouts'
);

-- Create unified monitoring schedule
SELECT cron.schedule(
  'unified-timeout-monitor',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/monitor-idea-timeouts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYmNzbHdpZ3F0aHJseG5xYm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTM2MTYsImV4cCI6MjA2NzM4OTYxNn0.9tciRjcOCMQNlVlkjdcASHRBQr4xmFvj_ypgbP3xgQU"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);

SELECT cron.schedule(
  'unified-submission-monitor', 
  '*/5 * * * *', -- every 5 minutes (offset by 1 minute)
  $$
  SELECT
    net.http_post(
        url:='https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/monitor-submission-timeouts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYmNzbHdpZ3F0aHJseG5xYm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTM2MTYsImV4cCI6MjA2NzM4OTYxNn0.9tciRjcOCMQNlVlkjdcASHRBQr4xmFvj_ypgbP3xgQU"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);