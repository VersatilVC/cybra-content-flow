-- Create historical data cleanup functions
CREATE OR REPLACE FUNCTION public.cleanup_historical_data(
  cleanup_older_than_days integer DEFAULT 30,
  batch_size integer DEFAULT 100,
  dry_run boolean DEFAULT true
)
RETURNS TABLE(
  cleaned_ideas integer,
  cleaned_briefs integer,
  cleaned_items integer,
  cleaned_derivatives integer,
  cleaned_suggestions integer,
  total_cleaned integer,
  cleanup_summary jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cutoff_date timestamptz := now() - (cleanup_older_than_days || ' days')::interval;
  ideas_cleaned integer := 0;
  briefs_cleaned integer := 0;
  items_cleaned integer := 0;
  derivatives_cleaned integer := 0;
  suggestions_cleaned integer := 0;
  summary_data jsonb;
BEGIN
  -- Cleanup old failed content ideas
  IF dry_run THEN
    SELECT COUNT(*) INTO ideas_cleaned 
    FROM content_ideas 
    WHERE status = 'failed' 
      AND updated_at < cutoff_date
      AND COALESCE(retry_count, 0) >= 3;
  ELSE
    WITH deleted AS (
      DELETE FROM content_ideas 
      WHERE status = 'failed' 
        AND updated_at < cutoff_date
        AND COALESCE(retry_count, 0) >= 3
        AND id IN (
          SELECT id FROM content_ideas 
          WHERE status = 'failed' 
            AND updated_at < cutoff_date
            AND COALESCE(retry_count, 0) >= 3
          LIMIT batch_size
        )
      RETURNING id
    )
    SELECT COUNT(*) INTO ideas_cleaned FROM deleted;
  END IF;

  -- Cleanup old failed content briefs
  IF dry_run THEN
    SELECT COUNT(*) INTO briefs_cleaned 
    FROM content_briefs 
    WHERE status = 'failed' 
      AND updated_at < cutoff_date
      AND COALESCE(retry_count, 0) >= 3;
  ELSE
    WITH deleted AS (
      DELETE FROM content_briefs 
      WHERE status = 'failed' 
        AND updated_at < cutoff_date
        AND COALESCE(retry_count, 0) >= 3
        AND id IN (
          SELECT id FROM content_briefs 
          WHERE status = 'failed' 
            AND updated_at < cutoff_date
            AND COALESCE(retry_count, 0) >= 3
          LIMIT batch_size
        )
      RETURNING id
    )
    SELECT COUNT(*) INTO briefs_cleaned FROM deleted;
  END IF;

  -- Cleanup old failed content items
  IF dry_run THEN
    SELECT COUNT(*) INTO items_cleaned 
    FROM content_items 
    WHERE status = 'failed' 
      AND updated_at < cutoff_date
      AND COALESCE(retry_count, 0) >= 3;
  ELSE
    WITH deleted AS (
      DELETE FROM content_items 
      WHERE status = 'failed' 
        AND updated_at < cutoff_date
        AND COALESCE(retry_count, 0) >= 3
        AND id IN (
          SELECT id FROM content_items 
          WHERE status = 'failed' 
            AND updated_at < cutoff_date
            AND COALESCE(retry_count, 0) >= 3
          LIMIT batch_size
        )
      RETURNING id
    )
    SELECT COUNT(*) INTO items_cleaned FROM deleted;
  END IF;

  -- Cleanup old failed content derivatives
  IF dry_run THEN
    SELECT COUNT(*) INTO derivatives_cleaned 
    FROM content_derivatives 
    WHERE status = 'failed' 
      AND updated_at < cutoff_date
      AND COALESCE(retry_count, 0) >= 3;
  ELSE
    WITH deleted AS (
      DELETE FROM content_derivatives 
      WHERE status = 'failed' 
        AND updated_at < cutoff_date
        AND COALESCE(retry_count, 0) >= 3
        AND id IN (
          SELECT id FROM content_derivatives 
          WHERE status = 'failed' 
            AND updated_at < cutoff_date
            AND COALESCE(retry_count, 0) >= 3
          LIMIT batch_size
        )
      RETURNING id
    )
    SELECT COUNT(*) INTO derivatives_cleaned FROM deleted;
  END IF;

  -- Cleanup old failed content suggestions
  IF dry_run THEN
    SELECT COUNT(*) INTO suggestions_cleaned 
    FROM content_suggestions 
    WHERE status = 'failed' 
      AND updated_at < cutoff_date
      AND COALESCE(retry_count, 0) >= 3;
  ELSE
    WITH deleted AS (
      DELETE FROM content_suggestions 
      WHERE status = 'failed' 
        AND updated_at < cutoff_date
        AND COALESCE(retry_count, 0) >= 3
        AND id IN (
          SELECT id FROM content_suggestions 
          WHERE status = 'failed' 
            AND updated_at < cutoff_date
            AND COALESCE(retry_count, 0) >= 3
          LIMIT batch_size
        )
      RETURNING id
    )
    SELECT COUNT(*) INTO suggestions_cleaned FROM deleted;
  END IF;

  -- Build summary
  summary_data := jsonb_build_object(
    'cleanup_mode', CASE WHEN dry_run THEN 'dry_run' ELSE 'actual' END,
    'cutoff_date', cutoff_date,
    'batch_size', batch_size,
    'cleanup_older_than_days', cleanup_older_than_days,
    'timestamp', now()
  );

  -- Return results
  RETURN QUERY SELECT 
    ideas_cleaned,
    briefs_cleaned,
    items_cleaned,
    derivatives_cleaned,
    suggestions_cleaned,
    (ideas_cleaned + briefs_cleaned + items_cleaned + derivatives_cleaned + suggestions_cleaned),
    summary_data;
END;
$function$;

-- Create function to get cleanup candidates (for admin interface)
CREATE OR REPLACE FUNCTION public.get_cleanup_candidates(
  older_than_days integer DEFAULT 30
)
RETURNS TABLE(
  entity_type text,
  entity_id uuid,
  title text,
  status text,
  updated_at timestamptz,
  retry_count integer,
  last_error_message text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH cutoff_date AS (
    SELECT now() - (older_than_days || ' days')::interval AS cutoff
  )
  SELECT 'content_idea'::text, id, title, status, updated_at, COALESCE(retry_count, 0), last_error_message
  FROM content_ideas, cutoff_date
  WHERE status = 'failed' 
    AND updated_at < cutoff_date.cutoff
    AND COALESCE(retry_count, 0) >= 3
  
  UNION ALL
  
  SELECT 'content_brief'::text, id, title, status, updated_at, COALESCE(retry_count, 0), last_error_message
  FROM content_briefs, cutoff_date
  WHERE status = 'failed' 
    AND updated_at < cutoff_date.cutoff
    AND COALESCE(retry_count, 0) >= 3
  
  UNION ALL
  
  SELECT 'content_item'::text, id, title, status, updated_at, COALESCE(retry_count, 0), last_error_message
  FROM content_items, cutoff_date
  WHERE status = 'failed' 
    AND updated_at < cutoff_date.cutoff
    AND COALESCE(retry_count, 0) >= 3
  
  UNION ALL
  
  SELECT 'content_derivative'::text, id, title, status, updated_at, COALESCE(retry_count, 0), last_error_message
  FROM content_derivatives, cutoff_date
  WHERE status = 'failed' 
    AND updated_at < cutoff_date.cutoff
    AND COALESCE(retry_count, 0) >= 3
  
  UNION ALL
  
  SELECT 'content_suggestion'::text, id, title, status, updated_at, COALESCE(retry_count, 0), last_error_message
  FROM content_suggestions, cutoff_date
  WHERE status = 'failed' 
    AND updated_at < cutoff_date.cutoff
    AND COALESCE(retry_count, 0) >= 3
  
  ORDER BY updated_at ASC;
$function$;