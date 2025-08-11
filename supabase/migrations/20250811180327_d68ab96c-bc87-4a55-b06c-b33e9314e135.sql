-- Fix the remaining 4 database functions with mutable search_path warnings
-- This completes the security hardening for all database functions

-- Fix generate_signed_file_url function
CREATE OR REPLACE FUNCTION public.generate_signed_file_url(bucket_name text, file_path text, expiry_seconds integer DEFAULT 3600)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result_url text;
BEGIN
  -- This function would typically call Supabase storage API
  -- For now, it serves as a placeholder for the TypeScript implementation
  -- The actual signed URL generation will be done in the webhook handler
  RETURN NULL;
END;
$$;

-- Fix get_derivative_counts function
CREATE OR REPLACE FUNCTION public.get_derivative_counts(item_ids uuid[])
RETURNS TABLE(content_item_id uuid, category text, total integer, approved integer, published integer)
LANGUAGE sql
SET search_path TO 'public'
AS $$
  SELECT
    cd.content_item_id,
    cd.category,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE cd.status = 'approved')::int AS approved,
    COUNT(*) FILTER (WHERE cd.status = 'published')::int AS published
  FROM public.content_derivatives cd
  WHERE cd.content_item_id = ANY(item_ids)
  GROUP BY cd.content_item_id, cd.category
  ORDER BY cd.content_item_id, cd.category;
$$;

-- Fix audit_content_idea_file_access function
CREATE OR REPLACE FUNCTION public.audit_content_idea_file_access()
RETURNS TABLE(total_file_ideas integer, ideas_with_invalid_urls integer, ideas_missing_paths integer, ideas_with_mismatched_user_ids integer, path_user_ids_extracted integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::integer FROM content_ideas WHERE source_type = 'file') as total_file_ideas,
        (SELECT COUNT(*)::integer FROM content_ideas 
         WHERE source_type = 'file' 
           AND source_data ? 'url' 
           AND source_data->>'url' LIKE '%/storage/v1/object/public/content-files/%'
        ) as ideas_with_invalid_urls,
        (SELECT COUNT(*)::integer FROM content_ideas 
         WHERE source_type = 'file' 
           AND (NOT source_data ? 'path' OR source_data->>'path' = '')
        ) as ideas_missing_paths,
        (SELECT COUNT(*)::integer FROM content_ideas 
         WHERE source_type = 'file' 
           AND source_data ? 'path'
           AND extract_user_id_from_path(source_data->>'path') IS NOT NULL
           AND extract_user_id_from_path(source_data->>'path') != user_id
        ) as ideas_with_mismatched_user_ids,
        (SELECT COUNT(*)::integer FROM content_ideas 
         WHERE source_type = 'file' 
           AND source_data ? 'path'
           AND extract_user_id_from_path(source_data->>'path') IS NOT NULL
        ) as path_user_ids_extracted;
END;
$$;

-- Fix extract_user_id_from_path function
CREATE OR REPLACE FUNCTION public.extract_user_id_from_path(file_path text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- Extract user ID from path like "user_id/filename"
  RETURN (split_part(file_path, '/', 1))::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;