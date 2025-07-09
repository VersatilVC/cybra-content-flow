-- Create extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move vector extension from public to extensions schema
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION vector WITH SCHEMA extensions;

-- Grant usage on extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;

-- Update any existing functions that reference vector types
-- This ensures they continue to work with the new schema location
ALTER FUNCTION public.match_documents SET search_path = public, extensions;
ALTER FUNCTION public.match_documents_competitor SET search_path = public, extensions;
ALTER FUNCTION public.match_documents_industry SET search_path = public, extensions;
ALTER FUNCTION public.match_documents_news SET search_path = public, extensions;