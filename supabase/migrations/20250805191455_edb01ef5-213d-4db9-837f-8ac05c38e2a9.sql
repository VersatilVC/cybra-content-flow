-- Comprehensive fix for historical URLs and file access issues

-- Create a function to extract user ID from file path
CREATE OR REPLACE FUNCTION public.extract_user_id_from_path(file_path text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Extract user ID from path like "user_id/filename"
  RETURN (split_part(file_path, '/', 1))::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Create a function to validate file access and generate signed URLs
CREATE OR REPLACE FUNCTION public.generate_signed_file_url(
  bucket_name text,
  file_path text,
  expiry_seconds integer DEFAULT 3600
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Fix historical content ideas with invalid public URLs in private buckets
DO $$
DECLARE
    fixed_count integer;
    invalid_url_pattern text := '%/storage/v1/object/public/content-files/%';
BEGIN
    -- Count how many will be fixed
    SELECT COUNT(*) INTO fixed_count 
    FROM content_ideas 
    WHERE source_type = 'file' 
      AND source_data ? 'url' 
      AND source_data->>'url' LIKE invalid_url_pattern;
    
    RAISE NOTICE 'Found % content ideas with invalid public URLs for private bucket', fixed_count;
    
    -- Remove invalid public URLs for private bucket files, preserve path for signed URL generation
    UPDATE content_ideas 
    SET 
        source_data = source_data - 'url',
        updated_at = now()
    WHERE source_type = 'file' 
      AND source_data ? 'url' 
      AND source_data->>'url' LIKE invalid_url_pattern;
      
    RAISE NOTICE 'Fixed % content ideas by removing invalid public URLs', fixed_count;
END $$;

-- Create a function to audit file access issues
CREATE OR REPLACE FUNCTION public.audit_content_idea_file_access()
RETURNS TABLE(
    total_file_ideas integer,
    ideas_with_invalid_urls integer,
    ideas_missing_paths integer,
    ideas_with_mismatched_user_ids integer,
    path_user_ids_extracted integer
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Fix any remaining user ID mismatches where the path contains the correct user ID
UPDATE content_ideas 
SET 
    user_id = extract_user_id_from_path(source_data->>'path'),
    updated_at = now()
WHERE source_type = 'file' 
  AND source_data ? 'path'
  AND extract_user_id_from_path(source_data->>'path') IS NOT NULL
  AND extract_user_id_from_path(source_data->>'path') != user_id;

-- Create an index to improve performance of file-related queries
CREATE INDEX IF NOT EXISTS idx_content_ideas_file_source ON content_ideas(source_type, user_id) 
WHERE source_type = 'file';