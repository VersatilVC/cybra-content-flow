-- Add function to check for timed out general content items (2 minute timeout)
CREATE OR REPLACE FUNCTION public.force_check_timed_out_general_content()
RETURNS TABLE(updated_count integer, failed_items jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  timed_out_count integer;
  failed_items_list jsonb;
  cutoff_time timestamptz := now() - interval '2 minutes';
BEGIN
  -- Update all timed out general content items to failed status
  WITH timed_out AS (
    UPDATE general_content_items 
    SET 
      status = 'failed',
      updated_at = now()
    WHERE 
      status = 'processing' 
      AND created_at < cutoff_time
    RETURNING id, title, user_id
  )
  SELECT 
    COUNT(*)::integer,
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'user_id', user_id
      )
    ), '[]'::jsonb)
  INTO timed_out_count, failed_items_list
  FROM timed_out;
  
  -- Return the results
  RETURN QUERY SELECT timed_out_count, failed_items_list;
END;
$$;